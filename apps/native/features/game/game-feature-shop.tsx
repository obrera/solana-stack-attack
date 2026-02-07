import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Card, useThemeColor } from 'heroui-native'
import { Pressable, ScrollView, Text, View } from 'react-native'

import { UiContainer } from '@/features/ui/ui/ui-container'
import { useGameContext } from './data-access/game-provider'
import { GameUiUpgradeCard } from './ui/game-ui-upgrade-card'
import { gameFormatNumber } from './util/game-format-number'

export function GameFeatureShop() {
  const accentColor = useThemeColor('success')
  const mutedColor = useThemeColor('muted')
  const router = useRouter()

  const {
    state,
    upgrades,
    getUpgradeCost,
    getUpgradeLevel,
    canAfford,
    buyUpgrade,
  } = useGameContext()

  return (
    <UiContainer className="flex-1">
      <ScrollView className="flex-1 p-4">
        {/* Current Score */}
        <Card variant="secondary" className="mb-6 p-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-muted text-sm">Your Score</Text>
              <Text className="font-bold text-3xl text-foreground">
                {gameFormatNumber(state.score)}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-muted text-xs">
                +{state.pointsPerTap}/tap
              </Text>
              {state.pointsPerSecond > 0 && (
                <Text className="text-muted text-xs">
                  +{state.pointsPerSecond}/sec
                </Text>
              )}
            </View>
          </View>
        </Card>

        {/* Tap Upgrades */}
        <Text className="mb-3 font-semibold text-foreground text-lg">
          ⚡ Tap Power
        </Text>
        <View className="mb-6 gap-3">
          {upgrades
            .filter((u) => u.effect.type === 'tap_multiplier')
            .map((upgrade) => (
              <GameUiUpgradeCard
                key={upgrade.id}
                upgrade={upgrade}
                level={getUpgradeLevel(upgrade.id)}
                cost={getUpgradeCost(upgrade.id)}
                canAfford={canAfford(upgrade.id)}
                accentColor={accentColor}
                mutedColor={mutedColor}
                onPurchase={() => buyUpgrade(upgrade.id)}
              />
            ))}
        </View>

        {/* Auto Tappers */}
        <Text className="mb-3 font-semibold text-foreground text-lg">
          🤖 Auto Tappers
        </Text>
        <View className="gap-3 pb-8">
          {upgrades
            .filter((u) => u.effect.type === 'auto_tapper')
            .map((upgrade) => (
              <GameUiUpgradeCard
                key={upgrade.id}
                upgrade={upgrade}
                level={getUpgradeLevel(upgrade.id)}
                cost={getUpgradeCost(upgrade.id)}
                canAfford={canAfford(upgrade.id)}
                accentColor={accentColor}
                mutedColor={mutedColor}
                onPurchase={() => buyUpgrade(upgrade.id)}
              />
            ))}
        </View>
      </ScrollView>

      {/* Back to Game Button */}
      <View className="border-border/50 border-t p-4">
        <Pressable
          onPress={() => router.push('/game')}
          className="w-full rounded-lg p-4"
          style={{ backgroundColor: accentColor }}
        >
          <View className="flex-row items-center justify-center gap-2">
            <Ionicons name="game-controller" size={20} color="white" />
            <Text className="font-semibold text-white">Back to Game</Text>
          </View>
        </Pressable>
      </View>
    </UiContainer>
  )
}
