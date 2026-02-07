import * as Haptics from 'expo-haptics'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Animated } from 'react-native'

import { useUpgrades } from './use-upgrades'

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

export interface UseGameReturn {
  state: GameState
  scaleAnim: Animated.Value
  floatingTexts: FloatingText[]
  handleTap: (event: {
    nativeEvent: { locationX: number; locationY: number }
  }) => void
  upgrades: ReturnType<typeof useUpgrades>
  buyUpgrade: (upgradeId: string) => boolean
}

export function useGame(): UseGameReturn {
  const [score, setScore] = useState(0)
  const [totalTaps, setTotalTaps] = useState(0)

  const upgrades = useUpgrades()
  const pointsPerTap = upgrades.calculatePointsPerTap()
  const pointsPerSecond = upgrades.calculatePointsPerSecond()

  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([])
  const floatingIdRef = useRef(0)

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
      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

      // Update score
      setScore((prev) => prev + pointsPerTap)
      setTotalTaps((prev) => prev + 1)

      // Scale animation
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

      // Add floating text
      const id = floatingIdRef.current++
      const { locationX, locationY } = event.nativeEvent
      setFloatingTexts((prev) => [
        ...prev,
        { id, x: locationX, y: locationY, value: pointsPerTap },
      ])

      // Remove floating text after animation
      setTimeout(() => {
        setFloatingTexts((prev) => prev.filter((t) => t.id !== id))
      }, 500)
    },
    [pointsPerTap, scaleAnim],
  )

  const buyUpgrade = useCallback(
    (upgradeId: string): boolean => {
      if (!upgrades.canAfford(upgradeId, score)) {
        return false
      }

      const cost = upgrades.purchaseUpgrade(upgradeId)
      if (cost !== null) {
        setScore((prev) => prev - cost)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        return true
      }
      return false
    },
    [score, upgrades],
  )

  const level = Math.floor(totalTaps / 100) + 1

  return {
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
    upgrades,
    buyUpgrade,
  }
}
