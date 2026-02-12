import { getBase64Encoder, getTransactionDecoder } from '@solana/kit'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { Alert } from 'react-native'

import { client, orpc } from '@/features/core/util/core-orpc'

/** Helper to decode base64 tx and sign+send via wallet */
async function signAndSendBase64Tx(
  transaction: string,
  signAndSendTransaction: (
    tx: ReturnType<ReturnType<typeof getTransactionDecoder>['decode']>,
    minContextSlot: bigint,
  ) => Promise<unknown>,
) {
  const txBytes = getBase64Encoder().encode(transaction)
  const decoder = getTransactionDecoder()
  const decodedTx = decoder.decode(txBytes)
  await signAndSendTransaction(decodedTx, 0n)
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
 * Two-step burn mutation:
 * 1. Server builds + fee-payer-signs the burn tx
 * 2. Client prompts user to sign and send via wallet
 * 3. Server verifies balance drop and records the burn
 */
export function useBurnPurchase() {
  const queryClient = useQueryClient()
  const { signAndSendTransaction } = useMobileWallet()

  return useMutation({
    mutationFn: async (upgradeId: string) => {
      const { transaction } = await client.burn.prepareBurn({ upgradeId })
      console.log('[Burn] Transaction base64:', transaction)
      await signAndSendBase64Tx(transaction, signAndSendTransaction)
      return await client.burn.confirmBurn({ upgradeId })
    },
    onSuccess: () => {
      // Invalidate all burn-related queries
      queryClient.invalidateQueries({
        queryKey: orpc.burn.purchased.queryOptions().queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: orpc.burn.spendableBalance.queryOptions().queryKey,
      })
      // Also invalidate leaderboard since burns affect ranking
      queryClient.invalidateQueries({
        queryKey: orpc.game.getLeaderboard.queryOptions().queryKey,
      })
    },
    onError: (error) => {
      Alert.alert(
        'Burn Failed',
        error instanceof Error ? error.message : String(error),
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
  const { signAndSendTransaction } = useMobileWallet()

  return useMutation({
    mutationFn: async () => {
      const { transaction } = await client.burn.prepareFuelCell()
      console.log('[Burn] Fuel Cell tx base64:', transaction)
      await signAndSendBase64Tx(transaction, signAndSendTransaction)
      return await client.burn.confirmFuelCell()
    },
    onSuccess: () => {
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
      Alert.alert(
        'Fuel Cell Failed',
        error instanceof Error ? error.message : String(error),
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
    onError: (error) => {
      Alert.alert(
        'Claim Failed',
        error instanceof Error ? error.message : String(error),
      )
    },
  })
}
