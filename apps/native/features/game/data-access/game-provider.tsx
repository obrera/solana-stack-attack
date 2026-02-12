import type { GameClient } from '@solana-stack-attack/game-data-access/game-provider'
import {
  GameProvider as SharedGameProvider,
  useGameContext as useSharedGameContext,
} from '@solana-stack-attack/game-data-access/game-provider'
import * as Haptics from 'expo-haptics'
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import { Animated, AppState } from 'react-native'

import { useIsAuthenticated } from '@/features/auth/data-access/auth-client'
import { client } from '@/features/core/util/core-orpc'

function createGameClient(): GameClient {
  return {
    getState: async () => {
      const state = await client.game.getState()
      if (!state) return null
      return {
        ...state,
        updatedAt: state.updatedAt?.toISOString(),
      }
    },
    saveState: async (state) => {
      await client.game.saveState(state)
    },
    getMilestones: () => client.game.getMilestones(),
    getPurchasedBurnUpgrades: () => client.burn.purchased(),
  }
}

/**
 * Native-specific extensions to the shared game context.
 * Adds haptics, Animated tap bounce, and RN event handling.
 */
interface NativeGameContextValue {
  scaleAnim: Animated.Value
  handleTap: (event: {
    nativeEvent: { locationX: number; locationY: number }
  }) => void
}

const NativeGameContext = createContext<NativeGameContextValue | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useIsAuthenticated()
  const gameClient = useMemo(() => createGameClient(), [])

  return (
    <SharedGameProvider client={gameClient} isAuthenticated={isAuthenticated}>
      <NativeGameLayer>{children}</NativeGameLayer>
    </SharedGameProvider>
  )
}

function NativeGameLayer({ children }: { children: ReactNode }) {
  const { tap, saveGame, state } = useSharedGameContext()
  const scaleAnim = useRef(new Animated.Value(1)).current

  // Save on app background/close
  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextState: string) => {
        if (nextState === 'background' || nextState === 'inactive') {
          saveGame()
        }
      },
    )
    return () => subscription.remove()
  }, [saveGame])

  // Haptic feedback on milestone celebration
  useEffect(() => {
    if (state.pendingCelebration) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    }
  }, [state.pendingCelebration])

  // Native tap handler: calls shared tap() + adds haptics + animation
  const handleTap = useCallback(
    (event: { nativeEvent: { locationX: number; locationY: number } }) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

      const { locationX, locationY } = event.nativeEvent
      tap(locationX, locationY)

      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start()
    },
    [tap, scaleAnim],
  )

  const value = useMemo(
    () => ({ scaleAnim, handleTap }),
    [scaleAnim, handleTap],
  )

  return (
    <NativeGameContext.Provider value={value}>
      {children}
    </NativeGameContext.Provider>
  )
}

function useNativeGameContext(): NativeGameContextValue {
  const context = useContext(NativeGameContext)
  if (!context) {
    throw new Error(
      'useNativeGameContext must be used within a NativeGameLayer',
    )
  }
  return context
}

/**
 * Combined hook: shared game context + native extensions.
 * Drop-in replacement for the old useGameContext.
 */
export function useGameContext() {
  const shared = useSharedGameContext()
  const native = useNativeGameContext()
  return { ...shared, ...native }
}
