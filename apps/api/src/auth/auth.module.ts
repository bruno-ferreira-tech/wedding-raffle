import { DbModule } from '../db/db.module';
import { AdminGuard } from './admin.guard';
import { AuthController } from './auth.controller';
import { CoupleAuthService } from './couple-auth.service';
import { CoupleGuard } from './couple.guard';
import { PadrinhoGuard } from './padrinho.guard';

@Module({
  imports: [DbModule],
  controllers: [AuthController],
  providers: [AdminGuard, PadrinhoGuard, CoupleAuthService, CoupleGuard],
  exports: [AdminGuard, PadrinhoGuard, CoupleAuthService, CoupleGuard],
})
export class AuthModule {}
