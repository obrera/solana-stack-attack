import 'dotenv/config'
import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  server: {
    AUTH_COOKIE_DOMAIN: z.string().min(1).optional(),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
    CORS_ORIGINS: z
      .string()
      .transform((val) => val.split(',').map((url) => url.trim()))
      .pipe(z.array(z.url())),
    DATABASE_AUTH_TOKEN: z.string().min(1),
    DATABASE_URL: z.string().min(1),
    FEE_PAYER_KEYPAIR: z.string().min(1),
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    SOLANA_RPC_URL: z.string().url().default('https://api.devnet.solana.com'),
    TOKEN_MINT_ADDRESS: z.string().min(1),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})
