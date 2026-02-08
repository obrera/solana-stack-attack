import * as Haptics from 'expo-haptics'
import { useEffect, useRef, useState } from 'react'
import { Animated } from 'react-native'

interface UseGameAnimationOptions {
  earnings: number
  onCollect: () => void
}

export function useGameAnimation({
  earnings,
  onCollect,
}: UseGameAnimationOptions) {
  const scaleAnim = useRef(new Animated.Value(0)).current
  const coinsAnim = useRef(new Animated.Value(0)).current
  const [isReady, setIsReady] = useState(false)
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    // Haptic feedback on show
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

    // Animate modal in
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start()

    // Listen to animated value changes
    const listenerId = coinsAnim.addListener(({ value }) => {
      setDisplayValue(Math.floor(value))
    })

    // Small delay before starting count animation to avoid showing 0
    const timer = setTimeout(() => {
      setIsReady(true)
      // Animate coins counting up
      Animated.timing(coinsAnim, {
        toValue: earnings,
        duration: 1500,
        useNativeDriver: false,
      }).start()
    }, 100)

    return () => {
      clearTimeout(timer)
      coinsAnim.removeListener(listenerId)
    }
  }, [earnings, scaleAnim, coinsAnim])

  const handleCollect = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    onCollect()
  }

  return {
    scaleAnim,
    displayValue,
    isReady,
    handleCollect,
  }
}
