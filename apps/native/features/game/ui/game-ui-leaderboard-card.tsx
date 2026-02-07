import { Ionicons } from '@expo/vector-icons'
import { Card } from 'heroui-native'
import { Text, View } from 'react-native'

import { gameFormatNumber } from '../util/game-format-number'

interface GameUiLeaderboardCardProps {
  rank: number
  name: string
  score: number
  totalTaps: number
  isCurrentUser: boolean
  accentColor: string
  mutedColor: string
}

export function GameUiLeaderboardCard({
  rank,
  name,
  score,
  totalTaps,
  isCurrentUser,
  accentColor,
  mutedColor,
}: GameUiLeaderboardCardProps) {
  function getRankColor(): string {
    if (rank === 1) {
      return '#FFD700' // Gold
    }
    if (rank === 2) {
      return '#C0C0C0' // Silver
    }
    if (rank === 3) {
      return '#CD7F32' // Bronze
    }
    return mutedColor
  }

  function getRankIcon(): keyof typeof Ionicons.glyphMap {
    if (rank === 1) {
      return 'trophy'
    }
    if (rank === 2) {
      return 'medal'
    }
    if (rank === 3) {
      return 'medal-outline'
    }
    return 'person'
  }

  return (
    <Card
      variant="secondary"
      className="p-4"
      style={isCurrentUser ? { borderColor: accentColor, borderWidth: 2 } : {}}
    >
      <View className="flex-row items-center gap-4">
        {/* Rank */}
        <View
          className="h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: `${getRankColor()}20` }}
        >
          {rank <= 3 ? (
            <Ionicons name={getRankIcon()} size={24} color={getRankColor()} />
          ) : (
            <Text style={{ color: mutedColor }} className="font-bold text-lg">
              {rank}
            </Text>
          )}
        </View>

        {/* Player Info */}
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="font-semibold text-foreground">{name}</Text>
            {isCurrentUser && (
              <View
                className="rounded px-2 py-0.5"
                style={{ backgroundColor: `${accentColor}30` }}
              >
                <Text
                  style={{ color: accentColor }}
                  className="font-medium text-xs"
                >
                  YOU
                </Text>
              </View>
            )}
          </View>
          <Text className="text-muted text-sm">
            {gameFormatNumber(totalTaps)} taps
          </Text>
        </View>

        {/* Score */}
        <View className="items-end">
          <Text className="font-bold text-foreground text-lg">
            {gameFormatNumber(score)}
          </Text>
          <Text className="text-muted text-xs">points</Text>
        </View>
      </View>
    </Card>
  )
}
