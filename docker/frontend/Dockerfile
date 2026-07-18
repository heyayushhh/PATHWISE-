FROM node:20-alpine AS base

ARG NPM_REGISTRY=https://registry.npmjs.org/

WORKDIR /app

ENV NPM_CONFIG_REGISTRY=${NPM_REGISTRY}

FROM base AS tools

RUN npm config set registry "${NPM_CONFIG_REGISTRY}" \
  && npm config set fetch-retries 5 \
  && npm config set fetch-retry-mintimeout 20000 \
  && npm config set fetch-retry-maxtimeout 120000 \
  && npm install -g pnpm@9.0.0

FROM tools AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/shared-utils/package.json ./packages/shared-utils/
COPY packages/ui/package.json ./packages/ui/

RUN pnpm config set registry "${NPM_CONFIG_REGISTRY}" \
  && pnpm config set fetch-retries 5 \
  && pnpm config set fetch-timeout 120000 \
  && pnpm config set network-concurrency 1 \
  && pnpm install --frozen-lockfile

FROM tools AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/frontend/node_modules ./apps/frontend/node_modules
COPY --from=deps /app/packages/shared-types/node_modules ./packages/shared-types/node_modules
COPY --from=deps /app/packages/shared-utils/node_modules ./packages/shared-utils/node_modules
COPY --from=deps /app/packages/ui/node_modules ./packages/ui/node_modules
COPY . .

RUN pnpm --filter @pathwise/frontend build

FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/apps/frontend/.next/standalone ./
COPY --from=builder /app/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=builder /app/apps/frontend/public ./apps/frontend/public

EXPOSE 3000

CMD ["node", "apps/frontend/server.js"]
