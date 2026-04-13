import { Module } from "@nestjs/common";
import { EventsModule } from "../events/events.module";
import { AuthModule } from "../auth/auth.module";
import { RoundsController } from "./rounds.controller";
import { RoundsService } from "./rounds.service";

@Module({
  imports: [AuthModule, EventsModule],
  controllers: [RoundsController],
  providers: [RoundsService],
  exports: [RoundsService],
})
export class RoundsModule {}
