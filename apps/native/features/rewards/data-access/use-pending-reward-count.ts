import { useEffect, useState } from 'react'

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
  const [tick, setTick] = useState(0)

  useEffect(() => {
    function refetch() {
      setTick((t) => t + 1)
    }
    listeners.push(refetch)
    return () => {
      listeners = listeners.filter((l) => l !== refetch)
    }
  }, [])

  useEffect(() => {
    async function fetch() {
      try {
        const data = await client.reward.list()
        setCount(data.filter((r) => r.status === 'pending').length)
      } catch {
        // Silently fail — badge is non-critical
      }
    }
    fetch()

    // Re-check every 30 seconds
    const interval = setInterval(fetch, 30_000)
    return () => clearInterval(interval)
  }, [tick])

  return count
}
