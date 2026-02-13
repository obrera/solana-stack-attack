import { db } from '@solana-stack-attack/db'
import { migrate } from 'drizzle-orm/libsql/migrator'

import app from './index'

const port = Number(process.env.PORT ?? 3000)

async function main() {
  console.log('Running migrations...')
  await migrate(db, { migrationsFolder: './migrations' })
  console.log('Migrations complete.')

  Bun.serve({
    fetch: app.fetch,
    port,
  })

  console.log(`Server running at http://localhost:${port}`)
}

main().catch((error) => {
  console.error('Failed to start server:', error)
  process.exit(1)
})
