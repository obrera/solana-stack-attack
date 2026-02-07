import { Redirect } from 'expo-router'
import { Spinner } from 'heroui-native'
import type { ReactNode } from 'react'
import { View } from 'react-native'

import { useIsAuthenticated } from '../auth-client'

interface AuthGuardProps {
  children: ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isPending } = useIsAuthenticated()

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Spinner size="lg" />
      </View>
    )
  }

  if (!isAuthenticated) {
    return <Redirect href="/auth" />
  }

  return <>{children}</>
}
