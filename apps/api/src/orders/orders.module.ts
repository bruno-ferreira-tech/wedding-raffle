import { Module } from '@nestjs/common';
import { DbModule } from '../db/db.module';
import { PaymentsModule } from '../payments/payments.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { WebhooksController } from './webhooks.controller';

@Module({
  imports: [DbModule, PaymentsModule, RealtimeModule],
  controllers: [OrdersController, WebhooksController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
