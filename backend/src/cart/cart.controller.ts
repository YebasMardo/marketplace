import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('cart')
@UseGuards(JwtAuthGuard) // toutes les routes ci-dessous exigent un token valide
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@CurrentUser() user: { userId: string }) {
    return this.cartService.getCart(user.userId);
  }

  @Post('items')
  addItem(
    @Body() dto: AddCartItemDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.cartService.addItem(user.userId, dto.productId, dto.quantity);
  }

  @Patch('items/:productId')
  updateItem(
    @Param('productId') productId: string,
    @Body() dto: UpdateCartItemDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.cartService.updateItem(user.userId, productId, dto.quantity);
  }

  @Delete('items/:productId')
  removeItem(
    @Param('productId') productId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.cartService.removeItem(user.userId, productId);
  }

  @Delete()
  clearCart(@CurrentUser() user: { userId: string }) {
    return this.cartService.clearCart(user.userId);
  }
}