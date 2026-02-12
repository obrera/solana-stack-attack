import { createFileRoute, redirect } from '@tanstack/react-router'

import { GameProvider } from '@/features/game/data-access/game-provider'
import { GameFeature } from '@/features/game/game-feature'
import { getUser } from '@/functions/get-user'

export const Route = createFileRoute('/game')({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await getUser()
    if (!session) {
      throw redirect({ to: '/login' })
    }
  },
})

function RouteComponent() {
  return (
    <GameProvider>
      <GameFeature />
    </GameProvider>
  )
}
