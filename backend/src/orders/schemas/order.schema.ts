import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderStatus =
  | 'pending_payment'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'cancelled';

// _id: false — line items are frozen at purchase time, never edited or
// looked up individually, so they don't need their own identity.
@Schema({ _id: false })
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  // Snapshot of title/price at purchase time — deliberately NOT re-read
  // live from Product, otherwise a later price change would silently
  // rewrite the history of a past order.
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true, min: 1 })
  quantity: number;
}

const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

// Coordonnées saisies au checkout, figées sur la commande au même titre que
// les lignes d'articles : modifier son profil plus tard ne doit pas réécrire
// l'adresse à laquelle une commande passée a réellement été expédiée.
// _id: false — même raison que OrderItem, cet objet n'a pas d'identité propre.
@Schema({ _id: false })
export class ShippingDetails {
  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ required: true, trim: true, lowercase: true })
  email: string;

  @Prop({ required: true, trim: true })
  phone: string;

  // Optionnels ici, exigés par OrdersService.checkout() pour les commandes
  // physiques uniquement : une commande numérique n'a pas d'adresse de
  // livraison, seulement un contact.
  @Prop({ trim: true })
  country?: string;

  @Prop({ trim: true })
  city?: string;

  @Prop({ trim: true })
  addressLine?: string;

  @Prop({ trim: true })
  postalCode?: string;
}

const ShippingDetailsSchema = SchemaFactory.createForClass(ShippingDetails);

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  buyerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  sellerId: Types.ObjectId;

  // One value for the whole order, never mixed — see OrdersService.checkout()
  @Prop({ required: true, enum: ['physical', 'digital'] })
  fulfillmentType: 'physical' | 'digital';

  @Prop({ type: [OrderItemSchema], required: true })
  items: OrderItem[];

  @Prop({ required: true, min: 0 })
  total: number;

  // Pas `required` alors que checkout() le renseigne systématiquement : les
  // commandes créées avant l'ajout de ce champ n'en ont pas, et Mongoose
  // valide le document ENTIER à chaque save() — le rendre obligatoire ferait
  // échouer cancel()/markAsShipped()/markAsPaid() sur ces commandes-là.
  // Côté lecture, les consommateurs doivent donc tester sa présence.
  @Prop({ type: ShippingDetailsSchema })
  shipping?: ShippingDetails;

  @Prop({ required: true, enum: ['stripe', 'cash'] })
  paymentMethod: 'stripe' | 'cash';

  // Only set when paymentMethod = 'stripe' — used to match the order
  // when the webhook fires.
  @Prop()
  stripePaymentIntentId?: string;

  @Prop({
    enum: [
      'pending_payment',
      'processing',
      'shipped',
      'delivered',
      'completed',
      'cancelled',
    ],
    default: 'pending_payment',
  })
  status: OrderStatus;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
