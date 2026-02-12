import { Spinner } from '@/components/ui/spinner'
import { useRewards } from './data-access/use-rewards'
import { RewardsUiCard } from './ui/rewards-ui-card'

export function RewardsFeature() {
  const { claimingId, claimReward, isLoading, rewards } = useRewards()

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Spinner className="size-6" />
      </div>
    )
  }

  if (rewards.length === 0) {
    return (
      <div className="py-4">
        <p className="text-center text-muted-foreground">
          No rewards yet. Keep playing to earn STACK tokens!
        </p>
      </div>
    )
  }

  const pending = rewards.filter((r) => r.status === 'pending')
  const claimed = rewards.filter((r) => r.status === 'claimed')

  return (
    <div>
      {pending.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 font-semibold text-sm">
            Claimable ({pending.length})
          </p>
          {pending.map((r) => (
            <RewardsUiCard
              isClaiming={claimingId === r.id}
              key={r.id}
              onClaim={claimReward}
              reward={r}
            />
          ))}
        </div>
      )}

      {claimed.length > 0 && (
        <div>
          <p className="mb-2 font-semibold text-sm">
            Claimed ({claimed.length})
          </p>
          {claimed.map((r) => (
            <RewardsUiCard
              isClaiming={false}
              key={r.id}
              onClaim={claimReward}
              reward={r}
            />
          ))}
        </div>
      )}
    </div>
  )
}
