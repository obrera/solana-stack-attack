import { Card } from 'heroui-native'
import { Pressable, Text } from 'react-native'

import { queryClient } from '@/features/core/util/core-orpc'

import { authClient, useIsAuthenticated } from '../data-access/auth-client'

export function AuthUiUserMenu() {
  const { user } = useIsAuthenticated()

  if (!user) return null

  return (
    <Card variant="secondary" className="p-4">
      <Text className="mb-2 text-base text-foreground">
        Welcome, <Text className="font-medium">{user.name}</Text>
      </Text>
      <Text className="mb-4 text-muted text-sm">{user.email}</Text>
      <Pressable
        className="self-start rounded-lg bg-danger px-4 py-3 active:opacity-70"
        onPress={() => {
          authClient.signOut()
          queryClient.invalidateQueries()
        }}
      >
        <Text className="font-medium text-foreground">Sign Out</Text>
      </Pressable>
    </Card>
  )
}
