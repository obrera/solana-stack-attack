import { useCallback, useEffect, useState } from 'react'
import { client } from '@/utils/orpc'

let listeners: Array<() => void> = []

/** Notify all usePendingRewardCount hooks to refetch. */
export function invalidatePendingRewardCount() {
  for (const listener of listeners) {
    listener()
  }
}

/** Lightweight hook for badge indicators — returns count of unclaimed rewards. */
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
    const interval = setInterval(fetchCount, 30_000)
    return () => clearInterval(interval)
  }, [fetchCount])

  return count
}
