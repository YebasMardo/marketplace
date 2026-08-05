import { IsInt, Min } from 'class-validator';

export class UpdateCartItemDto {
  // 0 removes the item — see CartService.updateItem
  @IsInt()
  @Min(0)
  quantity: number;
}
