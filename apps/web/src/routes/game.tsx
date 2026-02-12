import { createFileRoute } from '@tanstack/react-router'

import { GameProvider } from '@/features/game/data-access/game-provider'
import { GameFeature } from '@/features/game/game-feature'

export const Route = createFileRoute('/game')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <GameProvider>
      <GameFeature />
    </GameProvider>
  )
}
