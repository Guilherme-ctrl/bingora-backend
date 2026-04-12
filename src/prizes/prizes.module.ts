import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { EventsModule } from '../events/events.module';
import { EventPrizesController } from './event-prizes.controller';
import { PrizesController } from './prizes.controller';
import { PrizesService } from './prizes.service';

@Module({
  imports: [AuthModule, EventsModule],
  controllers: [EventPrizesController, PrizesController],
  providers: [PrizesService],
  exports: [PrizesService],
})
export class PrizesModule {}
