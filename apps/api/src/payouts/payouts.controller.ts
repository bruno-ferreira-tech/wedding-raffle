import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CoupleGuard, type AuthenticatedCoupleRequest } from '../auth/couple.guard';
import { PayoutsService } from './payouts.service';

@Controller('dashboard/events/:id')
@UseGuards(CoupleGuard)
export class PayoutsController {
  constructor(private readonly payoutsService: PayoutsService) {}

  @Get('balance')
  async getBalance(
    @Req() req: AuthenticatedCoupleRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.payoutsService.getBalance(req.user.userId, id);
  }

  @Post('payouts')
  async requestPayout(
    @Req() req: AuthenticatedCoupleRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { amountCents?: number; pixKey?: string; pixKeyType?: string },
  ) {
    return this.payoutsService.requestPayout(req.user.userId, id, dto);
  }

  @Get('payouts')
  async listPayouts(
    @Req() req: AuthenticatedCoupleRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.payoutsService.listPayouts(req.user.userId, id);
  }
}
