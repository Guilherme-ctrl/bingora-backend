import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { EventsModule } from "../events/events.module";
import { DomainEventsModule } from "../domain-events/domain-events.module";
import { DrawController } from "./draw.controller";
import { RoundDrawController } from "./round-draw.controller";
import { DrawService } from "./draw.service";

@Module({
  imports: [AuthModule, EventsModule, DomainEventsModule],
  controllers: [DrawController, RoundDrawController],
  providers: [DrawService],
  exports: [DrawService],
})
export class DrawModule {}
