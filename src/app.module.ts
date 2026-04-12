import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { validateEnv } from "./config/env.validation";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { OrganizersModule } from "./organizers/organizers.module";
import { HealthModule } from "./health/health.module";
import { EventsModule } from "./events/events.module";
import { PrizesModule } from "./prizes/prizes.module";
import { CardsModule } from "./cards/cards.module";
import { ParticipantsModule } from "./participants/participants.module";
import { SalesModule } from "./sales/sales.module";
import { DrawModule } from "./draw/draw.module";
import { WinnersModule } from "./winners/winners.module";
import { FinanceModule } from "./finance/finance.module";
import { EventSellersModule } from "./event-sellers/event-sellers.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 120,
      },
    ]),
    PrismaModule,
    AuthModule,
    OrganizersModule,
    EventsModule,
    PrizesModule,
    CardsModule,
    ParticipantsModule,
    SalesModule,
    DrawModule,
    WinnersModule,
    FinanceModule,
    EventSellersModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
