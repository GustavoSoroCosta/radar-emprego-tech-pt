import { readFile } from 'node:fs/promises'
import type pg from 'pg'

/** Applies schema.sql. Every statement is idempotent, so running it twice is safe. */
export async function migrate(pool: pg.Pool): Promise<void> {
  const sql = await readFile(new URL('./schema.sql', import.meta.url), 'utf8')
  await pool.query(sql)
}
