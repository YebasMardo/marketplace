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
