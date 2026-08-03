import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  // rawBody: true garde le Buffer brut de chaque requête dans req.rawBody,
  // en plus du JSON déjà parsé dans req.body — indispensable pour que
  // Stripe.webhooks.constructEvent() puisse vérifier la signature.
  const app = await NestFactory.create(AppModule, { rawBody: true });

  // Sans ça, le navigateur bloque toute requête du frontend (:5173)
  // vers l'API (:3000) — les deux origines étant différentes.
  app.enableCors({
    // `||` et non `??` : docker-compose définit FRONTEND_URL à la chaîne
    // vide quand la variable est absente du .env, et `?? ` ne rattrape pas
    // une chaîne vide — l'origine autorisée serait alors "".
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

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