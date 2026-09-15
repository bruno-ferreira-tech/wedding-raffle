import {
  BadRequestException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { and, asc, eq, inArray } from 'drizzle-orm';
import { DB, type Db } from '../db/db.module';
import { events, raffleNumbers } from '../db/schema';
import { parseCheckIds } from './parse-check-ids';

export type NumberCheckResult = {
  id: number;
  status: string;
};

export type NumberBoardCell = {
  id: number;
  status: 'disponivel' | 'reservado' | 'pago';
};

@Injectable()
export class NumbersService {
  constructor(@Inject(DB) private readonly db: Db) {}

  async resolveEventId(slugOrId?: string | number): Promise<number> {
    if (!slugOrId) return 1;

    if (typeof slugOrId === 'number' || /^\d+$/.test(String(slugOrId))) {
      return Number(slugOrId);
    }

    const [event] = await this.db
      .select({ id: events.id })
      .from(events)
      .where(eq(events.slug, String(slugOrId)))
      .limit(1);

    return event?.id ?? 1;
  }

  async board(slugOrId?: string | number): Promise<NumberBoardCell[]> {
    const eventId = await this.resolveEventId(slugOrId);
    const rows = await this.db
      .select({
        id: raffleNumbers.id,
        status: raffleNumbers.status,
      })
      .from(raffleNumbers)
      .where(eq(raffleNumbers.eventId, eventId))
      .orderBy(asc(raffleNumbers.id));

    return rows.map((r) => ({
      id: r.id,
      status: r.status,
    }));
  }

  async check(
    idsQuery: string | undefined,
    slugOrId?: string | number,
  ): Promise<NumberCheckResult[]> {
    let ids: number[];
    try {
      ids = parseCheckIds(idsQuery);
    } catch (err) {
      throw new BadRequestException(
        err instanceof Error ? err.message : 'ids inválidos',
      );
    }

    const eventId = await this.resolveEventId(slugOrId);
    const rows = await this.db
      .select({
        id: raffleNumbers.id,
        status: raffleNumbers.status,
      })
      .from(raffleNumbers)
      .where(
        and(eq(raffleNumbers.eventId, eventId), inArray(raffleNumbers.id, ids)),
      );

    const byId = new Map(rows.map((r) => [r.id, r.status]));

    return ids.map((id) => ({
      id,
      status: byId.get(id) ?? 'missing',
    }));
  }
}
