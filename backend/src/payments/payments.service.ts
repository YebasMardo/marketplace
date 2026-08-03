import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private readonly config: ConfigService,
    private readonly ordersService: OrdersService,
  ) {
    this.stripe = new Stripe(this.config.get<string>('STRIPE_SECRET_KEY')!);
  }

  async createIntent(orderId: string, requesterId: string) {
    const order = await this.ordersService.findOne(orderId, requesterId);

    if (order.buyerId.toString() !== requesterId) {
      throw new BadRequestException("Seul l'acheteur peut initier le paiement");
    }
    if (order.paymentMethod !== 'stripe') {
      throw new BadRequestException(
        "Cette commande n'utilise pas Stripe comme mode de paiement",
      );
    }
    if (order.status !== 'pending_payment') {
      throw new BadRequestException(
        `Cette commande a déjà le statut "${order.status}"`,
      );
    }

    const intent = await this.stripe.paymentIntents.create({
      // Stripe attend le montant dans la plus petite unité de la devise
      // (centimes pour usd/eur) — d'où le *100.
      amount: Math.round(order.total * 100),
      currency: this.config.get<string>('STRIPE_CURRENCY', 'usd'),
      metadata: { orderId: order._id.toString() },
    });

    await this.ordersService.attachPaymentIntent(orderId, intent.id);

    return { clientSecret: intent.client_secret };
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    const webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET')!;
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch (err) {
      throw new BadRequestException(
        `Signature Stripe invalide: ${(err as Error).message}`,
      );
    }

    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object as Stripe.PaymentIntent;
      const orderId = intent.metadata.orderId;
      if (orderId) {
        await this.ordersService.markAsPaid(orderId);
      }
    }

    return { received: true };
  }

  async confirmCashPayment(orderId: string, sellerId: string) {
    const order = await this.ordersService.findOne(orderId, sellerId);

    if (order.sellerId.toString() !== sellerId) {
      throw new BadRequestException("Cette commande n'est pas la vôtre");
    }
    if (order.paymentMethod !== 'cash') {
      throw new BadRequestException(
        "Cette commande n'utilise pas le paiement en espèces",
      );
    }

    return this.ordersService.markAsPaid(orderId);
  }
}