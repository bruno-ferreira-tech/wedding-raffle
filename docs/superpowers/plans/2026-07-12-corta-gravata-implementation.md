# Corta-Gravata Digital — Implementation Plan

> **SUPERSEDED (2026-07-12):** Backend moved to NestJS. Use instead:  
> `docs/superpowers/plans/2026-07-12-corta-gravata-nest-monorepo-implementation.md`  
> Do **not** implement API Route Handlers in Next from this document.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar um app Next.js de rifa do corta-gravata: compra PIX em lote, admin padrinho (marcar pago), tellão ao vivo e sorteio de N prêmios.

**Architecture:** Next.js App Router + Postgres/Drizzle. Domínio puro para reserva/sorteio. `PaymentProvider` pluggable (Stripe PIX primário, Mercado Pago fallback). Tellão via SSE + snapshot REST.

**Tech Stack:** Next.js 15, TypeScript, Drizzle, Postgres, Vitest, Stripe (e/ou Mercado Pago), CSS modules / CSS variables (sem UI kit genérico).

**Spec:** `docs/superpowers/specs/2026-07-12-corta-gravata-design.md`

---

## File structure (alvo)

```
src/
  app/
    page.tsx                    # compra convidado
    pedido/[id]/page.tsx
    telao/page.tsx
    padrinho/page.tsx
    admin/page.tsx
    api/
      orders/route.ts
      orders/[id]/route.ts
      padrinho/mark-paid/route.ts
      admin/sales/route.ts
      admin/draw/route.ts
      webhooks/stripe/route.ts
      webhooks/mercadopago/route.ts
      events/route.ts           # SSE
      auth/padrinho/route.ts
      auth/admin/route.ts
      state/route.ts            # snapshot tellão/admin
  domain/
    money.ts
    numbers.ts
    orders.ts
    draw.ts
  db/
    schema.ts
    client.ts
    seed.ts
  payments/
    types.ts
    index.ts
    stripe-pix.ts
    mercado-pago-pix.ts
  realtime/
    bus.ts
  auth/
    session.ts
  styles/
    tokens.css
    globals.css
tests/
  domain/
    numbers.test.ts
    orders.test.ts
    draw.test.ts
```

---

### Task 1: Scaffold Next.js + Vitest + tokens

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `vitest.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/styles/tokens.css`, `src/styles/globals.css`, `.env.example`, `.gitignore`

- [ ] **Step 1: Create Next.js app with TypeScript**

Run from repo root:

```bash
npx create-next-app@latest . --typescript --eslint --app --src-dir --import-alias "@/*" --turbopack --no-tailwind
```

If directory not empty (docs exist), create in temp and move files, or init `package.json` manually with `next`, `react`, `react-dom`, `typescript`, `vitest`, `drizzle-orm`, `postgres`, `zod`, `stripe`.

- [ ] **Step 2: Add Vitest**

```bash
npm i -D vitest @vitejs/plugin-react
```

`vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: { environment: "node", include: ["tests/**/*.test.ts"] },
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
});
```

Add script `"test": "vitest run"`.

- [ ] **Step 3: Design tokens + layout shell**

`src/styles/tokens.css`:

```css
:root {
  --ink: #0b1220;
  --ink-elevated: #121a2b;
  --champagne: #c6a75e;
  --champagne-soft: #e6d3a3;
  --paper: #f3efe6;
  --muted: #9aa3b5;
  --success: #2f6f5e;
  --danger: #b33a3a;
  --font-display: "Fraunces", Georgia, serif;
  --font-body: "Manrope", system-ui, sans-serif;
}
```

Import Google fonts Fraunces + Manrope in `layout.tsx`. Title: "Corta-Gravata".

- [ ] **Step 4: `.env.example`**

```
DATABASE_URL=postgres://...
ADMIN_PASSWORD=
PADRINHO_PASSWORD=
SESSION_SECRET=
PAYMENT_PROVIDER=stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_WEBHOOK_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js app with design tokens"
```

---

### Task 2: Schema Drizzle + seed 2000 números

**Files:**
- Create: `src/db/schema.ts`, `src/db/client.ts`, `src/db/seed.ts`, `drizzle.config.ts`

- [ ] **Step 1: Define schema**

```ts
// src/db/schema.ts
import {
  pgTable, serial, integer, text, timestamp, pgEnum,
} from "drizzle-orm/pg-core";

export const numberStatusEnum = pgEnum("number_status", [
  "disponivel", "reservado", "pago",
]);
export const orderStatusEnum = pgEnum("order_status", [
  "pending", "paid", "expired", "cancelled",
]);
export const orderSourceEnum = pgEnum("order_source", [
  "convidado", "padrinho",
]);
export const salesStatusEnum = pgEnum("sales_status", [
  "open", "closed",
]);

export const raffleNumbers = pgTable("raffle_numbers", {
  id: integer("id").primaryKey(), // 1..2000
  status: numberStatusEnum("status").notNull().default("disponivel"),
  orderId: integer("order_id"),
  buyerName: text("buyer_name"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  buyerName: text("buyer_name").notNull(),
  source: orderSourceEnum("source").notNull(),
  status: orderStatusEnum("status").notNull().default("pending"),
  totalCents: integer("total_cents").notNull(),
  numberIds: integer("number_ids").array().notNull(),
  provider: text("provider"),
  providerChargeId: text("provider_charge_id"),
  pixCopyPaste: text("pix_copy_paste"),
  pixQrBase64: text("pix_qr_base64"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  paidAt: timestamp("paid_at"),
});

export const eventState = pgTable("event_state", {
  id: integer("id").primaryKey().default(1),
  salesStatus: salesStatusEnum("sales_status").notNull().default("open"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const drawResults = pgTable("draw_results", {
  id: serial("id").primaryKey(),
  prizeIndex: integer("prize_index").notNull(),
  prizeLabel: text("prize_label").notNull(),
  numberId: integer("number_id").notNull(),
  buyerName: text("buyer_name").notNull(),
  drawnAt: timestamp("drawn_at").notNull().defaultNow(),
});
```

- [ ] **Step 2: Client + seed**

Seed inserts numbers `1..2000` and one `event_state` row. Script: `npm run db:seed`.

- [ ] **Step 3: Commit**

```bash
git commit -m "feat: add drizzle schema and seed 2000 numbers"
```

---

### Task 3: Domínio — dinheiro, reserva, expiração (TDD)

**Files:**
- Create: `src/domain/money.ts`, `src/domain/numbers.ts`, `tests/domain/numbers.test.ts`

- [ ] **Step 1: Failing tests**

```ts
// tests/domain/numbers.test.ts
import { describe, expect, it } from "vitest";
import { PRICE_CENTS, totalCents } from "@/domain/money";
import {
  assertCanReserve,
  applyReservation,
  applyRelease,
  applyMarkPaid,
  type NumberRow,
} from "@/domain/numbers";

describe("money", () => {
  it("totals batch at R$20 each", () => {
    expect(PRICE_CENTS).toBe(2000);
    expect(totalCents(3)).toBe(6000);
  });
});

describe("reservation", () => {
  const base = (id: number): NumberRow => ({
    id, status: "disponivel", orderId: null, buyerName: null,
  });

  it("reserves available numbers for an order", () => {
    const rows = [base(1), base(2)];
    const next = applyReservation(rows, { orderId: 10, buyerName: "Ana" });
    expect(next.every((r) => r.status === "reservado" && r.orderId === 10)).toBe(true);
  });

  it("rejects if any number is not disponivel", () => {
    const rows: NumberRow[] = [
      base(1),
      { id: 2, status: "pago", orderId: 1, buyerName: "B" },
    ];
    expect(() => assertCanReserve(rows)).toThrow(/indispon/);
  });

  it("releases reserved numbers back to disponivel", () => {
    const rows: NumberRow[] = [
      { id: 1, status: "reservado", orderId: 10, buyerName: "Ana" },
    ];
    expect(applyRelease(rows)[0].status).toBe("disponivel");
  });

  it("marks paid from disponivel (padrinho)", () => {
    const rows = [base(5)];
    const next = applyMarkPaid(rows, { orderId: 99, buyerName: "Carlos" });
    expect(next[0]).toMatchObject({ status: "pago", buyerName: "Carlos" });
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npm test
```

- [ ] **Step 3: Implement**

```ts
// src/domain/money.ts
export const PRICE_CENTS = 2000;
export function totalCents(count: number): number {
  if (!Number.isInteger(count) || count < 1) throw new Error("count inválido");
  return count * PRICE_CENTS;
}

// src/domain/numbers.ts
export type NumberStatus = "disponivel" | "reservado" | "pago";
export type NumberRow = {
  id: number;
  status: NumberStatus;
  orderId: number | null;
  buyerName: string | null;
};

export function assertCanReserve(rows: NumberRow[]): void {
  const blocked = rows.filter((r) => r.status !== "disponivel");
  if (blocked.length) {
    throw new Error(`Número(s) indisponível(is): ${blocked.map((b) => b.id).join(", ")}`);
  }
}

export function applyReservation(
  rows: NumberRow[],
  opts: { orderId: number; buyerName: string },
): NumberRow[] {
  assertCanReserve(rows);
  return rows.map((r) => ({
    ...r,
    status: "reservado" as const,
    orderId: opts.orderId,
    buyerName: opts.buyerName,
  }));
}

export function applyRelease(rows: NumberRow[]): NumberRow[] {
  return rows.map((r) => {
    if (r.status !== "reservado") return r;
    return { ...r, status: "disponivel" as const, orderId: null, buyerName: null };
  });
}

export function applyMarkPaid(
  rows: NumberRow[],
  opts: { orderId: number; buyerName: string },
): NumberRow[] {
  assertCanReserve(rows);
  return rows.map((r) => ({
    ...r,
    status: "pago" as const,
    orderId: opts.orderId,
    buyerName: opts.buyerName,
  }));
}

export function applyConfirmPaid(rows: NumberRow[]): NumberRow[] {
  return rows.map((r) => {
    if (r.status !== "reservado") {
      throw new Error(`Número ${r.id} não está reservado`);
    }
    return { ...r, status: "pago" as const };
  });
}
```

- [ ] **Step 4: Tests PASS + commit**

```bash
npm test
git commit -m "feat: domain rules for money and number reservation"
```

---

### Task 4: Domínio — sorteio (TDD)

**Files:**
- Create: `src/domain/draw.ts`, `tests/domain/draw.test.ts`

- [ ] **Step 1: Failing test**

```ts
import { describe, expect, it } from "vitest";
import { pickWinner, eligiblePool } from "@/domain/draw";

describe("draw", () => {
  it("builds pool from paid numbers excluding prior winners", () => {
    const paid = [
      { id: 1, buyerName: "A" },
      { id: 2, buyerName: "B" },
      { id: 3, buyerName: "C" },
    ];
    expect(eligiblePool(paid, [2]).map((p) => p.id)).toEqual([1, 3]);
  });

  it("picks winner using provided rng index", () => {
    const pool = [
      { id: 10, buyerName: "A" },
      { id: 20, buyerName: "B" },
    ];
    expect(pickWinner(pool, () => 1)).toEqual({ id: 20, buyerName: "B" });
  });

  it("throws when pool empty", () => {
    expect(() => pickWinner([], () => 0)).toThrow(/nenhum/);
  });
});
```

- [ ] **Step 2: Implement + pass + commit**

```ts
export type PaidEntry = { id: number; buyerName: string };

export function eligiblePool(paid: PaidEntry[], drawnIds: number[]): PaidEntry[] {
  const taken = new Set(drawnIds);
  return paid.filter((p) => !taken.has(p.id));
}

export function pickWinner(
  pool: PaidEntry[],
  randomIndex: (maxExclusive: number) => number,
): PaidEntry {
  if (pool.length === 0) throw new Error("Nenhum número elegível para sorteio");
  const idx = randomIndex(pool.length);
  if (idx < 0 || idx >= pool.length) throw new Error("rng inválido");
  return pool[idx];
}
```

Production wiring uses `crypto.randomInt(0, pool.length)`.

```bash
git commit -m "feat: domain draw pool and winner selection"
```

---

### Task 5: Auth por cookie (padrinho / admin)

**Files:**
- Create: `src/auth/session.ts`, `src/app/api/auth/padrinho/route.ts`, `src/app/api/auth/admin/route.ts`

- [ ] **Step 1: Session helpers**

HMAC-signed cookie (`padrinho` | `admin`) with `SESSION_SECRET`. Missing env → throw on boot of auth routes (fail loud).

- [ ] **Step 2: POST login routes** compare body password to env; set httpOnly cookie.

- [ ] **Step 3: `requireRole(req, 'admin' | 'padrinho')`** for protected APIs (admin can also mark paid).

- [ ] **Step 4: Commit**

```bash
git commit -m "feat: cookie auth for padrinho and admin"
```

---

### Task 6: PaymentProvider + Stripe PIX + Fake

**Files:**
- Create: `src/payments/types.ts`, `src/payments/index.ts`, `src/payments/stripe-pix.ts`, `src/payments/mercado-pago-pix.ts`, `src/payments/fake.ts`

- [ ] **Step 1: Interface**

```ts
export type CreatePixInput = {
  orderId: number;
  amountCents: number;
  buyerName: string;
  expiresAt: Date;
};

export type CreatePixResult = {
  provider: "stripe" | "mercadopago" | "fake";
  providerChargeId: string;
  copyPaste: string;
  qrBase64?: string;
};

export interface PaymentProvider {
  createPixCharge(input: CreatePixInput): Promise<CreatePixResult>;
}
```

- [ ] **Step 2: `getPaymentProvider()`** reads `PAYMENT_PROVIDER`; throws if keys missing.

- [ ] **Step 3: Stripe** — PaymentIntent with `payment_method_types: ['pix']`.  
**Fake** (`PAYMENT_PROVIDER=fake`) for demo local sem Stripe — retorna copia-e-cola fictício; `POST /api/orders/[id]/confirm-fake` confirma pagamento.

- [ ] **Step 4: Commit**

```bash
git commit -m "feat: pluggable PaymentProvider with Stripe PIX and fake"
```

---

### Task 7: API orders — criar, status, expirar, webhook

**Files:**
- Create: `src/app/api/orders/route.ts`, `src/app/api/orders/[id]/route.ts`, `src/app/api/webhooks/stripe/route.ts`, `src/domain/orders.ts`

- [ ] **Step 1: POST `/api/orders`**

Body: `{ buyerName, numberIds: number[] }`.  
If sales closed → 409.  
Transaction: lock rows, reserve, insert order pending, create PIX, update order with PIX fields, publish realtime `order.reserved`.

- [ ] **Step 2: GET `/api/orders/[id]`** — status + números + PIX payload.

- [ ] **Step 3: Webhook Stripe** — verify signature; on succeeded: confirm paid; publish `sale.completed`. Idempotent on `providerChargeId`.

- [ ] **Step 4: Lazy expire** on GET order and on POST new order: expire pending past `expiresAt`.

- [ ] **Step 5: Fake confirm** `POST /api/orders/[id]/confirm-fake` only if `PAYMENT_PROVIDER=fake`.

- [ ] **Step 6: Commit**

```bash
git commit -m "feat: order creation, PIX webhook, and expiry"
```

---

### Task 8: API padrinho mark-paid + admin sales close

**Files:**
- Create: `src/app/api/padrinho/mark-paid/route.ts`, `src/app/api/admin/sales/route.ts`

- [ ] **Step 1: POST mark-paid** `{ buyerName, numberIds }` → order source padrinho paid immediately + realtime.

- [ ] **Step 2: POST admin sales** `{ status: 'open' | 'closed' }`. On `closed`: cancel pending orders + release reservations.

- [ ] **Step 3: Commit**

```bash
git commit -m "feat: padrinho mark-paid and admin sales lock"
```

---

### Task 9: API draw + state snapshot + SSE

**Files:**
- Create: `src/app/api/admin/draw/route.ts`, `src/app/api/state/route.ts`, `src/app/api/events/route.ts`, `src/realtime/bus.ts`

- [ ] **Step 1: In-memory EventBus** (single-instance; multi-instance needs Redis later — YAGNI para um casamento).

- [ ] **Step 2: GET `/api/state`** — salesStatus, counts, recent sales (30), drawResults, arrecadado.

- [ ] **Step 3: SSE `/api/events`** — subscribe; push on bus events; heartbeat 15s.

- [ ] **Step 4: POST `/api/admin/draw`** `{ prizeLabel?: string }` — only if sales closed; pick winner; insert draw_results; emit `draw.winner`.

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: event state, SSE, and draw endpoint"
```

---

### Task 10: UI compra convidado + pedido

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/app/pedido/[id]/page.tsx`, components under `src/app/_components/`

- [ ] **Step 1: Number picker** — search by number, toggle select, show selected chips + total.

- [ ] **Step 2: Checkout** — name field → POST order → redirect `/pedido/[id]`.

- [ ] **Step 3: Pedido page** — QR / copy-paste, countdown, poll until paid|expired. Fake-pay button if provider fake.

- [ ] **Step 4: Respect sales closed** — banner "vendas encerradas".

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: guest purchase and payment status UI"
```

---

### Task 11: UI padrinho + admin

**Files:**
- Create: `src/app/padrinho/page.tsx`, `src/app/admin/page.tsx`

- [ ] **Step 1: Padrinho** — login, select numbers, name, mark paid.

- [ ] **Step 2: Admin** — login, counts, close/open sales, "sortear próximo" with optional label, winners list.

- [ ] **Step 3: Commit**

```bash
git commit -m "feat: padrinho and admin consoles"
```

---

### Task 12: Tellão cinematográfico

**Files:**
- Create: `src/app/telao/page.tsx`

- [ ] **Step 1: Full-bleed dark ceremonial layout** — brand, counters, live feed.

- [ ] **Step 2: Subscribe SSE**; animate new sales; on `draw.winner` reveal (countdown → número → nome).

- [ ] **Step 3: Commit**

```bash
git commit -m "feat: live tellao with sales feed and draw reveal"
```

---

### Task 13: Verificação ponta a ponta local

- [ ] **Step 1:** `PAYMENT_PROVIDER=fake`, seed DB, `npm run dev`.

- [ ] **Step 2:** Checklist da spec §13 (compra lote, padrinho, conflito, expiry, fechar vendas, sortear 3).

- [ ] **Step 3:** Fix bugs; commit.

```bash
git commit -m "test: verify wedding-day acceptance flows"
```

---

## Spec coverage

| Spec item | Task |
|-----------|------|
| 2000 nums @ R$20, batch PIX | 2, 3, 7, 10 |
| Nome only | 7, 10 |
| Padrinho mark paid | 8, 11 |
| Only paid in draw | 4, 9 |
| N prizes at draw time | 9, 11 |
| Admin closes sales | 8, 11 |
| 15 min reserve + cancel on close | 7, 8 |
| Tellão feed + draw | 9, 12 |
| PaymentProvider Stripe/MP/fake | 6 |
| Visual ceremonial | 1, 10–12 |

---

## Nota de velocidade

Primeiro sobe com **`PAYMENT_PROVIDER=fake`** (demo completa sem Stripe). Stripe/MP entra só trocando env quando as chaves existirem.
