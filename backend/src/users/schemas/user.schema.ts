import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  // Never store the raw password — only the bcrypt hash.
  @Prop({ required: true })
  passwordHash: string;

  @Prop({ trim: true })
  name?: string;

  @Prop({ enum: ['admin', 'seller', 'buyer'], default: 'buyer' })
  role: 'admin' | 'seller' | 'buyer';
}

export const UserSchema = SchemaFactory.createForClass(User);