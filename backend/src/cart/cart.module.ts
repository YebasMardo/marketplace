import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { ProductsModule } from '../products/products.module';

@Module({
  // RedisService is available everywhere already — RedisModule is @Global().
  // ProductsModule is imported to reuse ProductsService for live lookups.
  imports: [ProductsModule],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
