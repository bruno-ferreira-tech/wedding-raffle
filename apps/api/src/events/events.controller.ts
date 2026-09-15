import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CoupleGuard, type AuthenticatedCoupleRequest } from '../auth/couple.guard';
import {
  EventsService,
  type CreateEventDto,
  type UpdateEventDto,
} from './events.service';

@Controller()
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get('events/by-slug/:slug')
  async getPublicEvent(@Param('slug') slug: string) {
    return this.eventsService.getPublicBySlug(slug);
  }

  @Post('events/by-slug/:slug/verify-padrinho')
  async verifyPadrinho(
    @Param('slug') slug: string,
    @Body('pin') pin: string,
  ) {
    return this.eventsService.verifyPadrinhoPin(slug, pin || '');
  }

  @Get('dashboard/events')
  @UseGuards(CoupleGuard)
  async listUserEvents(@Req() req: AuthenticatedCoupleRequest) {
    return this.eventsService.listByUser(req.user.userId);
  }

  @Post('dashboard/events')
  @UseGuards(CoupleGuard)
  async createEvent(
    @Req() req: AuthenticatedCoupleRequest,
    @Body() dto: CreateEventDto,
  ) {
    return this.eventsService.create(req.user.userId, dto);
  }

  @Get('dashboard/events/:id')
  @UseGuards(CoupleGuard)
  async getDashboardEvent(
    @Req() req: AuthenticatedCoupleRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.eventsService.getDashboardEvent(req.user.userId, id);
  }

  @Put('dashboard/events/:id')
  @UseGuards(CoupleGuard)
  async updateEvent(
    @Req() req: AuthenticatedCoupleRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventsService.update(req.user.userId, id, dto);
  }

  @Post('dashboard/events/:id/sales-status')
  @UseGuards(CoupleGuard)
  async setSalesStatus(
    @Req() req: AuthenticatedCoupleRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: 'open' | 'closed',
  ) {
    return this.eventsService.setSalesStatus(req.user.userId, id, status);
  }
}
