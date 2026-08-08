import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { CheckoutDto, ShippingDetailsDto } from './dto/checkout.dto';
import { CartService } from '../cart/cart.service';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';

interface OrderGroup {
  sellerId: string;
  fulfillmentType: 'physical' | 'digital';
  items: {
    productId: string;
    title: string;
    price: number;
    quantity: number;
  }[];
}

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private readonly cartService: CartService,
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
  ) {}

  async checkout(buyerId: string, dto: CheckoutDto) {
    const cart = await this.cartService.getCart(buyerId);
    if (cart.items.length === 0) {
      throw new BadRequestException('Le panier est vide');
    }

    // Group cart items by "vendeur + type" — each group becomes its own Order.
    const groups = new Map<string, OrderGroup>();

    // Stock déjà réservé pendant cette tentative de checkout. Si quoi que ce
    // soit échoue avant la création des commandes, on le rend.
    const reserved: { productId: string; quantity: number }[] = [];
    let ordersCreated = false;

    try {
      for (const cartItem of cart.items) {
        const product = await this.productsService.findOne(cartItem.productId);

        // Seuls les produits physiques ont un stock à décompter.
        if (product.type === 'physical') {
          // Premier article physique rencontré : c'est ici, et seulement ici,
          // qu'on sait que la commande devra être expédiée quelque part.
          // Si l'adresse manque, on sort par le catch : les réservations déjà
          // prises sur les articles précédents sont rendues normalement.
          this.assertDeliverable(dto.shipping);

          const ok = await this.productsService.decrementStock(
            cartItem.productId,
            cartItem.quantity,
          );
          if (!ok) {
            throw new BadRequestException(
              `Stock insuffisant pour « ${product.title} »`,
            );
          }
          reserved.push({
            productId: cartItem.productId,
            quantity: cartItem.quantity,
          });
        }

        const key = `${product.sellerId}:${product.type}`;
        if (!groups.has(key)) {
          groups.set(key, {
            sellerId: product.sellerId.toString(),
            fulfillmentType: product.type,
            items: [],
          });
        }
        groups.get(key)!.items.push({
          productId: cartItem.productId,
          title: cartItem.title,
          price: cartItem.price,
          quantity: cartItem.quantity,
        });
      }

      const orders = await Promise.all(
        Array.from(groups.values()).map((group) =>
          this.orderModel.create({
            buyerId,
            sellerId: group.sellerId,
            fulfillmentType: group.fulfillmentType,
            items: group.items,
            total: group.items.reduce(
              (sum, i) => sum + i.price * i.quantity,
              0,
            ),
            status: 'pending_payment',
            paymentMethod: dto.paymentMethod,
            // Chaque commande issue d'un même checkout porte sa propre copie
            // des coordonnées : c'est un instantané, comme les lignes
            // d'articles, pas une référence partagée.
            shipping: this.shippingFor(dto.shipping, group.fulfillmentType),
          }),
        ),
      );
      ordersCreated = true;

      await this.cartService.clearCart(buyerId);
      return orders;
    } catch (err) {
      // Une fois les commandes créées, la réservation leur appartient :
      // la rendre ici provoquerait une survente.
      if (!ordersCreated) {
        await this.releaseReservations(reserved);
      }
      throw err;
    }
  }

  findAllForBuyer(buyerId: string) {
    return this.orderModel.find({ buyerId }).sort({ createdAt: -1 }).exec();
  }

  findAllForSeller(sellerId: string) {
    return this.orderModel.find({ sellerId }).sort({ createdAt: -1 }).exec();
  }

  async findOne(orderId: string, requesterId: string) {
    const order = await this.findExisting(orderId);
    this.assertIsParty(order, requesterId);
    return order;
  }

  async markAsShipped(orderId: string, sellerId: string) {
    const order = await this.findExisting(orderId);
    if (order.sellerId.toString() !== sellerId) {
      throw new ForbiddenException("Cette commande n'est pas la vôtre");
    }
    if (order.fulfillmentType !== 'physical') {
      throw new BadRequestException(
        "Seules les commandes physiques ont une étape d'expédition",
      );
    }
    if (order.status !== 'processing') {
      throw new BadRequestException(
        `Impossible d'expédier une commande au statut "${order.status}"`,
      );
    }
    order.status = 'shipped';
    return order.save();
  }

  async confirmDelivery(orderId: string, buyerId: string) {
    const order = await this.findExisting(orderId);
    if (order.buyerId.toString() !== buyerId) {
      throw new ForbiddenException("Cette commande n'est pas la vôtre");
    }
    if (order.status !== 'shipped') {
      throw new BadRequestException(
        `Impossible de confirmer la réception d'une commande au statut "${order.status}"`,
      );
    }
    order.status = 'delivered';
    return order.save();
  }

  async cancel(orderId: string, requesterId: string) {
    const order = await this.findExisting(orderId);
    this.assertIsParty(order, requesterId);
    if (!['pending_payment', 'processing'].includes(order.status)) {
      throw new BadRequestException(
        `Impossible d'annuler une commande au statut "${order.status}"`,
      );
    }

    order.status = 'cancelled';
    await order.save();

    // Les deux statuts annulables sont postérieurs au checkout, donc le
    // stock a bien été décompté : on le remet en rayon.
    if (order.fulfillmentType === 'physical') {
      await this.releaseReservations(
        order.items.map((item) => ({
          productId: item.productId.toString(),
          quantity: item.quantity,
        })),
      );
    }

    return order;
  }

  // Appelé par PaymentsService, que ce soit via le webhook Stripe ou la
  // confirmation manuelle du vendeur pour un paiement en espèces — c'est
  // le SEUL endroit où une commande "pending_payment" devient payée.
  async markAsPaid(orderId: string) {
    const order = await this.findExisting(orderId);

    // Idempotent : un webhook Stripe peut être livré plusieurs fois.
    if (order.status !== 'pending_payment') {
      return order;
    }

    if (order.fulfillmentType === 'digital') {
      order.status = 'completed';
      await order.save();
      await this.deliverDigitalItems(order);
    } else {
      order.status = 'processing';
      await order.save();
    }

    return order;
  }

  async attachPaymentIntent(orderId: string, stripePaymentIntentId: string) {
    await this.orderModel
      .updateOne({ _id: orderId }, { stripePaymentIntentId })
      .exec();
  }

  private async deliverDigitalItems(order: OrderDocument) {
    const buyer = await this.usersService.findById(order.buyerId.toString());
    if (!buyer) return;

    for (const item of order.items) {
      // Chaque article est isolé : un envoi qui échoue ne doit pas priver
      // l'acheteur des articles suivants de la même commande.
      try {
        const product = await this.productsService.findOne(
          item.productId.toString(),
        );
        if (product.fileKey) {
          // Destinataire = l'email DU COMPTE, pas order.shipping.email : ce
          // dernier est un champ libre saisi au checkout, et l'utiliser
          // permettrait de rediriger un téléchargement vers une boîte non
          // vérifiée. Ne pas « corriger » sans y avoir réfléchi.
          await this.emailService.sendDigitalDelivery(
            buyer.email,
            item.title,
            product.fileKey,
          );
        }
      } catch (err) {
        this.logger.error(
          `Livraison numérique échouée — commande ${order._id}, article « ${item.title} »`,
          err instanceof Error ? err.stack : String(err),
        );
      }
    }
  }

  // L'adresse postale n'est obligatoire que s'il y a quelque chose à
  // expédier — voir ShippingDetailsDto, qui la laisse optionnelle parce qu'au
  // moment de sa validation le contenu du panier est encore inconnu.
  private assertDeliverable(shipping: ShippingDetailsDto) {
    const isIncomplete = (
      ['country', 'city', 'addressLine', 'postalCode'] as const
    ).some((field) => !shipping[field]?.trim());

    if (isIncomplete) {
      throw new BadRequestException(
        'Une adresse de livraison complète (pays, ville, adresse, code postal) est requise pour les articles physiques',
      );
    }
  }

  // Une commande numérique n'a pas d'adresse de livraison : on n'en conserve
  // que le contact, même si l'acheteur a rempli le reste du formulaire pour
  // les articles physiques du même panier.
  private shippingFor(
    shipping: ShippingDetailsDto,
    fulfillmentType: 'physical' | 'digital',
  ) {
    if (fulfillmentType === 'physical') return shipping;
    const { fullName, email, phone } = shipping;
    return { fullName, email, phone };
  }

  private async releaseReservations(
    reservations: { productId: string; quantity: number }[],
  ) {
    for (const { productId, quantity } of reservations) {
      try {
        await this.productsService.restoreStock(productId, quantity);
      } catch (err) {
        // Le stock d'un produit supprimé entre-temps n'a plus de sens :
        // on journalise sans faire échouer l'opération appelante.
        this.logger.error(
          `Restitution de stock échouée — produit ${productId}, quantité ${quantity}`,
          err instanceof Error ? err.stack : String(err),
        );
      }
    }
  }

  private async findExisting(orderId: string) {
    const order = await this.orderModel.findById(orderId).exec();
    if (!order) {
      throw new NotFoundException(`Commande ${orderId} introuvable`);
    }
    return order;
  }

  private assertIsParty(order: OrderDocument, requesterId: string) {
    const isParty =
      order.buyerId.toString() === requesterId ||
      order.sellerId.toString() === requesterId;
    if (!isParty) {
      throw new ForbiddenException("Cette commande n'est pas la vôtre");
    }
  }
}
