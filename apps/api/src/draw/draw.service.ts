import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { randomInt } from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import { DB, type Db } from '../db/db.module';
import { drawResults, eventState, events, raffleNumbers } from '../db/schema';
import { eligiblePool, pickWinner } from '../domain/draw';
import { EVENT_BUS, type EventBus } from '../realtime/bus';
import { parseDrawInput } from './draw-validation';

export type DrawWinnerResponse = {
  prizeIndex: number;
  prizeLabel: string;
  numberId: number;
  buyerName: string;
  drawnAt: string;
};

@Injectable()
export class DrawService {
  constructor(
    @Inject(DB) private readonly db: Db,
    @Inject(EVENT_BUS) private readonly bus: EventBus,
  ) {}

  async drawNext(rawBody: unknown): Promise<DrawWinnerResponse> {
    let input;
    try {
      input = parseDrawInput((rawBody ?? {}) as { prizeLabel?: unknown });
    } catch (err) {
      throw new BadRequestException(
        err instanceof Error ? err.message : 'Sorteio inválido',
      );
    }

    const rawAny = (rawBody ?? {}) as Record<string, unknown>;
    let eventId = 1;
    if (rawAny.eventId) {
      eventId = Number(rawAny.eventId);
    } else if (rawAny.slug) {
      const [ev] = await this.db
        .select({ id: events.id })
        .from(events)
        .where(eq(events.slug, String(rawAny.slug)))
        .limit(1);
      if (ev) eventId = ev.id;
    }

    const [eventRow] = await this.db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (eventRow) {
      if (eventRow.salesStatus !== 'closed') {
        throw new ConflictException('Sorteio só após fechar vendas');
      }
    } else {
      const [state] = await this.db.select().from(eventState).limit(1);
      if (!state || state.salesStatus !== 'closed') {
        throw new ConflictException('Sorteio só após fechar vendas');
      }
    }

    const paidRows = await this.db
      .select({
        id: raffleNumbers.id,
        buyerName: raffleNumbers.buyerName,
      })
      .from(raffleNumbers)
      .where(
        and(eq(raffleNumbers.eventId, eventId), eq(raffleNumbers.status, 'pago')),
      );

    const paid = paidRows
      .filter((r): r is { id: number; buyerName: string } => r.buyerName != null)
      .map((r) => ({ id: r.id, buyerName: r.buyerName }));

    const existing = await this.db
      .select()
      .from(drawResults)
      .where(eq(drawResults.eventId, eventId));
    const drawnIds = existing.map((d) => d.numberId);
    const pool = eligiblePool(paid, drawnIds);

    let winner;
    try {
      winner = pickWinner(pool, (maxExclusive) => randomInt(0, maxExclusive));
    } catch (err) {
      throw new ConflictException(
        err instanceof Error ? err.message : 'Nenhum número elegível',
      );
    }

    const prizeIndex = existing.length + 1;
    const prizeLabel = input.prizeLabel ?? `Prêmio ${prizeIndex}`;

    const [inserted] = await this.db
      .insert(drawResults)
      .values({
        eventId,
        prizeIndex,
        prizeLabel,
        numberId: winner.id,
        buyerName: winner.buyerName,
      })
      .returning();

    this.bus.emit('draw.winner', {
      eventId,
      prizeIndex: inserted.prizeIndex,
      prizeLabel: inserted.prizeLabel,
      numberId: inserted.numberId,
      buyerName: inserted.buyerName,
    });

    return {
      prizeIndex: inserted.prizeIndex,
      prizeLabel: inserted.prizeLabel,
      numberId: inserted.numberId,
      buyerName: inserted.buyerName,
      drawnAt: inserted.drawnAt.toISOString(),
    };
  }
}
