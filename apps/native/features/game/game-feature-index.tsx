import { Ionicons } from '@expo/vector-icons'
import { Card, useThemeColor } from 'heroui-native'
import { Animated, Pressable, Text, View } from 'react-native'

import { UiContainer } from '@/features/ui/ui/ui-container'
import { useGameContext } from './data-access/game-provider'
import { GameUiFloatingText } from './ui/game-ui-floating-text'
import { GameUiMilestoneModal } from './ui/game-ui-milestone-modal'
import { GameUiWelcomeModal } from './ui/game-ui-welcome-modal'
import { gameFormatNumber } from './util/game-format-number'

export function GameFeatureIndex() {
  const {
    state,
    scaleAnim,
    floatingTexts,
    handleTap,
    dismissOfflineEarnings,
    dismissCelebration,
  } = useGameContext()
  const accentColor = useThemeColor('success')
  const mutedColor = useThemeColor('muted')

  function formatLastSaved(date: Date | null): string {
    if (!date) {
      return 'Not saved yet'
    }
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
    if (seconds < 5) {
      return 'Just now'
    }
    if (seconds < 60) {
      return `${seconds}s ago`
    }
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) {
      return `${minutes}m ago`
    }
    return date.toLocaleTimeString()
  }

  return (
    <UiContainer className="flex-1">
      {/* Welcome Back Modal */}
      {state.offlineEarnings && state.offlineEarnings > 0 && (
        <GameUiWelcomeModal
          earnings={state.offlineEarnings}
          onDismiss={dismissOfflineEarnings}
        />
      )}

      {/* Milestone Celebration Modal */}
      <GameUiMilestoneModal
        milestone={state.pendingCelebration}
        onDismiss={dismissCelebration}
      />

      {/* Save Status Bar */}
      <View className="flex-row items-center justify-center gap-2 pt-12 pb-2">
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
            {gameFormatNumber(state.score)}
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
              <GameUiFloatingText
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
                  {gameFormatNumber(state.totalTaps)}
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
    </UiContainer>
  )
}
