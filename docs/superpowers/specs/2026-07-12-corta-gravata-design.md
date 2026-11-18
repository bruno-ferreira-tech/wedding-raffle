# Corta-Gravata Digital — Design Spec

**Data:** 2026-07-12  
**Status:** aprovado em espírito (detalhes ajustáveis depois)  
**Produto:** rifa digital do “corta-gravata” no dia do casamento

---

## 1. Objetivo

No dia do casamento, convidados compram números via PIX; padrinhos registram vendas para quem não é tecnológico; um tellão mostra compras em tempo real; os noivos fecham as vendas e sorteiam N prêmios configuráveis na hora.

**Sucesso no dia D:** fila de compra fluida, tellão confiável, sorteio sem ambiguidade sobre quem ganhou.

---

## 2. Regras de negócio (fechadas)

| Item | Decisão |
|------|---------|
| Números | **2000** — exibidos como `0001`–`2000` |
| Preço | **R$ 20,00** fixo por número |
| Checkout | Vários números, **um PIX** com o total |
| Dados do comprador | **Só o nome** |
| PIX convidado | Automático (QR + copia-e-cola); número só `pago` após confirmação |
| Padrinho | Escolhe números + nome → **marca como pago** (caixa / PIX no celular dele) |
| Elegíveis no sorteio | Apenas números **pagos** |
| Prêmios | Quantidade **N definida na hora** do sorteio (rótulos opcionais: “1º prêmio”, etc.) |
| Fechar vendas | Só **admin noivos** |
| Reserva PIX | Timeout **15 minutos**; depois números voltam a disponíveis |
| Ao fechar vendas | Cancela reservas abertas; bloqueia novas compras e “marcar pago” |

---

## 3. Papéis e rotas

| Papel | Acesso | Pode |
|-------|--------|------|
| Convidado | público | Escolher números, informar nome, pagar PIX |
| Padrinho | `/padrinho` + senha compartilhada | Registrar venda + marcar pago; ver lista recente |
| Noivos | `/admin` + senha mestre | Tudo do padrinho + fechar/reabrir vendas + sortear + ver arrecadação |

| Rota | UI |
|------|-----|
| `/` | Compra (grade/busca + carrinho + checkout PIX) |
| `/pedido/[id]` | Status do pagamento (aguardando / confirmado / expirado) |
| `/telao` | Tela cheia para projetor |
| `/padrinho` | Venda assistida |
| `/admin` | Controle do evento + sorteio |

Auth MVP: senhas em variáveis de ambiente (`PADRINHO_PASSWORD`, `ADMIN_PASSWORD`) + cookie de sessão HTTP-only. Sem contas individuais no MVP.

---

## 4. Estados do número

```
disponivel ──► reservado ──► pago
     ▲              │
     └──────────────┘ (timeout / cancelamento / fechar vendas)
```

- **disponivel:** pode ser selecionado  
- **reservado:** travado por um `Order` pendente  
- **pago:** entra no tellão e no pool do sorteio  

Transição padrinho “marcar pago”: `disponivel` → `pago` (cria `Order` com `source=padrinho`, `status=paid`, sem cobrança externa).

---

## 5. Fluxo de compra (convidado)

1. Cliente seleciona 1..N números disponíveis.  
2. Informa nome → “Pagar com PIX”.  
3. Servidor (transação):  
   - rejeita se vendas fechadas;  
   - tenta reservar todos os números atomicamente;  
   - se qualquer um falhar → rollback e erro “número(s) indisponível(is)”;  
   - cria `Order` (`pending`, total = N × 2000 centavos);  
   - chama `PaymentProvider.createPixCharge(order)`;  
   - persiste `provider`, `providerChargeId`, QR / copia-e-cola, `expiresAt`.  
4. UI mostra QR + código + countdown.  
5. Webhook `payment.succeeded` (idempotente): marca order `paid`, números `pago`, emite evento realtime.  
6. Expiração (job ou check lazy): order `expired`, números liberados.

**Concorrência:** unique partial index / `UPDATE … WHERE status = 'reservado'|'pago'` garantindo um dono por número.

---

## 6. Fluxo padrinho

1. Login com senha padrinho.  
2. Busca/seleciona números + nome.  
3. “Marcar como pago” → commit atômico → tellão atualiza.  
4. Sem PIX no MVP do padrinho (evita dois caminhos confusos na fila).

---

## 7. Tellão (`/telao`)

Com **2000** números, **não** renderizar grade completa.

**Modo vendas abertas**
- Contadores: vendidos / disponíveis / arrecadado (R$)  
- Feed ao vivo: `#0421 — Maria` (últimos ~30, animação de entrada)  
- Marca do casal / título “Corta-Gravata” como herói visual  

**Modo vendas fechadas / sorteio**
- Mesmos contadores (congelados)  
- Área central de sorteio: countdown → revelação do número + nome  
- Lista de ganhadores da noite (prêmio 1..N)

Realtime: SSE a partir do Next.js (ou Postgres `LISTEN/NOTIFY`) — polling 2s como fallback se SSE cair.

---

## 8. Sorteio

1. Admin fecha vendas.  
2. Admin define `N` (quantidade de prêmios) e opcionalmente labels.  
3. Para cada prêmio `i = 1..N`:  
   - botão “Sortear próximo”;  
   - servidor sorteia uniformemente entre números `pago` ainda não ganhadores;  
   - persiste `DrawResult { prizeIndex, number, buyerName, drawnAt }`;  
   - tellão anima a revelação.  
4. Sorteio é **server-side** (nunca só no browser) — seed = CSPRNG (`crypto.randomInt`).

Não há “desfazer sorteio” no MVP (evita drama). Se precisar: só via intervenção manual no banco, fora do produto.

---

## 9. Arquitetura técnica

**Decisão (2026-07-12):** monorepo com **Next.js (front)** + **NestJS (API)**.  
O plano anterior (API via Route Handlers do Next) foi **substituído** — o domínio, PIX, auth, SSE e sorteio vivem no Nest.

**Stack**
- `apps/web` — Next.js (App Router) + TypeScript — só UI  
- `apps/api` — NestJS + TypeScript — REST + SSE + webhooks  
- Postgres + Drizzle ORM (no Nest)  
- `PaymentProvider` interface:  
  - `StripePixProvider` (primário se conta tiver PIX)  
  - `MercadoPagoPixProvider` (fallback BR)  
  - `FakePaymentProvider` (demo local)  
- Deploy: web (Vercel) + API (Railway/Fly/Render ou similar) + Neon  
- Testes: Vitest/Jest no Nest para domínio (reserva, expiração, sorteio)

**Layout**

| Pasta | Papel |
|-------|--------|
| `apps/web` | Compra, pedido, tellão, padrinho, admin |
| `apps/api` | Domínio, DB, PIX, auth, realtime, sorteio |

**Módulos Nest (limites claros)**

| Módulo | Responsabilidade |
|--------|------------------|
| `numbers` | Estados, reserva atômica, liberação |
| `orders` | Criação, expiração, marcar pago |
| `draw` | Pool elegível, sorteio, ganhadores |
| `payments` | Interface + Stripe + MP + Fake + webhooks |
| `realtime` | SSE / bus de eventos |
| `auth` | Cookies de sessão padrinho/admin |
| `event-state` | Abrir/fechar vendas |

**Front → API:** `NEXT_PUBLIC_API_URL` (ex. `http://localhost:3001`). CORS liberado para o origin do web.

**Variáveis de ambiente (obrigatórias em prod — falhar alto se faltar)**  
API: `DATABASE_URL`, `ADMIN_PASSWORD`, `PADRINHO_PASSWORD`, `PAYMENT_PROVIDER` (`stripe`|`mercadopago`|`fake`), chaves do provider, `SESSION_SECRET`, `WEB_ORIGIN`.  
Web: `NEXT_PUBLIC_API_URL`.

---

## 10. Direção visual (frontend)

**Conceito:** cerimônia noturna do corta-gravata — tinta profunda, metal da tesoura, calor de salão. Não “rifa genérica”, não dashboard.

- **Tom:** luxury ceremonial (escuro, pontual, teatral no tellão)  
- **Cores:** fundo navy/ink `#0B1220`, texto off-white, acento champagne `#C6A75E`, sucesso esmeralda só em “pago”  
- **Tipo:** display serif característico para marca/títulos (ex. Fraunces ou Similar); corpo com grotesk refinada **não**-Inter (ex. Source Sans 3 ou Manrope)  
- **Tellão:** tipografia grande, feed como “placa de resultado”, motion de revelação no sorteio  
- **Compra mobile:** uma composição clara — marca, seletor de números, CTA pagar; sem cards decorativos  
- **Motion:** entrada stagger no feed do tellão; countdown do sorteio; microfeedback ao selecionar número  

Evitar: purple gradient, cream+terracotta clichê, pills excessivas, emojis.

---

## 11. Fora do MVP (explicitamente)

- Contas por padrinho / audit log rico  
- WhatsApp / e-mail do comprador  
- PIX gerado pelo fluxo padrinho  
- Múltiplos eventos / multi-tenant  
- Reembolso self-service  
- App nativo  

---

## 12. Riscos e mitigações

| Risco | Mitigação |
|-------|-----------|
| Stripe PIX invite-only (conta BR) | Trocar `PAYMENT_PROVIDER=mercadopago` sem mudar domínio |
| Internet do salão instável | Tellão com reconnect + último snapshot em memória |
| Dois convidados no mesmo número | Reserva atômica + mensagem clara |
| PIX pago após fechar vendas | No fechamento, cancelar reservas; webhook tardio: se order já `expired`/`cancelled`, registrar alerta admin e não reabrir número já sorteado (edge: documentar; MVP rejeita late-pay se vendas fechadas e order cancelada) |

---

## 13. Critérios de aceite

1. Comprar 3 números → um PIX de R$ 60 → após webhook, 3 números `pago` no tellão.  
2. Padrinho marca 2 números pagos → aparecem no tellão sem PIX.  
3. Dois clientes disputam o mesmo número → só um reserva.  
4. Reserva expira em 15 min → números livres.  
5. Admin fecha vendas → `/` e padrinho não vendem mais; reservas abertas canceladas.  
6. Admin sorteia N=3 → três ganhadores distintos só entre pagos; tellão revela.  
7. Reiniciar tellão no meio da festa → reconecta e recupera estado atual.
