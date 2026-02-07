import { relations, sql } from 'drizzle-orm'
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

import { user } from './auth'

export const gameState = sqliteTable(
  'game_state',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' })
      .unique(),
    score: integer('score').default(0).notNull(),
    totalTaps: integer('total_taps').default(0).notNull(),
    // Store owned upgrades as JSON: [{ id: string, level: number }]
    ownedUpgrades: text('owned_upgrades', { mode: 'json' })
      .$type<Array<{ id: string; level: number }>>()
      .default([])
      .notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('game_state_userId_idx').on(table.userId)],
)

export const gameStateRelations = relations(gameState, ({ one }) => ({
  user: one(user, {
    fields: [gameState.userId],
    references: [user.id],
  }),
}))
