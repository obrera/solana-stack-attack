import { db } from '@solana-stack-attack/db'
import { user } from '@solana-stack-attack/db/schema/auth'
import { gameState } from '@solana-stack-attack/db/schema/game'
import { desc, eq, gt, sql } from 'drizzle-orm'
import z from 'zod'

import { protectedProcedure, publicProcedure } from '../index'

const ownedUpgradeSchema = z.object({
  id: z.string(),
  level: z.number().int().min(1),
})

// Offline progression constants
const OFFLINE_RATE = 0.5 // 50% of normal auto-tapper speed
const MAX_OFFLINE_MS = 8 * 60 * 60 * 1000 // 8 hours max

export const gameRouter = {
  // Get current user's game state (calculates offline earnings on resume)
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
          pointsPerSecond: 0,
          lastActiveAt: new Date(),
        })
        .returning()

      return { ...newState, offlineEarnings: 0 }
    }

    // Calculate offline earnings
    const now = Date.now()
    const lastActive = state.lastActiveAt.getTime()
    const elapsedMs = Math.min(now - lastActive, MAX_OFFLINE_MS)
    const elapsedSeconds = elapsedMs / 1000

    const offlineEarnings = Math.floor(
      elapsedSeconds * state.pointsPerSecond * OFFLINE_RATE,
    )

    if (offlineEarnings > 0) {
      // Apply offline earnings and update lastActiveAt
      const [updated] = await db
        .update(gameState)
        .set({
          score: state.score + offlineEarnings,
          lastActiveAt: new Date(),
        })
        .where(eq(gameState.userId, userId))
        .returning()

      return { ...updated, offlineEarnings }
    }

    // Update lastActiveAt even if no earnings
    await db
      .update(gameState)
      .set({ lastActiveAt: new Date() })
      .where(eq(gameState.userId, userId))

    return { ...state, offlineEarnings: 0 }
  }),

  // Save game state
  saveState: protectedProcedure
    .input(
      z.object({
        score: z.number().int().min(0),
        totalTaps: z.number().int().min(0),
        ownedUpgrades: z.array(ownedUpgradeSchema),
        pointsPerSecond: z.number().int().min(0),
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
            pointsPerSecond: input.pointsPerSecond,
            lastActiveAt: new Date(),
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
          pointsPerSecond: input.pointsPerSecond,
          lastActiveAt: new Date(),
        })
        .returning()

      return created
    }),

  // Get leaderboard (top players by score)
  getLeaderboard: publicProcedure
    .input(
      z
        .object({
          limit: z.number().int().min(1).max(100).default(10),
        })
        .optional(),
    )
    .handler(async ({ input }) => {
      const limit = input?.limit ?? 10

      const leaders = await db
        .select({
          rank: sql<number>`row_number() over (order by ${gameState.score} desc)`.as(
            'rank',
          ),
          userId: gameState.userId,
          name: user.name,
          image: user.image,
          score: gameState.score,
          totalTaps: gameState.totalTaps,
        })
        .from(gameState)
        .innerJoin(user, eq(gameState.userId, user.id))
        .orderBy(desc(gameState.score))
        .limit(limit)

      return leaders
    }),

  // Get current user's rank
  getMyRank: protectedProcedure.handler(async ({ context }) => {
    const userId = context.session.user.id

    // Get user's score
    const [myState] = await db
      .select({ score: gameState.score })
      .from(gameState)
      .where(eq(gameState.userId, userId))
      .limit(1)

    if (!myState) {
      return { rank: null, score: 0, totalPlayers: 0 }
    }

    // Count how many players have higher scores
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(gameState)
      .where(gt(gameState.score, myState.score))

    const rank = (result?.count ?? 0) + 1

    // Get total player count
    const [total] = await db
      .select({ count: sql<number>`count(*)` })
      .from(gameState)

    return {
      rank,
      score: myState.score,
      totalPlayers: total?.count ?? 0,
    }
  }),
}
