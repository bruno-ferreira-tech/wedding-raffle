import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'node:path';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { OrdersModule } from './orders/orders.module';
import { PadrinhoModule } from './padrinho/padrinho.module';
import { PaymentsModule } from './payments/payments.module';
import { RealtimeModule } from './realtime/realtime.module';
import { StateModule } from './state/state.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(__dirname, '..', '.env'),
    }),
    AuthModule,
    PaymentsModule,
    OrdersModule,
    PadrinhoModule,
    AdminModule,
    StateModule,
    RealtimeModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
