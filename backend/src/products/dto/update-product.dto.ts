import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

// Same rules as CreateProductDto, but every field becomes optional —
// avoids rewriting all the validation logic a second time.
export class UpdateProductDto extends PartialType(CreateProductDto) {}