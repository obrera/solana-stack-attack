import { Ionicons } from '@expo/vector-icons'
import { gameFormatNumber } from '@solana-stack-attack/game-util/game-format-number'
import { Card, useThemeColor } from 'heroui-native'
import { useEffect, useRef } from 'react'
import {
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  Text,
  View,
} from 'react-native'
import {
  useBurnPurchased,
  useClaimAll,
} from '@/features/burn/data-access/use-burn-upgrades'
import { usePendingRewardCount } from '@/features/rewards/data-access/use-pending-reward-count'
import { UiContainer } from '@/features/ui/ui/ui-container'
import { useGameContext } from './data-access/game-provider'
import { GameUiFloatingText } from './ui/game-ui-floating-text'
import { GameUiMilestoneModal } from './ui/game-ui-milestone-modal'
import { GameUiWelcomeModal } from './ui/game-ui-welcome-modal'

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
  const warningColor = useThemeColor('warning')
  const dangerColor = useThemeColor('danger')

  const { data: purchased } = useBurnPurchased()
  const hasBuyAll = purchased?.includes('buy_all') ?? false
  const hasAutoClaim = purchased?.includes('auto_claim') ?? false
  const claimAllMutation = useClaimAll()
  const { buyAll, upgrades, canAfford } = useGameContext()
  const canAffordAny = hasBuyAll && upgrades.some((u) => canAfford(u.id))
  const pendingRewards = usePendingRewardCount()
  const canClaimAny = hasAutoClaim && pendingRewards > 0

  const energyPercent = state.maxEnergy > 0 ? state.energy / state.maxEnergy : 0
  const energyBarColor =
    energyPercent < 0.1
      ? dangerColor
      : energyPercent < 0.3
        ? warningColor
        : accentColor

  // Pulsing animation for "TAP TO RECHARGE!" message
  const pulseAnim = useRef(new Animated.Value(1)).current
  useEffect(() => {
    if (state.energy <= 0) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      )
      animation.start()
      return () => animation.stop()
    }
    pulseAnim.setValue(1)
  }, [state.energy, pulseAnim])

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

      {/* Energy Bar */}
      {state.pointsPerSecond > 0 && (
        <View className="mx-6 mt-1">
          <View className="mb-1 flex-row items-center justify-between">
            <Text className="text-muted text-xs">⚡ Energy</Text>
            <Text className="text-muted text-xs">
              {state.energy}/{state.maxEnergy}
            </Text>
          </View>
          <View className="h-3 w-full overflow-hidden rounded-full bg-black/20">
            <View
              style={{
                width: `${energyPercent * 100}%`,
                backgroundColor: energyBarColor,
              }}
              className="h-full rounded-full"
            />
          </View>
        </View>
      )}

      <View className="flex-1 items-center justify-center p-6">
        {/* Score Display */}
        <View className="mb-8 items-center">
          <Text className="text-lg text-muted">SCORE</Text>
          <Text className="font-bold text-6xl text-foreground">
            {gameFormatNumber(state.score)}
          </Text>
          <Text className="mt-2 text-muted text-sm">
            +{state.pointsPerTap} per tap
            {state.pointsPerSecond > 0 &&
              (state.energy > 0
                ? ` · +${state.pointsPerSecond}/s`
                : ' · ⚡ auto-tappers paused')}
          </Text>
        </View>

        {/* Energy warning / recharge prompt */}
        {state.pointsPerSecond > 0 && state.energy <= 0 && (
          <Animated.View
            style={{ opacity: pulseAnim }}
            className="mb-4 rounded-xl bg-danger/20 px-6 py-3"
          >
            <Text className="text-center font-bold text-danger text-lg">
              ⚡ TAP TO RECHARGE!
            </Text>
          </Animated.View>
        )}
        {state.pointsPerSecond > 0 &&
          state.energy > 0 &&
          energyPercent < 0.3 && (
            <View className="mb-4">
              <Text className="text-center font-semibold text-sm text-warning">
                ⚡ Energy low — keep tapping!
              </Text>
            </View>
          )}

        {/* Tap Button */}
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Pressable
            onPress={handleTap}
            style={{
              borderColor:
                state.pointsPerSecond > 0 && state.energy <= 0
                  ? dangerColor
                  : accentColor,
            }}
            className="relative h-[200px] w-[200px] overflow-visible rounded-full border-4 bg-black/10"
          >
            {/* Center content absolutely */}
            <View className="absolute inset-0 items-center justify-center">
              <Ionicons
                name="diamond"
                size={80}
                color={
                  state.pointsPerSecond > 0 && state.energy <= 0
                    ? dangerColor
                    : accentColor
                }
              />
              <Text
                style={{
                  color:
                    state.pointsPerSecond > 0 && state.energy <= 0
                      ? dangerColor
                      : accentColor,
                }}
                className="font-bold text-xl"
              >
                {state.energy <= 0 && state.pointsPerSecond > 0
                  ? 'RECHARGE!'
                  : 'TAP!'}
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

          {/* Quick Actions (unlocked via burn shop) */}
          {(hasBuyAll || hasAutoClaim) && (
            <View className="mt-3 flex-row gap-3">
              {hasBuyAll && (
                <Pressable
                  onPress={() => {
                    const spent = buyAll()
                    if (spent > 0) {
                      Alert.alert('🛒', `Bought upgrades for ${spent} points!`)
                    }
                  }}
                  disabled={!canAffordAny}
                  className="flex-1 flex-row items-center justify-center gap-2 rounded-xl py-3"
                  style={{
                    backgroundColor: `${accentColor}20`,
                    opacity: canAffordAny ? 1 : 0.4,
                  }}
                >
                  <Ionicons name="cart" size={18} color={accentColor} />
                  <Text
                    style={{ color: accentColor }}
                    className="font-semibold text-sm"
                  >
                    Buy All
                  </Text>
                </Pressable>
              )}
              {hasAutoClaim && (
                <Pressable
                  onPress={() =>
                    claimAllMutation.mutate(undefined, {
                      onSuccess: (data) => {
                        if (data.claimed > 0) {
                          Alert.alert(
                            '⚡',
                            `Claimed ${data.claimed} rewards for ${data.displayTotalAmount} STACK!`,
                          )
                        } else {
                          Alert.alert('⚡', 'No pending rewards to claim.')
                        }
                      },
                    })
                  }
                  disabled={!canClaimAny || claimAllMutation.isPending}
                  className="flex-1 flex-row items-center justify-center gap-2 rounded-xl py-3"
                  style={{
                    backgroundColor: `${accentColor}20`,
                    opacity:
                      canClaimAny && !claimAllMutation.isPending ? 1 : 0.4,
                  }}
                >
                  {claimAllMutation.isPending ? (
                    <ActivityIndicator size={18} color={accentColor} />
                  ) : (
                    <Ionicons name="gift" size={18} color={accentColor} />
                  )}
                  <Text
                    style={{ color: accentColor }}
                    className="font-semibold text-sm"
                  >
                    Claim All
                  </Text>
                </Pressable>
              )}
            </View>
          )}
        </View>
      </View>
    </UiContainer>
  )
}
