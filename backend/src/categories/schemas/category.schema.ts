import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true, trim: true })
  name: string;

  // Generated automatically from name — see CategoriesService.slugify().
  // Used for clean URLs like /categories/electronique instead of an ObjectId.
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  // null = top-level category. Set to a parent's _id for a sub-category.
  @Prop({ type: Types.ObjectId, ref: 'Category', default: null })
  parentId: Types.ObjectId | null;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
