import { Redirect } from 'expo-router'
import { Text, View } from 'react-native'

import { UiContainer } from '@/features/ui/ui/ui-container'

import { useIsAuthenticated } from './data-access/auth-client'
import { AuthUiSolanaSignInButton } from './ui/auth-ui-solana-sign-in-button'

export function AuthFeatureIndex() {
  const { isAuthenticated, isPending } = useIsAuthenticated()

  // Redirect to home if already authenticated
  if (!isPending && isAuthenticated) {
    return <Redirect href="/" />
  }

  return (
    <UiContainer className="flex-1 justify-center p-6">
      <View className="mb-8">
        <Text className="mb-2 text-center font-bold text-4xl text-foreground">
          Stack Attack
        </Text>
        <Text className="text-center text-muted">
          Connect your wallet to start playing
        </Text>
      </View>

      <AuthUiSolanaSignInButton />
    </UiContainer>
  )
}
