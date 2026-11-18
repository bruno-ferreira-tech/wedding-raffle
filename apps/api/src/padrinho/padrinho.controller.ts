import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PadrinhoGuard } from '../auth/padrinho.guard';
import { OrdersService } from '../orders/orders.service';

@Controller('padrinho')
@UseGuards(PadrinhoGuard)
export class PadrinhoController {
  constructor(private readonly orders: OrdersService) {}

  @Post('mark-paid')
  markPaid(@Body() body: unknown) {
    return this.orders.markPaid(body);
  }
}
