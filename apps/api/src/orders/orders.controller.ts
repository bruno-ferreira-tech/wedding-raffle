import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  create(@Body() body: unknown) {
    return this.orders.create(body);
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.orders.getById(id);
  }

  @Post(':id/confirm-fake')
  confirmFake(@Param('id', ParseIntPipe) id: number) {
    return this.orders.confirmFake(id);
  }
}
