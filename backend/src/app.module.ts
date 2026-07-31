import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from './redis/redis.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UploadModule } from './upload/upload.module';

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
    UploadModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}