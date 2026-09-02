# =========================
# Dependencies
# =========================
FROM node:24-alpine AS deps

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@11.24.0 --activate

# Workspace files
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml ./

# Admin UI package
COPY apps/admin-ui/package.json ./apps/admin-ui/package.json

# Shared packages
COPY packages ./packages

# Install dependencies
RUN pnpm install \
    --filter admin-ui... \
    --frozen-lockfile \
    --fetch-retries 5 \
    --fetch-retry-factor 2 \
    --fetch-retry-mintimeout 20000 \
    --fetch-retry-maxtimeout 120000


# =========================
# Builder
# =========================
FROM node:24-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@11.24.0 --activate

# Dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/admin-ui/node_modules ./apps/admin-ui/node_modules
COPY --from=deps /app/packages ./packages

# Workspace configuration
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY nx.json ./
COPY tsconfig.base.json ./

# Admin UI source
COPY apps/admin-ui ./apps/admin-ui

ENV CI=true
ENV NEXT_TELEMETRY_DISABLED=1

# Build
RUN pnpm nx build admin-ui --configuration=production
RUN find /app/apps/admin-ui -maxdepth 5 -type d -name ".next" -o -name "standalone"


# =========================
# Production
# =========================
FROM node:24-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Security
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# Next.js standalone output
COPY --from=builder --chown=nextjs:nodejs \
    /app/apps/admin-ui/.next/standalone ./

COPY --from=builder --chown=nextjs:nodejs \
    /app/apps/admin-ui/.next/static ./apps/admin-ui/.next/static

# If you have public folder
COPY --from=builder --chown=nextjs:nodejs \
    /app/apps/admin-ui/public ./apps/admin-ui/public

USER nextjs

EXPOSE 3002

ENV PORT=3002
ENV HOSTNAME=0.0.0.0

CMD ["node", "apps/admin-ui/server.js"]