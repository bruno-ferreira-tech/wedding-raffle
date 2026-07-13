import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DbModule } from '../db/db.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { AdminController } from './admin.controller';
import { EventStateService } from './event-state.service';

@Module({
  imports: [AuthModule, DbModule, RealtimeModule],
  controllers: [AdminController],
  providers: [EventStateService],
  exports: [EventStateService],
})
export class AdminModule {}
