import { Redirect } from 'expo-router'
import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'

import { Container } from '@/components/container'
import { SignInForm, SignUpForm, useIsAuthenticated } from '@/features/auth'

export default function AuthScreen() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const { isAuthenticated, isPending } = useIsAuthenticated()

  // Redirect to home if already authenticated
  if (!isPending && isAuthenticated) {
    return <Redirect href="/" />
  }

  return (
    <Container className="flex-1 justify-center p-6">
      <View className="mb-8">
        <Text className="mb-2 text-center font-bold text-4xl text-foreground">
          Stack Attack
        </Text>
        <Text className="text-center text-muted">Sign in to start playing</Text>
      </View>

      {mode === 'signin' ? <SignInForm /> : <SignUpForm />}

      <View className="mt-6 flex-row justify-center">
        <Text className="text-muted">
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
    </Container>
  )
}
