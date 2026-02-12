import { createFileRoute, redirect } from '@tanstack/react-router'

import { GameFeatureIndex } from '@/features/game/game-feature-index'
import { getUser } from '@/functions/get-user'

export const Route = createFileRoute('/game')({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await getUser()
    if (!session) {
      throw redirect({ to: '/' })
    }
  },
})

function RouteComponent() {
  return <GameFeatureIndex />
}
