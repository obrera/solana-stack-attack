import { useCallback, useEffect, useState } from 'react'

import { client } from '@/features/core/util/core-orpc'

let listeners: Array<() => void> = []

/**
 * Notify all usePendingRewardCount hooks to refetch.
 * Call this after claiming a reward.
 */
export function invalidatePendingRewardCount() {
  for (const listener of listeners) {
    listener()
  }
}

/**
 * Lightweight hook that returns the count of unclaimed rewards.
 * Used for badge indicators on tabs.
 */
export function usePendingRewardCount() {
  const [count, setCount] = useState(0)

  const fetchCount = useCallback(async () => {
    try {
      const data = await client.reward.list()
      setCount(data.filter((r) => r.status === 'pending').length)
    } catch {
      // Silently fail — badge is non-critical
    }
  }, [])

  useEffect(() => {
    listeners.push(fetchCount)
    return () => {
      listeners = listeners.filter((l) => l !== fetchCount)
    }
  }, [fetchCount])

  useEffect(() => {
    fetchCount()

    // Re-check every 30 seconds
    const interval = setInterval(fetchCount, 30_000)
    return () => clearInterval(interval)
  }, [fetchCount])

  return count
}
