import "reflect-metadata";

import { NestFactory } from "@nestjs/core";

import { getRuntimeFoundationConfig } from "@mafia-game/config";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const runtimeConfig = getRuntimeFoundationConfig();
  const port = Number(process.env.PORT ?? runtimeConfig.api.defaultPort);

  app.setGlobalPrefix(runtimeConfig.api.globalPrefix);
  app.enableCors({
    origin: true,
    credentials: true
  });

  await app.listen(port);
}

void bootstrap();
