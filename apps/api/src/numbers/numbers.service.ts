import {
  BadRequestException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { inArray } from 'drizzle-orm';
import { DB, type Db } from '../db/db.module';
import { raffleNumbers } from '../db/schema';
import { parseCheckIds } from './parse-check-ids';

export type NumberCheckResult = {
  id: number;
  status: string;
};

@Injectable()
export class NumbersService {
  constructor(@Inject(DB) private readonly db: Db) {}

  async check(idsQuery: string | undefined): Promise<NumberCheckResult[]> {
    let ids: number[];
    try {
      ids = parseCheckIds(idsQuery);
    } catch (err) {
      throw new BadRequestException(
        err instanceof Error ? err.message : 'ids inválidos',
      );
    }

    const rows = await this.db
      .select({
        id: raffleNumbers.id,
        status: raffleNumbers.status,
      })
      .from(raffleNumbers)
      .where(inArray(raffleNumbers.id, ids));

    const byId = new Map(rows.map((r) => [r.id, r.status]));

    return ids.map((id) => ({
      id,
      status: byId.get(id) ?? 'missing',
    }));
  }
}
