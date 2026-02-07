import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Card, useThemeColor } from 'heroui-native'
import { Pressable, ScrollView, Text, View } from 'react-native'

import { Container } from '@/components/container'
import { useGameContext } from '@/contexts/game-context'
import type { Upgrade } from '@/hooks/use-upgrades'

export default function ShopScreen() {
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
    <Container className="flex-1">
      <ScrollView className="flex-1 p-4">
        {/* Current Score */}
        <Card variant="secondary" className="mb-6 p-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-muted text-sm">Your Score</Text>
              <Text className="font-bold text-3xl text-foreground">
                {formatNumber(state.score)}
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
              <UpgradeCard
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
              <UpgradeCard
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
    </Container>
  )
}

interface UpgradeCardProps {
  upgrade: Upgrade
  level: number
  cost: number
  canAfford: boolean
  accentColor: string
  mutedColor: string
  onPurchase: () => void
}

function UpgradeCard({
  upgrade,
  level,
  cost,
  canAfford,
  accentColor,
  mutedColor,
  onPurchase,
}: UpgradeCardProps) {
  return (
    <Card variant="secondary" className="p-4">
      <View className="flex-row items-center gap-4">
        {/* Icon */}
        <View
          className="h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: `${accentColor}20` }}
        >
          <Ionicons
            name={upgrade.icon as keyof typeof Ionicons.glyphMap}
            size={24}
            color={accentColor}
          />
        </View>

        {/* Info */}
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="font-semibold text-foreground">
              {upgrade.name}
            </Text>
            {level > 0 && (
              <View
                className="rounded px-2 py-0.5"
                style={{ backgroundColor: `${accentColor}30` }}
              >
                <Text
                  style={{ color: accentColor }}
                  className="font-medium text-xs"
                >
                  Lv.{level}
                </Text>
              </View>
            )}
          </View>
          <Text className="text-muted text-sm">{upgrade.description}</Text>
        </View>

        {/* Buy Button */}
        <Pressable
          onPress={onPurchase}
          disabled={!canAfford}
          className="rounded-lg px-4 py-2"
          style={{
            backgroundColor: canAfford ? accentColor : mutedColor,
            opacity: canAfford ? 1 : 0.5,
          }}
        >
          <Text className="font-semibold text-white">{formatNumber(cost)}</Text>
        </Pressable>
      </View>
    </Card>
  )
}

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
