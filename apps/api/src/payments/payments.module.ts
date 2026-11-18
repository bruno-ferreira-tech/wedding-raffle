import { Module } from '@nestjs/common';
import { getPaymentProvider } from './get-payment-provider';
import { PAYMENT_PROVIDER } from './types';

@Module({
  providers: [
    {
      provide: PAYMENT_PROVIDER,
      useFactory: () => getPaymentProvider(),
    },
  ],
  exports: [PAYMENT_PROVIDER],
})
export class PaymentsModule {}
