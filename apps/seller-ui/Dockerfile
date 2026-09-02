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

# seller UI package
COPY apps/seller-ui/package.json ./apps/seller-ui/package.json

# Shared packages
COPY packages ./packages

# Install dependencies
RUN pnpm install \
    --filter seller-ui... \
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
COPY --from=deps /app/apps/seller-ui/node_modules ./apps/seller-ui/node_modules
COPY --from=deps /app/packages ./packages

# Workspace configuration
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY nx.json ./
COPY tsconfig.base.json ./

# seller UI source
COPY apps/seller-ui ./apps/seller-ui

ENV CI=true
ENV NEXT_TELEMETRY_DISABLED=1

# Build
RUN pnpm nx build seller-ui --configuration=production



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
    /app/apps/seller-ui/.next/standalone ./

COPY --from=builder --chown=nextjs:nodejs \
    /app/apps/seller-ui/.next/static ./apps/seller-ui/.next/static

# If you have public folder
COPY --from=builder --chown=nextjs:nodejs \
    /app/apps/seller-ui/public ./apps/seller-ui/public

USER nextjs

EXPOSE 3001

ENV PORT=3001
ENV HOSTNAME=0.0.0.0

CMD ["node", "apps/seller-ui/server.js"]