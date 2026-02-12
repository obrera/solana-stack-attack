import { createFileRoute } from '@tanstack/react-router'

import { GameFeatureLeaderboard } from '@/features/game/game-feature-leaderboard'

export const Route = createFileRoute('/leaderboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return <GameFeatureLeaderboard />
}
