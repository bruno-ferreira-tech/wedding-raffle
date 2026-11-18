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
import { DrawService } from '../draw/draw.service';
import { OrdersService } from '../orders/orders.service';
import {
  EventsService,
  type CreateEventDto,
  type UpdateEventDto,
} from './events.service';

@Controller()
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly ordersService: OrdersService,
    private readonly drawService: DrawService,
  ) {}

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

  @Post('events/by-slug/:slug/padrinho/mark-paid')
  async padrinhoMarkPaid(
    @Param('slug') slug: string,
    @Body()
    body: {
      pin: string;
      buyerName: string;
      numberIds: number[];
    },
  ) {
    await this.eventsService.verifyPadrinhoPin(slug, body.pin || '');
    return this.ordersService.markPaid({
      buyerName: body.buyerName,
      numberIds: body.numberIds,
      slug,
    });
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

  @Post('dashboard/events/:id/draw')
  @UseGuards(CoupleGuard)
  async drawEvent(
    @Req() req: AuthenticatedCoupleRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body('prizeLabel') prizeLabel?: string,
  ) {
    // Verifies ownership
    await this.eventsService.getDashboardEvent(req.user.userId, id);
    return this.drawService.drawNext({
      eventId: id,
      prizeLabel,
    });
  }
}
