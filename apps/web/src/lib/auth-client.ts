import { solanaAuthClient } from '@solana-stack-attack/better-auth-solana/client'
import { env } from '@solana-stack-attack/env/web'
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: env.VITE_SERVER_URL,
  plugins: [solanaAuthClient()],
})
