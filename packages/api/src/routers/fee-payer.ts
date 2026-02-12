import { getBalance } from '@solana-stack-attack/solana-client'

import { publicProcedure } from '../index'

let cachedBalance: { lamports: bigint; timestamp: number } | null = null
const CACHE_TTL_MS = 60_000 // 1 minute

export const feePayerRouter = {
  getBalance: publicProcedure.handler(async ({ context }) => {
    const now = Date.now()

    if (cachedBalance && now - cachedBalance.timestamp < CACHE_TTL_MS) {
      return formatBalance(cachedBalance.lamports)
    }

    const result = await getBalance(context.solana, context.feePayer.address)

    cachedBalance = { lamports: result.value, timestamp: now }

    return formatBalance(result.value)
  }),
}

function formatBalance(lamports: bigint) {
  const sol = Number(lamports) / 1e9
  return {
    lamports: Number(lamports),
    sol: Math.round(sol * 1000) / 1000,
    funded: sol >= 0.01,
    lowBalance: sol < 1,
  }
}
