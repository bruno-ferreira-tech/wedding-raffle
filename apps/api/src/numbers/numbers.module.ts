import { Module } from '@nestjs/common';
import { DbModule } from '../db/db.module';
import { NumbersController } from './numbers.controller';
import { NumbersService } from './numbers.service';

@Module({
  imports: [DbModule],
  controllers: [NumbersController],
  providers: [NumbersService],
})
export class NumbersModule {}
