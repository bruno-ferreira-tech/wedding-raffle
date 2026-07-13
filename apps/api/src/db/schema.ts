import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const numberStatusEnum = pgEnum('number_status', [
  'disponivel',
  'reservado',
  'pago',
]);

export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'paid',
  'expired',
  'cancelled',
]);

export const orderSourceEnum = pgEnum('order_source', [
  'convidado',
  'padrinho',
]);

export const salesStatusEnum = pgEnum('sales_status', ['open', 'closed']);

export const raffleNumbers = pgTable('raffle_numbers', {
  id: integer('id').primaryKey(), // 1..2000
  status: numberStatusEnum('status').notNull().default('disponivel'),
  orderId: integer('order_id'),
  buyerName: text('buyer_name'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  buyerName: text('buyer_name').notNull(),
  source: orderSourceEnum('source').notNull(),
  status: orderStatusEnum('status').notNull().default('pending'),
  totalCents: integer('total_cents').notNull(),
  numberIds: integer('number_ids').array().notNull(),
  provider: text('provider'),
  providerChargeId: text('provider_charge_id'),
  pixCopyPaste: text('pix_copy_paste'),
  pixQrBase64: text('pix_qr_base64'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  paidAt: timestamp('paid_at'),
});

export const eventState = pgTable('event_state', {
  id: integer('id').primaryKey().default(1),
  salesStatus: salesStatusEnum('sales_status').notNull().default('open'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const drawResults = pgTable('draw_results', {
  id: serial('id').primaryKey(),
  prizeIndex: integer('prize_index').notNull(),
  prizeLabel: text('prize_label').notNull(),
  numberId: integer('number_id').notNull(),
  buyerName: text('buyer_name').notNull(),
  drawnAt: timestamp('drawn_at').notNull().defaultNow(),
});
