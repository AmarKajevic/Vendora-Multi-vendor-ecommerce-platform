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

# user UI package
COPY apps/user-ui/package.json ./apps/user-ui/package.json

# Shared packages
COPY packages ./packages

# Install dependencies
RUN pnpm install \
    --filter user-ui... \
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
COPY --from=deps /app/apps/user-ui/node_modules ./apps/user-ui/node_modules
COPY --from=deps /app/packages ./packages

# Workspace configuration
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY nx.json ./
COPY tsconfig.base.json ./

# user UI source
COPY apps/user-ui ./apps/user-ui

ENV CI=true
ENV NEXT_TELEMETRY_DISABLED=1

# Build
RUN pnpm nx build user-ui --configuration=production
RUN find /app/apps/user-ui -maxdepth 5 -type d -name ".next" -o -name "standalone"


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
    /app/apps/user-ui/.next/standalone ./

COPY --from=builder --chown=nextjs:nodejs \
    /app/apps/user-ui/.next/static ./apps/user-ui/.next/static

# If you have public folder
COPY --from=builder --chown=nextjs:nodejs \
    /app/apps/user-ui/public ./apps/user-ui/public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "apps/user-ui/server.js"]