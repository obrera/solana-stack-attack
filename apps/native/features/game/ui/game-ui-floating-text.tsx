import { useRef, useState } from 'react'
import { Animated } from 'react-native'

interface GameUiFloatingTextProps {
  x: number
  y: number
  points: number
  color: string
}

export function GameUiFloatingText({
  x,
  y,
  points,
  color,
}: GameUiFloatingTextProps) {
  const opacity = useRef(new Animated.Value(1)).current
  const translateY = useRef(new Animated.Value(0)).current

  useState(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -50,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start()
  })

  return (
    <Animated.Text
      style={{
        left: x - 20,
        top: y - 30,
        opacity,
        transform: [{ translateY }],
        color,
      }}
      className="absolute font-bold text-2xl"
    >
      +{points}
    </Animated.Text>
  )
}
