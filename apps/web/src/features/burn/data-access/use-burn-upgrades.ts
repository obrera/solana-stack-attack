import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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

export function useBurnPurchase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (_upgradeId: string) => {
      // TODO: implement wallet signing for pre-built burn transactions
      // The server returns a base64 tx via client.burn.prepareBurn({ upgradeId })
      // that needs the user's wallet signature before sending
      toast.error('Burn purchases require wallet signing (coming soon)')
      throw new Error('Wallet signing not yet implemented for web')
    },
    onSuccess: () => {
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
  })
}

export function useFuelCellInfo() {
  return useQuery({
    ...orpc.burn.fuelCellInfo.queryOptions(),
  })
}

export function useFuelCellPurchase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      toast.error('Fuel cell purchases require wallet signing (coming soon)')
      throw new Error('Wallet signing not yet implemented for web')
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
