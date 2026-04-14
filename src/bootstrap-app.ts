import {
  RequestMethod,
  ValidationPipe,
  type INestApplication,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import { randomUUID } from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
import type { AppEnv } from "./config/env.validation";

export function configureApp(
  app: INestApplication,
  config: ConfigService<AppEnv, true>,
): void {
  const nodeEnv = config.get("NODE_ENV", { infer: true });
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      contentSecurityPolicy: nodeEnv === "production",
    }),
  );

  const corsRaw = config.get("CORS_ORIGINS", { infer: true });
  const origin =
    typeof corsRaw === "string" && corsRaw.trim().length > 0
      ? corsRaw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : nodeEnv === "production"
        ? []
        : true;

  app.enableCors({
    origin,
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'baggage', 'sentry-trace'],
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    const reqId = req.header("x-request-id") ?? randomUUID();
    req.headers["x-request-id"] = reqId;
    res.setHeader("x-request-id", reqId);
    next();
  });

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.setGlobalPrefix("api/v1", {
    exclude: [{ path: "health", method: RequestMethod.GET }],
  });

  if (nodeEnv !== "production") {
    const swaggerConfig = new DocumentBuilder()
      .setTitle("Bingo Event API")
      .setDescription(
        [
          "MVP organizer backend. Product and contract: repository `/Docs` (see `06-api-contract.md`).",
          "",
          "**Auth:** `Authorization: Bearer <access_token>` on protected routes.",
          "",
          '**Errors:** JSON `{ "error": { "code", "message", "details" } }` with 4xx/5xx per contract.',
          "",
          "**Validation:** failed DTO checks return **400** with `code: VALIDATION_ERROR` and `details.messages`.",
        ].join("\n"),
      )
      .setVersion("1.0")
      .addBearerAuth({
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT from `POST /api/v1/auth/login` or `register`",
      })
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup("api/docs", app, document);
  }
}
