export type AppEnv = {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  /** Comma-separated browser origins allowed by CORS (required when NODE_ENV is production). */
  CORS_ORIGINS?: string;
  /** When true, sales require active round in EM_VENDA. */
  ROUND_FLOW_ENFORCED?: string;
  SENTRY_DSN?: string;
  SENTRY_ENVIRONMENT?: string;
  SENTRY_RELEASE?: string;
  SENTRY_TRACES_SAMPLE_RATE?: string;
};

export function validateEnv(config: Record<string, unknown>): AppEnv {
  const errors: string[] = [];

  const nodeEnv =
    typeof config["NODE_ENV"] === "string" ? config["NODE_ENV"] : "development";

  const databaseUrl = config["DATABASE_URL"];
  if (typeof databaseUrl !== "string" || databaseUrl.length === 0) {
    errors.push("DATABASE_URL must be a non-empty string");
  }

  const jwtSecret = config["JWT_SECRET"];
  if (typeof jwtSecret !== "string" || jwtSecret.length < 16) {
    errors.push("JWT_SECRET must be a string with at least 16 characters");
  }

  const jwtExpiresIn = config["JWT_EXPIRES_IN"];
  if (typeof jwtExpiresIn !== "string" || jwtExpiresIn.length === 0) {
    errors.push("JWT_EXPIRES_IN must be a non-empty string (e.g. 3600s)");
  }

  const portRaw = config["PORT"];
  const port =
    typeof portRaw === "string"
      ? Number.parseInt(portRaw, 10)
      : typeof portRaw === "number"
        ? portRaw
        : 3000;
  if (Number.isNaN(port) || port < 1) {
    errors.push("PORT must be a positive number");
  }

  const corsOrigins = config["CORS_ORIGINS"];
  const corsOriginsStr =
    typeof corsOrigins === "string" ? corsOrigins.trim() : "";
  if (nodeEnv === "production" && corsOriginsStr.length === 0) {
    errors.push(
      "CORS_ORIGINS is required in production (comma-separated origins, e.g. https://app.example.com,https://www.example.com)",
    );
  }

  if (errors.length > 0) {
    throw new Error(`Invalid environment:\n- ${errors.join("\n- ")}`);
  }

  const roundFlowEnforced = config["ROUND_FLOW_ENFORCED"];
  const sentryDsn = config["SENTRY_DSN"];
  const sentryEnvironment = config["SENTRY_ENVIRONMENT"];
  const sentryRelease = config["SENTRY_RELEASE"];
  const sentryTracesSampleRate = config["SENTRY_TRACES_SAMPLE_RATE"];

  return {
    NODE_ENV: nodeEnv,
    PORT: port,
    DATABASE_URL: databaseUrl as string,
    JWT_SECRET: jwtSecret as string,
    JWT_EXPIRES_IN: jwtExpiresIn as string,
    ...(corsOriginsStr.length > 0 ? { CORS_ORIGINS: corsOriginsStr } : {}),
    ...(typeof roundFlowEnforced === "string" && roundFlowEnforced.length > 0
      ? { ROUND_FLOW_ENFORCED: roundFlowEnforced }
      : {}),
    ...(typeof sentryDsn === "string" && sentryDsn.length > 0
      ? { SENTRY_DSN: sentryDsn }
      : {}),
    ...(typeof sentryEnvironment === "string" && sentryEnvironment.length > 0
      ? { SENTRY_ENVIRONMENT: sentryEnvironment }
      : {}),
    ...(typeof sentryRelease === "string" && sentryRelease.length > 0
      ? { SENTRY_RELEASE: sentryRelease }
      : {}),
    ...(typeof sentryTracesSampleRate === "string" &&
    sentryTracesSampleRate.length > 0
      ? { SENTRY_TRACES_SAMPLE_RATE: sentryTracesSampleRate }
      : {}),
  };
}
