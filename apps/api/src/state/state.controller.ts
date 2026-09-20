import { Controller, Get, Query } from '@nestjs/common';
import { StateService } from './state.service';

@Controller('state')
export class StateController {
  constructor(private readonly state: StateService) {}

  @Get()
  getSnapshot(
    @Query('slug') slug?: string,
    @Query('eventId') eventId?: string,
  ) {
    const parsedEventId = eventId && /^\d+$/.test(eventId) ? Number(eventId) : undefined;
    return this.state.getSnapshot({
      slug: slug?.trim() || undefined,
      eventId: parsedEventId,
    });
  }
}

