import '@/global.css'

import { Stack } from 'expo-router'

import { CoreProvider } from '@/features/core/data-access/core-provider'

export const unstable_settings = {
  initialRouteName: '(tabs)',
}

export default function Layout() {
  return (
    <CoreProvider>
      <Stack screenOptions={{}}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ title: 'Modal', presentation: 'modal' }}
        />
      </Stack>
    </CoreProvider>
  )
}
