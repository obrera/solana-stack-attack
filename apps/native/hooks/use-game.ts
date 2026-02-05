import * as Haptics from 'expo-haptics'
import { useCallback, useRef, useState } from 'react'
import { Animated } from 'react-native'

export interface FloatingText {
  id: number
  x: number
  y: number
}

export interface GameState {
  score: number
  totalTaps: number
  pointsPerTap: number
  level: number
}

export interface UseGameReturn {
  state: GameState
  scaleAnim: Animated.Value
  floatingTexts: FloatingText[]
  handleTap: (event: {
    nativeEvent: { locationX: number; locationY: number }
  }) => void
}

export function useGame(): UseGameReturn {
  const [score, setScore] = useState(0)
  const [totalTaps, setTotalTaps] = useState(0)
  const [pointsPerTap, _setPointsPerTap] = useState(1)

  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([])
  const floatingIdRef = useRef(0)

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
      setFloatingTexts((prev) => [...prev, { id, x: locationX, y: locationY }])

      // Remove floating text after animation
      setTimeout(() => {
        setFloatingTexts((prev) => prev.filter((t) => t.id !== id))
      }, 500)
    },
    [pointsPerTap, scaleAnim],
  )

  const level = Math.floor(totalTaps / 100) + 1

  return {
    state: {
      score,
      totalTaps,
      pointsPerTap,
      level,
    },
    scaleAnim,
    floatingTexts,
    handleTap,
  }
}
