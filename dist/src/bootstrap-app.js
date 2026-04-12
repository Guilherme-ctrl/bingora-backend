"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureApp = configureApp;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = __importDefault(require("helmet"));
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
function configureApp(app, config) {
    const nodeEnv = config.get('NODE_ENV', { infer: true });
    app.use((0, helmet_1.default)({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        contentSecurityPolicy: nodeEnv === 'production',
    }));
    const corsRaw = config.get('CORS_ORIGINS', { infer: true });
    const origin = typeof corsRaw === 'string' && corsRaw.trim().length > 0
        ? corsRaw
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : nodeEnv === 'production'
            ? []
            : true;
    app.enableCors({
        origin,
        credentials: true,
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter());
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.setGlobalPrefix('api/v1', {
        exclude: [{ path: 'health', method: common_1.RequestMethod.GET }],
    });
    if (nodeEnv !== 'production') {
        const swaggerConfig = new swagger_1.DocumentBuilder()
            .setTitle('Bingo Event API')
            .setDescription([
            'MVP organizer backend. Product and contract: repository `/Docs` (see `06-api-contract.md`).',
            '',
            '**Auth:** `Authorization: Bearer <access_token>` on protected routes.',
            '',
            '**Errors:** JSON `{ "error": { "code", "message", "details" } }` with 4xx/5xx per contract.',
            '',
            '**Validation:** failed DTO checks return **400** with `code: VALIDATION_ERROR` and `details.messages`.',
        ].join('\n'))
            .setVersion('1.0')
            .addBearerAuth({
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'JWT from `POST /api/v1/auth/login` or `register`',
        })
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
        swagger_1.SwaggerModule.setup('api/docs', app, document);
    }
}
//# sourceMappingURL=bootstrap-app.js.map