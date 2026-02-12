import { relations, sql } from 'drizzle-orm'
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

import { user } from './auth'

export const reward = sqliteTable(
  'reward',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    milestoneId: text('milestone_id').notNull(),
    amount: integer('amount').notNull(),
    status: text('status', { enum: ['pending', 'claimed'] })
      .default('pending')
      .notNull(),
    claimedAt: integer('claimed_at', { mode: 'timestamp_ms' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    txSignature: text('tx_signature'),
  },
  (table) => [
    index('reward_userId_idx').on(table.userId),
    index('reward_userId_milestoneId_idx').on(table.userId, table.milestoneId),
  ],
)

export const rewardRelations = relations(reward, ({ one }) => ({
  user: one(user, {
    fields: [reward.userId],
    references: [user.id],
  }),
}))
