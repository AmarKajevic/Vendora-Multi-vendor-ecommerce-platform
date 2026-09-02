# ============================================================
# VENDORA - logger Service
# ============================================================

# ------------------------------------------------------------
# BUILDER
# ------------------------------------------------------------

FROM node:24-alpine AS builder

WORKDIR /app

RUN corepack enable && \
    corepack prepare pnpm@11.24.0 --activate

RUN apk add --no-cache openssl

# ------------------------------------------------------------
# Workspace manifests
# ------------------------------------------------------------

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

COPY apps/logger-service/package.json \
     ./apps/logger-service/package.json

COPY packages/error-handler \
     ./packages/error-handler

COPY packages/libs/prisma \
     ./packages/libs/prisma

# ------------------------------------------------------------
# Dependencies
# ------------------------------------------------------------
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install \
    --frozen-lockfile \
    --filter "...logger-service" \
    --fetch-retries 5 \
    --fetch-retry-factor 2 \
    --fetch-retry-mintimeout 20000 \
    --fetch-retry-maxtimeout 120000


# ------------------------------------------------------------
# Runtime source files
# ------------------------------------------------------------

COPY prisma ./prisma

COPY apps/logger-service/dist \
     ./apps/logger-service/dist

# ------------------------------------------------------------
# Prisma Client
# ------------------------------------------------------------

RUN pnpm exec prisma generate \
    --schema=./prisma/schema.prisma


# ============================================================
# loggerION
# ============================================================

FROM node:24-alpine AS loggerion

WORKDIR /app

ENV NODE_ENV=loggerion

RUN apk add --no-cache \
    openssl \
    dumb-init

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# ------------------------------------------------------------
# Preserve pnpm workspace structure
# ------------------------------------------------------------

COPY --from=builder \
    --chown=nodejs:nodejs \
    /app/node_modules \
    ./node_modules

COPY --from=builder \
    --chown=nodejs:nodejs \
    /app/apps \
    ./apps

COPY --from=builder \
    --chown=nodejs:nodejs \
    /app/packages \
    ./packages

COPY --from=builder \
    --chown=nodejs:nodejs \
    /app/prisma \
    ./prisma

COPY --from=builder \
    --chown=nodejs:nodejs \
    /app/package.json \
    ./package.json

COPY --from=builder \
    --chown=nodejs:nodejs \
    /app/pnpm-lock.yaml \
    ./pnpm-lock.yaml

COPY --from=builder \
    --chown=nodejs:nodejs \
    /app/pnpm-workspace.yaml \
    ./pnpm-workspace.yaml

USER nodejs

EXPOSE 6008

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "apps/logger-service/dist/main.js"]