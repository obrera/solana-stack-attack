import { Ionicons } from '@expo/vector-icons'
import { Card, useThemeColor } from 'heroui-native'
import { ActivityIndicator, Linking, Pressable, Text, View } from 'react-native'

import type { Reward } from '../data-access/use-rewards'

interface RewardsUiCardProps {
  isClaiming: boolean
  onClaim: (id: number) => void
  reward: Reward
}

export function RewardsUiCard({
  isClaiming,
  onClaim,
  reward,
}: RewardsUiCardProps) {
  const accentColor = useThemeColor('success')
  const isPending = reward.status === 'pending'

  function handleExplorerLink() {
    if (reward.txSignature) {
      Linking.openURL(
        `https://explorer.solana.com/tx/${reward.txSignature}?cluster=devnet`,
      )
    }
  }

  return (
    <Card variant="secondary" className="mb-3 p-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="font-semibold text-foreground">
            {reward.milestoneId
              .replace(/_/g, ' ')
              .replace(/\b\w/g, (c) => c.toUpperCase())}
          </Text>
          <Text className="mt-1 text-muted text-sm">
            {reward.displayAmount.toLocaleString()} STACK
          </Text>
        </View>

        {isPending ? (
          <Pressable
            disabled={isClaiming}
            onPress={() => onClaim(reward.id)}
            className="rounded-lg bg-success px-4 py-2 active:opacity-70"
            style={{ opacity: isClaiming ? 0.5 : 1 }}
          >
            {isClaiming ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text className="font-semibold text-white">Claim</Text>
            )}
          </Pressable>
        ) : (
          <View className="flex-row items-center gap-2">
            <Ionicons name="checkmark-circle" size={20} color={accentColor} />
            {reward.txSignature ? (
              <Pressable onPress={handleExplorerLink}>
                <Text className="text-sm text-success underline">View Tx</Text>
              </Pressable>
            ) : (
              <Text className="text-muted text-sm">Claimed</Text>
            )}
          </View>
        )}
      </View>
    </Card>
  )
}
