import { useWalletUi } from '@wallet-ui/react'
import {
  LucideGift,
  LucideShoppingCart,
  LucideWallet,
  LucideZap,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { WalletDropdown } from '@/components/wallet-dropdown'
import { useGameContext } from '@/features/game/data-access/game-provider'
import { usePendingRewardCount } from '@/features/rewards/data-access/use-pending-reward-count'
import {
  useBurnPurchase,
  useBurnPurchased,
  useBurnSpendableBalance,
  useBurnUpgrades,
  useClaimAll,
  useFuelCellInfo,
  useFuelCellPurchase,
} from './data-access/use-burn-upgrades'
import { BurnUiUpgradeCard } from './ui/burn-ui-upgrade-card'

export function BurnFeatureShop() {
  const { account } = useWalletUi()

  if (!account) {
    return <BurnWalletGuard />
  }

  return <BurnFeatureShopInner />
}

function BurnWalletGuard() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center justify-center gap-6 p-8 pt-24">
      <div className="flex size-20 items-center justify-center rounded-full bg-red-500/20">
        <LucideWallet className="size-10 text-red-500" />
      </div>
      <div className="text-center">
        <h2 className="font-bold text-xl">Connect Your Wallet</h2>
        <p className="mt-2 text-muted-foreground text-sm">
          Connect a wallet to burn STACK tokens for permanent upgrades.
        </p>
      </div>
      <WalletDropdown />
    </div>
  )
}

function BurnFeatureShopInner() {
  const { data: upgrades, isLoading: upgradesLoading } = useBurnUpgrades()
  const { data: purchased, isLoading: purchasedLoading } = useBurnPurchased()
  const { data: balance, isLoading: balanceLoading } = useBurnSpendableBalance()
  const { data: fuelCell } = useFuelCellInfo()
  const purchaseMutation = useBurnPurchase()
  const fuelCellMutation = useFuelCellPurchase()
  const claimAllMutation = useClaimAll()
  const { buyAll, refillEnergy } = useGameContext()

  const hasBuyAll = purchased?.includes('buy_all') ?? false
  const hasAutoClaim = purchased?.includes('auto_claim') ?? false
  const pendingRewards = usePendingRewardCount()
  const canClaimAny = hasAutoClaim && pendingRewards > 0

  const isLoading = upgradesLoading || purchasedLoading || balanceLoading

  function handlePurchase(upgradeId: string, name: string, cost: number) {
    if (
      !confirm(
        `🔥 Burn ${cost} STACK to unlock ${name}? This will burn tokens on-chain and cannot be undone.`,
      )
    ) {
      return
    }
    purchaseMutation.mutate(upgradeId)
  }

  function handleFuelCell() {
    if (!fuelCell) return
    if (
      !confirm(
        `⚡ Burn ${fuelCell.displayCost} STACK to fully recharge energy?`,
      )
    ) {
      return
    }
    fuelCellMutation.mutate(undefined, {
      onSuccess: () => refillEnergy(),
    })
  }

  function handleBuyAll() {
    const count = buyAll()
    if (count > 0) {
      toast.success(`Bought upgrades for ${count} points!`)
    } else {
      toast.info("Can't afford any upgrades right now.")
    }
  }

  function handleClaimAll() {
    claimAllMutation.mutate(undefined, {
      onSuccess: (data) => {
        toast.success(
          `Claimed ${data.claimed} rewards for ${data.displayTotalAmount} STACK!`,
        )
      },
    })
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col items-center py-6">
        <span className="text-5xl">🔥</span>
        <h1 className="mt-2 font-bold text-2xl">Burn Shop</h1>
        <p className="mt-1 text-center text-muted-foreground text-sm">
          Burn your STACK tokens for permanent upgrades
        </p>
      </div>

      {/* Balance Card */}
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="text-muted-foreground text-sm">Spendable STACK</p>
            {balanceLoading ? (
              <Spinner className="size-6" />
            ) : (
              <p className="font-bold text-3xl text-red-500">
                {balance?.displaySpendable ?? 0}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-xs">Total Burned</p>
            <p className="font-semibold">
              🔥 {balance?.displayTotalBurned ?? 0}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {(hasBuyAll || hasAutoClaim) && (
        <div>
          <h2 className="mb-3 font-semibold text-lg">⚡ Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {hasBuyAll && (
              <Button
                variant="outline"
                className="flex h-auto flex-col gap-2 py-4"
                onClick={handleBuyAll}
              >
                <LucideShoppingCart className="size-7 text-green-500" />
                <span className="font-semibold text-sm">Buy All</span>
              </Button>
            )}
            {hasAutoClaim && (
              <Button
                variant="outline"
                className={`flex h-auto flex-col gap-2 py-4 ${!canClaimAny ? 'opacity-50' : ''}`}
                onClick={handleClaimAll}
                disabled={!canClaimAny || claimAllMutation.isPending}
              >
                {claimAllMutation.isPending ? (
                  <Spinner className="size-7" />
                ) : (
                  <LucideGift
                    className={`size-7 ${canClaimAny ? 'text-green-500' : 'text-muted-foreground'}`}
                  />
                )}
                <span
                  className={`font-semibold text-sm ${canClaimAny ? '' : 'text-muted-foreground'}`}
                >
                  Claim All
                </span>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <Spinner className="size-8" />
        </div>
      )}

      {/* Fuel Cell */}
      {fuelCell && (
        <div>
          <h2 className="mb-3 font-semibold text-lg">⚡ Fuel Cell</h2>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex size-12 items-center justify-center rounded-full bg-yellow-500/20">
                <LucideZap className="size-6 text-yellow-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{fuelCell.name}</span>
                  {fuelCell.timesPurchased > 0 && (
                    <span className="rounded bg-yellow-500/30 px-2 py-0.5 font-medium text-xs text-yellow-500">
                      ×{fuelCell.timesPurchased}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground text-sm">
                  {fuelCell.description}
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                disabled={
                  (balance?.spendable ?? 0) < fuelCell.cost ||
                  fuelCellMutation.isPending
                }
                onClick={handleFuelCell}
              >
                {fuelCellMutation.isPending ? (
                  <Spinner className="size-4" />
                ) : (
                  <>{fuelCell.displayCost} 🔥</>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Permanent Upgrades */}
      {!isLoading && upgrades && (
        <div>
          <h2 className="mb-3 font-semibold text-lg">🔥 Permanent Upgrades</h2>
          <div className="space-y-3">
            {upgrades.map((upgrade) => {
              const isPurchased = purchased?.includes(upgrade.id) ?? false
              const canAfford =
                (balance?.spendable ?? 0) >= upgrade.cost && !isPurchased

              return (
                <BurnUiUpgradeCard
                  key={upgrade.id}
                  name={upgrade.name}
                  description={upgrade.description}
                  icon={upgrade.icon}
                  displayCost={upgrade.displayCost}
                  isPurchased={isPurchased}
                  canAfford={canAfford}
                  isPurchasing={
                    purchaseMutation.isPending &&
                    purchaseMutation.variables === upgrade.id
                  }
                  onPurchase={() =>
                    handlePurchase(
                      upgrade.id,
                      upgrade.name,
                      upgrade.displayCost,
                    )
                  }
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Info */}
      <p className="text-center text-muted-foreground text-xs">
        💡 Claim STACK from milestones, then burn them here.
        <br />
        Burning STACK boosts your leaderboard ranking!
      </p>
    </div>
  )
}
