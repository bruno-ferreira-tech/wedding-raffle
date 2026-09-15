import { Module } from '@nestjs/common';
import { DbModule } from '../db/db.module';
import { PayoutsController } from './payouts.controller';
import { PayoutsService } from './payouts.service';
import {
  FakePayoutTransferProvider,
  PAYOUT_TRANSFER_PROVIDER,
} from './transfer-provider';

@Module({
  imports: [DbModule],
  controllers: [PayoutsController],
  providers: [
    PayoutsService,
    {
      provide: PAYOUT_TRANSFER_PROVIDER,
      useClass: FakePayoutTransferProvider,
    },
  ],
  exports: [PayoutsService],
})
export class PayoutsModule {}
