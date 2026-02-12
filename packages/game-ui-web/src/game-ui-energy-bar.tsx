import { useGameContext } from '@solana-stack-attack/game-data-access/game-provider'

export function GameUiEnergyBar() {
  const { state } = useGameContext()

  if (state.pointsPerSecond <= 0) return null

  const percent =
    state.maxEnergy > 0 ? (state.energy / state.maxEnergy) * 100 : 0
  const color =
    percent < 10
      ? 'bg-red-500'
      : percent < 30
        ? 'bg-yellow-500'
        : 'bg-emerald-400'

  return (
    <div className="w-full max-w-sm">
      <div className="mb-1 flex justify-between text-gray-400 text-xs">
        <span>⚡ Energy</span>
        <span>
          {state.energy}/{state.maxEnergy}
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
