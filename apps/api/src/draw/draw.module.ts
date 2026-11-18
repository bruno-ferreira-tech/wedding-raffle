import { Module } from '@nestjs/common';
import { DbModule } from '../db/db.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { DrawService } from './draw.service';

@Module({
  imports: [DbModule, RealtimeModule],
  providers: [DrawService],
  exports: [DrawService],
})
export class DrawModule {}
