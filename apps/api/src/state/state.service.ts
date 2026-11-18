import { Inject, Injectable } from '@nestjs/common';
import { asc, count, desc, eq } from 'drizzle-orm';
import { DB, type Db } from '../db/db.module';
import { drawResults, eventState, raffleNumbers } from '../db/schema';
import { PRICE_CENTS } from '../domain/money';

export type StateSnapshot = {
  salesStatus: 'open' | 'closed';
  counts: {
    disponivel: number;
    reservado: number;
    pago: number;
  };
  arrecadadoCents: number;
  recentSales: Array<{
    numberId: number;
    buyerName: string;
    updatedAt: string;
  }>;
  drawResults: Array<{
    prizeIndex: number;
    prizeLabel: string;
    numberId: number;
    buyerName: string;
    drawnAt: string;
  }>;
};

@Injectable()
export class StateService {
  constructor(@Inject(DB) private readonly db: Db) {}

  async getSnapshot(): Promise<StateSnapshot> {
    const [state] = await this.db.select().from(eventState).limit(1);
    const salesStatus = state?.salesStatus ?? 'open';

    const statusCounts = await this.db
      .select({
        status: raffleNumbers.status,
        total: count(),
      })
      .from(raffleNumbers)
      .groupBy(raffleNumbers.status);

    const counts = {
      disponivel: 0,
      reservado: 0,
      pago: 0,
    };
    for (const row of statusCounts) {
      counts[row.status] = Number(row.total);
    }

    const arrecadadoCents = counts.pago * PRICE_CENTS;

    const recentRows = await this.db
      .select({
        numberId: raffleNumbers.id,
        buyerName: raffleNumbers.buyerName,
        updatedAt: raffleNumbers.updatedAt,
      })
      .from(raffleNumbers)
      .where(eq(raffleNumbers.status, 'pago'))
      .orderBy(desc(raffleNumbers.updatedAt))
      .limit(30);

    const recentSales = recentRows
      .filter(
        (r): r is { numberId: number; buyerName: string; updatedAt: Date } =>
          r.buyerName != null,
      )
      .map((r) => ({
        numberId: r.numberId,
        buyerName: r.buyerName,
        updatedAt: r.updatedAt.toISOString(),
      }));

    const winners = await this.db
      .select()
      .from(drawResults)
      .orderBy(asc(drawResults.prizeIndex));

    return {
      salesStatus,
      counts,
      arrecadadoCents,
      recentSales,
      drawResults: winners.map((w) => ({
        prizeIndex: w.prizeIndex,
        prizeLabel: w.prizeLabel,
        numberId: w.numberId,
        buyerName: w.buyerName,
        drawnAt: w.drawnAt.toISOString(),
      })),
    };
  }
}
