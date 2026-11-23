import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { migrate } from '../src/db/migrate.ts'
import { createPool } from '../src/db/pool.ts'
import { saveSnapshot, todayInLisbon } from '../src/db/snapshots.ts'
import type { Snapshot } from '../src/snapshot/build.ts'

// Real Postgres (docker compose up -d db). Never point this at production: it deletes rows.
const pool = createPool(process.env.TEST_DATABASE_URL ?? 'postgres://radar:radar@localhost:5433/radar_test')

beforeAll(() => migrate(pool))
beforeEach(() => pool.query('TRUNCATE snapshots CASCADE'))
afterAll(() => pool.end())

const snapshot: Snapshot = {
  totalJobs: 800,
  juniorJobs: 25,
  counts: [
    { kind: 'tech', key: 'React', count: 150 },
    { kind: 'area', key: 'frontend', count: 40 },
  ],
}

async function countsFor(day: string) {
  const { rows } = await pool.query(
    `SELECT c.kind, c.key, c.count FROM snapshot_counts c
     JOIN snapshots s ON s.id = c.snapshot_id WHERE s.taken_on = $1 ORDER BY c.kind, c.key`,
    [day],
  )
  return rows
}

describe('saveSnapshot', () => {
  it('stores the totals and every count', async () => {
    await saveSnapshot(pool, '2026-11-22', snapshot)
    const { rows } = await pool.query("SELECT total_jobs, junior_jobs FROM snapshots WHERE taken_on = '2026-11-22'")
    expect(rows).toEqual([{ total_jobs: 800, junior_jobs: 25 }])
    expect(await countsFor('2026-11-22')).toEqual([
      { kind: 'area', key: 'frontend', count: 40 },
      { kind: 'tech', key: 'React', count: 150 },
    ])
  })

  it('replaces the day when it runs twice', async () => {
    await saveSnapshot(pool, '2026-11-22', snapshot)
    await saveSnapshot(pool, '2026-11-22', { totalJobs: 810, juniorJobs: 26, counts: [{ kind: 'tech', key: 'Vue', count: 9 }] })
    const { rows } = await pool.query('SELECT count(*)::int AS n, max(total_jobs) AS total FROM snapshots')
    expect(rows[0]).toEqual({ n: 1, total: 810 })
    expect(await countsFor('2026-11-22')).toEqual([{ kind: 'tech', key: 'Vue', count: 9 }])
  })

  it('leaves the previous data untouched when a count is invalid', async () => {
    await saveSnapshot(pool, '2026-11-22', snapshot)
    const broken: Snapshot = { totalJobs: 1, juniorJobs: 0, counts: [{ kind: 'tech', key: 'X', count: -1 }] }
    await expect(saveSnapshot(pool, '2026-11-22', broken)).rejects.toThrow()
    expect(await countsFor('2026-11-22')).toHaveLength(2)
  })

  it('handles a day with no counts', async () => {
    await saveSnapshot(pool, '2026-11-23', { totalJobs: 0, juniorJobs: 0, counts: [] })
    expect(await countsFor('2026-11-23')).toEqual([])
  })
})

describe('todayInLisbon', () => {
  it('uses the Portuguese date, not UTC', () => {
    // 23:30 UTC on 31 March 2027 is already 1 April in Lisbon (summer time, UTC+1).
    expect(todayInLisbon(new Date('2027-03-31T23:30:00Z'))).toBe('2027-04-01')
    expect(todayInLisbon(new Date('2026-11-22T23:30:00Z'))).toBe('2026-11-22')
  })
})
