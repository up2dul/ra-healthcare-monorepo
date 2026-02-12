# ---- Base ----
FROM node:22-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

# ---- Dependencies ----
FROM base AS deps

COPY .npmrc pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/server/package.json ./apps/server/
COPY packages/db/package.json ./packages/db/
COPY packages/env/package.json ./packages/env/
COPY packages/config/package.json ./packages/config/

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --no-frozen-lockfile

# ---- Build ----
FROM deps AS build

# Copy workspace packages (tsdown bundles them, but needs source to compile)
COPY packages/db/ ./packages/db/
COPY packages/env/ ./packages/env/
COPY packages/config/ ./packages/config/

# Copy server source
COPY apps/server/ ./apps/server/

# tsdown bundles all @ra-healthcare/* via noExternal — output is dist/index.mjs
RUN pnpm --filter server build

# Create standalone production bundle (only runtime npm deps)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm --filter server deploy --prod /app/out

# ---- Migrate ----
# Lightweight stage for running DB migrations before server starts
# Usage: docker compose run --rm migrate
FROM deps AS migrate

COPY packages/db/ ./packages/db/
COPY packages/env/ ./packages/env/
COPY packages/config/ ./packages/config/

CMD ["pnpm", "--filter", "@ra-healthcare/db", "db:migrate"]

# ---- Runner ----
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 server

# Production node_modules (express, graphql-yoga, pg, etc.)
COPY --from=build --chown=server:nodejs /app/out/node_modules ./node_modules
COPY --from=build --chown=server:nodejs /app/out/package.json ./

# Bundled server output
COPY --from=build --chown=server:nodejs /app/apps/server/dist ./dist

USER server

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "fetch('http://localhost:3000').then(r=>{if(!r.ok)throw r.status})"

CMD ["node", "dist/index.mjs"]