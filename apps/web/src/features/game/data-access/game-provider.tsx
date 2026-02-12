import type { GameClient } from '@solana-stack-attack/game-data-access/game-provider'
import {
  GameProvider as SharedGameProvider,
  useGameContext,
} from '@solana-stack-attack/game-data-access/game-provider'
import { type ReactNode, useEffect, useMemo } from 'react'

import { authClient } from '@/lib/auth-client'
import { client } from '@/utils/orpc'

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
 * Web GameProvider — wraps the shared provider with:
 * - oRPC client wiring
 * - Auth session
 * - visibilitychange save-on-background
 */
export function GameProvider({ children }: { children: ReactNode }) {
  const { data: session } = authClient.useSession()
  const isAuthenticated = !!session?.user
  const gameClient = useMemo(() => createGameClient(), [])

  return (
    <SharedGameProvider client={gameClient} isAuthenticated={isAuthenticated}>
      <WebGameBehavior />
      {children}
    </SharedGameProvider>
  )
}

function WebGameBehavior() {
  const { saveGame } = useGameContext()

  // Save on tab hide/close
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        saveGame()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [saveGame])

  return null
}

export { useGameContext } from '@solana-stack-attack/game-data-access/game-provider'
