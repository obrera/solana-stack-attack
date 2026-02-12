import { relations, sql } from 'drizzle-orm'
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

import { user } from './auth'

export const burn = sqliteTable(
  'burn',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    upgradeId: text('upgrade_id').notNull(),
    amount: integer('amount').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    index('burn_userId_idx').on(table.userId),
    index('burn_userId_upgradeId_idx').on(table.userId, table.upgradeId),
  ],
)

export const burnRelations = relations(burn, ({ one }) => ({
  user: one(user, {
    fields: [burn.userId],
    references: [user.id],
  }),
}))
