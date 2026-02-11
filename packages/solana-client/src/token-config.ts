/**
 * STACK token configuration and reward tiers.
 */
export const TOKEN_CONFIG = {
  decimals: 9,
  name: 'Solana Stack Attack',
  symbol: 'STACK',

  /** Reward tiers: milestone → STACK amount (human-readable) */
  rewards: {
    /** First 1,000 taps */
    firstThousandTaps: 100,
    /** Score reaches 10,000 */
    score10k: 500,
    /** Score reaches 100,000 */
    score100k: 2_500,
    /** Score reaches 1,000,000 */
    score1m: 10_000,
    /** All upgrades purchased */
    allUpgrades: 25_000,
    /** All achievements unlocked */
    allAchievements: 100_000,
  },
} as const
