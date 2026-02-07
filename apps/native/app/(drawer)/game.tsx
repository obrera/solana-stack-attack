import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Card, useThemeColor } from 'heroui-native'
import { useRef, useState } from 'react'
import { Animated, Pressable, Text, View } from 'react-native'

import { Container } from '@/components/container'
import { WelcomeBackModal } from '@/components/welcome-back-modal'
import { useGameContext } from '@/contexts/game-context'

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
  const {
    state,
    scaleAnim,
    floatingTexts,
    handleTap,
    upgrades,
    canAfford,
    dismissOfflineEarnings,
  } = useGameContext()
  const accentColor = useThemeColor('success')
  const mutedColor = useThemeColor('muted')
  const router = useRouter()

  // Check if player can afford any upgrade
  const canAffordAnyUpgrade = upgrades.some((u) => canAfford(u.id))

  // Format relative time
  const formatLastSaved = (date: Date | null): string => {
    if (!date) return 'Not saved yet'
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
    if (seconds < 5) return 'Just now'
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    return date.toLocaleTimeString()
  }

  return (
    <Container className="flex-1">
      {/* Welcome Back Modal */}
      {state.offlineEarnings && state.offlineEarnings > 0 && (
        <WelcomeBackModal
          earnings={state.offlineEarnings}
          onDismiss={dismissOfflineEarnings}
        />
      )}

      {/* Save Status Bar */}
      <View className="flex-row items-center justify-center gap-2 py-2">
        {state.isSaving ? (
          <>
            <Ionicons name="cloud-upload" size={14} color={mutedColor} />
            <Text className="text-muted text-xs">Saving...</Text>
          </>
        ) : state.lastSavedAt ? (
          <>
            <Ionicons name="cloud-done" size={14} color={accentColor} />
            <Text className="text-muted text-xs">
              Saved {formatLastSaved(state.lastSavedAt)}
            </Text>
          </>
        ) : (
          <>
            <Ionicons name="cloud-offline" size={14} color={mutedColor} />
            <Text className="text-muted text-xs">Not saved yet</Text>
          </>
        )}
      </View>

      <View className="flex-1 items-center justify-center p-6">
        {/* Score Display */}
        <View className="mb-8 items-center">
          <Text className="text-lg text-muted">SCORE</Text>
          <Text className="font-bold text-6xl text-foreground">
            {formatNumber(state.score)}
          </Text>
          <Text className="mt-2 text-muted text-sm">
            +{state.pointsPerTap} per tap
            {state.pointsPerSecond > 0 && ` · +${state.pointsPerSecond}/s`}
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
                points={ft.value}
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

        {/* Shop Button */}
        <Pressable
          onPress={() => router.push('/shop')}
          disabled={!canAffordAnyUpgrade}
          className="mt-4 w-full rounded-lg p-4"
          style={{
            backgroundColor: canAffordAnyUpgrade ? accentColor : mutedColor,
            opacity: canAffordAnyUpgrade ? 1 : 0.5,
          }}
        >
          <View className="flex-row items-center justify-center gap-2">
            <Ionicons name="cart" size={20} color="white" />
            <Text className="font-semibold text-white">
              {canAffordAnyUpgrade ? 'Upgrade Shop' : 'Keep Tapping...'}
            </Text>
          </View>
        </Pressable>
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
