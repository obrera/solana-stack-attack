import { expoClient } from '@better-auth/expo/client'
import { solanaAuthClient } from '@solana-stack-attack/better-auth-solana/client'
import { env } from '@solana-stack-attack/env/native'
import { createAuthClient } from 'better-auth/react'
import Constants from 'expo-constants'
import * as SecureStore from 'expo-secure-store'

export const authClient = createAuthClient({
  baseURL: env.EXPO_PUBLIC_SERVER_URL,
  plugins: [
    solanaAuthClient(),
    expoClient({
      scheme: Constants.expoConfig?.scheme as string,
      storagePrefix: Constants.expoConfig?.scheme as string,
      storage: SecureStore,
    }),
  ],
})

export function useSession() {
  return authClient.useSession()
}

export function useIsAuthenticated() {
  const { data: session, isPending } = authClient.useSession()
  return {
    isAuthenticated: !!session?.user,
    isPending,
    user: session?.user,
    session,
  }
}
