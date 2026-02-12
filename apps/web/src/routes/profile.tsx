import { createFileRoute, redirect } from '@tanstack/react-router'

import { ProfileFeature } from '@/features/profile/profile-feature'
import { getUser } from '@/functions/get-user'

export const Route = createFileRoute('/profile')({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await getUser()
    if (!session) {
      throw redirect({ to: '/' })
    }
  },
})

function RouteComponent() {
  return <ProfileFeature />
}
