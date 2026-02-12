import { auth } from '@solana-stack-attack/auth'
import { env } from '@solana-stack-attack/env/server'
import {
  createSolanaClient,
  getFeePayer,
} from '@solana-stack-attack/solana-client'
import type { Context as HonoContext } from 'hono'

const solana = createSolanaClient({ url: env.SOLANA_RPC_URL })
const feePayerPromise = getFeePayer(env.FEE_PAYER_KEYPAIR)

// Log token config at startup
feePayerPromise.then((feePayer) => {
  console.log(`Token mint: ${env.TOKEN_MINT_ADDRESS}`)
  console.log(`Fee payer:  ${feePayer.address}`)
})

export type CreateContextOptions = {
  context: HonoContext
}

export async function createContext({ context }: CreateContextOptions) {
  const session = await auth.api.getSession({
    headers: context.req.raw.headers,
  })

  const feePayer = await feePayerPromise

  return {
    feePayer,
    session,
    solana,
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
