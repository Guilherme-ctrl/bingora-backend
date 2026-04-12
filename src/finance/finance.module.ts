import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { EventsModule } from '../events/events.module';
import { EventFinanceController } from './event-finance.controller';
import { FinanceService } from './finance.service';

@Module({
  imports: [AuthModule, EventsModule],
  controllers: [EventFinanceController],
  providers: [FinanceService],
})
export class FinanceModule {}
