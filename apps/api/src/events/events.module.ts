import { Module } from '@nestjs/common';
import { DbModule } from '../db/db.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

@Module({
  imports: [DbModule, RealtimeModule],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
