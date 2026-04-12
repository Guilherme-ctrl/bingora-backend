import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "node:path";
import { AppModule } from "./app.module";
import { configureApp } from "./bootstrap-app";
import type { AppEnv } from "./config/env.validation";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService<AppEnv, true>);
  configureApp(app, config);
  app.useStaticAssets(join(process.cwd(), "uploads"), { prefix: "/uploads/" });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}

void bootstrap();
