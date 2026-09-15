import { Module } from '@nestjs/common';
import { DbModule } from '../db/db.module';
import { DrawModule } from '../draw/draw.module';
import { OrdersModule } from '../orders/orders.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

@Module({
  imports: [DbModule, RealtimeModule, OrdersModule, DrawModule],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
