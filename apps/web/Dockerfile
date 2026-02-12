# ---- Base ----
# Common Node.js + pnpm setup reused across stages
FROM node:22-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

# ---- Dependencies ----
# Install ALL dependencies (dev + prod) needed for building
FROM base AS deps

COPY .npmrc pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/env/package.json ./packages/env/
COPY packages/config/package.json ./packages/config/

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --no-frozen-lockfile

# ---- Build ----
# Compile the React Router application
FROM deps AS build

# Copy workspace package sources (needed during build)
COPY packages/env/ ./packages/env/
COPY packages/config/ ./packages/config/

# Copy web app source
COPY apps/web/ ./apps/web/

# Build-time env var — Vite embeds this into the client bundle
ARG VITE_SERVER_URL
ENV VITE_SERVER_URL=$VITE_SERVER_URL

RUN pnpm --filter web build

# ---- Runner ----
# Serve static SPA with nginx — no Node.js needed at runtime
FROM nginx:stable-alpine AS runner

# SPA fallback: all routes serve index.html, let React Router handle routing
RUN printf 'server {\n\
    listen 4173;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
\n\
    location /assets/ {\n\
        expires 1y;\n\
        add_header Cache-Control "public, immutable";\n\
    }\n\
\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

COPY --from=build /app/apps/web/build/client /usr/share/nginx/html

EXPOSE 4173

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q --spider http://localhost:4173/ || exit 1