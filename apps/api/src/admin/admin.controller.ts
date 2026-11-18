import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { DrawService } from '../draw/draw.service';
import { EventStateService } from './event-state.service';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(
    private readonly eventState: EventStateService,
    private readonly draw: DrawService,
  ) {}

  @Post('sales')
  setSalesStatus(@Body() body: unknown) {
    return this.eventState.setSalesStatus(body);
  }

  @Post('draw')
  drawNext(@Body() body: unknown) {
    return this.draw.drawNext(body);
  }
}
