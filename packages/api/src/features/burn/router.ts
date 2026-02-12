import { ORPCError } from '@orpc/server'
import type { Address } from '@solana/kit'
import { db } from '@solana-stack-attack/db'
import { walletAddress } from '@solana-stack-attack/db/schema/auth'
import { burn } from '@solana-stack-attack/db/schema/burn'
import { env } from '@solana-stack-attack/env/server'
import {
  buildBurnTransaction,
  getTokenBalance,
  TOKEN_CONFIG,
} from '@solana-stack-attack/solana-client'
import { and, eq, sql } from 'drizzle-orm'
import z from 'zod'

import { protectedProcedure, publicProcedure } from '../../index'
import {
  BURN_UPGRADES,
  FUEL_CELL,
  getBurnUpgrade,
  getFuelCellCost,
} from './lib/burn-upgrades'

// Cache token balances for burn verification
const balanceCache = new Map<string, { balance: number; fetchedAt: number }>()
const CACHE_TTL_MS = 30_000 // 30 seconds

export const burnRouter = {
  /** Get all burn upgrade definitions */
  upgrades: publicProcedure.handler(async () => {
    return BURN_UPGRADES.map((u) => ({
      ...u,
      displayCost: u.cost / 10 ** TOKEN_CONFIG.decimals,
    }))
  }),

  /** Get current user's purchased burn upgrades */
  purchased: protectedProcedure.handler(async ({ context }) => {
    const userId = context.session.user.id

    const burns = await db
      .select({ upgradeId: burn.upgradeId })
      .from(burn)
      .where(eq(burn.userId, userId))

    return burns.map((b) => b.upgradeId)
  }),

  /** Get user's spendable STACK balance (on-chain token balance) */
  spendableBalance: protectedProcedure.handler(async ({ context }) => {
    const userId = context.session.user.id

    // Get user's wallet
    const [wallet] = await db
      .select()
      .from(walletAddress)
      .where(eq(walletAddress.userId, userId))
      .limit(1)

    if (!wallet) {
      return {
        spendable: 0,
        displaySpendable: 0,
        totalBurned: 0,
        displayTotalBurned: 0,
      }
    }

    // Get on-chain balance
    const { uiAmount } = await getTokenBalance(
      context.solana,
      env.TOKEN_MINT_ADDRESS as Address,
      wallet.address as Address,
    )

    // Get total burned from DB
    const [burnedResult] = await db
      .select({ total: sql<number>`coalesce(sum(${burn.amount}), 0)` })
      .from(burn)
      .where(eq(burn.userId, userId))

    const totalBurned = burnedResult?.total ?? 0

    return {
      spendable: Math.floor(uiAmount * 10 ** TOKEN_CONFIG.decimals),
      displaySpendable: uiAmount,
      totalBurned,
      displayTotalBurned: totalBurned / 10 ** TOKEN_CONFIG.decimals,
    }
  }),

  /**
   * Step 1: Build a burn transaction for the user to sign.
   * Server creates and fee-payer-signs the tx, returns base64 for client signing.
   */
  prepareBurn: protectedProcedure
    .input(z.object({ upgradeId: z.string() }))
    .handler(async ({ context, input }) => {
      const userId = context.session.user.id

      const upgrade = getBurnUpgrade(input.upgradeId)
      if (!upgrade) {
        throw new ORPCError('NOT_FOUND', { message: 'Upgrade not found' })
      }

      // Check not already purchased
      const [existing] = await db
        .select({ id: burn.id })
        .from(burn)
        .where(
          and(eq(burn.userId, userId), eq(burn.upgradeId, input.upgradeId)),
        )
        .limit(1)

      if (existing) {
        throw new ORPCError('BAD_REQUEST', {
          message: 'Upgrade already purchased',
        })
      }

      // Get user's wallet
      const [wallet] = await db
        .select()
        .from(walletAddress)
        .where(eq(walletAddress.userId, userId))
        .limit(1)

      if (!wallet) {
        throw new ORPCError('BAD_REQUEST', {
          message: 'No wallet address found.',
        })
      }

      // Check on-chain balance
      const { uiAmount } = await getTokenBalance(
        context.solana,
        env.TOKEN_MINT_ADDRESS as Address,
        wallet.address as Address,
      )

      // Cache pre-burn balance for verification
      balanceCache.set(userId, {
        balance: uiAmount,
        fetchedAt: Date.now(),
      })

      const requiredAmount = upgrade.cost / 10 ** TOKEN_CONFIG.decimals
      if (uiAmount < requiredAmount) {
        throw new ORPCError('BAD_REQUEST', {
          message: `Not enough STACK. Need ${requiredAmount}, have ${uiAmount}`,
        })
      }

      // Build the burn transaction (fee payer signs, user needs to co-sign)
      const { transaction } = await buildBurnTransaction(context.solana, {
        amount: BigInt(upgrade.cost),
        decimals: TOKEN_CONFIG.decimals,
        feePayer: context.feePayer,
        mint: env.TOKEN_MINT_ADDRESS as Address,
        owner: wallet.address as Address,
      })

      return {
        transaction,
        upgradeId: input.upgradeId,
        burnAmount: upgrade.cost,
        displayBurnAmount: requiredAmount,
      }
    }),

  /**
   * Step 2: Confirm the burn after user signed and sent the transaction.
   * Verifies the token balance decreased, then records the burn in DB.
   */
  confirmBurn: protectedProcedure
    .input(z.object({ upgradeId: z.string() }))
    .handler(async ({ context, input }) => {
      const userId = context.session.user.id

      const upgrade = getBurnUpgrade(input.upgradeId)
      if (!upgrade) {
        throw new ORPCError('NOT_FOUND', { message: 'Upgrade not found' })
      }

      // Check not already purchased
      const [existing] = await db
        .select({ id: burn.id })
        .from(burn)
        .where(
          and(eq(burn.userId, userId), eq(burn.upgradeId, input.upgradeId)),
        )
        .limit(1)

      if (existing) {
        throw new ORPCError('BAD_REQUEST', {
          message: 'Upgrade already purchased',
        })
      }

      // Get user's wallet
      const [wallet] = await db
        .select()
        .from(walletAddress)
        .where(eq(walletAddress.userId, userId))
        .limit(1)

      if (!wallet) {
        throw new ORPCError('BAD_REQUEST', {
          message: 'No wallet address found.',
        })
      }

      // Verify balance decreased
      const preBurn = balanceCache.get(userId)
      const { uiAmount: postBurnBalance } = await getTokenBalance(
        context.solana,
        env.TOKEN_MINT_ADDRESS as Address,
        wallet.address as Address,
      )

      const requiredAmount = upgrade.cost / 10 ** TOKEN_CONFIG.decimals

      if (preBurn && preBurn.fetchedAt > Date.now() - CACHE_TTL_MS) {
        const balanceDrop = preBurn.balance - postBurnBalance
        // Allow small tolerance for rounding
        if (balanceDrop < requiredAmount * 0.99) {
          throw new ORPCError('BAD_REQUEST', {
            message: 'Burn not detected on-chain. Please try again.',
          })
        }
      }

      // Clean up cache
      balanceCache.delete(userId)

      // Record the burn
      const [record] = await db
        .insert(burn)
        .values({
          userId,
          upgradeId: input.upgradeId,
          amount: upgrade.cost,
        })
        .returning()

      if (!record) {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'Failed to record burn',
        })
      }

      return {
        ...record,
        displayAmount: record.amount / 10 ** TOKEN_CONFIG.decimals,
      }
    }),

  /** Get fuel cell info (repeatable burn) */
  fuelCellInfo: protectedProcedure.handler(async ({ context }) => {
    const userId = context.session.user.id

    // Count how many times fuel cell has been purchased
    const burns = await db
      .select({ id: burn.id })
      .from(burn)
      .where(and(eq(burn.userId, userId), eq(burn.upgradeId, FUEL_CELL.id)))

    const timesPurchased = burns.length
    const cost = getFuelCellCost(timesPurchased)

    return {
      ...FUEL_CELL,
      timesPurchased,
      cost,
      displayCost: cost / 10 ** TOKEN_CONFIG.decimals,
    }
  }),

  /** Prepare a fuel cell burn transaction */
  prepareFuelCell: protectedProcedure.handler(async ({ context }) => {
    const userId = context.session.user.id

    // Get user's wallet
    const [wallet] = await db
      .select()
      .from(walletAddress)
      .where(eq(walletAddress.userId, userId))
      .limit(1)

    if (!wallet) {
      throw new ORPCError('BAD_REQUEST', {
        message: 'No wallet address found.',
      })
    }

    // Calculate cost
    const burns = await db
      .select({ id: burn.id })
      .from(burn)
      .where(and(eq(burn.userId, userId), eq(burn.upgradeId, FUEL_CELL.id)))

    const cost = getFuelCellCost(burns.length)

    // Check balance
    const { uiAmount } = await getTokenBalance(
      context.solana,
      env.TOKEN_MINT_ADDRESS as Address,
      wallet.address as Address,
    )

    balanceCache.set(userId, { balance: uiAmount, fetchedAt: Date.now() })

    const requiredAmount = cost / 10 ** TOKEN_CONFIG.decimals
    if (uiAmount < requiredAmount) {
      throw new ORPCError('BAD_REQUEST', {
        message: `Not enough STACK. Need ${requiredAmount}, have ${uiAmount}`,
      })
    }

    const { transaction } = await buildBurnTransaction(context.solana, {
      amount: BigInt(cost),
      decimals: TOKEN_CONFIG.decimals,
      feePayer: context.feePayer,
      mint: env.TOKEN_MINT_ADDRESS as Address,
      owner: wallet.address as Address,
    })

    return {
      transaction,
      upgradeId: FUEL_CELL.id,
      burnAmount: cost,
      displayBurnAmount: requiredAmount,
    }
  }),

  /** Confirm a fuel cell burn */
  confirmFuelCell: protectedProcedure.handler(async ({ context }) => {
    const userId = context.session.user.id

    const [wallet] = await db
      .select()
      .from(walletAddress)
      .where(eq(walletAddress.userId, userId))
      .limit(1)

    if (!wallet) {
      throw new ORPCError('BAD_REQUEST', {
        message: 'No wallet address found.',
      })
    }

    // Calculate expected cost
    const existingBurns = await db
      .select({ id: burn.id })
      .from(burn)
      .where(and(eq(burn.userId, userId), eq(burn.upgradeId, FUEL_CELL.id)))

    const cost = getFuelCellCost(existingBurns.length)

    // Verify balance decreased
    const preBurn = balanceCache.get(userId)
    const { uiAmount: postBurnBalance } = await getTokenBalance(
      context.solana,
      env.TOKEN_MINT_ADDRESS as Address,
      wallet.address as Address,
    )

    const requiredAmount = cost / 10 ** TOKEN_CONFIG.decimals
    if (preBurn && preBurn.fetchedAt > Date.now() - CACHE_TTL_MS) {
      const balanceDrop = preBurn.balance - postBurnBalance
      if (balanceDrop < requiredAmount * 0.99) {
        throw new ORPCError('BAD_REQUEST', {
          message: 'Burn not detected on-chain. Please try again.',
        })
      }
    }

    balanceCache.delete(userId)

    const [record] = await db
      .insert(burn)
      .values({ userId, upgradeId: FUEL_CELL.id, amount: cost })
      .returning()

    if (!record) {
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to record burn',
      })
    }

    return {
      ...record,
      displayAmount: record.amount / 10 ** TOKEN_CONFIG.decimals,
    }
  }),

  /** Get total burned per user for leaderboard */
  leaderboard: publicProcedure
    .input(
      z
        .object({ limit: z.number().int().min(1).max(100).default(10) })
        .optional(),
    )
    .handler(async ({ input }) => {
      const limit = input?.limit ?? 10

      const leaders = await db
        .select({
          userId: burn.userId,
          totalBurned: sql<number>`sum(${burn.amount})`.as('total_burned'),
        })
        .from(burn)
        .groupBy(burn.userId)
        .orderBy(sql`total_burned desc`)
        .limit(limit)

      return leaders.map((l) => ({
        ...l,
        displayTotalBurned: (l.totalBurned ?? 0) / 10 ** TOKEN_CONFIG.decimals,
      }))
    }),
}
