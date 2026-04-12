import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { EventsModule } from '../events/events.module';
import { DrawController } from './draw.controller';
import { DrawService } from './draw.service';

@Module({
  imports: [AuthModule, EventsModule],
  controllers: [DrawController],
  providers: [DrawService],
  exports: [DrawService],
})
export class DrawModule {}
