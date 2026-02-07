import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { Spinner, useThemeColor } from 'heroui-native'
import { ScrollView, Text, View } from 'react-native'
import { authClient } from '@/features/auth/data-access/auth-client'
import { orpc } from '@/features/core/util/core-orpc'
import { UiContainer } from '@/features/ui/ui/ui-container'

import { GameUiLeaderboardCard } from './ui/game-ui-leaderboard-card'

export function GameFeatureLeaderboard() {
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
    <UiContainer className="flex-1">
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
              <GameUiLeaderboardCard
                key={player.userId}
                rank={index + 1}
                name={player.name}
                score={player.score}
                totalTaps={player.totalTaps}
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
    </UiContainer>
  )
}
