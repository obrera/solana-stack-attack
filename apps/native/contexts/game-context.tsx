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
import { authClient } from '@/lib/auth-client'
import { client } from '@/utils/orpc'

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
  isLoading: boolean
  isSaving: boolean
  lastSavedAt: Date | null
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
  // Persistence
  saveGame: () => Promise<void>
}

const GameContext = createContext<GameContextValue | null>(null)

// Auto-save interval in milliseconds
const AUTO_SAVE_INTERVAL = 10_000

export function GameProvider({ children }: { children: ReactNode }) {
  const [score, setScore] = useState(0)
  const [totalTaps, setTotalTaps] = useState(0)
  const [ownedUpgrades, setOwnedUpgrades] = useState<OwnedUpgrade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)

  // Use refs for values we need in intervals to avoid stale closures
  const stateRef = useRef({ score, totalTaps, ownedUpgrades })
  const lastSavedStateRef = useRef({
    score: 0,
    totalTaps: 0,
    ownedUpgrades: [] as OwnedUpgrade[],
  })
  const isSavingRef = useRef(false)

  // Keep refs in sync
  useEffect(() => {
    stateRef.current = { score, totalTaps, ownedUpgrades }
  }, [score, totalTaps, ownedUpgrades])

  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([])
  const floatingIdRef = useRef(0)

  // Get session for auth check
  const { data: session } = authClient.useSession()
  const isAuthenticated = !!session?.user

  // Load game state on mount (if authenticated)
  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false)
      return
    }

    const loadState = async () => {
      try {
        console.log('[Game] Loading state...')
        const state = await client.game.getState()
        console.log('[Game] Loaded state:', state)
        if (state) {
          setScore(state.score)
          setTotalTaps(state.totalTaps)
          setOwnedUpgrades(state.ownedUpgrades as OwnedUpgrade[])
          lastSavedStateRef.current = {
            score: state.score,
            totalTaps: state.totalTaps,
            ownedUpgrades: state.ownedUpgrades as OwnedUpgrade[],
          }
          if (state.updatedAt) {
            setLastSavedAt(new Date(state.updatedAt))
          }
        }
      } catch (error) {
        console.error('[Game] Failed to load state:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadState()
  }, [isAuthenticated])

  // Save game state (using refs to get fresh values)
  const doSave = useCallback(async () => {
    if (!isAuthenticated || isSavingRef.current) return

    const current = stateRef.current
    const last = lastSavedStateRef.current

    // Check if state actually changed
    if (
      current.score === last.score &&
      current.totalTaps === last.totalTaps &&
      JSON.stringify(current.ownedUpgrades) ===
        JSON.stringify(last.ownedUpgrades)
    ) {
      console.log('[Game] No changes to save')
      return
    }

    console.log('[Game] Saving state...', current)
    isSavingRef.current = true
    setIsSaving(true)

    try {
      await client.game.saveState({
        score: current.score,
        totalTaps: current.totalTaps,
        ownedUpgrades: current.ownedUpgrades,
      })
      lastSavedStateRef.current = { ...current }
      setLastSavedAt(new Date())
      console.log('[Game] Saved successfully!')
    } catch (error) {
      console.error('[Game] Failed to save:', error)
    } finally {
      isSavingRef.current = false
      setIsSaving(false)
    }
  }, [isAuthenticated])

  // Auto-save periodically
  useEffect(() => {
    if (!isAuthenticated) return

    console.log('[Game] Starting auto-save interval')
    const interval = setInterval(() => {
      doSave()
    }, AUTO_SAVE_INTERVAL)

    return () => {
      console.log('[Game] Clearing auto-save interval')
      clearInterval(interval)
    }
  }, [isAuthenticated, doSave])

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
      isLoading,
      isSaving,
      lastSavedAt,
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
    saveGame: doSave,
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
