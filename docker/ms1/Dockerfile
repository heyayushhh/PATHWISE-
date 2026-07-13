FROM node:20-alpine AS base

WORKDIR /app

FROM base AS deps
RUN npm install -g pnpm@9
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY apps/ms1-core-api/package.json ./apps/ms1-core-api/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/shared-utils/package.json ./packages/shared-utils/
RUN pnpm install --frozen-lockfile

FROM base AS builder
RUN npm install -g pnpm@9
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/ms1-core-api/node_modules ./apps/ms1-core-api/node_modules
COPY --from=deps /app/packages/shared-types/node_modules ./packages/shared-types/node_modules
COPY --from=deps /app/packages/shared-utils/node_modules ./packages/shared-utils/node_modules
COPY . .
RUN pnpm build --filter=ms1-core-api

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/apps/ms1-core-api/dist ./apps/ms1-core-api/dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3001
CMD ["node", "apps/ms1-core-api/dist/index.js"]
