FROM oven/bun:1-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

FROM base AS release
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY package.json bun.lockb tsconfig.json prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src

RUN bun run db:generate

USER bun

CMD ["bun", "run", "start"]
