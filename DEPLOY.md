# Guia de Deploy em Produção — Corta-Gravata Digital

Este documento descreve como colocar o sistema **Corta-Gravata Digital** em produção para o dia do casamento.

---

## 🎯 Opções de Hospedagem

| Opção | Recomendado Para | Custo / Complexidade |
|-------|------------------|-----------------------|
| **Opção 1: Docker Compose em VPS** (Hetzner, DigitalOcean, Linode, AWS) | Tudo em um único servidor com total controle | Baixo (~$4–$6/mês) / Baixa complexidade |
| **Opção 2: Cloud PaaS Híbrido** (Vercel + Railway/Render + Neon) | Sem gerenciar Linux/Docker diretamente | Grátis / Baixo custo inicial |

---

## 🚀 Opção 1: Deploy com Docker Compose em VPS (Recomendado)

### 1. Requisitos no Servidor
- Servidor Linux (Ubuntu 22.04 ou 24.04 recomendado) com pelo menos **1 GB RAM** e 1 vCPU.
- **Docker** e **Docker Compose** instalados (`curl -fsSL https://get.docker.com | sh`).
- Um domínio ou subdomínio apontado para o IP da VPS (ex.: `casamento.seudominio.com` ou dois subdomínios `app.seudominio.com` e `api.seudominio.com`).

### 2. Clonar e Configurar
No terminal da VPS:
```bash
git clone https://github.com/bruno-ferreira-tech/wedding-raffle.git
cd wedding-raffle
git checkout feature/corta-gravata

# Criar arquivo de variáveis de ambiente
cp .env.example .env
nano .env
```

Preencha as variáveis em `.env`:
* `ADMIN_PASSWORD`: Senha forte dos noivos.
* `PADRINHO_PASSWORD`: Senha fácil dos padrinhos.
* `SESSION_SECRET`: Uma string aleatória longa (mínimo 32 caracteres).
* `PAYMENT_PROVIDER`: `mercadopago`, `stripe` ou `fake`.
* `MERCADO_PAGO_ACCESS_TOKEN` / `STRIPE_SECRET_KEY`: Suas chaves de produção.
* `WEB_ORIGIN`: `https://casamento.seudominio.com`
* `NEXT_PUBLIC_API_URL`: `https://api.seudominio.com` (ou `https://casamento.seudominio.com/api` se usar reverse proxy único)
* `COOKIE_SECURE`: `true` (quando estiver com HTTPS)

### 3. Inicializar e Subir
```bash
# Subir os containers em background
docker compose up -d --build

# Inicializar o banco de dados (migração + seed dos 2000 números)
docker compose exec api npm run db:setup
```

### 4. Configurar SSL / HTTPS Reverso (Exemplo com Caddy)
O Caddy emite certificados Let's Encrypt automaticamente:
```caddy
# /etc/caddy/Caddyfile
casamento.seudominio.com {
    reverse_proxy localhost:3000
}

api.seudominio.com {
    reverse_proxy localhost:3001
}
```
Recarregue o Caddy: `sudo systemctl reload caddy`.

---

## ☁️ Opção 2: Deploy em Plataformas Cloud (PaaS)

### 1. Banco de Dados (PostgreSQL no Neon / Supabase)
1. Crie um projeto no [Neon](https://neon.tech) ou [Supabase](https://supabase.com).
2. Copie a `DATABASE_URL` (com pooling ativado ou conexão direta).

### 2. Backend (API NestJS no Railway / Render / Fly.io)
1. Conecte o repositório no Railway/Render.
2. Root Directory: selecione a raiz ou `apps/api`.
3. Build Command: `npm run build --workspace=@wedding/api`
4. Start Command: `npm run start:prod --workspace=@wedding/api`
5. Variáveis de Ambiente no Painel:
   * `DATABASE_URL` = sua URL do Neon/Supabase
   * `ADMIN_PASSWORD` = senha master
   * `PADRINHO_PASSWORD` = senha padrinhos
   * `SESSION_SECRET` = chave aleatória de 32+ caracteres
   * `PAYMENT_PROVIDER` = `mercadopago` ou `stripe`
   * `MERCADO_PAGO_ACCESS_TOKEN` = seu token MP
   * `WEB_ORIGIN` = `https://seu-front.vercel.app`
   * `COOKIE_SECURE` = `true`
   * `COOKIE_SAME_SITE` = `none` (necessário se o front e a API estiverem em domínios diferentes)
6. Execute o seed uma vez:
   No terminal do Railway/Render: `npm run db:setup --workspace=@wedding/api`

### 3. Frontend (Next.js na Vercel)
1. Importe o repositório na [Vercel](https://vercel.com).
2. Root Directory: `apps/web`.
3. Variáveis de Ambiente na Vercel:
   * `NEXT_PUBLIC_API_URL` = `https://sua-api.up.railway.app`
   * `NEXT_PUBLIC_PAYMENT_PROVIDER` = `mercadopago` (ou `stripe`)
4. Clique em **Deploy**.

---

## 🔔 Configuração dos Webhooks de Pagamento

Para que os pagamentos PIX sejam confirmados automaticamente no telão:

### Mercado Pago
1. Acesse o painel de desenvolvedores do Mercado Pago.
2. Em **Webhooks / Notificações IPN**, configure a URL:
   `https://sua-api.seudominio.com/webhooks/mercadopago`
3. Eventos: marque **Pagamentos (payment)**.

### Stripe
1. Acesse o Dashboard da Stripe > **Developers** > **Webhooks**.
2. Adicione o endpoint:
   `https://sua-api.seudominio.com/webhooks/stripe`
3. Selecione os eventos: `payment_intent.succeeded`.
4. Copie o **Signing secret** (`whsec_...`) e defina na variável `STRIPE_WEBHOOK_SECRET`.

---

## ✅ Checklist do Dia do Evento

1. [ ] Acessar `/admin` com a `ADMIN_PASSWORD` e checar se o contador marca **2000 números disponíveis**.
2. [ ] Testar uma compra real de R$ 20,00 no PIX e verificar se o número muda para `pago` e aparece no feed do `/telao`.
3. [ ] Abrir `/padrinho` no celular dos padrinhos com a `PADRINHO_PASSWORD` e simular uma venda presencial.
4. [ ] Conectar o notebook do projetor na rota `/telao` em tela cheia (`F11`).
5. [ ] Na hora do sorteio: entrar no `/admin`, clicar em **Encerrar vendas** e sortear os prêmios na sequência!

---

## 🌐 Modo SaaS Multi-Tenant (Estilo Casar.com)

A plataforma opera nativamente como **SaaS Multi-Tenant comercial** com total isolamento de eventos, temas e carteira digital:

### 1. Rotas do SaaS
* **`/`**: Landing Page de alta conversão com simulador interativo de arrecadação.
* **`/cadastro`** & **`/login`**: Autenticação de noivos com criação instantânea do casamento.
* **`/dashboard`**: Painel financeiro do casal com saldo líquido em tempo real e botão de **Saque PIX Instantâneo**.
* **`/dashboard/configurar`**: Seletor de 4 temas luxuosos de casamento (`champagne-navy`, `rose-gold`, `emerald-brass`, `monochrome-slate`), cadastro dinâmico de prêmios, PIN dos padrinhos e chave PIX para saques.
* **`/dashboard/sorteio`**: Trava de vendas e sorteio eletrônico ao vivo com broadcast SSE.
* **`/e/[slug]`**: Rifa pública dos convidados com cartela responsiva tipo bingo e checkout PIX integrado.
* **`/e/[slug]/telao`**: Telão ao vivo exclusivo do evento para projetores/TVs.
* **`/e/[slug]/padrinho`**: Console de vendas assistidas para padrinhos com autenticação por PIN de 4 dígitos.

### 2. Variáveis de Configuração do SaaS
* `PLATFORM_FEE_PERCENT`: Porcentagem da taxa retida pela plataforma (padrão: `4.9`).
* `PAYOUT_TRANSFER_PROVIDER`: Provedor de transferências bancárias PIX para saques automáticos (`fake`, `asaas`, `mercadopago`).

