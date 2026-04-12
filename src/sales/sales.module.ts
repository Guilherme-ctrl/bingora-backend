import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CardsModule } from '../cards/cards.module';
import { EventsModule } from '../events/events.module';
import { EventSalesController } from './event-sales.controller';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';

@Module({
  imports: [AuthModule, EventsModule, CardsModule],
  controllers: [EventSalesController, SalesController],
  providers: [SalesService],
  exports: [SalesService],
})
export class SalesModule {}
