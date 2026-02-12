import { ActivityIndicator, Text, View } from 'react-native'

import { useRewards } from './data-access/use-rewards'
import { RewardsUiCard } from './ui/rewards-ui-card'

export function RewardsFeature() {
  const { claimingId, claimReward, isLoading, rewards } = useRewards()

  if (isLoading) {
    return (
      <View className="items-center py-4">
        <ActivityIndicator />
      </View>
    )
  }

  if (rewards.length === 0) {
    return (
      <View className="py-4">
        <Text className="text-center text-muted">
          No rewards yet. Keep playing to earn STACK tokens!
        </Text>
      </View>
    )
  }

  const pending = rewards.filter((r) => r.status === 'pending')
  const claimed = rewards.filter((r) => r.status === 'claimed')

  return (
    <View>
      {pending.length > 0 && (
        <View className="mb-4">
          <Text className="mb-2 font-semibold text-foreground text-sm">
            Claimable ({pending.length})
          </Text>
          {pending.map((r) => (
            <RewardsUiCard
              isClaiming={claimingId === r.id}
              key={r.id}
              onClaim={claimReward}
              reward={r}
            />
          ))}
        </View>
      )}

      {claimed.length > 0 && (
        <View>
          <Text className="mb-2 font-semibold text-foreground text-sm">
            Claimed ({claimed.length})
          </Text>
          {claimed.map((r) => (
            <RewardsUiCard
              isClaiming={false}
              key={r.id}
              onClaim={claimReward}
              reward={r}
            />
          ))}
        </View>
      )}
    </View>
  )
}
