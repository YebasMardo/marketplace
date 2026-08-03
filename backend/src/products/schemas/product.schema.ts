import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true }) 
export class Product {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  sellerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true, index: true })
  categoryId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ required: true, min: 0 })
  price: number;

  // Quand il est défini, c'est LUI qui est facturé — voir CartService.
  @Prop({ required: false, min: 0 })
  promoPrice?: number;

  // Cloudinary URLs from the upload module — never binary data here.
  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ enum: ['draft', 'active', 'suspended'], default: 'draft' })
  status: string;

  @Prop({ required: true, enum: ['physical', 'digital'] })
  type: 'physical' | 'digital';

  // ---- Physical-only fields (undefined when type = 'digital') ----
  @Prop({ min: 0 })
  stock?: number;

  @Prop({ min: 0 })
  weightGrams?: number;

  @Prop({ type: [{ label: String, cost: Number }], default: undefined })
  shippingOptions?: { label: string; cost: number }[];

  // ---- Digital-only fields (undefined when type = 'physical') ----
  @Prop()
  fileKey?: string; // storage reference, never a public URL

  @Prop({ min: 1 })
  downloadLimit?: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);