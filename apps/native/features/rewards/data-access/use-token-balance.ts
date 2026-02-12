import { useCallback, useEffect, useState } from 'react'

import { client } from '@/features/core/util/core-orpc'

let listeners: Array<() => void> = []

/**
 * Notify all useTokenBalance hooks to refetch.
 * Call this after claiming a reward.
 */
export function invalidateTokenBalance() {
  for (const listener of listeners) {
    listener()
  }
}

/**
 * Hook that returns the user's STACK token balance from the server.
 * Server caches the RPC call so this is cheap to call.
 */
export function useTokenBalance() {
  const [balance, setBalance] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchBalance = useCallback(async () => {
    try {
      const data = await client.reward.balance()
      setBalance(data.balance)
    } catch {
      // Silently fail
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    listeners.push(fetchBalance)
    return () => {
      listeners = listeners.filter((l) => l !== fetchBalance)
    }
  }, [fetchBalance])

  useEffect(() => {
    fetchBalance()
  }, [fetchBalance])

  return { balance, isLoading }
}
