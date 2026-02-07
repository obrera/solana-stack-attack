import { QueryClientProvider } from '@tanstack/react-query'
import {
  createSolanaDevnet,
  MobileWalletProvider,
} from '@wallet-ui/react-native-kit'
import { HeroUINativeProvider } from 'heroui-native'
import type { ReactNode } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { KeyboardProvider } from 'react-native-keyboard-controller'

import { GameProvider } from '@/features/game/data-access/game-provider'
import { UiThemeProvider } from '@/features/ui/data-access/ui-theme-provider'

import { queryClient } from '../util/core-orpc'

const cluster = createSolanaDevnet()
const identity = {
  name: 'Solana Mobile Stack',
  uri: 'https://solana.com',
  icon: 'favicon.png',
}

interface CoreProviderProps {
  children: ReactNode
}

export function CoreProvider({ children }: CoreProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <MobileWalletProvider cluster={cluster} identity={identity}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <KeyboardProvider>
            <UiThemeProvider>
              <HeroUINativeProvider>
                <GameProvider>{children}</GameProvider>
              </HeroUINativeProvider>
            </UiThemeProvider>
          </KeyboardProvider>
        </GestureHandlerRootView>
      </MobileWalletProvider>
    </QueryClientProvider>
  )
}
