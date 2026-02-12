import type { RouterClient } from '@orpc/server'
import { gameRouter } from '../features/game'
import { rewardRouter } from '../features/reward'
import { protectedProcedure, publicProcedure } from '../index'
import { solanaRouter } from './solana'
import { todoRouter } from './todo'

export const appRouter = {
  healthCheck: publicProcedure.handler(() => {
    return 'OK'
  }),
  privateData: protectedProcedure.handler(({ context }) => {
    return {
      message: 'This is private',
      user: context.session?.user,
    }
  }),
  game: gameRouter,
  reward: rewardRouter,
  solana: solanaRouter,
  todo: todoRouter,
}
export type AppRouter = typeof appRouter
export type AppRouterClient = RouterClient<typeof appRouter>
