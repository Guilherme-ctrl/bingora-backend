export type AppEnv = {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
};

export function validateEnv(config: Record<string, unknown>): AppEnv {
  const errors: string[] = [];

  const databaseUrl = config['DATABASE_URL'];
  if (typeof databaseUrl !== 'string' || databaseUrl.length === 0) {
    errors.push('DATABASE_URL must be a non-empty string');
  }

  const jwtSecret = config['JWT_SECRET'];
  if (typeof jwtSecret !== 'string' || jwtSecret.length < 16) {
    errors.push('JWT_SECRET must be a string with at least 16 characters');
  }

  const jwtExpiresIn = config['JWT_EXPIRES_IN'];
  if (typeof jwtExpiresIn !== 'string' || jwtExpiresIn.length === 0) {
    errors.push('JWT_EXPIRES_IN must be a non-empty string (e.g. 3600s)');
  }

  const portRaw = config['PORT'];
  const port =
    typeof portRaw === 'string'
      ? Number.parseInt(portRaw, 10)
      : typeof portRaw === 'number'
        ? portRaw
        : 3000;
  if (Number.isNaN(port) || port < 1) {
    errors.push('PORT must be a positive number');
  }

  if (errors.length > 0) {
    throw new Error(`Invalid environment:\n- ${errors.join('\n- ')}`);
  }

  return {
    NODE_ENV:
      typeof config['NODE_ENV'] === 'string'
        ? config['NODE_ENV']
        : 'development',
    PORT: port,
    DATABASE_URL: databaseUrl as string,
    JWT_SECRET: jwtSecret as string,
    JWT_EXPIRES_IN: jwtExpiresIn as string,
  };
}
