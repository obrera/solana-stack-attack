import type { RouterClient } from '@orpc/server'

import { protectedProcedure, publicProcedure } from '../index'
import { gameRouter } from './game'
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
  todo: todoRouter,
  solana: solanaRouter,
}
export type AppRouter = typeof appRouter
export type AppRouterClient = RouterClient<typeof appRouter>
