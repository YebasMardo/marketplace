import {
  Controller,
  Headers,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post(':orderId/create-intent')
  @UseGuards(JwtAuthGuard)
  createIntent(
    @Param('orderId') orderId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.paymentsService.createIntent(orderId, user.userId);
  }

  @Patch(':orderId/confirm-cash')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller')
  confirmCash(
    @Param('orderId') orderId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.paymentsService.confirmCashPayment(orderId, user.userId);
  }

  // Pas de JwtAuthGuard ici — Stripe appelle cette route directement,
  // sans utilisateur connecté. La vérification de signature à l'intérieur
  // de PaymentsService.handleWebhook() EST la sécurité de cette route.
  @Post('webhook')
  handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.paymentsService.handleWebhook(req.rawBody!, signature);
  }
}
