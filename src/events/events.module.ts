import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { EventLogoController } from "./event-logo.controller";
import { EventsController } from "./events.controller";
import { EventsService } from "./events.service";

@Module({
  imports: [AuthModule],
  controllers: [EventsController, EventLogoController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
