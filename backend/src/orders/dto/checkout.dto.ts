import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class ShippingDetailsDto {
  // ---- contact : toujours exigé, quel que soit le type d'article ----
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  // ---- adresse postale : exigée pour les commandes physiques ----
  // Volontairement @IsOptional() ici plutôt qu'un @ValidateIf() : le DTO est
  // validé AVANT que le panier ne soit lu, donc à cet instant on ignore
  // encore s'il contient un article physique. La règle est appliquée par
  // OrdersService.checkout(), seul endroit qui connaît le contenu du panier.
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  country?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  city?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  addressLine?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  postalCode?: string;
}

export class CheckoutDto {
  @IsEnum(['stripe', 'cash'])
  paymentMethod: 'stripe' | 'cash';

  @ValidateNested()
  @Type(() => ShippingDetailsDto)
  shipping: ShippingDetailsDto;
}
