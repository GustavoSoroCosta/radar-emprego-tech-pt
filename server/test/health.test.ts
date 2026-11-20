import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app.ts'
import { migrate } from '../src/db/migrate.ts'
import { createPool } from '../src/db/pool.ts'

// Runs against a real Postgres (docker compose up -d db). Never point this at production: it deletes rows.
const pool = createPool(process.env.TEST_DATABASE_URL ?? 'postgres://radar:radar@localhost:5433/radar_test')
const app = createApp(pool)

beforeAll(() => migrate(pool))
beforeEach(() => pool.query('TRUNCATE snapshots CASCADE'))
afterAll(() => pool.end())

describe('GET /api/health', () => {
  it('reports no snapshot on an empty database', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ ok: true, lastSnapshot: null })
  })

  it('reports the most recent snapshot day', async () => {
    await pool.query(
      "INSERT INTO snapshots (taken_on, total_jobs, junior_jobs) VALUES ('2026-11-18', 800, 25), ('2026-11-19', 810, 27)",
    )
    const res = await request(app).get('/api/health')
    expect(res.body).toEqual({ ok: true, lastSnapshot: '2026-11-19' })
  })

  it('answers 503 when the database is down', async () => {
    const broken = createPool('postgres://nobody:wrong@localhost:1/none')
    const res = await request(createApp(broken)).get('/api/health')
    expect(res.status).toBe(503)
    expect(res.body.ok).toBe(false)
    await broken.end()
  })
})
