import {
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', [
  'couple',
  'platform_admin',
]);

export const payoutStatusEnum = pgEnum('payout_status', [
  'pending',
  'completed',
  'failed',
]);

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

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: userRoleEnum('role').notNull().default('couple'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  coupleNames: text('couple_names').notNull(),
  eventDate: timestamp('event_date'),
  coverImageUrl: text('cover_image_url'),
  welcomeMessage: text('welcome_message'),
  themeId: text('theme_id').notNull().default('champagne-navy'),
  totalNumbers: integer('total_numbers').notNull().default(1000),
  ticketPriceCents: integer('ticket_price_cents').notNull().default(2000),
  padrinhoPin: text('padrinho_pin').notNull().default('1234'),
  pixKeyType: text('pix_key_type'),
  pixKey: text('pix_key'),
  salesStatus: salesStatusEnum('sales_status').notNull().default('open'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const eventPrizes = pgTable('event_prizes', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id')
    .references(() => events.id)
    .notNull(),
  prizeIndex: integer('prize_index').notNull(),
  label: text('label').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const payouts = pgTable('payouts', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id')
    .references(() => events.id)
    .notNull(),
  amountCents: integer('amount_cents').notNull(),
  feeDeductedCents: integer('fee_deducted_cents').notNull().default(0),
  pixKey: text('pix_key').notNull(),
  pixKeyType: text('pix_key_type').notNull(),
  providerTransferId: text('provider_transfer_id'),
  status: payoutStatusEnum('status').notNull().default('pending'),
  failureReason: text('failure_reason'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
});

export const raffleNumbers = pgTable(
  'raffle_numbers',
  {
    eventId: integer('event_id')
      .references(() => events.id)
      .notNull()
      .default(1),
    id: integer('id').notNull(), // raffle number (1..N) within the event
    status: numberStatusEnum('status').notNull().default('disponivel'),
    orderId: integer('order_id'),
    buyerName: text('buyer_name'),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.eventId, table.id] }),
  ],
);

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id')
    .references(() => events.id)
    .notNull()
    .default(1),
  buyerName: text('buyer_name').notNull(),
  source: orderSourceEnum('source').notNull(),
  status: orderStatusEnum('status').notNull().default('pending'),
  totalCents: integer('total_cents').notNull(),
  feeCents: integer('fee_cents').notNull().default(0),
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
  eventId: integer('event_id')
    .references(() => events.id)
    .notNull()
    .default(1),
  prizeIndex: integer('prize_index').notNull(),
  prizeLabel: text('prize_label').notNull(),
  numberId: integer('number_id').notNull(),
  buyerName: text('buyer_name').notNull(),
  drawnAt: timestamp('drawn_at').notNull().defaultNow(),
});
