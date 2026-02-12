import { GameUiEnergyBar } from '@solana-stack-attack/game-ui-web/game-ui-energy-bar'
import { GameUiFloatingText } from '@solana-stack-attack/game-ui-web/game-ui-floating-text'
import { GameUiStats } from '@solana-stack-attack/game-ui-web/game-ui-stats'
import { GameUiTapButton } from '@solana-stack-attack/game-ui-web/game-ui-tap-button'
import { gameFormatNumber } from '@solana-stack-attack/game-util/game-format-number'
import { LucideGift, LucideShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import {
  useBurnPurchased,
  useClaimAll,
} from '@/features/burn/data-access/use-burn-upgrades'
import { usePendingRewardCount } from '@/features/rewards/data-access/use-pending-reward-count'
import { useGameContext } from './data-access/game-provider'
import { GameUiMilestoneModal } from './ui/game-ui-milestone-modal'
import { GameUiWelcomeModal } from './ui/game-ui-welcome-modal'

export function GameFeatureIndex() {
  const {
    state,
    floatingTexts,
    buyAll,
    upgrades,
    canAfford,
    dismissOfflineEarnings,
    dismissCelebration,
  } = useGameContext()
  const { data: purchased } = useBurnPurchased()
  const hasBuyAll = purchased?.includes('buy_all') ?? false
  const hasAutoClaim = purchased?.includes('auto_claim') ?? false
  const claimAllMutation = useClaimAll()
  const pendingRewards = usePendingRewardCount()
  const canAffordAny = hasBuyAll && upgrades.some((u) => canAfford(u.id))
  const canClaimAny = hasAutoClaim && pendingRewards > 0

  if (state.isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-gray-400">Loading game...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center gap-6 p-6 lg:flex-row lg:items-start lg:justify-center lg:gap-12">
      {/* Welcome Back Modal */}
      {state.offlineEarnings != null && state.offlineEarnings > 0 && (
        <GameUiWelcomeModal
          earnings={state.offlineEarnings}
          onDismiss={dismissOfflineEarnings}
        />
      )}

      {/* Milestone Celebration Modal */}
      <GameUiMilestoneModal
        milestone={state.pendingCelebration}
        onDismiss={dismissCelebration}
      />

      {/* Game Area */}
      <div className="flex flex-col items-center gap-6">
        <GameUiEnergyBar />

        {/* Score */}
        <div className="text-center">
          <div className="text-gray-400 text-sm">SCORE</div>
          <div className="font-bold text-5xl text-white">
            {gameFormatNumber(state.score)}
          </div>
          <div className="mt-1 text-gray-400 text-sm">
            +{state.pointsPerTap} per tap
            {state.pointsPerSecond > 0 &&
              (state.energy > 0
                ? ` · +${state.pointsPerSecond}/s`
                : ' · ⚡ auto-tappers paused')}
          </div>
        </div>

        {/* Energy warnings */}
        {state.pointsPerSecond > 0 && state.energy <= 0 && (
          <div className="animate-pulse rounded-xl bg-red-500/20 px-6 py-3">
            <span className="font-bold text-lg text-red-500">
              ⚡ TAP TO RECHARGE!
            </span>
          </div>
        )}
        {state.pointsPerSecond > 0 &&
          state.energy > 0 &&
          state.maxEnergy > 0 &&
          state.energy / state.maxEnergy < 0.3 && (
            <span className="font-semibold text-sm text-yellow-500">
              ⚡ Energy low — keep tapping!
            </span>
          )}

        {/* Tap Button */}
        <div className="relative">
          <GameUiTapButton />
          {floatingTexts.map((ft) => (
            <GameUiFloatingText key={ft.id} text={ft} />
          ))}
        </div>

        <GameUiStats />

        {/* Quick Actions (unlocked via burn shop) */}
        {(hasBuyAll || hasAutoClaim) && (
          <div className="flex w-full gap-3">
            {hasBuyAll && (
              <Button
                variant="ghost"
                className={`flex flex-1 items-center gap-2 rounded-xl py-3 ${canAffordAny ? 'bg-green-500/20' : 'bg-muted opacity-50'}`}
                disabled={!canAffordAny}
                onClick={() => {
                  const spent = buyAll()
                  if (spent > 0) {
                    toast.success(`Bought upgrades for ${spent} points!`)
                  } else {
                    toast.info("Can't afford any upgrades right now.")
                  }
                }}
              >
                <LucideShoppingCart
                  className={`size-5 ${canAffordAny ? 'text-green-500' : 'text-muted-foreground'}`}
                />
                <span
                  className={`font-semibold text-sm ${canAffordAny ? 'text-green-500' : 'text-muted-foreground'}`}
                >
                  Buy All
                </span>
              </Button>
            )}
            {hasAutoClaim && (
              <Button
                variant="ghost"
                className={`flex flex-1 items-center gap-2 rounded-xl py-3 ${canClaimAny ? 'bg-green-500/20' : 'bg-muted opacity-50'}`}
                disabled={!canClaimAny || claimAllMutation.isPending}
                onClick={() =>
                  claimAllMutation.mutate(undefined, {
                    onSuccess: (data) => {
                      if (data.claimed > 0) {
                        toast.success(
                          `Claimed ${data.claimed} rewards for ${data.displayTotalAmount} STACK!`,
                        )
                      } else {
                        toast.info('No pending rewards to claim.')
                      }
                    },
                  })
                }
              >
                {claimAllMutation.isPending ? (
                  <Spinner className="size-5" />
                ) : (
                  <LucideGift
                    className={`size-5 ${canClaimAny ? 'text-green-500' : 'text-muted-foreground'}`}
                  />
                )}
                <span
                  className={`font-semibold text-sm ${canClaimAny ? 'text-green-500' : 'text-muted-foreground'}`}
                >
                  Claim All
                </span>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
