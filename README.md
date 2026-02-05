# solana-mobile-stack

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines React, TanStack Start, Hono, ORPC, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **TanStack Start** - SSR framework with TanStack Router
- **React Native** - Build mobile apps using React
- **Expo** - Tools for React Native development
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **shadcn/ui** - Reusable UI components
- **Hono** - Lightweight, performant server framework
- **oRPC** - End-to-end type-safe APIs with OpenAPI integration
- **Bun** - Runtime environment
- **Drizzle** - TypeScript-first ORM
- **SQLite/Turso** - Database engine
- **Authentication** - Better-Auth
- **Biome** - Linting and formatting
- **Turborepo** - Optimized monorepo build system

## Getting Started

First, install the dependencies:

```bash
bun install
```

## Database Setup

This project uses SQLite with Drizzle ORM.

1. Start the local database using Docker:
 
 ```bash
 bun run db:up
 ```
 
 This starts a LibSQL (Turso) server locally on port 8080. If you prefer to run it in the background, you can add the `-d` flag: `bun run db:up -- -d`.
 
 2. Configure your environment variables. Copy `apps/server/.env.example` to `apps/server/.env`:
```bash
cp apps/server/.env.example apps/server/.env
```

The default values in `.env.example` are configured to work with the local Docker database.

3. Apply the schema to your database:

```bash
bun run db:push
```

To stop the database:

```bash
bun run db:down
```

## Running the Application

After setting up the database, run the development server:

```bash
bun run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser to see the web application.
Use the Expo Go app to run the mobile application.
The API is running at [http://localhost:3000](http://localhost:3000).

## Git Hooks and Formatting

- Format and lint fix: `bun run check`

## Project Structure

```
solana-mobile-stack/
├── apps/
│   ├── web/         # Frontend application (React + TanStack Start)
│   ├── native/      # Mobile application (React Native, Expo)
│   └── server/      # Backend API (Hono, ORPC)
├── packages/
│   ├── api/         # API layer / business logic
│   ├── auth/        # Authentication configuration & logic
│   └── db/          # Database schema & queries
```

## Available Scripts

- `bun run build`: Build all applications
- `bun run check-types`: Check TypeScript types across all apps
- `bun run lint`: Run Biome formatting and linting check
- `bun run lint:fix`: Run Biome formatting and linting check and fix
- `bun run db:down`: Stop the local database
- `bun run db:local`: Start the local SQLite database using Turso CLI
- `bun run db:push`: Push schema changes to database
- `bun run db:studio`: Open database studio UI
- `bun run db:up`: Start the local database using Docker
- `bun run dev:native`: Start the React Native/Expo development server
- `bun run dev:server`: Start only the server
- `bun run dev:web`: Start only the web application
- `bun run dev`: Start all applications in development mode
