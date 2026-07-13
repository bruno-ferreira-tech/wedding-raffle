import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AdminGuard } from './admin.guard';
import { PadrinhoGuard } from './padrinho.guard';

@Module({
  controllers: [AuthController],
  providers: [AdminGuard, PadrinhoGuard],
  exports: [AdminGuard, PadrinhoGuard],
})
export class AuthModule {}
