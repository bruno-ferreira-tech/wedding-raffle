import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { OrdersModule } from '../orders/orders.module';
import { PadrinhoController } from './padrinho.controller';

@Module({
  imports: [AuthModule, OrdersModule],
  controllers: [PadrinhoController],
})
export class PadrinhoModule {}
