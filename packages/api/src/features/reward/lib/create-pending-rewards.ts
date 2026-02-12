import { db } from '@solana-stack-attack/db'
import { reward } from '@solana-stack-attack/db/schema/reward'
import { and, eq } from 'drizzle-orm'

import { getRewardAmount } from './reward-amounts'

/**
 * Check for newly achieved milestones and create pending rewards
 * for any that don't already have a reward record.
 */
export async function createPendingRewards(
  userId: string,
  achievedMilestones: string[],
): Promise<void> {
  for (const milestoneId of achievedMilestones) {
    const amount = getRewardAmount(milestoneId)
    if (!amount) {
      continue
    }

    // Check if reward already exists for this user + milestone
    const [existing] = await db
      .select({ id: reward.id })
      .from(reward)
      .where(
        and(eq(reward.userId, userId), eq(reward.milestoneId, milestoneId)),
      )
      .limit(1)

    if (existing) {
      continue
    }

    // Create pending reward (store as integer — smallest units)
    await db.insert(reward).values({
      userId,
      milestoneId,
      amount: Number(amount),
      status: 'pending',
    })
  }
}
