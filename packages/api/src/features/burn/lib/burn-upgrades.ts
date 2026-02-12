import { TOKEN_CONFIG } from '@solana-stack-attack/solana-client'

const MULTIPLIER = 10 ** TOKEN_CONFIG.decimals

export interface BurnUpgrade {
  id: string
  name: string
  description: string
  icon: string
  /** Cost in smallest token units */
  cost: number
  /** Effect applied when purchased */
  effect: BurnUpgradeEffect
}

export type BurnUpgradeEffect =
  | { type: 'score_multiplier'; value: number }
  | { type: 'energy_max'; value: number }
  | { type: 'energy_passive'; value: number }
  | { type: 'tap_multiplier'; value: number }
  | { type: 'utility' }

/**
 * Premium upgrades purchasable by burning STACK tokens.
 * Each can only be purchased once.
 */
export const BURN_UPGRADES: BurnUpgrade[] = [
  {
    id: 'diamond_hands',
    name: 'Diamond Hands',
    description: 'Permanent +10% score multiplier on all earnings',
    icon: 'diamond',
    cost: 100 * MULTIPLIER,
    effect: { type: 'score_multiplier', value: 0.1 },
  },
  {
    id: 'energy_surge',
    name: 'Energy Surge',
    description: 'Max energy increased from 100 to 150',
    icon: 'battery-charging',
    cost: 250 * MULTIPLIER,
    effect: { type: 'energy_max', value: 50 },
  },
  {
    id: 'auto_pilot',
    name: 'Auto-Pilot',
    description: 'Auto-tappers run at 50% speed even at 0 energy',
    icon: 'airplane',
    cost: 500 * MULTIPLIER,
    effect: { type: 'energy_passive', value: 0.5 },
  },
  {
    id: 'golden_touch',
    name: 'Golden Touch',
    description: '+50 points per tap permanently',
    icon: 'hand-left',
    cost: 1000 * MULTIPLIER,
    effect: { type: 'tap_multiplier', value: 50 },
  },
  {
    id: 'buy_all',
    name: 'Buy All',
    description: 'Buy all affordable shop upgrades with one tap',
    icon: 'cart',
    cost: 200 * MULTIPLIER,
    effect: { type: 'utility' },
  },
  {
    id: 'auto_claim',
    name: 'Auto-Claim',
    description: 'Claim all pending rewards with one tap',
    icon: 'gift',
    cost: 150 * MULTIPLIER,
    effect: { type: 'utility' },
  },
]

/**
 * Fuel Cell — repeatable burn that refills energy to max.
 * Cost doubles each time: 10 → 20 → 40 → 80 → ...
 */
export const FUEL_CELL = {
  id: 'fuel_cell',
  name: 'Fuel Cell',
  description: 'Instantly refill energy to max (cost doubles each use)',
  icon: 'flash',
  baseCost: 10 * MULTIPLIER,
  costMultiplier: 2,
} as const

export function getFuelCellCost(timesPurchased: number): number {
  return FUEL_CELL.baseCost * FUEL_CELL.costMultiplier ** timesPurchased
}

export function getBurnUpgrade(upgradeId: string): BurnUpgrade | undefined {
  return BURN_UPGRADES.find((u) => u.id === upgradeId)
}
