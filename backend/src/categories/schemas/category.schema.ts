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

  // Cloudinary secure URL, set via POST /upload/image?folder=categories.
  // Explicit `type: String` — Mongoose can't infer a schema type from a
  // `string | null` union via TS reflection metadata.
  @Prop({ type: String, trim: true, default: null })
  imageUrl: string | null;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
