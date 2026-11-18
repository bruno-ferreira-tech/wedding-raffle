# Corta-Gravata — Implementation Plan (Nest API + Next Web)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Mesmo produto da spec, com **NestJS** como backend e **Next.js** só como frontend.

**Architecture:** npm workspaces monorepo `apps/api` (Nest + Drizzle + Postgres) e `apps/web` (Next UI). Domínio e PIX no Nest; web consome REST/SSE via `NEXT_PUBLIC_API_URL`.

**Tech Stack:** NestJS 11, Next.js 15, Drizzle, Postgres, Vitest/Jest, Stripe/MP/Fake PIX.

**Spec:** `docs/superpowers/specs/2026-07-12-corta-gravata-design.md` (seção 9 atualizada)

**Supersedes:** `docs/superpowers/plans/2026-07-12-corta-gravata-implementation.md` (API-no-Next) — não executar aquele plano.

---

## File structure (alvo)

```
package.json                 # workspaces: apps/*
apps/
  web/                       # Next (move do scaffold atual)
    src/app/...
    src/styles/...
  api/                       # Nest
    src/
      main.ts
      app.module.ts
      config/
      db/schema.ts, client.ts, seed.ts
      domain/money.ts, numbers.ts, draw.ts
      auth/
      numbers/
      orders/
      payments/
      draw/
      event-state/
      realtime/
    test/
drizzle.config.ts            # na api ou root apontando api
docs/superpowers/...
```

---

### Task 1: Monorepo — mover Next para `apps/web` + scaffold Nest `apps/api`

**Files:** root `package.json` workspaces; move scaffold; create Nest app.

- [ ] **Step 1:** Discard unfinished Next-root Drizzle (`src/db/*`, `drizzle.config.ts` at root, db scripts/deps only on Next) — schema will live in Nest.

- [ ] **Step 2:** Create npm workspaces root:

```json
{
  "name": "wedding-raffle",
  "private": true,
  "workspaces": ["apps/*"],
  "scripts": {
    "dev": "npm run dev --workspace=apps/web",
    "dev:web": "npm run dev --workspace=apps/web",
    "dev:api": "npm run start:dev --workspace=apps/api",
    "test": "npm run test --workspaces --if-present",
    "db:seed": "npm run db:seed --workspace=apps/api"
  }
}
```

- [ ] **Step 3:** Move current Next app into `apps/web` (package.json name `@wedding/web`, paths intact under `apps/web`). Keep design tokens/layout. Remove drizzle/stripe from web deps (API owns them). Web keeps `NEXT_PUBLIC_API_URL` in `.env.example`.

- [ ] **Step 4:** Scaffold Nest in `apps/api`:

```bash
npx @nestjs/cli new api --directory apps/api --package-manager npm --skip-git
```

Or manual Nest structure if CLI fights workspaces. Package name `@wedding/api`, port **3001**, enable CORS for `WEB_ORIGIN` (default `http://localhost:3000`). Fail loud if required env missing in production bootstrap for secrets used.

- [ ] **Step 5:** Health route `GET /health` → `{ ok: true }`.

- [ ] **Step 6:** Commit

```bash
git add -A
git commit -m "chore: split monorepo into Nest API and Next web"
```

---

### Task 2: Drizzle schema + seed no Nest (2000 números)

**Files:** `apps/api/src/db/schema.ts`, `client.ts`, `seed.ts`, `apps/api/drizzle.config.ts`

Same schema as previous plan (raffle_numbers, orders, event_state, draw_results). Scripts `db:generate`, `db:migrate`/`db:push`, `db:seed` on `@wedding/api`. `DATABASE_URL` required — throw if missing.

- [ ] Implement schema + client + idempotent seed 1..2000 + event_state
- [ ] Commit: `feat(api): drizzle schema and seed 2000 numbers`

---

### Task 3: Domínio puro — money + numbers (TDD)

**Files:** `apps/api/src/domain/money.ts`, `numbers.ts`, `apps/api/test/domain/numbers.spec.ts` (or vitest)

Same behaviors as old plan: PRICE_CENTS=2000, totalCents, assertCanReserve, applyReservation, applyRelease, applyMarkPaid, applyConfirmPaid.

- [ ] Red → green → commit: `feat(api): domain money and number reservation`

---

### Task 4: Domínio — draw (TDD)

**Files:** `apps/api/src/domain/draw.ts`, tests

`eligiblePool`, `pickWinner` — same as old plan.

- [ ] Commit: `feat(api): domain draw selection`

---

### Task 5: Auth Nest (padrinho / admin cookies)

**Files:** `apps/api/src/auth/*`

HMAC-signed httpOnly cookies; `POST /auth/padrinho`, `POST /auth/admin`; guards `PadrinhoGuard`, `AdminGuard`. Env: `ADMIN_PASSWORD`, `PADRINHO_PASSWORD`, `SESSION_SECRET` — throw if missing when guard/login runs.

- [ ] Commit: `feat(api): cookie auth for padrinho and admin`

---

### Task 6: PaymentProvider (Stripe + MP + Fake)

**Files:** `apps/api/src/payments/*`

Interface + `getPaymentProvider()` from `PAYMENT_PROVIDER`. Fake for local demo.

- [ ] Commit: `feat(api): pluggable PaymentProvider`

---

### Task 7: Orders module — create, status, expire, webhooks, fake confirm

**Files:** `apps/api/src/orders/*`, webhook controllers

- `POST /orders` `{ buyerName, numberIds }`
- `GET /orders/:id`
- Stripe/MP webhooks
- `POST /orders/:id/confirm-fake` if fake provider
- 15 min expiry lazy
- sales closed → 409

- [ ] Commit: `feat(api): orders, PIX webhook, and expiry`

---

### Task 8: Mark-paid + fechar vendas

- `POST /padrinho/mark-paid` (padrinho|admin)
- `POST /admin/sales` `{ status: 'open'|'closed' }` — on close cancel pending + release reservations

- [ ] Commit: `feat(api): mark-paid and sales lock`

---

### Task 9: State snapshot + SSE + draw

- `GET /state`
- `GET /events` SSE
- `POST /admin/draw` `{ prizeLabel? }` only if sales closed
- In-memory EventBus (YAGNI Redis)

- [ ] Commit: `feat(api): state, SSE, and draw`

---

### Task 10: Web — compra + pedido (consome API)

Point fetch/SSE to `NEXT_PUBLIC_API_URL`. Number picker, checkout, pedido status + fake pay button.

- [ ] Commit: `feat(web): guest purchase UI against Nest API`

---

### Task 11: Web — padrinho + admin

- [ ] Commit: `feat(web): padrinho and admin consoles`

---

### Task 12: Web — tellão

- [ ] Commit: `feat(web): live tellao with SSE`

---

### Task 13: Verificação E2E local

`PAYMENT_PROVIDER=fake`, API :3001, web :3000, checklist spec §13.

- [ ] Commit fixes if needed

---

## Note

Keep product rules from the design spec unchanged (2000 nums, R$20, batch PIX, name-only, padrinho mark-paid, N prizes, admin closes sales).
