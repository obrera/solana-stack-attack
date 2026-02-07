import * as Haptics from 'expo-haptics'
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Animated } from 'react-native'

import { type OwnedUpgrade, UPGRADES, type Upgrade } from '@/hooks/use-upgrades'

export interface FloatingText {
  id: number
  x: number
  y: number
  value: number
}

export interface GameState {
  score: number
  totalTaps: number
  pointsPerTap: number
  pointsPerSecond: number
  level: number
}

interface GameContextValue {
  state: GameState
  scaleAnim: Animated.Value
  floatingTexts: FloatingText[]
  handleTap: (event: {
    nativeEvent: { locationX: number; locationY: number }
  }) => void
  // Upgrades
  upgrades: Upgrade[]
  ownedUpgrades: OwnedUpgrade[]
  getUpgradeCost: (upgradeId: string) => number
  getUpgradeLevel: (upgradeId: string) => number
  canAfford: (upgradeId: string) => boolean
  buyUpgrade: (upgradeId: string) => boolean
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [score, setScore] = useState(0)
  const [totalTaps, setTotalTaps] = useState(0)
  const [ownedUpgrades, setOwnedUpgrades] = useState<OwnedUpgrade[]>([])

  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([])
  const floatingIdRef = useRef(0)

  // Calculate upgrade effects
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

  const pointsPerTap = (() => {
    let total = 1
    for (const owned of ownedUpgrades) {
      const upgrade = UPGRADES.find((u) => u.id === owned.id)
      if (upgrade?.effect.type === 'tap_multiplier') {
        total += upgrade.effect.value * owned.level
      }
    }
    return total
  })()

  const pointsPerSecond = (() => {
    let total = 0
    for (const owned of ownedUpgrades) {
      const upgrade = UPGRADES.find((u) => u.id === owned.id)
      if (upgrade?.effect.type === 'auto_tapper') {
        total += upgrade.effect.value * owned.level
      }
    }
    return total
  })()

  // Auto-tapper interval
  useEffect(() => {
    if (pointsPerSecond <= 0) return

    const interval = setInterval(() => {
      setScore((prev) => prev + pointsPerSecond)
    }, 1000)

    return () => clearInterval(interval)
  }, [pointsPerSecond])

  const handleTap = useCallback(
    (event: { nativeEvent: { locationX: number; locationY: number } }) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

      setScore((prev) => prev + pointsPerTap)
      setTotalTaps((prev) => prev + 1)

      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start()

      const id = floatingIdRef.current++
      const { locationX, locationY } = event.nativeEvent
      setFloatingTexts((prev) => [
        ...prev,
        { id, x: locationX, y: locationY, value: pointsPerTap },
      ])

      setTimeout(() => {
        setFloatingTexts((prev) => prev.filter((t) => t.id !== id))
      }, 500)
    },
    [pointsPerTap, scaleAnim],
  )

  const canAfford = useCallback(
    (upgradeId: string): boolean => {
      return score >= getUpgradeCost(upgradeId)
    },
    [score, getUpgradeCost],
  )

  const buyUpgrade = useCallback(
    (upgradeId: string): boolean => {
      const cost = getUpgradeCost(upgradeId)
      if (score < cost) return false

      setScore((prev) => prev - cost)
      setOwnedUpgrades((prev) => {
        const existing = prev.find((u) => u.id === upgradeId)
        if (existing) {
          return prev.map((u) =>
            u.id === upgradeId ? { ...u, level: u.level + 1 } : u,
          )
        }
        return [...prev, { id: upgradeId, level: 1 }]
      })

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      return true
    },
    [score, getUpgradeCost],
  )

  const level = Math.floor(totalTaps / 100) + 1

  const value: GameContextValue = {
    state: {
      score,
      totalTaps,
      pointsPerTap,
      pointsPerSecond,
      level,
    },
    scaleAnim,
    floatingTexts,
    handleTap,
    upgrades: UPGRADES,
    ownedUpgrades,
    getUpgradeCost,
    getUpgradeLevel,
    canAfford,
    buyUpgrade,
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGameContext(): GameContextValue {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider')
  }
  return context
}
