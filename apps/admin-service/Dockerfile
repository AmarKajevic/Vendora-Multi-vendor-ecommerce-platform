# syntax=docker/dockerfile:1

# ---- Build Stage ----
FROM node:24-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.24.0 --activate

# Kopiraj samo manifest fajlove prvo (za layer caching)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/admin-service/package.json ./apps/admin-service/package.json
COPY packages/error-handler ./packages/error-handler
COPY packages/libs/prisma ./packages/libs/prisma

RUN apk add --no-cache openssl

# Cache mount čuva pnpm store IZMEĐU build-ova - drastično ubrzava ponovljene build-ove
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install \
    --frozen-lockfile \
    --filter "...admin-service" \
    --fetch-retries 5 \
    --fetch-retry-factor 2 \
    --fetch-retry-mintimeout 20000 \
    --fetch-retry-maxtimeout 120000

    

# Sad kopiraj pravi izvorni kod
COPY packages/error-handler ./packages/error-handler
COPY packages/libs/prisma ./packages/libs/prisma
COPY prisma ./prisma
COPY apps/admin-service/dist ./apps/admin-service/dist

RUN pnpm exec prisma generate --schema=./prisma/schema.prisma
ENV CI=true

# RUN pnpm prune --prod


# ---- Production Stage ----
FROM node:24-alpine AS production

RUN apk add --no-cache openssl dumb-init
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/apps/admin-service/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/apps/admin-service/package.json ./package.json
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma

USER nodejs

EXPOSE 6005

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]