import pg from 'pg'

/** Opens a connection pool. Fails fast when DATABASE_URL is missing instead of guessing a database. */
export function createPool(connectionString = process.env.DATABASE_URL): pg.Pool {
  if (!connectionString) throw new Error('DATABASE_URL is not set (see server/.env.example)')
  return new pg.Pool({ connectionString })
}
