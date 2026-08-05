import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
  ValidateNested,
  IsArray,
  IsUrl,
} from 'class-validator';

export class ShippingOptionDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsNumber()
  @Min(0)
  cost: number;
}

export class CreateProductDto {
  @IsMongoId()
  categoryId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  promoPrice?: number;

  // through POST /upload/image first, this just references the result.
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  images?: string[];

  @IsEnum(['physical', 'digital'])
  type: 'physical' | 'digital';

  // ---- required only when type = 'physical' ----
  @ValidateIf((dto) => dto.type === 'physical')
  @IsInt()
  @Min(0)
  stock?: number;

  @ValidateIf((dto) => dto.type === 'physical')
  @IsInt()
  @Min(0)
  weightGrams?: number;

  // Optionnel même pour un produit physique : un vendeur peut ne proposer
  // qu'un retrait en main propre, sans aucune option d'expédition.
  @ValidateIf((dto) => dto.type === 'physical')
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShippingOptionDto)
  shippingOptions?: ShippingOptionDto[];

  // ---- required only when type = 'digital' ----
  @ValidateIf((dto) => dto.type === 'digital')
  @IsString()
  @IsNotEmpty()
  fileKey?: string;

  @ValidateIf((dto) => dto.type === 'digital')
  @IsInt()
  @Min(1)
  downloadLimit?: number;
}
