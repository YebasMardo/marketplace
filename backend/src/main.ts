import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips any field not declared in the DTO
      forbidNonWhitelisted: true, // rejects the request if it sends extra fields
      transform: true, // converts plain JSON into real DTO class instances
    }),
  );

  await app.listen(3000);
}
bootstrap();