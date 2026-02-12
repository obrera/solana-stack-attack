import type { FloatingText } from '@solana-stack-attack/game-data-access/game-provider'

export function GameUiFloatingText({ text }: { text: FloatingText }) {
  return (
    <span
      className="pointer-events-none absolute animate-float font-bold text-emerald-400 text-lg"
      style={{ left: text.x, top: text.y }}
    >
      +{text.value}
    </span>
  )
}
