FROM node:20-alpine AS base

ARG NPM_REGISTRY=https://registry.npmjs.org/

WORKDIR /app

ENV NPM_CONFIG_REGISTRY=${NPM_REGISTRY}


# =========================
# Tools
# =========================
FROM base AS tools

RUN npm config set registry "${NPM_CONFIG_REGISTRY}" \
  && npm config set fetch-retries 5 \
  && npm config set fetch-retry-mintimeout 20000 \
  && npm config set fetch-retry-maxtimeout 120000 \
  && npm install -g pnpm@9.0.0


# =========================
# Deps
# =========================
FROM tools AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/ms1-core-api/package.json ./apps/ms1-core-api/
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/shared-utils/package.json ./packages/shared-utils/
COPY packages/ui/package.json ./packages/ui/

RUN pnpm config set registry "${NPM_CONFIG_REGISTRY}" \
  && pnpm config set fetch-retries 5 \
  && pnpm config set fetch-timeout 120000 \
  && pnpm config set network-concurrency 1 \
  && pnpm install --frozen-lockfile


# =========================
# Builder
# =========================
FROM tools AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/ms1-core-api/node_modules ./apps/ms1-core-api/node_modules
COPY --from=deps /app/apps/frontend/node_modules ./apps/frontend/node_modules
COPY --from=deps /app/packages/shared-types/node_modules ./packages/shared-types/node_modules
COPY --from=deps /app/packages/shared-utils/node_modules ./packages/shared-utils/node_modules
COPY --from=deps /app/packages/ui/node_modules ./packages/ui/node_modules
COPY . .

RUN pnpm --filter @pathwise/ms1-core-api build


# =========================
# Runner
# =========================
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/apps/ms1-core-api/dist ./apps/ms1-core-api/dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/ms1-core-api/node_modules ./apps/ms1-core-api/node_modules

EXPOSE 3001

CMD ["node", "apps/ms1-core-api/dist/index.js"]
