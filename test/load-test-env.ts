/**
 * Ensures ConfigModule validation passes when running e2e without a local `.env`.
 */
process.env.DATABASE_URL ??=
  "postgresql://test:test@127.0.0.1:5432/test_e2e_placeholder";
process.env.JWT_SECRET ??= "test_jwt_secret_at_least_16_chars";
process.env.JWT_EXPIRES_IN ??= "3600s";
