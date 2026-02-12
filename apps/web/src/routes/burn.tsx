import { createFileRoute, redirect } from '@tanstack/react-router'

import { BurnFeatureShop } from '@/features/burn/burn-feature-shop'
import { getUser } from '@/functions/get-user'

export const Route = createFileRoute('/burn')({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await getUser()
    if (!session) {
      throw redirect({ to: '/' })
    }
  },
})

function RouteComponent() {
  return <BurnFeatureShop />
}
