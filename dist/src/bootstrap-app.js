"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureApp = configureApp;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
function configureApp(app) {
    app.enableCors({
        origin: true,
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
//# sourceMappingURL=bootstrap-app.js.map