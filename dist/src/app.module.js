"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const throttler_1 = require("@nestjs/throttler");
const env_validation_1 = require("./config/env.validation");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const organizers_module_1 = require("./organizers/organizers.module");
const health_module_1 = require("./health/health.module");
const events_module_1 = require("./events/events.module");
const prizes_module_1 = require("./prizes/prizes.module");
const cards_module_1 = require("./cards/cards.module");
const participants_module_1 = require("./participants/participants.module");
const sales_module_1 = require("./sales/sales.module");
const draw_module_1 = require("./draw/draw.module");
const winners_module_1 = require("./winners/winners.module");
const finance_module_1 = require("./finance/finance.module");
const event_sellers_module_1 = require("./event-sellers/event-sellers.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                validate: env_validation_1.validateEnv,
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60_000,
                    limit: 120,
                },
            ]),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            organizers_module_1.OrganizersModule,
            events_module_1.EventsModule,
            prizes_module_1.PrizesModule,
            cards_module_1.CardsModule,
            participants_module_1.ParticipantsModule,
            sales_module_1.SalesModule,
            draw_module_1.DrawModule,
            winners_module_1.WinnersModule,
            finance_module_1.FinanceModule,
            event_sellers_module_1.EventSellersModule,
            health_module_1.HealthModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map