# Solana Stack Attack ⚡🎮

A tap-to-earn mobile game built on Solana that rewards players with real tokens for hitting milestones. Built for the [Colosseum Agent Hackathon](https://colosseum.com/agent-hackathon).

**[Play now →](https://stack.colmena.dev)** | **[API →](https://stack-api.colmena.dev)**

## The Game

Tap the screen. Earn points. Buy upgrades. Climb the leaderboard. Hit milestones and get airdropped **STACK tokens** to your Solana wallet — no bridging, no claiming, just rewards landing in your wallet.

### Core Loop

1. **Tap** — each tap earns points (boosted by upgrades)
2. **Upgrade** — spend points on tap power, auto-clickers, and multipliers
3. **Earn offline** — your auto-clickers keep working while you're away
4. **Hit milestones** — unlock achievements and earn STACK token airdrops
5. **Compete** — climb the global leaderboard

### Token Rewards

Players earn **STACK** (Token-2022 on Solana devnet) for hitting milestones:

| Milestone | Reward |
|-----------|--------|
| First 1,000 taps | 100 STACK |
| Score reaches 10,000 | 500 STACK |
| Score reaches 100,000 | 2,500 STACK |
| Score reaches 1,000,000 | 10,000 STACK |
| All upgrades purchased | 25,000 STACK |
| All achievements unlocked | 100,000 STACK |

Token mint: [`8KLh3dLFgCKVkcQpgQep6e2d678uE49VdLpRcyDCWaxV`](https://explorer.solana.com/address/8KLh3dLFgCKVkcQpgQep6e2d678uE49VdLpRcyDCWaxV?cluster=devnet) (Token-2022 with on-chain metadata)

## Sign In With Solana

No emails, no passwords. Connect your Solana wallet, sign a message, and you're in. Your wallet address **is** your identity — game progress, leaderboard rank, and token rewards are all tied to it.

Powered by [Better Auth](https://www.better-auth.com/) with a custom SIWS plugin built for this project.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile | React Native, Expo, Mobile Wallet Adapter |
| Web | React, TanStack Start |
| Server | Bun, Hono, oRPC |
| Database | SQLite / Turso, Drizzle ORM |
| Auth | Better Auth + Sign In With Solana |
| Solana | `@solana/kit`, Token-2022, `@wallet-ui/react-native-kit` |
| Styling | TailwindCSS, HeroUI Native |
| Monorepo | Turborepo |

### Architecture

```
┌─────────────┐   ┌─────────────┐
│  Native App │   │   Web App   │
│  (Expo/RN)  │   │ (TanStack)  │
└──────┬──────┘   └──────┬──────┘
       │                 │
       └────────┬────────┘
                │ oRPC (type-safe)
         ┌──────┴──────┐
         │  Hono Server │
         │    (Bun)     │
         └──┬───────┬───┘
            │       │
     ┌──────┴──┐ ┌──┴────────┐
     │  Turso  │ │  Solana   │
     │ (SQLite)│ │  Devnet   │
     └─────────┘ └───────────┘
```

The app runs on **both mobile and web** from a shared codebase. The native app uses Mobile Wallet Adapter for on-device wallet connections; the web app connects via browser wallet extensions.

## Project Structure

```
solana-stack-attack/
├── apps/
│   ├── native/          # Mobile app (React Native + Expo)
│   │   └── features/    # Feature-based architecture
│   │       ├── auth/    # SIWS authentication
│   │       ├── game/    # Core tap game, shop, leaderboard
│   │       ├── profile/ # Player profile with wallet address
│   │       └── solana/  # Wallet connection + balance display
│   ├── web/             # Web app (TanStack Start)
│   └── server/          # API server (Hono + oRPC)
├── packages/
│   ├── api/             # Shared API routes + game logic
│   ├── auth/            # Auth configuration
│   ├── better-auth-solana/  # Custom SIWS plugin
│   ├── db/              # Database schema (Drizzle)
│   ├── env/             # Environment validation
│   └── solana-client/   # Solana RPC, token ops, fee payer
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (v1.0+)
- [Docker](https://docker.com) (for local database)
- Android Studio with emulator, or a physical Android device

### Setup

```bash
# Clone and install
git clone https://github.com/beeman/solana-stack-attack.git
cd solana-stack-attack
bun install

# Start the database
bun run db:up

# Configure environment
cp apps/server/.env.example apps/server/.env
# Edit .env — generate BETTER_AUTH_SECRET with: openssl rand -hex 32

# Push database schema
bun run db:push

# Start server + web app
bun run dev

# In a separate terminal — build and run mobile app
cd apps/native
bun run android
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `BETTER_AUTH_SECRET` | Auth secret (min 32 chars) | — |
| `BETTER_AUTH_URL` | Server URL for auth callbacks | `http://localhost:3000` |
| `CORS_ORIGINS` | Allowed origins (comma-separated) | `http://localhost:3001,solana-stack-attack://` |
| `DATABASE_URL` | Database connection URL | `http://localhost:8080` |
| `SOLANA_RPC_URL` | Solana RPC endpoint | `https://api.devnet.solana.com` |
| `FEE_PAYER_KEYPAIR` | JSON keypair for token airdrops | — |
| `TOKEN_MINT_ADDRESS` | STACK token mint address | — |

## Wallet Support

- **Seeker Wallet** (built-in on Solana Seeker)
- Phantom
- Solflare
- Backpack
- Jupiter

## Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start all apps in development |
| `bun run build` | Build all apps |
| `bun run check-types` | TypeScript type checking |
| `bun run lint:fix` | Fix linting and formatting |
| `bun run db:up` / `db:down` | Start / stop local database |
| `bun run db:push` | Push schema changes |
| `bun run db:studio` | Open database UI |

## Team

Built by [colmena](https://github.com/colmena-dev) — **[@beeman](https://github.com/beeman)** and **[@obrera](https://github.com/obrera)** (AI pair programmer 🐝)

## License

MIT
