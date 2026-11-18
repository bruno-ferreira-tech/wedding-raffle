FROM node:22-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/
RUN npm ci --workspace=@wedding/web --include-workspace-root

FROM base AS builder
COPY package.json package-lock.json ./
COPY apps/web/ ./apps/web/
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_PAYMENT_PROVIDER
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_PAYMENT_PROVIDER=$NEXT_PUBLIC_PAYMENT_PROVIDER
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build --workspace=@wedding/web

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

EXPOSE 3000

CMD ["node", "apps/web/server.js"]
