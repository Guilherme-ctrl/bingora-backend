import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { EventsModule } from "../events/events.module";
import { CardsController } from "./cards.controller";
import { CardsService } from "./cards.service";

@Module({
  imports: [AuthModule, EventsModule],
  controllers: [CardsController],
  providers: [CardsService],
  exports: [CardsService],
})
export class CardsModule {}
