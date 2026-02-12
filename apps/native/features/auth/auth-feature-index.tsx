import { Ionicons } from '@expo/vector-icons'
import { Redirect } from 'expo-router'
import { useThemeColor } from 'heroui-native'
import { Text, View } from 'react-native'

import { UiContainer } from '@/features/ui/ui/ui-container'

import { useIsAuthenticated } from './data-access/auth-client'
import { AuthUiSolanaSignInButton } from './ui/auth-ui-solana-sign-in-button'

export function AuthFeatureIndex() {
  const { isAuthenticated, isPending } = useIsAuthenticated()
  const accentColor = useThemeColor('success')

  // Redirect to home if already authenticated
  if (!isPending && isAuthenticated) {
    return <Redirect href="/" />
  }

  return (
    <UiContainer>
      <View className="flex-1 items-center justify-center p-8">
        {/* Game icon */}
        <View className="mb-6 h-28 w-28 items-center justify-center rounded-full bg-success/10">
          <Ionicons name="diamond" size={56} color={accentColor} />
        </View>

        {/* Title */}
        <Text className="mb-2 text-center font-bold text-5xl text-foreground">
          Stack Attack
        </Text>
        <Text className="mb-1 text-center text-lg text-success">
          Tap. Stack. Earn.
        </Text>
        <Text className="mb-12 text-center text-muted text-sm">
          Connect your wallet to start stacking
        </Text>

        {/* Sign in button */}
        <View className="w-full">
          <AuthUiSolanaSignInButton />
        </View>

        {/* Footer */}
        <Text className="mt-8 text-center text-muted/50 text-xs">
          Built on Solana ⚡
        </Text>
      </View>
    </UiContainer>
  )
}
