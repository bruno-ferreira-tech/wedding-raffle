import { Module } from '@nestjs/common';
import { EVENT_BUS, eventBus } from './bus';
import { EventsController } from './events.controller';

@Module({
  controllers: [EventsController],
  providers: [{ provide: EVENT_BUS, useValue: eventBus }],
  exports: [EVENT_BUS],
})
export class RealtimeModule {}
