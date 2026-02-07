import { db } from '@solana-stack-attack/db'
import { gameState } from '@solana-stack-attack/db/schema/game'
import { eq } from 'drizzle-orm'
import z from 'zod'

import { protectedProcedure } from '../index'

const ownedUpgradeSchema = z.object({
  id: z.string(),
  level: z.number().int().min(1),
})

export const gameRouter = {
  // Get current user's game state
  getState: protectedProcedure.handler(async ({ context }) => {
    const userId = context.session.user.id

    const [state] = await db
      .select()
      .from(gameState)
      .where(eq(gameState.userId, userId))
      .limit(1)

    if (!state) {
      // Create initial state if none exists
      const [newState] = await db
        .insert(gameState)
        .values({
          userId,
          score: 0,
          totalTaps: 0,
          ownedUpgrades: [],
        })
        .returning()

      return newState
    }

    return state
  }),

  // Save game state
  saveState: protectedProcedure
    .input(
      z.object({
        score: z.number().int().min(0),
        totalTaps: z.number().int().min(0),
        ownedUpgrades: z.array(ownedUpgradeSchema),
      }),
    )
    .handler(async ({ context, input }) => {
      const userId = context.session.user.id

      // Upsert: update if exists, insert if not
      const [existing] = await db
        .select({ id: gameState.id })
        .from(gameState)
        .where(eq(gameState.userId, userId))
        .limit(1)

      if (existing) {
        const [updated] = await db
          .update(gameState)
          .set({
            score: input.score,
            totalTaps: input.totalTaps,
            ownedUpgrades: input.ownedUpgrades,
          })
          .where(eq(gameState.userId, userId))
          .returning()

        return updated
      }

      const [created] = await db
        .insert(gameState)
        .values({
          userId,
          score: input.score,
          totalTaps: input.totalTaps,
          ownedUpgrades: input.ownedUpgrades,
        })
        .returning()

      return created
    }),
}
