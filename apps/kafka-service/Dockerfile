# =========================
# Build stage
# =========================

FROM node:24-alpine AS builder

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@11.24.0 --activate

# Copy workspace manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

# Copy service package.json
COPY apps/kafka-service/package.json ./apps/kafka-service/package.json

# Copy workspace packages required by kafka-service
COPY packages/error-handler ./packages/error-handler
COPY packages/libs/prisma ./packages/libs/prisma
COPY packages/utils ./packages/utils

# Prisma / native dependencies if required
RUN apk add --no-cache openssl

# Install only dependencies required by kafka-service
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install \
    --frozen-lockfile \
    --filter "...kafka-service" \
    --fetch-retries 5 \
    --fetch-retry-factor 2 \
    --fetch-retry-mintimeout 20000 \
    --fetch-retry-maxtimeout 120000


# Copy source
COPY apps/kafka-service ./apps/kafka-service

# Generate Prisma client if kafka-service uses Prisma
COPY prisma ./prisma

RUN pnpm exec prisma generate --schema=./prisma/schema.prisma

ENV CI=true


# =========================
# Production stage
# =========================

FROM node:24-alpine AS production

RUN apk add --no-cache openssl dumb-init

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

ENV NODE_ENV=production

# Node modules
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Kafka service
COPY --from=builder --chown=nodejs:nodejs \
    /app/apps/kafka-service ./apps/kafka-service

# Workspace packages
COPY --from=builder --chown=nodejs:nodejs \
    /app/packages ./packages

# Prisma
COPY --from=builder --chown=nodejs:nodejs \
    /app/prisma ./prisma

USER nodejs

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "apps/kafka-service/dist/main.js"]