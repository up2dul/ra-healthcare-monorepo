<div align="center">
  <h1>🏥 RaHealthcare</h1>
</div>

> A healthcare management system for managing patients, appointments, and workflows — built with React, Express, GraphQL, and PostgreSQL in a Turborepo monorepo.

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Technologies](#technologies)
- [Getting Started](#getting-started)
  - [1. Prerequisites](#1-prerequisites)
  - [2. Clone the Repository](#2-clone-the-repository)
  - [3. Installation](#3-installation)
  - [4. Environment Setup](#4-environment-setup)
  - [5. Database Setup](#5-database-setup)
- [Usage](#usage)
  - [Start the development server](#start-the-development-server)
  - [Run with Docker](#run-with-docker)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Development Workflow](#development-workflow)
  - [Code Quality](#code-quality)
  - [Git Hooks](#git-hooks)

## Technologies

Some of the technologies used in this project:

- ⚛️ [React](https://react.dev) — The main frontend library
- 🛤️ [React Router](https://reactrouter.com) — Declarative routing for React
- 🎨 [Tailwind CSS](https://tailwindcss.com) — Utility-first CSS framework
- 🧩 [shadcn/ui](https://ui.shadcn.com) — Reusable UI components
- 🚀 [Express](https://expressjs.com) — Fast, unopinionated web framework
- 🧘 [GraphQL Yoga](https://the-guild.dev/graphql/yoga-server) — GraphQL server
- 🔗 [urql](https://commerce.nearform.com/open-source/urql) — GraphQL client
- 💎 [Drizzle ORM](https://orm.drizzle.team) — TypeScript-first ORM
- 🐘 [PostgreSQL](https://postgresql.org) — Relational database
- 🔷 [TypeScript](https://typescriptlang.org) — A typed superset of JavaScript
- 🛡️ [Zod](https://zod.dev) — TypeScript-first schema validation
- 🐋 [Docker](https://docker.com) — Containerization

Also some additional development tools:

- 📦 [Turborepo](https://turbo.build) — Optimized monorepo build system
- 📝 [Biome](https://biomejs.dev) — Code formatter and linter
- 🔤 [Commitlint](https://commitlint.js.org) — Make sure the commit messages are well formatted
- 🐶 [Husky](https://typicode.github.io/husky) — Git hooks
- 📋 [Lint Staged](https://github.com/lint-staged/lint-staged) — Running some scripts before committing

## Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org) `>=18.x`
- [PostgreSQL](https://postgresql.org) `>=17.x`
- [pnpm](https://pnpm.io) `>=10.x` (recommended as the package manager)
- [Docker](https://docker.com) (optional, for containerized setup)

### 2. Clone the Repository

```bash
git clone https://github.com/up2dul/ra-healthcare.git

# or if using ssh
git clone git@github.com:up2dul/ra-healthcare.git
```

### 3. Installation

Go to the project directory and install dependencies

```bash
# Go to the project directory
cd ra-healthcare

# Install dependencies
pnpm install
```

### 4. Environment Setup

Create the `.env` files for the server and web apps:

**`apps/server/.env`**

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

**`apps/web/.env`**

```env
VITE_SERVER_URL=http://localhost:3000
```

### 5. Database Setup

This project uses PostgreSQL with Drizzle ORM. Make sure you have a PostgreSQL instance running, then apply the schema:

```bash
pnpm run db:push
```

## Usage

### Start the development server

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) with your browser to see the web application.
The API is running at [http://localhost:3000](http://localhost:3000) with a GraphQL playground at [http://localhost:3000/graphql](http://localhost:3000/graphql).

### Run with Docker

You can also run the entire stack with Docker Compose:

```bash
docker compose up --build
```

This starts PostgreSQL, the server, and the web app. Open [http://localhost:4173](http://localhost:4173) to see the result.

## Project Structure

```
.
├── apps/
│   ├── web/                         # Frontend application (React + React Router)
│   │   └── src/
│   │       ├── routes/              # Page routes
│   │       │   ├── _index.tsx
│   │       │   ├── patients.*.tsx   # Patient pages
│   │       │   ├── appointments.*.tsx # Appointment pages
│   │       │   └── workflow.*.tsx   # Workflow pages
│   │       ├── components/
│   │       │   ├── appointments/    # Appointment-related components
│   │       │   ├── patients/        # Patient-related components
│   │       │   ├── workflow/        # Workflow-related components
│   │       │   ├── layout/          # Layout components (header, theme)
│   │       │   └── ui/             # Reusable UI components (shadcn/ui)
│   │       ├── graphql/             # GraphQL queries and mutations
│   │       ├── schemas/             # Zod validation schemas
│   │       ├── hooks/               # Custom React hooks
│   │       └── lib/                 # Utilities (urql client, helpers)
│   └── server/                      # Backend API (Express + GraphQL Yoga)
│       └── src/
│           ├── index.ts             # Server entry point
│           └── graphql/
│               ├── type-defs.ts     # GraphQL schema definitions
│               ├── validations.ts   # Input validations
│               └── resolvers/       # GraphQL resolvers
│                   ├── patient.ts
│                   ├── appointment.ts
│                   └── workflow.ts
├── packages/
│   ├── db/                          # Database package (Drizzle ORM)
│   │   └── src/
│   │       ├── index.ts             # Database client
│   │       ├── seed.ts              # Seed script
│   │       ├── schema/              # Drizzle table schemas
│   │       └── migrations/          # SQL migrations
│   ├── env/                         # Shared environment validation (t3-env)
│   │   └── src/
│   │       ├── server.ts            # Server env schema
│   │       └── web.ts              # Web env schema
│   └── config/                      # Shared TypeScript config
├── docker-compose.yaml              # Docker Compose for full stack
├── turbo.json                       # Turborepo configuration
├── biome.json                       # Biome formatter/linter config
├── commitlint.config.ts             # Commitlint configuration
├── package.json
└── pnpm-workspace.yaml
```

## Available Scripts

| Script | Description |
| --- | --- |
| `pnpm dev` | Start all applications in development mode |
| `pnpm build` | Build all applications |
| `pnpm dev:web` | Start only the web application |
| `pnpm dev:server` | Start only the server |
| `pnpm check-types` | Check TypeScript types across all apps |
| `pnpm db:push` | Push schema changes to database |
| `pnpm db:generate` | Generate database migrations |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:studio` | Open Drizzle Studio UI |
| `pnpm format` | Run Biome formatting |
| `pnpm check` | Run Biome formatting and linting |

## Development Workflow

### Code Quality

The project uses Biome for automatic code formatting and linting:

```bash
# Format code
pnpm format

# Format and lint
pnpm check
```

### Git Hooks

Husky and lint-staged ensure code quality before commits:

- **Pre-commit** hook runs Biome formatting and linting
- **Commit messages** are validated with commitlint (using [Conventional Commits](https://www.conventionalcommits.org))

```bash
# Initialize hooks
pnpm prepare
```
