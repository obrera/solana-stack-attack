import { GameUiEnergyBar } from '@solana-stack-attack/game-ui-web/game-ui-energy-bar'
import { GameUiFloatingText } from '@solana-stack-attack/game-ui-web/game-ui-floating-text'
import { GameUiStats } from '@solana-stack-attack/game-ui-web/game-ui-stats'
import { GameUiTapButton } from '@solana-stack-attack/game-ui-web/game-ui-tap-button'
import { gameFormatNumber } from '@solana-stack-attack/game-util/game-format-number'
import { useGameContext } from './data-access/game-provider'

export function GameFeatureIndex() {
  const { state, floatingTexts } = useGameContext()

  if (state.isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-gray-400">Loading game...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center gap-6 p-6 lg:flex-row lg:items-start lg:justify-center lg:gap-12">
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

        {/* Tap Button */}
        <div className="relative">
          <GameUiTapButton />
          {floatingTexts.map((ft) => (
            <GameUiFloatingText key={ft.id} text={ft} />
          ))}
        </div>

        <GameUiStats />
      </div>
    </div>
  )
}
