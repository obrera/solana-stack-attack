import {
  getBase64Encoder,
  getTransactionDecoder,
  getTransactionEncoder,
} from '@solana/kit'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  type UiWalletAccount,
  useSignAndSendTransaction,
  useWalletUi,
} from '@wallet-ui/react'
import { useCallback } from 'react'
import { toast } from 'sonner'
import { client, orpc } from '@/utils/orpc'

function formatError(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  try {
    return JSON.stringify(error)
  } catch {
    return 'Unknown error'
  }
}

export function useBurnUpgrades() {
  return useQuery({
    ...orpc.burn.upgrades.queryOptions(),
  })
}

export function useBurnPurchased() {
  return useQuery({
    ...orpc.burn.purchased.queryOptions(),
  })
}

export function useBurnSpendableBalance() {
  return useQuery({
    ...orpc.burn.spendableBalance.queryOptions(),
  })
}

/**
 * Returns a function that signs and sends a base64-encoded transaction via the connected wallet.
 * Must only be called when a wallet account is connected (guard at page level).
 */
export function useSignAndSendBase64Tx() {
  const { account, cluster } = useWalletUi()
  // Safe: burn page has wallet guard, account is always defined here
  const walletAccount = account as UiWalletAccount
  const signAndSend = useSignAndSendTransaction(walletAccount, cluster.id)

  return useCallback(
    async (base64Tx: string) => {
      // Decode and re-encode to ensure proper wire format with signature slots
      const txBytes = getBase64Encoder().encode(base64Tx)
      const decoded = getTransactionDecoder().decode(txBytes)
      const reEncoded = getTransactionEncoder().encode(decoded)
      await signAndSend({ transaction: new Uint8Array(reEncoded) })
    },
    [signAndSend],
  )
}

export function useBurnPurchase() {
  const queryClient = useQueryClient()
  const signAndSendBase64Tx = useSignAndSendBase64Tx()

  return useMutation({
    mutationFn: async (upgradeId: string) => {
      const { transaction } = await client.burn.prepareBurn({ upgradeId })
      await signAndSendBase64Tx(transaction)
      return await client.burn.confirmBurn({ upgradeId })
    },
    onSuccess: () => {
      toast.success('Burn upgrade purchased!')
      queryClient.invalidateQueries({
        queryKey: orpc.burn.purchased.queryOptions().queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: orpc.burn.spendableBalance.queryOptions().queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: orpc.game.getLeaderboard.queryOptions().queryKey,
      })
    },
    onError: (error) => {
      console.error('[Burn] Purchase failed:', error)
      toast.error(`Burn failed: ${formatError(error)}`)
    },
  })
}

export function useFuelCellInfo() {
  return useQuery({
    ...orpc.burn.fuelCellInfo.queryOptions(),
  })
}

export function useFuelCellPurchase() {
  const queryClient = useQueryClient()
  const signAndSendBase64Tx = useSignAndSendBase64Tx()

  return useMutation({
    mutationFn: async () => {
      const { transaction } = await client.burn.prepareFuelCell()
      await signAndSendBase64Tx(transaction)
      return await client.burn.confirmFuelCell()
    },
    onSuccess: () => {
      toast.success('Fuel cell purchased!')
      queryClient.invalidateQueries({
        queryKey: orpc.burn.fuelCellInfo.queryOptions().queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: orpc.burn.spendableBalance.queryOptions().queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: orpc.game.getLeaderboard.queryOptions().queryKey,
      })
    },
    onError: (error) => {
      console.error('[Burn] Fuel cell failed:', error)
      toast.error(`Fuel cell failed: ${formatError(error)}`)
    },
  })
}

export function useClaimAll() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      return await client.reward.claimAll()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.reward.list.queryOptions().queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: orpc.reward.balance.queryOptions().queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: orpc.burn.spendableBalance.queryOptions().queryKey,
      })
    },
  })
}
