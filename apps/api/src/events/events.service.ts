import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, asc, eq, inArray } from 'drizzle-orm';
import { DB, type Db } from '../db/db.module';
import {
  eventPrizes,
  events,
  orders,
  raffleNumbers,
} from '../db/schema';
import { EVENT_BUS, type EventBus } from '../realtime/bus';
import { slugify } from './slug';

export type CreateEventDto = {
  title?: string;
  coupleNames: string;
  slug?: string;
  eventDate?: string;
  coverImageUrl?: string;
  welcomeMessage?: string;
  themeId?: string;
  totalNumbers?: number;
  ticketPriceCents?: number;
  padrinhoPin?: string;
  pixKey?: string;
  pixKeyType?: string;
  prizes?: Array<{ prizeIndex: number; label: string }>;
};

export type UpdateEventDto = {
  title?: string;
  coupleNames?: string;
  eventDate?: string;
  coverImageUrl?: string;
  welcomeMessage?: string;
  themeId?: string;
  ticketPriceCents?: number;
  padrinhoPin?: string;
  pixKey?: string;
  pixKeyType?: string;
  prizes?: Array<{ prizeIndex: number; label: string }>;
};

@Injectable()
export class EventsService {
  constructor(
    @Inject(DB) private readonly db: Db,
    @Inject(EVENT_BUS) private readonly bus: EventBus,
  ) {}

  async create(userId: number, dto: CreateEventDto) {
    const coupleNames = dto.coupleNames?.trim();
    if (!coupleNames) {
      throw new BadRequestException('Nome dos noivos é obrigatório.');
    }

    const title = dto.title?.trim() || `Casamento ${coupleNames}`;
    let rawSlug = dto.slug?.trim() ? slugify(dto.slug) : slugify(coupleNames);
    if (!rawSlug) {
      rawSlug = `casamento-${Date.now().toString(36)}`;
    }

    // Check slug uniqueness
    const [existing] = await this.db
      .select({ id: events.id })
      .from(events)
      .where(eq(events.slug, rawSlug))
      .limit(1);

    const slug = existing ? `${rawSlug}-${Math.random().toString(36).slice(2, 6)}` : rawSlug;

    const totalNumbers = Math.max(50, Math.min(5000, dto.totalNumbers || 1000));
    const ticketPriceCents = Math.max(100, dto.ticketPriceCents || 2000);
    const padrinhoPin = dto.padrinhoPin?.trim() || '1234';
    const themeId = dto.themeId || 'champagne-navy';

    const eventDate = dto.eventDate ? new Date(dto.eventDate) : null;

    const [created] = await this.db
      .insert(events)
      .values({
        userId,
        slug,
        title,
        coupleNames,
        eventDate,
        coverImageUrl: dto.coverImageUrl,
        welcomeMessage: dto.welcomeMessage,
        themeId,
        totalNumbers,
        ticketPriceCents,
        padrinhoPin,
        pixKey: dto.pixKey,
        pixKeyType: dto.pixKeyType,
        salesStatus: 'open',
      })
      .returning();

    // Populate raffle numbers in chunks
    const numbers = Array.from({ length: totalNumbers }, (_, i) => ({
      eventId: created.id,
      id: i + 1,
      status: 'disponivel' as const,
    }));

    const CHUNK_SIZE = 500;
    for (let i = 0; i < numbers.length; i += CHUNK_SIZE) {
      const chunk = numbers.slice(i, i + CHUNK_SIZE);
      await this.db.insert(raffleNumbers).values(chunk).onConflictDoNothing();
    }

    // Add initial prizes if provided
    if (dto.prizes && dto.prizes.length > 0) {
      await this.db.insert(eventPrizes).values(
        dto.prizes.map((p) => ({
          eventId: created.id,
          prizeIndex: p.prizeIndex,
          label: p.label.trim(),
        })),
      );
    }

    return created;
  }

  async getPublicBySlug(slug: string) {
    const [event] = await this.db
      .select({
        id: events.id,
        slug: events.slug,
        title: events.title,
        coupleNames: events.coupleNames,
        eventDate: events.eventDate,
        coverImageUrl: events.coverImageUrl,
        welcomeMessage: events.welcomeMessage,
        themeId: events.themeId,
        totalNumbers: events.totalNumbers,
        ticketPriceCents: events.ticketPriceCents,
        salesStatus: events.salesStatus,
      })
      .from(events)
      .where(eq(events.slug, slug))
      .limit(1);

    if (!event) {
      throw new NotFoundException('Casamento não encontrado.');
    }

    const prizes = await this.db
      .select({
        id: eventPrizes.id,
        prizeIndex: eventPrizes.prizeIndex,
        label: eventPrizes.label,
      })
      .from(eventPrizes)
      .where(eq(eventPrizes.eventId, event.id))
      .orderBy(asc(eventPrizes.prizeIndex));

    return { ...event, prizes };
  }

  async verifyPadrinhoPin(slug: string, pin: string) {
    const [event] = await this.db
      .select({
        id: events.id,
        slug: events.slug,
        title: events.title,
        padrinhoPin: events.padrinhoPin,
      })
      .from(events)
      .where(eq(events.slug, slug))
      .limit(1);

    if (!event) {
      throw new NotFoundException('Casamento não encontrado.');
    }

    if (event.padrinhoPin !== pin.trim()) {
      throw new ForbiddenException('PIN do padrinho incorreto.');
    }

    return {
      ok: true,
      eventId: event.id,
      slug: event.slug,
      title: event.title,
    };
  }

  async listByUser(userId: number) {
    return this.db
      .select()
      .from(events)
      .where(eq(events.userId, userId))
      .orderBy(asc(events.id));
  }

  async getDashboardEvent(userId: number, eventId: number) {
    const [event] = await this.db
      .select()
      .from(events)
      .where(and(eq(events.id, eventId), eq(events.userId, userId)))
      .limit(1);

    if (!event) {
      throw new NotFoundException('Evento não encontrado ou acesso negado.');
    }

    const prizes = await this.db
      .select()
      .from(eventPrizes)
      .where(eq(eventPrizes.eventId, eventId))
      .orderBy(asc(eventPrizes.prizeIndex));

    return { ...event, prizes };
  }

  async update(userId: number, eventId: number, dto: UpdateEventDto) {
    const [existing] = await this.db
      .select()
      .from(events)
      .where(and(eq(events.id, eventId), eq(events.userId, userId)))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Evento não encontrado.');
    }

    const [updated] = await this.db
      .update(events)
      .set({
        title: dto.title?.trim() || existing.title,
        coupleNames: dto.coupleNames?.trim() || existing.coupleNames,
        eventDate: dto.eventDate ? new Date(dto.eventDate) : existing.eventDate,
        coverImageUrl: dto.coverImageUrl !== undefined ? dto.coverImageUrl : existing.coverImageUrl,
        welcomeMessage: dto.welcomeMessage !== undefined ? dto.welcomeMessage : existing.welcomeMessage,
        themeId: dto.themeId || existing.themeId,
        ticketPriceCents: dto.ticketPriceCents ? Math.max(100, dto.ticketPriceCents) : existing.ticketPriceCents,
        padrinhoPin: dto.padrinhoPin?.trim() || existing.padrinhoPin,
        pixKey: dto.pixKey !== undefined ? dto.pixKey?.trim() : existing.pixKey,
        pixKeyType: dto.pixKeyType || existing.pixKeyType,
        updatedAt: new Date(),
      })
      .where(eq(events.id, eventId))
      .returning();

    if (dto.prizes) {
      await this.db.delete(eventPrizes).where(eq(eventPrizes.eventId, eventId));
      if (dto.prizes.length > 0) {
        await this.db.insert(eventPrizes).values(
          dto.prizes.map((p) => ({
            eventId,
            prizeIndex: p.prizeIndex,
            label: p.label.trim(),
          })),
        );
      }
    }

    return updated;
  }

  async setSalesStatus(userId: number, eventId: number, status: 'open' | 'closed') {
    const [existing] = await this.db
      .select()
      .from(events)
      .where(and(eq(events.id, eventId), eq(events.userId, userId)))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Evento não encontrado.');
    }

    const [updated] = await this.db
      .update(events)
      .set({ salesStatus: status, updatedAt: new Date() })
      .where(eq(events.id, eventId))
      .returning();

    if (status === 'closed') {
      // Cancel open reservations for this event
      const pendingOrders = await this.db
        .select()
        .from(orders)
        .where(and(eq(orders.eventId, eventId), eq(orders.status, 'pending')));

      for (const order of pendingOrders) {
        await this.db.transaction(async (tx) => {
          await tx
            .update(orders)
            .set({ status: 'cancelled' })
            .where(eq(orders.id, order.id));

          await tx
            .update(raffleNumbers)
            .set({
              status: 'disponivel',
              orderId: null,
              buyerName: null,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(raffleNumbers.eventId, eventId),
                inArray(raffleNumbers.id, order.numberIds),
                eq(raffleNumbers.status, 'reservado'),
              ),
            );
        });
      }
    }

    this.bus.emit('sales.updated', { salesStatus: status, eventId });

    return { salesStatus: updated.salesStatus };
  }
}
