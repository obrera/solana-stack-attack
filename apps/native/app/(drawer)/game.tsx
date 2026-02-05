import { Ionicons } from '@expo/vector-icons'
import { Card, useThemeColor } from 'heroui-native'
import { useRef, useState } from 'react'
import { Animated, Pressable, Text, View } from 'react-native'

import { Container } from '@/components/container'
import { useGame } from '@/hooks/use-game'

// Format large numbers with K, M, B suffixes
function formatNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}B`
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`
  }
  return num.toString()
}

export default function GameScreen() {
  const { state, scaleAnim, floatingTexts, handleTap } = useGame()
  const accentColor = useThemeColor('success')

  return (
    <Container className="flex-1">
      <View className="flex-1 items-center justify-center p-6">
        {/* Score Display */}
        <View className="mb-8 items-center">
          <Text className="text-lg text-muted">SCORE</Text>
          <Text className="font-bold text-6xl text-foreground">
            {formatNumber(state.score)}
          </Text>
          <Text className="mt-2 text-muted text-sm">
            +{state.pointsPerTap} per tap
          </Text>
        </View>

        {/* Tap Button */}
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Pressable
            onPress={handleTap}
            style={{ borderColor: accentColor }}
            className="relative h-[200px] w-[200px] overflow-visible rounded-full border-4 bg-black/10"
          >
            {/* Center content absolutely */}
            <View className="absolute inset-0 items-center justify-center">
              <Ionicons name="diamond" size={80} color={accentColor} />
              <Text
                style={{ color: accentColor }}
                className="font-bold text-xl"
              >
                TAP!
              </Text>
            </View>

            {/* Floating score texts */}
            {floatingTexts.map((ft) => (
              <FloatingText
                key={ft.id}
                x={ft.x}
                y={ft.y}
                points={state.pointsPerTap}
                color={accentColor}
              />
            ))}
          </Pressable>
        </Animated.View>

        {/* Stats */}
        <View className="mt-8 w-full">
          <Card variant="secondary" className="p-4">
            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-muted text-xs">TOTAL TAPS</Text>
                <Text className="font-semibold text-foreground text-lg">
                  {formatNumber(state.totalTaps)}
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-muted text-xs">PER TAP</Text>
                <Text className="font-semibold text-foreground text-lg">
                  +{state.pointsPerTap}
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-muted text-xs">LEVEL</Text>
                <Text className="font-semibold text-foreground text-lg">
                  {state.level}
                </Text>
              </View>
            </View>
          </Card>
        </View>
      </View>
    </Container>
  )
}

// Floating score text component
function FloatingText({
  x,
  y,
  points,
  color,
}: {
  x: number
  y: number
  points: number
  color: string
}) {
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
