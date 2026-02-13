import { db } from '@solana-stack-attack/db'
import { walletAddress } from '@solana-stack-attack/db/schema/auth'
import { eq } from 'drizzle-orm'

import { protectedProcedure } from '../../index'

export const userRouter = {
  /** Get the current user's linked wallet addresses */
  wallets: protectedProcedure.handler(async ({ context }) => {
    const userId = context.session.user.id

    const wallets = await db
      .select({
        address: walletAddress.address,
        cluster: walletAddress.cluster,
        isPrimary: walletAddress.isPrimary,
      })
      .from(walletAddress)
      .where(eq(walletAddress.userId, userId))

    return wallets
  }),
}
