import type pg from 'pg'
import type { Snapshot } from '../snapshot/build.ts'

/**
 * Stores one day's snapshot in a single transaction. Running it twice on the same day
 * replaces that day, and a failure halfway leaves the previous data untouched.
 */
export async function saveSnapshot(pool: pg.Pool, takenOn: string, snapshot: Snapshot): Promise<number> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { rows } = await client.query<{ id: number }>(
      `INSERT INTO snapshots (taken_on, total_jobs, junior_jobs)
       VALUES ($1, $2, $3)
       ON CONFLICT (taken_on)
       DO UPDATE SET total_jobs = EXCLUDED.total_jobs, junior_jobs = EXCLUDED.junior_jobs, created_at = now()
       RETURNING id`,
      [takenOn, snapshot.totalJobs, snapshot.juniorJobs],
    )
    const id = rows[0].id

    await client.query('DELETE FROM snapshot_counts WHERE snapshot_id = $1', [id])
    if (snapshot.counts.length > 0) {
      // One round trip for all rows: Postgres expands the arrays into a table.
      await client.query(
        `INSERT INTO snapshot_counts (snapshot_id, kind, key, count)
         SELECT $1, * FROM unnest($2::text[], $3::text[], $4::int[])`,
        [
          id,
          snapshot.counts.map((c) => c.kind),
          snapshot.counts.map((c) => c.key),
          snapshot.counts.map((c) => c.count),
        ],
      )
    }

    await client.query('COMMIT')
    return id
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

/** Today's date in Portugal (YYYY-MM-DD), so a run just after midnight UTC is not filed under yesterday. */
export function todayInLisbon(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Lisbon' }).format(now)
}
