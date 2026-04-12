"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnv = validateEnv;
function validateEnv(config) {
    const errors = [];
    const nodeEnv = typeof config['NODE_ENV'] === 'string' ? config['NODE_ENV'] : 'development';
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
    const port = typeof portRaw === 'string'
        ? Number.parseInt(portRaw, 10)
        : typeof portRaw === 'number'
            ? portRaw
            : 3000;
    if (Number.isNaN(port) || port < 1) {
        errors.push('PORT must be a positive number');
    }
    const corsOrigins = config['CORS_ORIGINS'];
    const corsOriginsStr = typeof corsOrigins === 'string' ? corsOrigins.trim() : '';
    if (nodeEnv === 'production' && corsOriginsStr.length === 0) {
        errors.push('CORS_ORIGINS is required in production (comma-separated origins, e.g. https://app.example.com,https://www.example.com)');
    }
    if (errors.length > 0) {
        throw new Error(`Invalid environment:\n- ${errors.join('\n- ')}`);
    }
    return {
        NODE_ENV: nodeEnv,
        PORT: port,
        DATABASE_URL: databaseUrl,
        JWT_SECRET: jwtSecret,
        JWT_EXPIRES_IN: jwtExpiresIn,
        ...(corsOriginsStr.length > 0 ? { CORS_ORIGINS: corsOriginsStr } : {}),
    };
}
//# sourceMappingURL=env.validation.js.map