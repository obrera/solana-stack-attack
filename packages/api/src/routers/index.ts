import type { RouterClient } from '@orpc/server'
import { burnRouter } from '../features/burn'
import { gameRouter } from '../features/game'
import { rewardRouter } from '../features/reward'
import { protectedProcedure, publicProcedure } from '../index'
import { feePayerRouter } from './fee-payer'
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
  burn: burnRouter,
  feePayer: feePayerRouter,
  game: gameRouter,
  reward: rewardRouter,
  solana: solanaRouter,
  todo: todoRouter,
}
export type AppRouter = typeof appRouter
export type AppRouterClient = RouterClient<typeof appRouter>
