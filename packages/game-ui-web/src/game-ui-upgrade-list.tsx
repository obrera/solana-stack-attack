import { useGameContext } from '@solana-stack-attack/game-data-access/game-provider'
import { gameFormatNumber } from '@solana-stack-attack/game-util/game-format-number'

export function GameUiUpgradeList() {
  const { upgrades, getUpgradeCost, getUpgradeLevel, canAfford, buyUpgrade } =
    useGameContext()

  return (
    <div className="w-full max-w-sm space-y-2">
      <h3 className="font-semibold text-gray-400 text-sm">UPGRADES</h3>
      {upgrades.map((upgrade) => {
        const level = getUpgradeLevel(upgrade.id)
        const cost = getUpgradeCost(upgrade.id)
        const affordable = canAfford(upgrade.id)

        return (
          <button
            key={upgrade.id}
            type="button"
            onClick={() => buyUpgrade(upgrade.id)}
            disabled={!affordable}
            className={`flex w-full items-center justify-between rounded-lg bg-white/5 p-3 text-left transition-colors ${affordable ? 'cursor-pointer hover:bg-white/10' : 'cursor-not-allowed opacity-50'}`}
          >
            <div>
              <div className="font-medium text-white">
                {upgrade.name}
                {level > 0 && (
                  <span className="ml-2 text-emerald-400 text-sm">
                    Lv.{level}
                  </span>
                )}
              </div>
              <div className="text-gray-400 text-sm">{upgrade.description}</div>
            </div>
            <div className="font-semibold text-sm text-yellow-400">
              {gameFormatNumber(cost)}
            </div>
          </button>
        )
      })}
    </div>
  )
}
