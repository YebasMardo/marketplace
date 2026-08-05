import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from './redis/redis.module';
import { UploadModule } from './upload/upload.module';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { EmailModule } from './email/email.module';
import { PaymentsModule } from './payments/payments.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // isGlobal: true means you don't need to re-import ConfigModule
    // in every feature module to access ConfigService.
    ConfigModule.forRoot({ isGlobal: true }),

    // forRootAsync waits for ConfigService to be ready before building
    // the connection URI — avoids hardcoding a value that differs
    // between your local machine and the Docker container.
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
      }),
    }),

    RedisModule,
    UploadModule,
    ProductsModule,
    UsersModule,
    AuthModule,
    CategoriesModule,
    CartModule,
    OrdersModule,
    EmailModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
