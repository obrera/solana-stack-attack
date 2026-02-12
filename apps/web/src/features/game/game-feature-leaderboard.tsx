import { useQuery } from '@tanstack/react-query'
import { LucideTrophy, LucideUsers } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { authClient } from '@/lib/auth-client'
import { orpc } from '@/utils/orpc'
import { GameUiLeaderboardCard } from './ui/game-ui-leaderboard-card'

export function GameFeatureLeaderboard() {
  const { data: session } = authClient.useSession()
  const currentUserId = session?.user?.id

  const { data: leaders, isLoading: leadersLoading } = useQuery({
    ...orpc.game.getLeaderboard.queryOptions({ input: { limit: 20 } }),
  })

  const { data: myRank, isLoading: rankLoading } = useQuery({
    ...orpc.game.getMyRank.queryOptions(),
    enabled: !!currentUserId,
  })

  const isLoading = leadersLoading || rankLoading

  return (
    <div className="mx-auto w-full max-w-lg space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col items-center py-6">
        <LucideTrophy className="size-12 text-amber-400" />
        <h1 className="mt-2 font-bold text-2xl">Leaderboard</h1>
        {myRank?.rank && (
          <p className="mt-1 text-muted-foreground">
            Your rank: #{myRank.rank} of {myRank.totalPlayers}
          </p>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <Spinner className="size-8" />
        </div>
      )}

      {/* Leaderboard List */}
      {!isLoading && leaders && (
        <div className="space-y-3">
          {leaders.map((player, index) => (
            <GameUiLeaderboardCard
              key={player.userId}
              rank={index + 1}
              name={player.name}
              score={player.score}
              totalTaps={player.totalTaps}
              displayTotalBurned={
                (player as Record<string, unknown>).displayTotalBurned as
                  | number
                  | undefined
              }
              isCurrentUser={player.userId === currentUserId}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && (!leaders || leaders.length === 0) && (
        <div className="flex flex-col items-center py-8">
          <LucideUsers className="size-12 text-muted-foreground" />
          <p className="mt-4 text-center text-muted-foreground">
            No players yet. Be the first!
          </p>
        </div>
      )}
    </div>
  )
}
