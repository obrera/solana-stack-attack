import { gameFormatNumber } from '@solana-stack-attack/game-util/game-format-number'
import { Card, CardContent } from '@/components/ui/card'
import { useGameContext } from './data-access/game-provider'
import { GameUiUpgradeCard } from './ui/game-ui-upgrade-card'

export function GameFeatureShop() {
  const {
    state,
    upgrades,
    getUpgradeCost,
    getUpgradeLevel,
    canAfford,
    buyUpgrade,
  } = useGameContext()

  return (
    <div className="mx-auto w-full max-w-lg space-y-6 p-4">
      {/* Current Score */}
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="text-muted-foreground text-sm">Your Score</p>
            <p className="font-bold text-3xl">
              {gameFormatNumber(state.score)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-xs">
              +{state.pointsPerTap}/tap
            </p>
            {state.pointsPerSecond > 0 && (
              <p className="text-muted-foreground text-xs">
                +{state.pointsPerSecond}/sec
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tap Power */}
      <div>
        <h2 className="mb-3 font-semibold text-lg">⚡ Tap Power</h2>
        <div className="space-y-3">
          {upgrades
            .filter((u) => u.effect.type === 'tap_multiplier')
            .map((upgrade) => (
              <GameUiUpgradeCard
                key={upgrade.id}
                upgrade={upgrade}
                level={getUpgradeLevel(upgrade.id)}
                cost={getUpgradeCost(upgrade.id)}
                canAfford={canAfford(upgrade.id)}
                onPurchase={() => buyUpgrade(upgrade.id)}
              />
            ))}
        </div>
      </div>

      {/* Auto Tappers */}
      <div>
        <h2 className="mb-3 font-semibold text-lg">🤖 Auto Tappers</h2>
        <div className="space-y-3">
          {upgrades
            .filter((u) => u.effect.type === 'auto_tapper')
            .map((upgrade) => (
              <GameUiUpgradeCard
                key={upgrade.id}
                upgrade={upgrade}
                level={getUpgradeLevel(upgrade.id)}
                cost={getUpgradeCost(upgrade.id)}
                canAfford={canAfford(upgrade.id)}
                onPurchase={() => buyUpgrade(upgrade.id)}
              />
            ))}
        </div>
      </div>
    </div>
  )
}
