import type pg from 'pg'
import type { CountKind } from '../snapshot/build.ts'
import type { DayCount, DayTotals } from '../trends/math.ts'

export interface LatestSnapshot {
  date: string
  totalJobs: number
  juniorJobs: number
  counts: Record<CountKind, { key: string; count: number }[]>
}

/** The most recent day with every count grouped by kind, biggest first. Null on an empty database. */
export async function getLatestSnapshot(db: pg.Pool): Promise<LatestSnapshot | null> {
  const { rows } = await db.query<{ id: number; date: string; total_jobs: number; junior_jobs: number }>(
    `SELECT id, to_char(taken_on, 'YYYY-MM-DD') AS date, total_jobs, junior_jobs
     FROM snapshots ORDER BY taken_on DESC LIMIT 1`,
  )
  const day = rows[0]
  if (!day) return null

  const counts: LatestSnapshot['counts'] = { tech: [], area: [], city: [], work_mode: [] }
  const result = await db.query<{ kind: CountKind; key: string; count: number }>(
    'SELECT kind, key, count FROM snapshot_counts WHERE snapshot_id = $1 ORDER BY count DESC, key',
    [day.id],
  )
  for (const row of result.rows) counts[row.kind].push({ key: row.key, count: row.count })

  return { date: day.date, totalJobs: day.total_jobs, juniorJobs: day.junior_jobs, counts }
}

/**
 * One key per day over the last `days` days, counted back from the latest snapshot
 * (not from today, so a missed daily run does not empty the chart).
 * Days where the key had no jobs come back with count 0 instead of disappearing.
 */
export async function getKeySeries(db: pg.Pool, kind: CountKind, key: string, days: number): Promise<DayCount[]> {
  const { rows } = await db.query<DayCount>(
    `SELECT to_char(s.taken_on, 'YYYY-MM-DD') AS date, COALESCE(c.count, 0) AS count, s.total_jobs AS total
     FROM snapshots s
     LEFT JOIN snapshot_counts c ON c.snapshot_id = s.id AND c.kind = $1 AND c.key = $2
     WHERE s.taken_on > (SELECT max(taken_on) FROM snapshots) - $3::int
     ORDER BY s.taken_on`,
    [kind, key, days],
  )
  return rows
}

/** First and last day of the window with all counts of one kind, ready for findMovers. Null with fewer than 2 days. */
export async function getWindowEnds(
  db: pg.Pool,
  kind: CountKind,
  days: number,
): Promise<{ from: string; to: string; first: DayTotals; last: DayTotals } | null> {
  const { rows } = await db.query<{ id: number; date: string; total_jobs: number }>(
    `SELECT id, to_char(taken_on, 'YYYY-MM-DD') AS date, total_jobs FROM snapshots
     WHERE taken_on > (SELECT max(taken_on) FROM snapshots) - $1::int
     ORDER BY taken_on`,
    [days],
  )
  if (rows.length < 2) return null
  const ends = [rows[0], rows[rows.length - 1]]

  const totals = await Promise.all(
    ends.map(async (day): Promise<DayTotals> => {
      const result = await db.query<{ key: string; count: number }>(
        'SELECT key, count FROM snapshot_counts WHERE snapshot_id = $1 AND kind = $2',
        [day.id, kind],
      )
      return { total: day.total_jobs, counts: Object.fromEntries(result.rows.map((r) => [r.key, r.count])) }
    }),
  )
  return { from: ends[0].date, to: ends[1].date, first: totals[0], last: totals[1] }
}
