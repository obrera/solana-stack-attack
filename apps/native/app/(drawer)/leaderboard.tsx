import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { Card, Spinner, useThemeColor } from 'heroui-native'
import { ScrollView, Text, View } from 'react-native'

import { Container } from '@/components/container'
import { authClient } from '@/lib/auth-client'
import { formatNumber } from '@/lib/format-number'
import { orpc } from '@/utils/orpc'

export default function LeaderboardScreen() {
  const accentColor = useThemeColor('success')
  const mutedColor = useThemeColor('muted')
  const warningColor = useThemeColor('warning')

  const { data: session } = authClient.useSession()
  const currentUserId = session?.user?.id

  const { data: leaders, isLoading: leadersLoading } = useQuery({
    ...orpc.game.getLeaderboard.queryOptions({ input: { limit: 20 } }),
  })

  const { data: myRank, isLoading: rankLoading } = useQuery({
    ...orpc.game.getMyRank.queryOptions(),
    enabled: !!currentUserId,
  })

  const isLoading = leadersLoading || rankLoading

  return (
    <Container className="flex-1">
      <ScrollView className="flex-1 p-4">
        {/* Header */}
        <View className="mb-6 items-center py-4">
          <Ionicons name="trophy" size={48} color={warningColor} />
          <Text className="mt-2 font-bold text-2xl text-foreground">
            Leaderboard
          </Text>
          {myRank?.rank && (
            <Text className="mt-1 text-muted">
              Your rank: #{myRank.rank} of {myRank.totalPlayers}
            </Text>
          )}
        </View>

        {/* Loading State */}
        {isLoading && (
          <View className="items-center py-8">
            <Spinner size="lg" color="default" />
          </View>
        )}

        {/* Leaderboard List */}
        {!isLoading && leaders && (
          <View className="gap-3">
            {leaders.map((player, index) => (
              <LeaderboardCard
                key={player.userId}
                rank={index + 1}
                name={player.name}
                score={player.score}
                totalTaps={player.totalTaps}
                image={player.image}
                isCurrentUser={player.userId === currentUserId}
                accentColor={accentColor}
                mutedColor={mutedColor}
              />
            ))}
          </View>
        )}

        {/* Empty State */}
        {!isLoading && (!leaders || leaders.length === 0) && (
          <View className="items-center py-8">
            <Ionicons name="people-outline" size={48} color={mutedColor} />
            <Text className="mt-4 text-center text-muted">
              No players yet. Be the first!
            </Text>
          </View>
        )}

        {/* Bottom padding */}
        <View className="h-8" />
      </ScrollView>
    </Container>
  )
}

interface LeaderboardCardProps {
  rank: number
  name: string
  score: number
  totalTaps: number
  image: string | null
  isCurrentUser: boolean
  accentColor: string
  mutedColor: string
}

function LeaderboardCard({
  rank,
  name,
  score,
  totalTaps,
  isCurrentUser,
  accentColor,
  mutedColor,
}: LeaderboardCardProps) {
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
            {formatNumber(totalTaps)} taps
          </Text>
        </View>

        {/* Score */}
        <View className="items-end">
          <Text className="font-bold text-foreground text-lg">
            {formatNumber(score)}
          </Text>
          <Text className="text-muted text-xs">points</Text>
        </View>
      </View>
    </Card>
  )
}
