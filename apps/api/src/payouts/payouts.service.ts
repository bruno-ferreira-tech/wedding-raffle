import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { DB, type Db } from '../db/db.module';
import { events, orders, payouts } from '../db/schema';
import {
  PAYOUT_TRANSFER_PROVIDER,
  type PayoutTransferProvider,
} from './transfer-provider';

export type EventBalance = {
  grossRevenueCents: number;
  platformFeeCents: number;
  netRevenueCents: number;
  totalWithdrawnCents: number;
  availableBalanceCents: number;
};

@Injectable()
export class PayoutsService {
  constructor(
    @Inject(DB) private readonly db: Db,
    @Inject(PAYOUT_TRANSFER_PROVIDER)
    private readonly transferProvider: PayoutTransferProvider,
  ) {}

  async getBalance(userId: number, eventId: number): Promise<EventBalance> {
    const [event] = await this.db
      .select()
      .from(events)
      .where(and(eq(events.id, eventId), eq(events.userId, userId)))
      .limit(1);

    if (!event) {
      throw new NotFoundException('Evento não encontrado.');
    }

    const paidOrders = await this.db
      .select({
        totalCents: orders.totalCents,
        feeCents: orders.feeCents,
      })
      .from(orders)
      .where(and(eq(orders.eventId, eventId), eq(orders.status, 'paid')));

    const grossRevenueCents = paidOrders.reduce((sum, o) => sum + o.totalCents, 0);
    const platformFeeCents = paidOrders.reduce((sum, o) => sum + o.feeCents, 0);
    const netRevenueCents = grossRevenueCents - platformFeeCents;

    const existingPayouts = await this.db
      .select({
        amountCents: payouts.amountCents,
        status: payouts.status,
      })
      .from(payouts)
      .where(
        and(
          eq(payouts.eventId, eventId),
          inArray(payouts.status, ['completed', 'pending']),
        ),
      );

    const totalWithdrawnCents = existingPayouts
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + p.amountCents, 0);

    const pendingWithdrawnCents = existingPayouts
      .filter((p) => p.status === 'pending')
      .reduce((sum, p) => sum + p.amountCents, 0);

    const availableBalanceCents = Math.max(
      0,
      netRevenueCents - totalWithdrawnCents - pendingWithdrawnCents,
    );

    return {
      grossRevenueCents,
      platformFeeCents,
      netRevenueCents,
      totalWithdrawnCents,
      availableBalanceCents,
    };
  }

  async requestPayout(
    userId: number,
    eventId: number,
    dto: { amountCents?: number; pixKey?: string; pixKeyType?: string },
  ) {
    const [event] = await this.db
      .select()
      .from(events)
      .where(and(eq(events.id, eventId), eq(events.userId, userId)))
      .limit(1);

    if (!event) {
      throw new NotFoundException('Evento não encontrado.');
    }

    const pixKey = dto.pixKey?.trim() || event.pixKey?.trim();
    const pixKeyType = dto.pixKeyType?.trim() || event.pixKeyType?.trim() || 'cpf';

    if (!pixKey) {
      throw new BadRequestException('Chave PIX de destino não informada.');
    }

    const balance = await this.getBalance(userId, eventId);
    const amountCents = dto.amountCents ?? balance.availableBalanceCents;

    if (amountCents <= 0) {
      throw new BadRequestException('Valor de saque deve ser maior que zero.');
    }

    if (amountCents > balance.availableBalanceCents) {
      throw new BadRequestException('Saldo insuficiente para realizar o saque.');
    }

    // Create pending payout record
    const [created] = await this.db
      .insert(payouts)
      .values({
        eventId,
        amountCents,
        pixKey,
        pixKeyType,
        status: 'pending',
      })
      .returning();

    // Call automated PIX transfer service
    let transferResult;
    try {
      transferResult = await this.transferProvider.sendPixTransfer({
        amountCents,
        pixKey,
        pixKeyType,
        description: `Saque Corta-Gravata - ${event.title}`,
      });
    } catch (err) {
      transferResult = {
        transferId: '',
        status: 'failed' as const,
        failureReason: err instanceof Error ? err.message : 'Falha na transferência PIX',
      };
    }

    const [updated] = await this.db
      .update(payouts)
      .set({
        providerTransferId: transferResult.transferId || null,
        status: transferResult.status,
        failureReason: transferResult.failureReason || null,
        completedAt: transferResult.status === 'completed' ? new Date() : null,
      })
      .where(eq(payouts.id, created.id))
      .returning();

    return {
      payout: updated,
      newBalance: await this.getBalance(userId, eventId),
    };
  }

  async listPayouts(userId: number, eventId: number) {
    const [event] = await this.db
      .select({ id: events.id })
      .from(events)
      .where(and(eq(events.id, eventId), eq(events.userId, userId)))
      .limit(1);

    if (!event) {
      throw new NotFoundException('Evento não encontrado.');
    }

    return this.db
      .select()
      .from(payouts)
      .where(eq(payouts.eventId, eventId))
      .orderBy(desc(payouts.createdAt));
  }
}
