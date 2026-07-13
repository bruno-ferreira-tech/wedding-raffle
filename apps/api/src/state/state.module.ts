import { Module } from '@nestjs/common';
import { DbModule } from '../db/db.module';
import { StateController } from './state.controller';
import { StateService } from './state.service';

@Module({
  imports: [DbModule],
  controllers: [StateController],
  providers: [StateService],
})
export class StateModule {}
