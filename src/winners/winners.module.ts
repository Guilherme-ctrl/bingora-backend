import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { EventsModule } from "../events/events.module";
import { EventWinnersController } from "./event-winners.controller";
import { WinnersController } from "./winners.controller";
import { WinnersService } from "./winners.service";

@Module({
  imports: [AuthModule, EventsModule],
  controllers: [EventWinnersController, WinnersController],
  providers: [WinnersService],
  exports: [WinnersService],
})
export class WinnersModule {}
