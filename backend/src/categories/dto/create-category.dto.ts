import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsMongoId()
  parentId?: string;

  // Set to null to explicitly clear an existing image on update.
  @IsOptional()
  @IsUrl()
  imageUrl?: string | null;
}
