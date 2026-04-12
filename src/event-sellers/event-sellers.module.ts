import { Module } from '@nestjs/common';
import { EventsModule } from '../events/events.module';
import { EventSellersController } from './event-sellers.controller';
import { EventSellersService } from './event-sellers.service';

@Module({
  imports: [EventsModule],
  controllers: [EventSellersController],
  providers: [EventSellersService],
})
export class EventSellersModule {}
