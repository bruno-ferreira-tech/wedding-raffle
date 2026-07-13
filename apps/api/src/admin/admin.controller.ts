import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { EventStateService } from './event-state.service';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly eventState: EventStateService) {}

  @Post('sales')
  setSalesStatus(@Body() body: unknown) {
    return this.eventState.setSalesStatus(body);
  }
}
