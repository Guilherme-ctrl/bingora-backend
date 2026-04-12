export type AppEnv = {
    NODE_ENV: string;
    PORT: number;
    DATABASE_URL: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    CORS_ORIGINS?: string;
};
export declare function validateEnv(config: Record<string, unknown>): AppEnv;
