import { migrate } from '../db/migrate.ts'
import { createPool } from '../db/pool.ts'

const pool = createPool()
try {
  await migrate(pool)
  console.log('Schema is up to date.')
} finally {
  await pool.end()
}
