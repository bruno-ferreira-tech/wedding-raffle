import { Controller, Get, Query } from '@nestjs/common';
import { NumbersService } from './numbers.service';

@Controller('numbers')
export class NumbersController {
  constructor(private readonly numbers: NumbersService) {}

  @Get('board')
  board(
    @Query('slug') slug?: string,
    @Query('eventId') eventId?: string,
  ) {
    return this.numbers.board(slug || eventId);
  }

  @Get('check')
  check(
    @Query('ids') ids: string | undefined,
    @Query('slug') slug?: string,
    @Query('eventId') eventId?: string,
  ) {
    return this.numbers.check(ids, slug || eventId);
  }
}
