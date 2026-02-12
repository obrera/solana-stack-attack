import { getBase64Encoder } from '@solana/kit'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  type UiWalletAccount,
  useSignAndSendTransaction,
  useWalletUi,
} from '@wallet-ui/react'
import { useCallback } from 'react'
import { toast } from 'sonner'
import { client, orpc } from '@/utils/orpc'

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
      const txBytes = new Uint8Array(getBase64Encoder().encode(base64Tx))
      await signAndSend({ transaction: txBytes })
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
      toast.error(
        `Burn failed: ${error instanceof Error ? error.message : String(error)}`,
      )
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
      toast.error(
        `Fuel cell failed: ${error instanceof Error ? error.message : String(error)}`,
      )
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
