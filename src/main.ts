import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "node:path";
import * as Sentry from "@sentry/node";
import { AppModule } from "./app.module";
import { configureApp } from "./bootstrap-app";
import type { AppEnv } from "./config/env.validation";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService<AppEnv, true>);
  const sentryDsn = config.get("SENTRY_DSN", { infer: true });
  if (sentryDsn) {
    const tracesSampleRateRaw =
      config.get("SENTRY_TRACES_SAMPLE_RATE", { infer: true }) ?? "0.05";
    const tracesSampleRate = Number.parseFloat(tracesSampleRateRaw);
    Sentry.init({
      dsn: sentryDsn,
      environment:
        config.get("SENTRY_ENVIRONMENT", { infer: true }) ??
        config.get("NODE_ENV", { infer: true }),
      release: config.get("SENTRY_RELEASE", { infer: true }),
      tracesSampleRate: Number.isFinite(tracesSampleRate)
        ? tracesSampleRate
        : 0.05,
      sendDefaultPii: false,
    });
  }
  configureApp(app, config);
  app.useStaticAssets(join(process.cwd(), "uploads"), { prefix: "/uploads/" });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}

void bootstrap();
