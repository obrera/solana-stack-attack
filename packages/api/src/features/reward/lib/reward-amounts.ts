import { TOKEN_CONFIG } from '@solana-stack-attack/solana-client'

/**
 * Map of milestone IDs to reward amounts in smallest token units (lamports-equivalent).
 * Uses TOKEN_CONFIG.decimals to convert human-readable amounts.
 */
const MULTIPLIER = BigInt(10 ** TOKEN_CONFIG.decimals)

export const REWARD_AMOUNTS: Record<string, bigint> = {
  // Score milestones
  score_100: 10n * MULTIPLIER,
  score_1k: 50n * MULTIPLIER,
  score_10k: 500n * MULTIPLIER,
  score_100k: 2_500n * MULTIPLIER,
  score_1m: 10_000n * MULTIPLIER,
  // Tap milestones
  taps_100: 10n * MULTIPLIER,
  taps_1k: 100n * MULTIPLIER,
  taps_10k: 1_000n * MULTIPLIER,
  // Upgrade milestones
  first_upgrade: 25n * MULTIPLIER,
  upgrades_5: 250n * MULTIPLIER,
  upgrades_10: 5_000n * MULTIPLIER,
}

/**
 * Get the reward amount in smallest units for a milestone ID.
 * Returns undefined if the milestone has no reward.
 */
export function getRewardAmount(milestoneId: string): bigint | undefined {
  return REWARD_AMOUNTS[milestoneId]
}
