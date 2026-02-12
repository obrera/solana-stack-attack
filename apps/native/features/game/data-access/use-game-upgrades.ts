import { useCallback, useState } from 'react'

export interface Upgrade {
  id: string
  name: string
  description: string
  icon: string
  baseCost: number
  costMultiplier: number
  effect: UpgradeEffect
}

export interface UpgradeEffect {
  type: 'tap_multiplier' | 'auto_tapper'
  value: number // multiplier amount or taps per second
}

export interface OwnedUpgrade {
  id: string
  level: number
}

// Available upgrades in the game
// Rebalanced for better idle vs active tradeoff
// Auto-tappers: ~25-60s break-even (was 100-500s)
// Tap upgrades: steeper scaling to prevent over-stacking
export const UPGRADES: Upgrade[] = [
  {
    id: 'double_tap',
    name: 'Double Tap',
    description: '+1 point per tap',
    icon: 'finger-print',
    baseCost: 25,
    costMultiplier: 2.0, // was 1.5 — steeper scaling
    effect: { type: 'tap_multiplier', value: 1 },
  },
  {
    id: 'auto_clicker_1',
    name: 'Mini Bot',
    description: '+2 points per second',
    icon: 'hardware-chip',
    baseCost: 50, // was 100
    costMultiplier: 1.5, // was 1.8 — 25s break-even
    effect: { type: 'auto_tapper', value: 2 }, // was 1
  },
  {
    id: 'power_tap',
    name: 'Power Tap',
    description: '+5 points per tap',
    icon: 'flash',
    baseCost: 500,
    costMultiplier: 2.2, // was 2.0 — steeper scaling
    effect: { type: 'tap_multiplier', value: 5 },
  },
  {
    id: 'auto_clicker_2',
    name: 'Turbo Bot',
    description: '+20 points per second',
    icon: 'rocket',
    baseCost: 800, // was 2000
    costMultiplier: 1.8, // was 2.2 — 40s break-even
    effect: { type: 'auto_tapper', value: 20 }, // was 10
  },
  {
    id: 'mega_tap',
    name: 'Mega Tap',
    description: '+25 points per tap',
    icon: 'diamond',
    baseCost: 10000,
    costMultiplier: 2.5,
    effect: { type: 'tap_multiplier', value: 25 },
  },
  {
    id: 'auto_clicker_3',
    name: 'Quantum Bot',
    description: '+250 points per second',
    icon: 'planet',
    baseCost: 15000, // was 50000
    costMultiplier: 2.0, // was 3.0 — 60s break-even, game-changer!
    effect: { type: 'auto_tapper', value: 250 }, // was 100
  },
]

export interface UseGameUpgradesReturn {
  upgrades: Upgrade[]
  ownedUpgrades: OwnedUpgrade[]
  getUpgradeCost: (upgradeId: string) => number
  getUpgradeLevel: (upgradeId: string) => number
  canAfford: (upgradeId: string, score: number) => boolean
  purchaseUpgrade: (upgradeId: string) => number | null // returns cost or null if can't afford
  calculatePointsPerTap: () => number
  calculatePointsPerSecond: () => number
}

export function useGameUpgrades(): UseGameUpgradesReturn {
  const [ownedUpgrades, setOwnedUpgrades] = useState<OwnedUpgrade[]>([])

  const getUpgradeLevel = useCallback(
    (upgradeId: string): number => {
      const owned = ownedUpgrades.find((u) => u.id === upgradeId)
      return owned?.level ?? 0
    },
    [ownedUpgrades],
  )

  const getUpgradeCost = useCallback(
    (upgradeId: string): number => {
      const upgrade = UPGRADES.find((u) => u.id === upgradeId)
      if (!upgrade) return Number.POSITIVE_INFINITY

      const level = getUpgradeLevel(upgradeId)
      return Math.floor(upgrade.baseCost * upgrade.costMultiplier ** level)
    },
    [getUpgradeLevel],
  )

  const canAfford = useCallback(
    (upgradeId: string, score: number): boolean => {
      return score >= getUpgradeCost(upgradeId)
    },
    [getUpgradeCost],
  )

  const purchaseUpgrade = useCallback(
    (upgradeId: string): number | null => {
      const cost = getUpgradeCost(upgradeId)

      setOwnedUpgrades((prev) => {
        const existing = prev.find((u) => u.id === upgradeId)
        if (existing) {
          return prev.map((u) =>
            u.id === upgradeId ? { ...u, level: u.level + 1 } : u,
          )
        }
        return [...prev, { id: upgradeId, level: 1 }]
      })

      return cost
    },
    [getUpgradeCost],
  )

  const calculatePointsPerTap = useCallback((): number => {
    let total = 1 // base tap value

    for (const owned of ownedUpgrades) {
      const upgrade = UPGRADES.find((u) => u.id === owned.id)
      if (upgrade?.effect.type === 'tap_multiplier') {
        total += upgrade.effect.value * owned.level
      }
    }

    return total
  }, [ownedUpgrades])

  const calculatePointsPerSecond = useCallback((): number => {
    let total = 0

    for (const owned of ownedUpgrades) {
      const upgrade = UPGRADES.find((u) => u.id === owned.id)
      if (upgrade?.effect.type === 'auto_tapper') {
        total += upgrade.effect.value * owned.level
      }
    }

    return total
  }, [ownedUpgrades])

  return {
    upgrades: UPGRADES,
    ownedUpgrades,
    getUpgradeCost,
    getUpgradeLevel,
    canAfford,
    purchaseUpgrade,
    calculatePointsPerTap,
    calculatePointsPerSecond,
  }
}
