FROM node:22-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
RUN npm ci --workspace=@wedding/api --include-workspace-root

FROM base AS builder
COPY package.json package-lock.json ./
COPY apps/api/ ./apps/api/
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
RUN npm run build --workspace=@wedding/api

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3001

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules

COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY apps/api/drizzle ./apps/api/drizzle
COPY apps/api/src/db ./apps/api/src/db

EXPOSE 3001

CMD ["node", "apps/api/dist/main"]
