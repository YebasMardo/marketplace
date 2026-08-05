import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CheckoutDto } from './dto/checkout.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard) // toute la ressource "orders" exige d'être connecté
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  checkout(@Body() dto: CheckoutDto, @CurrentUser() user: { userId: string }) {
    return this.ordersService.checkout(user.userId, dto.paymentMethod);
  }

  @Get('my-purchases')
  findMyPurchases(@CurrentUser() user: { userId: string }) {
    return this.ordersService.findAllForBuyer(user.userId);
  }

  @Get('my-sales')
  @UseGuards(RolesGuard)
  @Roles('seller')
  findMySales(@CurrentUser() user: { userId: string }) {
    return this.ordersService.findAllForSeller(user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: { userId: string }) {
    return this.ordersService.findOne(id, user.userId);
  }

  @Patch(':id/ship')
  @UseGuards(RolesGuard)
  @Roles('seller')
  markAsShipped(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.ordersService.markAsShipped(id, user.userId);
  }

  @Patch(':id/confirm-delivery')
  confirmDelivery(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.ordersService.confirmDelivery(id, user.userId);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @CurrentUser() user: { userId: string }) {
    return this.ordersService.cancel(id, user.userId);
  }
}
