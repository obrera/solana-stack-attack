import { Ionicons } from '@expo/vector-icons'
import { Card } from 'heroui-native'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'

interface BurnUiUpgradeCardProps {
  name: string
  description: string
  icon: string
  displayCost: number
  isPurchased: boolean
  canAfford: boolean
  isPurchasing: boolean
  accentColor: string
  dangerColor: string
  mutedColor: string
  onPurchase: () => void
}

export function BurnUiUpgradeCard({
  name,
  description,
  icon,
  displayCost,
  isPurchased,
  canAfford,
  isPurchasing,
  accentColor,
  dangerColor,
  mutedColor,
  onPurchase,
}: BurnUiUpgradeCardProps) {
  return (
    <Card
      variant="secondary"
      className="p-4"
      style={isPurchased ? { borderColor: accentColor, borderWidth: 1 } : {}}
    >
      <View className="flex-row items-center gap-4">
        {/* Icon */}
        <View
          className="h-12 w-12 items-center justify-center rounded-full"
          style={{
            backgroundColor: isPurchased
              ? `${accentColor}20`
              : `${dangerColor}20`,
          }}
        >
          <Ionicons
            name={icon as keyof typeof Ionicons.glyphMap}
            size={24}
            color={isPurchased ? accentColor : dangerColor}
          />
        </View>

        {/* Info */}
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="font-semibold text-foreground">{name}</Text>
            {isPurchased && (
              <View
                className="rounded px-2 py-0.5"
                style={{ backgroundColor: `${accentColor}30` }}
              >
                <Text
                  style={{ color: accentColor }}
                  className="font-medium text-xs"
                >
                  OWNED
                </Text>
              </View>
            )}
          </View>
          <Text className="text-muted text-sm">{description}</Text>
        </View>

        {/* Buy/Owned Button */}
        {isPurchased ? (
          <View
            className="rounded-lg px-4 py-2"
            style={{ backgroundColor: `${accentColor}20` }}
          >
            <Ionicons name="checkmark" size={20} color={accentColor} />
          </View>
        ) : (
          <Pressable
            onPress={onPurchase}
            disabled={!canAfford || isPurchasing}
            className="flex-row items-center gap-1 rounded-lg px-4 py-2"
            style={{
              backgroundColor: canAfford ? dangerColor : mutedColor,
              opacity: canAfford && !isPurchasing ? 1 : 0.5,
            }}
          >
            {isPurchasing ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Text className="font-semibold text-white">{displayCost}</Text>
                <Text className="text-white/80 text-xs">🔥</Text>
              </>
            )}
          </Pressable>
        )}
      </View>
    </Card>
  )
}
