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
  value: number
}

export interface OwnedUpgrade {
  id: string
  level: number
}

// Available upgrades in the game
export const UPGRADES: Upgrade[] = [
  {
    id: 'double_tap',
    name: 'Double Tap',
    description: '+1 point per tap',
    icon: 'finger-print',
    baseCost: 25,
    costMultiplier: 2.0,
    effect: { type: 'tap_multiplier', value: 1 },
  },
  {
    id: 'auto_clicker_1',
    name: 'Mini Bot',
    description: '+2 points per second',
    icon: 'hardware-chip',
    baseCost: 50,
    costMultiplier: 1.5,
    effect: { type: 'auto_tapper', value: 2 },
  },
  {
    id: 'power_tap',
    name: 'Power Tap',
    description: '+5 points per tap',
    icon: 'flash',
    baseCost: 500,
    costMultiplier: 2.2,
    effect: { type: 'tap_multiplier', value: 5 },
  },
  {
    id: 'auto_clicker_2',
    name: 'Turbo Bot',
    description: '+20 points per second',
    icon: 'rocket',
    baseCost: 800,
    costMultiplier: 1.8,
    effect: { type: 'auto_tapper', value: 20 },
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
    baseCost: 15000,
    costMultiplier: 2.0,
    effect: { type: 'auto_tapper', value: 250 },
  },
]

export function getUpgradeLevel(
  ownedUpgrades: OwnedUpgrade[],
  upgradeId: string,
): number {
  const owned = ownedUpgrades.find((u) => u.id === upgradeId)
  return owned?.level ?? 0
}

export function getUpgradeCost(
  ownedUpgrades: OwnedUpgrade[],
  upgradeId: string,
): number {
  const upgrade = UPGRADES.find((u) => u.id === upgradeId)
  if (!upgrade) return Number.POSITIVE_INFINITY

  const level = getUpgradeLevel(ownedUpgrades, upgradeId)
  return Math.floor(upgrade.baseCost * upgrade.costMultiplier ** level)
}

export function calculatePointsPerTap(
  ownedUpgrades: OwnedUpgrade[],
  burnUpgrades: string[],
): number {
  let total = 1
  for (const owned of ownedUpgrades) {
    const upgrade = UPGRADES.find((u) => u.id === owned.id)
    if (upgrade?.effect.type === 'tap_multiplier') {
      total += upgrade.effect.value * owned.level
    }
  }
  if (burnUpgrades.includes('golden_touch')) {
    total += 50
  }
  return total
}

export function calculatePointsPerSecond(
  ownedUpgrades: OwnedUpgrade[],
): number {
  let total = 0
  for (const owned of ownedUpgrades) {
    const upgrade = UPGRADES.find((u) => u.id === owned.id)
    if (upgrade?.effect.type === 'auto_tapper') {
      total += upgrade.effect.value * owned.level
    }
  }
  return total
}
