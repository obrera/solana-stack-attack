import { Ionicons } from '@expo/vector-icons'
import { gameFormatNumber } from '@solana-stack-attack/game-util/game-format-number'
import { Card } from 'heroui-native'
import { Pressable, Text, View } from 'react-native'
import type { Upgrade } from '../data-access/use-game-upgrades'

interface GameUiUpgradeCardProps {
  upgrade: Upgrade
  level: number
  cost: number
  canAfford: boolean
  accentColor: string
  mutedColor: string
  onPurchase: () => void
}

export function GameUiUpgradeCard({
  upgrade,
  level,
  cost,
  canAfford,
  accentColor,
  mutedColor,
  onPurchase,
}: GameUiUpgradeCardProps) {
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
          <Text className="font-semibold text-white">
            {gameFormatNumber(cost)}
          </Text>
        </Pressable>
      </View>
    </Card>
  )
}
