import { Type } from 'class-transformer';
import {
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class QueryProductsDto {
  @IsOptional()
  @IsMongoId()
  categoryId?: string;

  @IsOptional()
  @IsMongoId()
  sellerId?: string;

  // Recherche plein texte simple sur le titre et la description.
  @IsOptional()
  @IsString()
  q?: string;

  // @Type est indispensable ici : un paramètre d'URL arrive toujours en
  // string, @IsInt échouerait sans cette conversion préalable.
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100) // garde-fou : empêche un client de demander 10 000 produits d'un coup
  limit?: number = 20;
}
