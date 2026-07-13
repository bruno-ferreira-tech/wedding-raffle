import { Module } from '@nestjs/common';
import { EVENT_BUS, eventBus } from './bus';

@Module({
  providers: [{ provide: EVENT_BUS, useValue: eventBus }],
  exports: [EVENT_BUS],
})
export class RealtimeModule {}
