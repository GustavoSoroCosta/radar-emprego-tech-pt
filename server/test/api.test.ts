import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app.ts'
import { migrate } from '../src/db/migrate.ts'
import { createPool } from '../src/db/pool.ts'
import { saveSnapshot } from '../src/db/snapshots.ts'

// Real Postgres (docker compose up -d db). Never point this at production: it deletes rows.
const pool = createPool(process.env.TEST_DATABASE_URL ?? 'postgres://radar:radar@localhost:5433/radar_test')
const app = createApp(pool)

beforeAll(() => migrate(pool))
beforeEach(() => pool.query('TRUNCATE snapshots CASCADE'))
afterAll(() => pool.end())

/** Three days, 10 days apart: React grows, Angular shrinks, Vue only appears on the last day. */
async function seed() {
  await saveSnapshot(pool, '2026-10-01', {
    totalJobs: 100,
    juniorJobs: 5,
    counts: [
      { kind: 'tech', key: 'React', count: 20 },
      { kind: 'tech', key: 'Angular', count: 30 },
      { kind: 'city', key: 'Porto', count: 40 },
    ],
  })
  await saveSnapshot(pool, '2026-10-11', {
    totalJobs: 200,
    juniorJobs: 8,
    counts: [{ kind: 'tech', key: 'Angular', count: 50 }],
  })
  await saveSnapshot(pool, '2026-10-21', {
    totalJobs: 100,
    juniorJobs: 6,
    counts: [
      { kind: 'tech', key: 'React', count: 30 },
      { kind: 'tech', key: 'Angular', count: 20 },
      { kind: 'tech', key: 'Vue', count: 10 },
    ],
  })
}

describe('GET /api/snapshots/latest', () => {
  it('answers 404 before the first snapshot', async () => {
    const res = await request(app).get('/api/snapshots/latest')
    expect(res.status).toBe(404)
  })

  it('returns the newest day grouped by kind, biggest first', async () => {
    await seed()
    const res = await request(app).get('/api/snapshots/latest')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      date: '2026-10-21',
      totalJobs: 100,
      juniorJobs: 6,
      counts: {
        tech: [
          { key: 'React', count: 30 },
          { key: 'Angular', count: 20 },
          { key: 'Vue', count: 10 },
        ],
        area: [],
        city: [],
        work_mode: [],
      },
    })
  })
})

describe('GET /api/trends', () => {
  it('returns one point per day, with 0 on days the key was missing', async () => {
    await seed()
    const res = await request(app).get('/api/trends?kind=tech&key=React&days=90')
    expect(res.status).toBe(200)
    expect(res.body.series).toEqual([
      { date: '2026-10-01', count: 20, total: 100, share: 20 },
      { date: '2026-10-11', count: 0, total: 200, share: 0 },
      { date: '2026-10-21', count: 30, total: 100, share: 30 },
    ])
  })

  it('counts the window back from the latest snapshot', async () => {
    await seed()
    const res = await request(app).get('/api/trends?key=React&days=15')
    expect(res.body.series.map((p: { date: string }) => p.date)).toEqual(['2026-10-11', '2026-10-21'])
  })

  it.each([
    ['/api/trends', 'key is required'],
    ['/api/trends?key=React&kind=salary', 'kind must be one of'],
    ['/api/trends?key=React&days=3', 'days must be a whole number between 7 and 365'],
    ['/api/trends?key=React&days=abc', 'days must be a whole number'],
  ])('answers 400 for %s', async (url, message) => {
    const res = await request(app).get(url)
    expect(res.status).toBe(400)
    expect(res.body.error).toContain(message)
  })
})

describe('GET /api/trends/movers', () => {
  it('compares the first and last day of the window', async () => {
    await seed()
    const res = await request(app).get('/api/trends/movers?kind=tech&days=30')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      kind: 'tech',
      days: 30,
      from: '2026-10-01',
      to: '2026-10-21',
      up: [
        { key: 'React', from: 20, to: 30, change: 10 },
        { key: 'Vue', from: 0, to: 10, change: 10 },
      ],
      down: [{ key: 'Angular', from: 30, to: 20, change: -10 }],
    })
  })

  it('returns empty lists while there is only one day', async () => {
    await saveSnapshot(pool, '2026-10-21', { totalJobs: 100, juniorJobs: 6, counts: [] })
    const res = await request(app).get('/api/trends/movers')
    expect(res.body).toEqual({ kind: 'tech', days: 30, from: null, to: null, up: [], down: [] })
  })

  it('answers 400 for a limit above 20', async () => {
    const res = await request(app).get('/api/trends/movers?limit=50')
    expect(res.status).toBe(400)
  })
})
