# SaaS Corta-Gravata Digital — Design Spec

**Data:** 2026-09-14  
**Status:** Aprovado  
**Produto:** Plataforma SaaS multi-tenant para rifa digital do "corta-gravata" em casamentos (estilo casar.com)

---

## 1. Visão Geral e Objetivo

Transformar o Corta-Gravata Digital de um sistema de evento único em uma plataforma SaaS multi-tenant comercializável, permitindo que qualquer casal crie sua rifa digital de casamento, personalize regras, identidade visual e prêmios, e receba os valores arrecadados no piloto automático via PIX direto em sua conta bancária.

### Objetivos Principais
- **Multi-Tenancy:** Múltiplos casamentos operando simultaneamente na mesma plataforma sem conflito de dados ou eventos em tempo real.
- **Subadquirência e Automação Total:** A plataforma processa os pagamentos dos convidados via gateway central, retém a taxa de serviço e realiza a transferência PIX (cashout) para a chave PIX dos noivos de forma 100% automatizada.
- **Personalização de Alto Padrão:** Nomes dos noivos, data, foto/banner de capa, regras de rifa (quantidade de números e preço configuráveis), lista de prêmios e paletas de cores refinadas para o telão e telas públicas.

---

## 2. Modelo de Domínio e Banco de Dados (PostgreSQL + Drizzle)

### 2.1 Novas Tabelas

#### `users`
Contas dos noivos e administradores da plataforma.
- `id`: `serial` primary key
- `email`: `text` unique, not null
- `password_hash`: `text` not null
- `name`: `text` not null
- `role`: `text` ('couple' | 'platform_admin') default 'couple'
- `created_at`: `timestamp` default now()

#### `events`
Instância de cada casamento/rifa.
- `id`: `serial` primary key
- `user_id`: `integer` references `users.id` not null
- `slug`: `text` unique not null (ex.: `mariana-e-felipe`)
- `title`: `text` not null
- `couple_names`: `text` not null
- `event_date`: `timestamp`
- `cover_image_url`: `text`
- `welcome_message`: `text`
- `theme_id`: `text` default 'champagne-navy' not null
- `total_numbers`: `integer` default 1000 not null
- `ticket_price_cents`: `integer` default 2000 not null
- `padrinho_pin`: `text` not null (PIN de 4 a 6 dígitos)
- `pix_key_type`: `text` (cpf, cnpj, email, phone, random)
- `pix_key`: `text`
- `sales_status`: `sales_status` ('open' | 'closed') default 'open'
- `created_at`: `timestamp` default now()
- `updated_at`: `timestamp` default now()

#### `payouts`
Histórico e controle de saques PIX dos noivos.
- `id`: `serial` primary key
- `event_id`: `integer` references `events.id` not null
- `amount_cents`: `integer` not null
- `fee_deducted_cents`: `integer` default 0 not null
- `pix_key`: `text` not null
- `pix_key_type`: `text` not null
- `provider_transfer_id`: `text`
- `status`: `payout_status` ('pending' | 'completed' | 'failed') default 'pending'
- `failure_reason`: `text`
- `created_at`: `timestamp` default now()
- `completed_at`: `timestamp`

#### `event_prizes`
Prêmios cadastrados previamente pelos noivos.
- `id`: `serial` primary key
- `event_id`: `integer` references `events.id` not null
- `prize_index`: `integer` not null (1, 2, 3...)
- `label`: `text` not null (ex.: "1º Lugar: TV 50 polegadas")
- `created_at`: `timestamp` default now()

### 2.2 Adaptação das Tabelas Existentes
- **`raffle_numbers`**: Adiciona `event_id` references `events.id`. Chave primária composta ou `(event_id, id)` com id de 1 a `event.total_numbers`.
- **`orders`**: Adiciona `event_id` references `events.id` e `fee_cents` integer default 0.
- **`draw_results`**: Adiciona `event_id` references `events.id`.

---

## 3. Fluxo Financeiro e Subadquirência

1. **Taxa da Plataforma (Take Rate):**
   - Configurada via variável de ambiente: `PLATFORM_FEE_PERCENT=4.9` (ou percentual customizado por plano).
2. **Cobrança do Convidado:**
   - O convidado escolhe $K$ números. Total = $K \times \text{ticket\_price\_cents}$.
   - O gateway central da plataforma gera o PIX dinâmico com metadata `{ eventId, orderId }`.
   - Ao receber o webhook de pagamento aprovado:
     - `order.status = 'paid'`
     - `order.fee_cents = Math.round(order.total_cents * (PLATFORM_FEE_PERCENT / 100))`
     - Os números correspondentes tornam-se `pago`.
     - Evento realtime emitido exclusivamente para o canal do evento.
3. **Cálculo de Saldo:**
   - $\text{Saldo Líquido Disponível} = \sum(\text{orders.total\_cents}) - \sum(\text{orders.fee\_cents}) - \sum(\text{payouts.amount\_cents where status in ('completed', 'pending')})$.
4. **Saque PIX Automático (Cashout):**
   - Noivos configuram chave PIX e clicam em "Sacar Saldo".
   - API valida se $\text{amount} \le \text{Saldo Líquido}$ e cria registro em `payouts` com status `'pending'`.
   - Serviço de transferência chama a API de transferência bancária do gateway (Asaas Transferências / Mercado Pago Payouts).
   - Ao concluir, atualiza `status = 'completed'` e persiste o ID do comprovante.

---

## 4. Temas Visuais e Experiência do Convidado e Telão

### Paletas Pré-Curadas (`theme_id`):
1. **`champagne-navy`:** Fundo `#0B1220`, texto `#F8FAFC`, acento dourado champanhe `#C6A75E`.
2. **`rose-gold`:** Fundo `#171018`, texto `#FAF5F0`, acento ouro rosé `#D4A373`.
3. **`emerald-brass`:** Fundo `#0A1C16`, texto `#F4FBF7`, acento latão nobre `#D4B26F`.
4. **`monochrome-slate`:** Fundo `#121417`, texto `#F1F5F9`, acento marfim prata `#E2E8F0`.

As variáveis CSS de cada tema são aplicadas dinamicamente no container raiz das páginas públicas (`data-theme={event.themeId}`).

---

## 5. Estrutura de Rotas e Telas

### Rotas Públicas da Plataforma
- `/`: Landing page do SaaS com apresentação, simulador de arrecadação e chamada para criar evento.
- `/login`: Login dos noivos (e-mail + senha).
- `/cadastro`: Criação de conta dos noivos.

### Rotas Públicas do Evento (`/e/[slug]`)
- `/e/[slug]`: Página da rifa para os convidados (banner, nomes dos noivos, cartela dinâmica estilo bingo e checkout PIX).
- `/e/[slug]/pedido/[id]`: Status do pagamento do pedido com QR Code e copia-e-cola.
- `/e/[slug]/telao`: Telão ao vivo em tela cheia com contadores, feed em tempo real e revelação de sorteio.
- `/e/[slug]/padrinho`: Console para padrinhos registrarem vendas assistidas usando o PIN do evento.

### Painel Privado dos Noivos (`/dashboard`)
- `/dashboard`: Resumo do casamento, arrecadação total, saldo disponível, solicitação de saque PIX instantâneo e links compartilháveis.
- `/dashboard/configurar`: Edição de nomes, foto/banner, tema visual, regras (preço e números), PIN do padrinho e prêmios.
- `/dashboard/ao-vivo`: Controle do telão (abrir/fechar vendas, disparar sorteio do próximo prêmio da lista).

---

## 6. Realtime (SSE) Multi-Tenant

O endpoint `/events?slug=:slug` ou `/events?eventId=:id`:
- Conecta o telão ou cartela pública ao canal específico do evento (`event:${eventId}`).
- Eventos transmitidos:
  - `order.reserved`
  - `sale.completed`
  - `sales.updated`
  - `draw.winner`
- Isolamento total entre casamentos concorrentes.
