import { gameFormatNumber } from '@solana-stack-attack/game-util/game-format-number'
import { LucideMedal, LucideTrophy } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface GameUiLeaderboardCardProps {
  displayTotalBurned?: number
  isCurrentUser: boolean
  name: string
  rank: number
  score: number
  totalTaps: number
}

function getRankColor(rank: number): string {
  if (rank === 1) return 'text-amber-400'
  if (rank === 2) return 'text-gray-400'
  if (rank === 3) return 'text-amber-700'
  return 'text-muted-foreground'
}

function getRankBg(rank: number): string {
  if (rank === 1) return 'bg-amber-400/20'
  if (rank === 2) return 'bg-gray-400/20'
  if (rank === 3) return 'bg-amber-700/20'
  return 'bg-muted/50'
}

function RankIcon({ rank }: { rank: number }) {
  const color = getRankColor(rank)
  if (rank === 1) return <LucideTrophy className={`size-6 ${color}`} />
  if (rank <= 3) return <LucideMedal className={`size-6 ${color}`} />
  return <span className={`font-bold text-lg ${color}`}>{rank}</span>
}

export function GameUiLeaderboardCard({
  displayTotalBurned,
  isCurrentUser,
  name,
  rank,
  score,
  totalTaps,
}: GameUiLeaderboardCardProps) {
  return (
    <Card className={isCurrentUser ? 'border-2 border-green-500' : ''}>
      <CardContent className="flex items-center gap-4 p-4">
        {/* Rank */}
        <div
          className={`flex size-12 items-center justify-center rounded-full ${getRankBg(rank)}`}
        >
          <RankIcon rank={rank} />
        </div>

        {/* Player Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{name}</span>
            {isCurrentUser && (
              <span className="rounded bg-green-500/30 px-2 py-0.5 font-medium text-green-500 text-xs">
                YOU
              </span>
            )}
          </div>
          <span className="text-muted-foreground text-sm">
            {gameFormatNumber(totalTaps)} taps
            {displayTotalBurned != null && displayTotalBurned > 0 && (
              <span> · 🔥 {gameFormatNumber(displayTotalBurned)}</span>
            )}
          </span>
        </div>

        {/* Score */}
        <div className="text-right">
          <p className="font-bold text-lg">{gameFormatNumber(score)}</p>
          <p className="text-muted-foreground text-xs">points</p>
        </div>
      </CardContent>
    </Card>
  )
}
