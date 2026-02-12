import type { RouterClient } from '@orpc/server'
import { burnRouter } from '../features/burn'
import { gameRouter } from '../features/game'
import { rewardRouter } from '../features/reward'
import { publicProcedure } from '../index'
import { feePayerRouter } from './fee-payer'

export const appRouter = {
  healthCheck: publicProcedure.handler(() => {
    return 'OK'
  }),
  burn: burnRouter,
  feePayer: feePayerRouter,
  game: gameRouter,
  reward: rewardRouter,
}
export type AppRouter = typeof appRouter
export type AppRouterClient = RouterClient<typeof appRouter>
