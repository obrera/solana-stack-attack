import { useCallback, useEffect, useState } from 'react'
import { client } from '@/utils/orpc'
import { invalidatePendingRewardCount } from './use-pending-reward-count'

export interface Reward {
  amount: number
  claimedAt: Date | null
  createdAt: Date
  displayAmount: number
  id: number
  milestoneId: string
  status: 'pending' | 'claimed'
  txSignature: string | null
  userId: string
}

export function useRewards() {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [claimingId, setClaimingId] = useState<number | null>(null)

  const fetchRewards = useCallback(async () => {
    try {
      const data = await client.reward.list()
      setRewards(data as Reward[])
    } catch (error) {
      console.error('[Rewards] Failed to fetch:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRewards()
  }, [fetchRewards])

  async function claimReward(id: number): Promise<Reward | null> {
    setClaimingId(id)
    try {
      const claimed = (await client.reward.claim({ id })) as Reward
      setRewards((prev) => prev.map((r) => (r.id === id ? claimed : r)))
      invalidatePendingRewardCount()
      return claimed
    } catch (error) {
      console.error('[Rewards] Failed to claim:', error)
      return null
    } finally {
      setClaimingId(null)
    }
  }

  const pendingCount = rewards.filter((r) => r.status === 'pending').length

  return {
    claimingId,
    claimReward,
    fetchRewards,
    isLoading,
    pendingCount,
    rewards,
  }
}
