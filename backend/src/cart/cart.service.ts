import { BadRequestException, Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { ProductsService } from '../products/products.service';

const CART_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 jours d'inactivité avant expiration

type CartMap = Record<string, number>; // productId -> quantité

@Injectable()
export class CartService {
  constructor(
    private readonly redisService: RedisService,
    private readonly productsService: ProductsService,
  ) {}

  private cartKey(userId: string) {
    return `cart:${userId}`;
  }

  private async getRawCart(userId: string): Promise<CartMap> {
    const raw = await this.redisService.get(this.cartKey(userId));
    return raw ? JSON.parse(raw) : {};
  }

  private saveCart(userId: string, cart: CartMap) {
    return this.redisService.set(
      this.cartKey(userId),
      JSON.stringify(cart),
      CART_TTL_SECONDS,
    );
  }

  // Enriches the raw {productId: quantity} map with live title/price/images
  // pulled from MongoDB — never a stale snapshot from when the item was added.
  // If a product was deleted or suspended since, it's dropped silently and
  // the cart is resaved without it, instead of crashing the whole request.
  async getCart(userId: string) {
    const cart = await this.getRawCart(userId);
    const productIds = Object.keys(cart);

    const items: {
      productId: string;
      quantity: number;
      title: string;
      price: number;
      originalPrice?: number;
      images: string[];
      subtotal: number;
    }[] = [];
    let cartChanged = false;

    for (const productId of productIds) {
      try {
        const product = await this.productsService.findOne(productId);

        // `price` est toujours le montant réellement facturé. Quand une
        // promo s'applique, `originalPrice` porte le prix barré à afficher.
        const hasPromo =
          product.promoPrice != null && product.promoPrice < product.price;
        const unitPrice = hasPromo ? product.promoPrice! : product.price;

        items.push({
          productId,
          quantity: cart[productId],
          title: product.title,
          price: unitPrice,
          ...(hasPromo ? { originalPrice: product.price } : {}),
          images: product.images,
          subtotal: unitPrice * cart[productId],
        });
      } catch {
        delete cart[productId];
        cartChanged = true;
      }
    }

    if (cartChanged) {
      await this.saveCart(userId, cart);
    }

    return {
      items,
      total: items.reduce((sum, item) => sum + item.subtotal, 0),
    };
  }

  async addItem(userId: string, productId: string, quantity: number) {
    if (quantity <= 0) {
      throw new BadRequestException('La quantité doit être positive');
    }
    await this.productsService.findOne(productId); // 404 si le produit n'existe pas

    const cart = await this.getRawCart(userId);
    cart[productId] = (cart[productId] ?? 0) + quantity;
    await this.saveCart(userId, cart);
    return this.getCart(userId);
  }

  async updateItem(userId: string, productId: string, quantity: number) {
    const cart = await this.getRawCart(userId);
    if (quantity <= 0) {
      delete cart[productId];
    } else {
      cart[productId] = quantity;
    }
    await this.saveCart(userId, cart);
    return this.getCart(userId);
  }

  async removeItem(userId: string, productId: string) {
    const cart = await this.getRawCart(userId);
    delete cart[productId];
    await this.saveCart(userId, cart);
    return this.getCart(userId);
  }

  // Renvoie le panier (vide) comme les autres mutations, pour que le client
  // n'ait pas à traiter ce cas différemment des quatre autres routes.
  async clearCart(userId: string) {
    await this.redisService.del(this.cartKey(userId));
    return { items: [], total: 0 };
  }
}