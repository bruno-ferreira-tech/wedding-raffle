import { Controller, Get, Query } from '@nestjs/common';
import { NumbersService } from './numbers.service';

@Controller('numbers')
export class NumbersController {
  constructor(private readonly numbers: NumbersService) {}

  @Get('board')
  board() {
    return this.numbers.board();
  }

  @Get('check')
  check(@Query('ids') ids: string | undefined) {
    return this.numbers.check(ids);
  }
}
