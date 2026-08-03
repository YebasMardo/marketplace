import { IsEnum } from 'class-validator';

export class CheckoutDto {
  @IsEnum(['stripe', 'cash'])
  paymentMethod: 'stripe' | 'cash';
}
