import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DB, type Db } from '../db/db.module';
import { eventState, orders, raffleNumbers } from '../db/schema';
import { EVENT_BUS, type EventBus } from '../realtime/bus';
import { parseSalesStatusInput, type SalesStatus } from './sales-validation';

export type SalesStatusResponse = {
  salesStatus: SalesStatus;
};

@Injectable()
export class EventStateService {
  constructor(
    @Inject(DB) private readonly db: Db,
    @Inject(EVENT_BUS) private readonly bus: EventBus,
  ) {}

  async setSalesStatus(rawBody: unknown): Promise<SalesStatusResponse> {
    let input;
    try {
      input = parseSalesStatusInput(
        (rawBody ?? {}) as { status?: unknown },
      );
    } catch (err) {
      throw new BadRequestException(
        err instanceof Error ? err.message : 'Status inválido',
      );
    }

    const now = new Date();

    await this.db.transaction(async (tx) => {
      const [updated] = await tx
        .update(eventState)
        .set({ salesStatus: input.status, updatedAt: now })
        .where(eq(eventState.id, 1))
        .returning();

      if (!updated) {
        throw new ConflictException('Estado do evento não encontrado');
      }

      if (input.status === 'closed') {
        const pending = await tx
          .select()
          .from(orders)
          .where(eq(orders.status, 'pending'));

        for (const order of pending) {
          const cancelled = await tx
            .update(orders)
            .set({ status: 'cancelled' })
            .where(and(eq(orders.id, order.id), eq(orders.status, 'pending')))
            .returning();

          if (cancelled.length === 0) {
            continue;
          }

          await tx
            .update(raffleNumbers)
            .set({
              status: 'disponivel',
              orderId: null,
              buyerName: null,
              updatedAt: now,
            })
            .where(
              and(
                eq(raffleNumbers.orderId, order.id),
                eq(raffleNumbers.status, 'reservado'),
              ),
            );
        }
      }
    });

    this.bus.emit('sales.updated', { salesStatus: input.status });

    return { salesStatus: input.status };
  }
}
