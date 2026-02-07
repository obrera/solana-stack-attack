import * as Haptics from 'expo-haptics'
import { useEffect, useRef } from 'react'
import { Animated } from 'react-native'

interface UseWelcomeAnimationOptions {
  earnings: number
  onCollect: () => void
}

export function useWelcomeAnimation({
  earnings,
  onCollect,
}: UseWelcomeAnimationOptions) {
  const scaleAnim = useRef(new Animated.Value(0)).current
  const coinsAnim = useRef(new Animated.Value(0)).current

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

    // Animate coins counting up
    Animated.timing(coinsAnim, {
      toValue: earnings,
      duration: 1500,
      useNativeDriver: false,
    }).start()
  }, [earnings, scaleAnim, coinsAnim])

  const handleCollect = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    onCollect()
  }

  const animatedEarnings = coinsAnim.interpolate({
    inputRange: [0, earnings],
    outputRange: ['0', earnings.toLocaleString()],
  })

  return {
    scaleAnim,
    animatedEarnings,
    handleCollect,
  }
}
