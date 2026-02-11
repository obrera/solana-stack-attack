import { Redirect } from 'expo-router'
import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'

import { UiContainer } from '@/features/ui/ui/ui-container'

import { useIsAuthenticated } from './data-access/auth-client'
import { AuthUiSignInForm } from './ui/auth-ui-sign-in-form'
import { AuthUiSignUpForm } from './ui/auth-ui-sign-up-form'
import { AuthUiSolanaSignInButton } from './ui/auth-ui-solana-sign-in-button'

export function AuthFeatureIndex() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
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
        <Text className="text-center text-muted">Sign in to start playing</Text>
      </View>

      {mode === 'signin' ? <AuthUiSignInForm /> : <AuthUiSignUpForm />}

      <View className="my-6 flex-row items-center">
        <View className="h-px flex-1 bg-muted" />
        <Text className="mx-4 text-muted">or</Text>
        <View className="h-px flex-1 bg-muted" />
      </View>

      <AuthUiSolanaSignInButton />

      <View className="mt-6 flex-row justify-center">
        <Text
          className="text-muted"
          onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
        >
          {mode === 'signin'
            ? "Don't have an account? "
            : 'Already have an account? '}
        </Text>
        <Pressable
          onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
        >
          <Text className="font-medium text-primary">
            {mode === 'signin' ? 'Sign Up' : 'Sign In'}
          </Text>
        </Pressable>
      </View>
    </UiContainer>
  )
}
