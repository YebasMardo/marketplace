import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { CartService } from '../cart/cart.service';
import { ProductsService } from '../products/products.service';

interface OrderGroup {
  sellerId: string;
  fulfillmentType: 'physical' | 'digital';
  items: { productId: string; title: string; price: number; quantity: number }[];
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private readonly cartService: CartService,
    private readonly productsService: ProductsService,
  ) {}

  async checkout(buyerId: string) {
    const cart = await this.cartService.getCart(buyerId);
    if (cart.items.length === 0) {
      throw new BadRequestException('Le panier est vide');
    }

    // Group cart items by "vendeur + type" — each group becomes its own Order.
    const groups = new Map<string, OrderGroup>();
    for (const cartItem of cart.items) {
      const product = await this.productsService.findOne(cartItem.productId);
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
          total: group.items.reduce((sum, i) => sum + i.price * i.quantity, 0),
          status: 'pending_payment',
        }),
      ),
    );

    await this.cartService.clearCart(buyerId);
    return orders;

    // Le module payments (prochaine étape) appellera une méthode interne
    // pour faire passer ces commandes de 'pending_payment' à 'processing'
    // (physique) ou directement 'completed' (digital) après paiement réussi.
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
    return order.save();
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