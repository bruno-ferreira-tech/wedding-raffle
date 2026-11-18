# SaaS Corta-Gravata Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar o Corta-Gravata Digital em uma plataforma SaaS multi-tenant comercializável com carteira digital e cashout PIX automatizado.

**Architecture:** Monorepo npm workspaces (`apps/api` NestJS e `apps/web` Next.js 15). Banco relacional PostgreSQL com multi-tenancy (`users`, `events`, `payouts`, `event_prizes`), rotas públicas dinâmicas `/e/[slug]` com temas visuais injetados, barramento SSE isolado por evento e painel `/dashboard` para os noivos gerenciarem arrecadação e saques.

**Tech Stack:** NestJS 11, Next.js 15, Drizzle ORM, PostgreSQL, Tailwind CSS 4, shadcn/ui, Vitest, Jest.

**Spec:** `docs/superpowers/specs/2026-09-14-saas-corta-gravata-design.md`

## Global Constraints
- Nenhuma dependência externa deve quebrar os testes existentes.
- Cada casamento deve ter seus números, pedidos, telão e sorteios 100% isolados por `event_id`.
- A taxa da plataforma padrão é 4.9% (configurável via `PLATFORM_FEE_PERCENT`).
- O cashout PIX deve ser automático via serviço plugável de pagamento.

---

### Task 1: Schema do Banco Multi-Tenant & Migrações

**Files:**
- Modify: `apps/api/src/db/schema.ts`
- Create: `apps/api/drizzle/0001_multi_tenant_saas.sql` (via drizzle-kit)
- Modify: `apps/api/src/db/migrate-and-seed.ts`
- Test: `apps/api/test/db/schema.spec.ts`

- [ ] **Step 1: Atualizar schema Drizzle com tabelas `users`, `events`, `event_prizes`, `payouts` e FKs em `orders`, `raffle_numbers`, `draw_results`**
- [ ] **Step 2: Gerar migração SQL com `npm run db:generate --workspace=@wedding/api`**
- [ ] **Step 3: Atualizar script de seed para criar usuário admin/demo e evento padrão**
- [ ] **Step 4: Executar testes e verificar integridade do schema**
- [ ] **Step 5: Commit:** `feat(db): add multi-tenant schema with users, events, and payouts`

---

### Task 2: Autenticação de Noivos (Cadastro, Login e Sessão)

**Files:**
- Create: `apps/api/src/auth/couple-auth.service.ts`
- Create: `apps/api/src/auth/couple-auth.controller.ts`
- Create: `apps/api/src/auth/couple-jwt.guard.ts`
- Test: `apps/api/src/auth/couple-auth.spec.ts`

- [ ] **Step 1: Escrever teste falhando para registro e login de noivos com senha com hash (bcrypt/scrypt)**
- [ ] **Step 2: Implementar CoupleAuthService e endpoints `POST /auth/register` e `POST /auth/login`**
- [ ] **Step 3: Implementar CoupleJwtGuard para proteger rotas do `/dashboard`**
- [ ] **Step 4: Rodar testes e verificar sucesso**
- [ ] **Step 5: Commit:** `feat(api): add couple authentication service and guards`

---

### Task 3: Módulo de Eventos dos Noivos (CRUD, Personalização e Temas)

**Files:**
- Create: `apps/api/src/events/events.module.ts`
- Create: `apps/api/src/events/events.service.ts`
- Create: `apps/api/src/events/events.controller.ts`
- Test: `apps/api/src/events/events.service.spec.ts`

- [ ] **Step 1: Escrever testes unitários para criação de evento, busca por slug e atualização de configurações**
- [ ] **Step 2: Implementar EventsService:**
  - `createEvent(userId, data)`: gera slug único, cria evento e popula a quantidade escolhida de números (ex: 500, 1000 ou 2000).
  - `getBySlug(slug)`: retorna dados públicos do evento (nomes, foto, data, tema, regras, status).
  - `updateSettings(userId, eventId, data)`: atualiza tema, prêmios, PIN do padrinho e chave PIX.
- [ ] **Step 3: Implementar endpoints REST no EventsController**
- [ ] **Step 4: Rodar testes e verificar aprovação**
- [ ] **Step 5: Commit:** `feat(api): add events management module with themes and customization`

---

### Task 4: Números, Pedidos e Cobrança Multi-Tenant com Cálculo de Taxa

**Files:**
- Modify: `apps/api/src/numbers/numbers.service.ts`
- Modify: `apps/api/src/numbers/numbers.controller.ts`
- Modify: `apps/api/src/orders/orders.service.ts`
- Modify: `apps/api/src/orders/orders.controller.ts`
- Test: `apps/api/src/orders/orders.service.spec.ts`

- [ ] **Step 1: Atualizar validações e testes para escopo por `eventId` e cálculo de `feeCents`**
- [ ] **Step 2: Modificar OrdersService para registrar `order.feeCents` com base em `PLATFORM_FEE_PERCENT`**
- [ ] **Step 3: Adaptar reserva atômica de números para respeitar `eventId`**
- [ ] **Step 4: Rodar testes da API**
- [ ] **Step 5: Commit:** `feat(api): scope numbers and orders by event and compute platform fees`

---

### Task 5: Realtime Multi-Tenant (SSE por Evento) & Sorteio Escopado

**Files:**
- Modify: `apps/api/src/realtime/bus.ts`
- Modify: `apps/api/src/realtime/realtime.service.ts`
- Modify: `apps/api/src/realtime/realtime.controller.ts`
- Modify: `apps/api/src/draw/draw.service.ts`
- Modify: `apps/api/src/draw/draw.controller.ts`
- Test: `apps/api/src/realtime/bus.spec.ts`

- [ ] **Step 1: Atualizar EventBus para suportar canais por evento (`event:${eventId}`)**
- [ ] **Step 2: Adaptar endpoint `/events?slug=:slug` para assinar apenas os eventos daquele casamento**
- [ ] **Step 3: Adaptar DrawService para sortear números pagos exclusivamente do `eventId`**
- [ ] **Step 4: Rodar testes e verificar isolamento entre canais**
- [ ] **Step 5: Commit:** `feat(api): isolate realtime SSE streams and draw pool by event`

---

### Task 6: Carteira Digital e Saque PIX Automático (Cashout)

**Files:**
- Create: `apps/api/src/payouts/payouts.module.ts`
- Create: `apps/api/src/payouts/payouts.service.ts`
- Create: `apps/api/src/payouts/payouts.controller.ts`
- Create: `apps/api/src/payouts/payout-transfer.provider.ts`
- Test: `apps/api/src/payouts/payouts.service.spec.ts`

- [ ] **Step 1: Escrever testes unitários para cálculo de saldo líquido e validação de saque**
- [ ] **Step 2: Implementar cálculo de saldo disponível:**
  $$\text{Saldo} = \sum(\text{pagos}) - \sum(\text{taxas}) - \sum(\text{saques})$$
- [ ] **Step 3: Implementar disparo de transferência PIX automática no gateway**
- [ ] **Step 4: Implementar endpoint `POST /dashboard/payouts` e histórico de saques**
- [ ] **Step 5: Rodar testes**
- [ ] **Step 6: Commit:** `feat(api): add digital wallet, balance calculation, and automated PIX cashout`

---

### Task 7: Frontend — Rotas Dinâmicas do Casamento (`/e/[slug]`) & Temas

**Files:**
- Create: `apps/web/src/app/e/[slug]/page.tsx`
- Create: `apps/web/src/app/e/[slug]/telao/page.tsx`
- Create: `apps/web/src/app/e/[slug]/padrinho/page.tsx`
- Create: `apps/web/src/app/e/[slug]/pedido/[id]/page.tsx`
- Create: `apps/web/src/styles/themes.css`
- Modify: `apps/web/src/lib/api.ts`

- [ ] **Step 1: Criar definições CSS dos 4 temas (`champagne-navy`, `rose-gold`, `emerald-brass`, `monochrome-slate`)**
- [ ] **Step 2: Implementar página da rifa do convidado `/e/[slug]` com dados dinâmicos do casal**
- [ ] **Step 3: Implementar Telão ao vivo `/e/[slug]/telao` com tema do casal e SSE filtrado**
- [ ] **Step 4: Implementar Console do Padrinho `/e/[slug]/padrinho` com autenticação via PIN do evento**
- [ ] **Step 5: Testar carregamento das telas**
- [ ] **Step 6: Commit:** `feat(web): add dynamic event routes with custom themes and pin auth`

---

### Task 8: Frontend — Dashboard dos Noivos e Landing Page Comercial

**Files:**
- Create: `apps/web/src/app/(marketing)/page.tsx` (nova landing page na raiz)
- Create: `apps/web/src/app/login/page.tsx`
- Create: `apps/web/src/app/cadastro/page.tsx`
- Create: `apps/web/src/app/dashboard/page.tsx`
- Create: `apps/web/src/app/dashboard/configurar/page.tsx`
- Create: `apps/web/src/app/dashboard/sorteio/page.tsx`

- [ ] **Step 1: Implementar Landing Page institucional na raiz `/` com calculadora de arrecadação da rifa**
- [ ] **Step 2: Implementar telas de cadastro e login de noivos**
- [ ] **Step 3: Implementar Dashboard Principal com resumo financeiro, saldo e botão de saque PIX**
- [ ] **Step 4: Implementar tela de configuração com seletor de tema visual, regras de números e cadastro de prêmios**
- [ ] **Step 5: Implementar painel de controle ao vivo do sorteio e encerramento de vendas**
- [ ] **Step 6: Commit:** `feat(web): add SaaS landing page, couple dashboard, and visual customizer`

---

### Task 9: Validação Geral e Testes E2E

- [ ] **Step 1: Executar `npm test` em todos os workspaces**
- [ ] **Step 2: Executar build de produção `npm run build`**
- [ ] **Step 3: Criar walkthrough com evidências de funcionamento**
- [ ] **Step 4: Commit:** `chore: finalize SaaS multi-tenant corta-gravata platform`
