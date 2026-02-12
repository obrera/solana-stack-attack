import type { Milestone } from '@solana-stack-attack/game-util/game-milestones'
import { gameCheckMilestones } from '@solana-stack-attack/game-util/game-milestones'
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  calculatePointsPerSecond,
  calculatePointsPerTap,
  getUpgradeCost,
  getUpgradeLevel,
  type OwnedUpgrade,
  UPGRADES,
} from './game-upgrades'

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
  offlineEarnings: number | null
  achievedMilestones: string[]
  pendingCelebration: Milestone | null
  energy: number
  maxEnergy: number
}

export interface GameClient {
  getState: () => Promise<{
    score: number
    totalTaps: number
    ownedUpgrades: OwnedUpgrade[]
    pointsPerSecond?: number
    achievedMilestones?: string[]
    energy?: number
    maxEnergy?: number
    offlineEarnings?: number
    updatedAt?: string
  } | null>
  saveState: (state: {
    score: number
    totalTaps: number
    ownedUpgrades: OwnedUpgrade[]
    pointsPerSecond: number
    achievedMilestones: string[]
    energy: number
    maxEnergy: number
  }) => Promise<void>
  getMilestones: () => Promise<Milestone[]>
  getPurchasedBurnUpgrades: () => Promise<string[]>
}

interface GameContextValue {
  state: GameState
  floatingTexts: FloatingText[]
  tap: (x: number, y: number) => number // returns earned points
  // Upgrades
  upgrades: typeof UPGRADES
  ownedUpgrades: OwnedUpgrade[]
  getUpgradeCost: (upgradeId: string) => number
  getUpgradeLevel: (upgradeId: string) => number
  canAfford: (upgradeId: string) => boolean
  buyUpgrade: (upgradeId: string) => boolean
  buyAll: () => number
  refillEnergy: () => void
  // Persistence
  saveGame: () => Promise<void>
  // Offline earnings
  dismissOfflineEarnings: () => void
  // Milestones
  milestones: Milestone[]
  dismissCelebration: () => void
}

const GameContext = createContext<GameContextValue | null>(null)

const AUTO_SAVE_INTERVAL = 10_000

interface GameProviderProps {
  children: ReactNode
  client: GameClient
  isAuthenticated: boolean
}

export function GameProvider({
  children,
  client,
  isAuthenticated,
}: GameProviderProps) {
  const [score, setScore] = useState(0)
  const [totalTaps, setTotalTaps] = useState(0)
  const [ownedUpgrades, setOwnedUpgrades] = useState<OwnedUpgrade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [offlineEarnings, setOfflineEarnings] = useState<number | null>(null)
  const [achievedMilestones, setAchievedMilestones] = useState<string[]>([])
  const [pendingCelebration, setPendingCelebration] =
    useState<Milestone | null>(null)
  const celebrationQueue = useRef<Milestone[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [energy, setEnergy] = useState(100)
  const [maxEnergy] = useState(100)
  const [burnUpgrades, setBurnUpgrades] = useState<string[]>([])
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([])
  const floatingIdRef = useRef(0)

  // Refs for intervals (avoid stale closures)
  const stateRef = useRef({
    score,
    totalTaps,
    ownedUpgrades,
    pointsPerSecond: 0,
    achievedMilestones: [] as string[],
    energy: 100,
    maxEnergy: 100,
  })
  const lastSavedStateRef = useRef({
    score: 0,
    totalTaps: 0,
    ownedUpgrades: [] as OwnedUpgrade[],
    pointsPerSecond: 0,
    achievedMilestones: [] as string[],
    energy: 100,
    maxEnergy: 100,
  })
  const isSavingRef = useRef(false)

  // Fetch milestones on mount
  useEffect(() => {
    client.getMilestones().then(setMilestones).catch(console.error)
  }, [client])

  // Load burn upgrades on mount (if authenticated)
  useEffect(() => {
    if (!isAuthenticated) return
    client.getPurchasedBurnUpgrades().then(setBurnUpgrades).catch(console.error)
  }, [isAuthenticated, client])

  // Load game state on mount (if authenticated)
  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false)
      return
    }

    const loadState = async () => {
      try {
        const state = await client.getState()
        if (state) {
          setScore(state.score)
          setTotalTaps(state.totalTaps)
          setOwnedUpgrades(state.ownedUpgrades as OwnedUpgrade[])
          setAchievedMilestones(state.achievedMilestones ?? [])
          setEnergy(state.energy ?? 100)
          lastSavedStateRef.current = {
            score: state.score,
            totalTaps: state.totalTaps,
            ownedUpgrades: state.ownedUpgrades as OwnedUpgrade[],
            pointsPerSecond: state.pointsPerSecond ?? 0,
            achievedMilestones: state.achievedMilestones ?? [],
            energy: state.energy ?? 100,
            maxEnergy: state.maxEnergy ?? 100,
          }
          if (state.updatedAt) {
            setLastSavedAt(new Date(state.updatedAt))
          }
          if (state.offlineEarnings && state.offlineEarnings > 0) {
            setOfflineEarnings(state.offlineEarnings)
          }
        }
      } catch (error) {
        console.error('[Game] Failed to load state:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadState()
  }, [isAuthenticated, client])

  // Save game state
  const doSave = useCallback(async () => {
    if (!isAuthenticated || isSavingRef.current) return

    const current = stateRef.current
    const last = lastSavedStateRef.current

    if (
      current.score === last.score &&
      current.totalTaps === last.totalTaps &&
      current.pointsPerSecond === last.pointsPerSecond &&
      JSON.stringify(current.ownedUpgrades) ===
        JSON.stringify(last.ownedUpgrades) &&
      JSON.stringify(current.achievedMilestones) ===
        JSON.stringify(last.achievedMilestones) &&
      current.energy === last.energy
    ) {
      return
    }

    isSavingRef.current = true
    setIsSaving(true)

    try {
      await client.saveState({
        score: current.score,
        totalTaps: current.totalTaps,
        ownedUpgrades: current.ownedUpgrades,
        pointsPerSecond: current.pointsPerSecond,
        achievedMilestones: current.achievedMilestones,
        energy: current.energy,
        maxEnergy: current.maxEnergy,
      })
      lastSavedStateRef.current = { ...current }
      setLastSavedAt(new Date())
    } catch (error) {
      console.error('[Game] Failed to save:', error)
    } finally {
      isSavingRef.current = false
      setIsSaving(false)
    }
  }, [isAuthenticated, client])

  // Auto-save periodically
  useEffect(() => {
    if (!isAuthenticated) return
    const interval = setInterval(doSave, AUTO_SAVE_INTERVAL)
    return () => clearInterval(interval)
  }, [isAuthenticated, doSave])

  // Burn upgrade helpers
  const hasBurnUpgrade = (id: string) => burnUpgrades.includes(id)
  const effectiveMaxEnergy =
    maxEnergy + (hasBurnUpgrade('energy_surge') ? 50 : 0)
  const scoreMultiplier = hasBurnUpgrade('diamond_hands') ? 1.1 : 1.0
  const hasAutoPilot = hasBurnUpgrade('auto_pilot')

  const pointsPerTap = calculatePointsPerTap(ownedUpgrades, burnUpgrades)
  const pointsPerSecond = calculatePointsPerSecond(ownedUpgrades)

  // Keep refs in sync
  useEffect(() => {
    stateRef.current = {
      score,
      totalTaps,
      ownedUpgrades,
      pointsPerSecond,
      achievedMilestones,
      energy,
      maxEnergy,
    }
  }, [
    score,
    totalTaps,
    ownedUpgrades,
    pointsPerSecond,
    achievedMilestones,
    energy,
    maxEnergy,
  ])

  // Check for new milestones
  const totalUpgradeLevels = ownedUpgrades.reduce((sum, u) => sum + u.level, 0)

  useEffect(() => {
    if (isLoading) return

    const newlyAchieved = gameCheckMilestones(
      score,
      totalTaps,
      totalUpgradeLevels,
      achievedMilestones,
      milestones,
    )

    if (newlyAchieved.length > 0) {
      setAchievedMilestones((prev) => [
        ...prev,
        ...newlyAchieved.map((m) => m.id),
      ])
      celebrationQueue.current.push(...newlyAchieved)

      if (!pendingCelebration && celebrationQueue.current.length > 0) {
        const next = celebrationQueue.current.shift()
        if (next) {
          setPendingCelebration(next)
        }
      }
    }
  }, [
    score,
    totalTaps,
    totalUpgradeLevels,
    achievedMilestones,
    isLoading,
    pendingCelebration,
    milestones,
  ])

  const dismissCelebration = useCallback(() => {
    if (celebrationQueue.current.length > 0) {
      const next = celebrationQueue.current.shift()
      if (next) {
        setPendingCelebration(next)
        return
      }
    }
    setPendingCelebration(null)
  }, [])

  // Auto-tapper interval (drains energy)
  useEffect(() => {
    if (pointsPerSecond <= 0) return

    const interval = setInterval(() => {
      setEnergy((prevEnergy) => {
        if (prevEnergy <= 0) {
          if (hasAutoPilot) {
            const earned = Math.floor(pointsPerSecond * 0.5 * scoreMultiplier)
            setScore((prev) => prev + earned)
          }
          return 0
        }
        const earned = Math.floor(pointsPerSecond * scoreMultiplier)
        setScore((prev) => prev + earned)
        return Math.max(0, prevEnergy - 1)
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [pointsPerSecond, scoreMultiplier, hasAutoPilot])

  // Tap action — returns earned points, platforms add their own feedback
  const tap = useCallback(
    (x: number, y: number): number => {
      const earned = Math.floor(pointsPerTap * scoreMultiplier)
      setScore((prev) => prev + earned)
      setTotalTaps((prev) => prev + 1)
      setEnergy((prev) => Math.min(effectiveMaxEnergy, prev + 5))

      const id = floatingIdRef.current++
      setFloatingTexts((prev) => [...prev, { id, x, y, value: earned }])
      setTimeout(() => {
        setFloatingTexts((prev) => prev.filter((t) => t.id !== id))
      }, 500)

      return earned
    },
    [pointsPerTap, scoreMultiplier, effectiveMaxEnergy],
  )

  const canAfford = useCallback(
    (upgradeId: string): boolean => {
      return score >= getUpgradeCost(ownedUpgrades, upgradeId)
    },
    [score, ownedUpgrades],
  )

  const buyUpgrade = useCallback(
    (upgradeId: string): boolean => {
      const cost = getUpgradeCost(ownedUpgrades, upgradeId)
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

      return true
    },
    [score, ownedUpgrades],
  )

  const buyAll = useCallback((): number => {
    let totalSpent = 0
    let bought = true
    while (bought) {
      bought = false
      const sorted = [...UPGRADES].sort((a, b) => {
        const costA = getUpgradeCost(ownedUpgrades, a.id)
        const costB = getUpgradeCost(ownedUpgrades, b.id)
        return costB - costA
      })
      for (const upgrade of sorted) {
        const cost = getUpgradeCost(ownedUpgrades, upgrade.id)
        if (score - totalSpent >= cost) {
          if (buyUpgrade(upgrade.id)) {
            totalSpent += cost
            bought = true
          }
        }
      }
    }
    return totalSpent
  }, [score, ownedUpgrades, buyUpgrade])

  const refillEnergy = useCallback(() => {
    setEnergy(effectiveMaxEnergy)
  }, [effectiveMaxEnergy])

  const level = Math.floor(totalTaps / 100) + 1

  const dismissOfflineEarnings = useCallback(() => {
    setOfflineEarnings(null)
  }, [])

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
      offlineEarnings,
      achievedMilestones,
      pendingCelebration,
      energy,
      maxEnergy: effectiveMaxEnergy,
    },
    floatingTexts,
    tap,
    upgrades: UPGRADES,
    ownedUpgrades,
    getUpgradeCost: (id: string) => getUpgradeCost(ownedUpgrades, id),
    getUpgradeLevel: (id: string) => getUpgradeLevel(ownedUpgrades, id),
    canAfford,
    buyUpgrade,
    buyAll,
    refillEnergy,
    saveGame: doSave,
    dismissOfflineEarnings,
    milestones,
    dismissCelebration,
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
