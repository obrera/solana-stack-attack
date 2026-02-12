import { createFileRoute, redirect } from '@tanstack/react-router'

import { GameFeatureShop } from '@/features/game/game-feature-shop'
import { getUser } from '@/functions/get-user'

export const Route = createFileRoute('/shop')({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await getUser()
    if (!session) {
      throw redirect({ to: '/login' })
    }
  },
})

function RouteComponent() {
  return <GameFeatureShop />
}
