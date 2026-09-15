import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { and, eq, inArray, isNotNull, lt } from 'drizzle-orm';
import { DB, type Db } from '../db/db.module';
import { eventState, events, orders, raffleNumbers } from '../db/schema';
import { totalCents } from '../domain/money';
import {
  PAYMENT_PROVIDER,
  type PaymentProvider,
} from '../payments/types';
import { EVENT_BUS, type EventBus } from '../realtime/bus';
import {
  parseCreateOrderInput,
  reservationExpiresAt,
} from './order-validation';

export type OrderResponse = {
  id: number;
  status: string;
  buyerName: string;
  source: string;
  totalCents: number;
  numberIds: number[];
  pixCopyPaste: string | null;
  pixQrBase64: string | null;
  expiresAt: string | null;
  paidAt: string | null;
  createdAt: string;
  numbers: Array<{
    id: number;
    status: string;
    buyerName: string | null;
  }>;
};

@Injectable()
export class OrdersService {
  constructor(
    @Inject(DB) private readonly db: Db,
    @Inject(PAYMENT_PROVIDER) private readonly payments: PaymentProvider,
    @Inject(EVENT_BUS) private readonly bus: EventBus,
  ) {}

  async create(rawBody: unknown): Promise<OrderResponse> {
    let input;
    try {
      input = parseCreateOrderInput(
        (rawBody ?? {}) as { buyerName?: unknown; numberIds?: unknown },
      );
    } catch (err) {
      throw new BadRequestException(
        err instanceof Error ? err.message : 'Pedido inválido',
      );
    }

    await this.expirePendingOrders();

    const rawAny = (rawBody ?? {}) as Record<string, unknown>;
    const event = await this.resolveEvent(
      (rawAny.slug as string) ?? (rawAny.eventId as string | number),
    );
    const eventId = event?.id ?? 1;
    const ticketPrice = event?.ticketPriceCents ?? 2000;

    if (event) {
      if (event.salesStatus === 'closed') {
        throw new ConflictException('Vendas encerradas');
      }
    } else {
      const [state] = await this.db.select().from(eventState).limit(1);
      if (!state || state.salesStatus === 'closed') {
        throw new ConflictException('Vendas encerradas');
      }
    }

    const amount = totalCents(input.numberIds.length, ticketPrice);
    const feeCents = this.computeFee(amount);
    const now = new Date();
    const expiresAt = reservationExpiresAt(now);

    let orderRow: typeof orders.$inferSelect;

    try {
      orderRow = await this.db.transaction(async (tx) => {
        const [created] = await tx
          .insert(orders)
          .values({
            eventId,
            buyerName: input.buyerName,
            source: 'convidado',
            status: 'pending',
            totalCents: amount,
            feeCents,
            numberIds: input.numberIds,
            expiresAt,
          })
          .returning();

        const reserved = await tx
          .update(raffleNumbers)
          .set({
            status: 'reservado',
            orderId: created.id,
            buyerName: input.buyerName,
            updatedAt: now,
          })
          .where(
            and(
              eq(raffleNumbers.eventId, eventId),
              inArray(raffleNumbers.id, input.numberIds),
              eq(raffleNumbers.status, 'disponivel'),
            ),
          )
          .returning();

        if (reserved.length !== input.numberIds.length) {
          throw new ConflictException('Número(s) indisponível(is)');
        }

        return created;
      });
    } catch (err) {
      if (err instanceof ConflictException) {
        throw err;
      }
      throw err;
    }

    let pix;
    try {
      pix = await this.payments.createPixCharge({
        orderId: orderRow.id,
        amountCents: amount,
        buyerName: input.buyerName,
        expiresAt,
      });
    } catch (err) {
      await this.rollbackReservation(orderRow.id, input.numberIds, eventId);
      throw new ServiceUnavailableException(
        err instanceof Error
          ? `Falha ao criar cobrança PIX: ${err.message}`
          : 'Falha ao criar cobrança PIX',
      );
    }

    const [updated] = await this.db
      .update(orders)
      .set({
        provider: pix.provider,
        providerChargeId: pix.providerChargeId,
        pixCopyPaste: pix.copyPaste,
        pixQrBase64: pix.qrBase64 ?? null,
        expiresAt,
      })
      .where(eq(orders.id, orderRow.id))
      .returning();

    this.bus.emit('order.reserved', {
      orderId: updated.id,
      numberIds: updated.numberIds,
      eventId,
    });

    return this.toResponse(updated);
  }

  async getById(id: number): Promise<OrderResponse> {
    if (!Number.isInteger(id) || id < 1) {
      throw new BadRequestException('Pedido inválido');
    }

    const [order] = await this.db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);

    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }

    if (
      order.status === 'pending' &&
      order.expiresAt &&
      order.expiresAt.getTime() < Date.now()
    ) {
      await this.expireOne(order);
      const [refreshed] = await this.db
        .select()
        .from(orders)
        .where(eq(orders.id, id))
        .limit(1);
      return this.toResponse(refreshed!);
    }

    return this.toResponse(order);
  }

  async markPaid(rawBody: unknown): Promise<OrderResponse> {
    let input;
    try {
      input = parseCreateOrderInput(
        (rawBody ?? {}) as { buyerName?: unknown; numberIds?: unknown },
      );
    } catch (err) {
      throw new BadRequestException(
        err instanceof Error ? err.message : 'Pedido inválido',
      );
    }

    const rawAny = (rawBody ?? {}) as Record<string, unknown>;
    const event = await this.resolveEvent(
      (rawAny.slug as string) ?? (rawAny.eventId as string | number),
    );
    const eventId = event?.id ?? 1;
    const ticketPrice = event?.ticketPriceCents ?? 2000;

    if (event) {
      if (event.salesStatus === 'closed') {
        throw new ConflictException('Vendas encerradas');
      }
    } else {
      const [state] = await this.db.select().from(eventState).limit(1);
      if (!state || state.salesStatus === 'closed') {
        throw new ConflictException('Vendas encerradas');
      }
    }

    const amount = totalCents(input.numberIds.length, ticketPrice);
    const feeCents = this.computeFee(amount);
    const paidAt = new Date();

    let orderRow: typeof orders.$inferSelect;

    try {
      orderRow = await this.db.transaction(async (tx) => {
        const [created] = await tx
          .insert(orders)
          .values({
            eventId,
            buyerName: input.buyerName,
            source: 'padrinho',
            status: 'paid',
            totalCents: amount,
            feeCents,
            numberIds: input.numberIds,
            paidAt,
          })
          .returning();

        // Atomic disponivel → pago (applyMarkPaid semantics).
        const marked = await tx
          .update(raffleNumbers)
          .set({
            status: 'pago',
            orderId: created.id,
            buyerName: input.buyerName,
            updatedAt: paidAt,
          })
          .where(
            and(
              eq(raffleNumbers.eventId, eventId),
              inArray(raffleNumbers.id, input.numberIds),
              eq(raffleNumbers.status, 'disponivel'),
            ),
          )
          .returning();

        if (marked.length !== input.numberIds.length) {
          throw new ConflictException('Número(s) indisponível(is)');
        }

        return created;
      });
    } catch (err) {
      if (err instanceof ConflictException) {
        throw err;
      }
      throw err;
    }

    this.bus.emit('sale.completed', {
      orderId: orderRow.id,
      numberIds: orderRow.numberIds,
      eventId,
    });

    return this.toResponse(orderRow);
  }

  async confirmFake(id: number): Promise<OrderResponse> {
    if (process.env.PAYMENT_PROVIDER !== 'fake') {
      throw new NotFoundException();
    }
    return this.confirmPaidByOrderId(id);
  }

  async confirmPaidByProviderChargeId(
    providerChargeId: string,
  ): Promise<OrderResponse | null> {
    const [order] = await this.db
      .select()
      .from(orders)
      .where(eq(orders.providerChargeId, providerChargeId))
      .limit(1);

    if (!order) {
      return null;
    }

    // Late PIX after expire/cancel: ignore for MVP (don't 5xx Stripe retries).
    if (order.status !== 'pending' && order.status !== 'paid') {
      return null;
    }

    return this.confirmPaidOrder(order);
  }

  async confirmPaidByOrderId(id: number): Promise<OrderResponse> {
    const [order] = await this.db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);

    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }

    return this.confirmPaidOrder(order);
  }

  async expirePendingOrders(now: Date = new Date()): Promise<void> {
    const expired = await this.db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.status, 'pending'),
          isNotNull(orders.expiresAt),
          lt(orders.expiresAt, now),
        ),
      );

    for (const order of expired) {
      await this.expireOne(order);
    }
  }

  private async confirmPaidOrder(
    order: typeof orders.$inferSelect,
  ): Promise<OrderResponse> {
    if (order.status === 'paid') {
      return this.toResponse(order);
    }

    if (order.status !== 'pending') {
      throw new ConflictException(
        `Pedido não pode ser confirmado (status=${order.status})`,
      );
    }

    const paidAt = new Date();

    const transitioned = await this.db.transaction(async (tx) => {
      // Claim the pending→paid transition first so concurrent webhooks are safe.
      const [claimed] = await tx
        .update(orders)
        .set({ status: 'paid', paidAt })
        .where(and(eq(orders.id, order.id), eq(orders.status, 'pending')))
        .returning();

      if (!claimed) {
        return false;
      }

      const confirmed = await tx
        .update(raffleNumbers)
        .set({
          status: 'pago',
          updatedAt: paidAt,
        })
        .where(
          and(
            eq(raffleNumbers.eventId, order.eventId),
            eq(raffleNumbers.orderId, order.id),
            eq(raffleNumbers.status, 'reservado'),
          ),
        )
        .returning();

      if (confirmed.length !== order.numberIds.length) {
        throw new ConflictException(
          'Números do pedido não estão reservados para confirmação',
        );
      }

      return true;
    });

    if (transitioned) {
      this.bus.emit('sale.completed', {
        orderId: order.id,
        numberIds: order.numberIds,
        eventId: order.eventId,
      });
    }

    const [fresh] = await this.db
      .select()
      .from(orders)
      .where(eq(orders.id, order.id))
      .limit(1);

    return this.toResponse(fresh!);
  }

  private async expireOne(order: typeof orders.$inferSelect): Promise<void> {
    await this.db.transaction(async (tx) => {
      const updated = await tx
        .update(orders)
        .set({ status: 'expired' })
        .where(and(eq(orders.id, order.id), eq(orders.status, 'pending')))
        .returning();

      if (updated.length === 0) {
        return;
      }

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
            eq(raffleNumbers.eventId, order.eventId),
            eq(raffleNumbers.orderId, order.id),
            eq(raffleNumbers.status, 'reservado'),
          ),
        );
    });
  }

  private async rollbackReservation(
    orderId: number,
    numberIds: number[],
    eventId: number = 1,
  ): Promise<void> {
    await this.db.transaction(async (tx) => {
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
            inArray(raffleNumbers.id, numberIds),
            eq(raffleNumbers.orderId, orderId),
            eq(raffleNumbers.status, 'reservado'),
          ),
        );

      await tx
        .update(orders)
        .set({ status: 'cancelled' })
        .where(eq(orders.id, orderId));
    });
  }

  private async toResponse(
    order: typeof orders.$inferSelect,
  ): Promise<OrderResponse> {
    const numbers = await this.db
      .select({
        id: raffleNumbers.id,
        status: raffleNumbers.status,
        buyerName: raffleNumbers.buyerName,
      })
      .from(raffleNumbers)
      .where(
        and(
          eq(raffleNumbers.eventId, order.eventId),
          inArray(raffleNumbers.id, order.numberIds),
        ),
      );

    numbers.sort((a, b) => a.id - b.id);

    return {
      id: order.id,
      status: order.status,
      buyerName: order.buyerName,
      source: order.source,
      totalCents: order.totalCents,
      numberIds: order.numberIds,
      pixCopyPaste: order.pixCopyPaste,
      pixQrBase64: order.pixQrBase64,
      expiresAt: order.expiresAt ? order.expiresAt.toISOString() : null,
      paidAt: order.paidAt ? order.paidAt.toISOString() : null,
      createdAt: order.createdAt.toISOString(),
      numbers,
    };
  }

  private async resolveEvent(slugOrId?: string | number) {
    if (!slugOrId) {
      const [first] = await this.db
        .select()
        .from(events)
        .where(eq(events.id, 1))
        .limit(1);
      return first ?? null;
    }
    if (typeof slugOrId === 'number' || /^\d+$/.test(String(slugOrId))) {
      const [byNum] = await this.db
        .select()
        .from(events)
        .where(eq(events.id, Number(slugOrId)))
        .limit(1);
      return byNum ?? null;
    }
    const [bySlug] = await this.db
      .select()
      .from(events)
      .where(eq(events.slug, String(slugOrId)))
      .limit(1);
    return bySlug ?? null;
  }

  private computeFee(amountCents: number): number {
    const feePercent = parseFloat(process.env.PLATFORM_FEE_PERCENT ?? '4.9');
    return Math.round(amountCents * (feePercent / 100));
  }
}
