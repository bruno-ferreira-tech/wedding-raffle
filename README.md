# 💍 Corta-Gravata Digital — Plataforma SaaS Multi-Tenant

> A plataforma moderna e automatizada de corta-gravata digital para casamentos (estilo *casar.com*), com cartela tipo bingo, pagamentos PIX automatizados, telão interativo ao vivo e carteira digital com saques automáticos para os noivos.

---

## 🌟 Principais Funcionalidades

- **🏢 Multi-Tenant Completo**: Cada casal possui seu próprio slug (`/e/:slug`), tema, prêmios, cartela e carteira digital.
- **⚡ Pagamento PIX e Saque 100% Automatizado**:
  - Convidado compra números via QR Code / Copia e Cola.
  - Plataforma retém take-rate configurável (`PLATFORM_FEE_PERCENT`, padrão 4.9%).
  - Casal acompanha o saldo líquido no `/dashboard` e clica em **"Sacar Saldo via PIX"** para transferência imediata e automatizada para sua chave bancária.
- **🎨 4 Temas Visuais Luxuosos**:
  - `champagne-navy` (Dourado Champagne & Azul Marinho)
  - `rose-gold` (Rose Gold & Veludo)
  - `emerald-brass` (Verde Esmeralda & Bronze)
  - `monochrome-slate` (Minimalista & Prata Marfim)
- **🖥️ Telão Interativo para Festas (`/e/:slug/telao`)**:
  - Atualização instantânea via Server-Sent Events (SSE).
  - Feed das últimas compras com animações.
  - Sorteio ao vivo com contagem regressiva e celebração do vencedor.
- **👔 Console do Padrinho (`/e/:slug/padrinho`)**:
  - Autenticação por PIN de 4 dígitos configurado pelo casal.
  - Registro ágil de vendas assistidas para convidados que pagarem em dinheiro em mãos.
- **🎛️ Painel dos Noivos (`/dashboard`)**:
  - Resumo financeiro (Bruto, Taxa, Líquido, Total Sacado, Saldo Disponível).
  - Configuração do casamento (`/dashboard/configurar`): noivos, mensagens, temas, valores e prêmios.
  - Painel do sorteio (`/dashboard/sorteio`): trava de vendas e sorteio eletrônico auditável.

---

## 🏗️ Arquitetura

- **Monorepo**: npm workspaces
  - `apps/api`: NestJS 11, PostgreSQL, Drizzle ORM, SSE, Provider de PIX/Payouts
  - `apps/web`: Next.js 15 (App Router, Tailwind CSS 4, React 19)
- **Banco de Dados**: PostgreSQL com Drizzle ORM e migrações versionadas

---

## 🚀 Como Executar Localmente

### 1. Pré-requisitos
- Node.js 20+
- Docker e Docker Compose (para PostgreSQL local)

### 2. Subir o Banco de Dados
```bash
docker compose up -d db
```

### 3. Configurar Variáveis de Ambiente
Copie `.env.example` para `.env` na raiz ou em cada app.

### 4. Executar Migrações e Seed
```bash
npm run db:setup --workspace=@wedding/api
```

### 5. Iniciar Serviços
```bash
# Iniciar API (NestJS na porta 3001)
npm run start:dev --workspace=@wedding/api

# Iniciar Frontend (Next.js na porta 3000)
npm run dev --workspace=@wedding/web
```

---

## 🧪 Testes e Validação

```bash
# Testes unitários do backend (NestJS + Drizzle)
npm test --workspace=@wedding/api

# Testes unitários do frontend (Vitest)
npm test --workspace=@wedding/web

# Build de produção do frontend
npm run build --workspace=@wedding/web

# Build de produção da API
npm run build --workspace=@wedding/api
```

Para mais detalhes sobre deploy em VPS ou Cloud, consulte o [DEPLOY.md](./DEPLOY.md).
