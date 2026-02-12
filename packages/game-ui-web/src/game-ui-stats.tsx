import { useGameContext } from '@solana-stack-attack/game-data-access/game-provider'
import { gameFormatNumber } from '@solana-stack-attack/game-util/game-format-number'

export function GameUiStats() {
  const { state } = useGameContext()

  return (
    <div className="grid w-full max-w-sm grid-cols-3 gap-4 rounded-xl bg-white/5 p-4">
      <div className="text-center">
        <div className="text-gray-400 text-xs">TOTAL TAPS</div>
        <div className="font-semibold text-lg text-white">
          {gameFormatNumber(state.totalTaps)}
        </div>
      </div>
      <div className="text-center">
        <div className="text-gray-400 text-xs">PER TAP</div>
        <div className="font-semibold text-lg text-white">
          +{state.pointsPerTap}
        </div>
      </div>
      <div className="text-center">
        <div className="text-gray-400 text-xs">LEVEL</div>
        <div className="font-semibold text-lg text-white">{state.level}</div>
      </div>
    </div>
  )
}
