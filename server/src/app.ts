import express from 'express'
import type pg from 'pg'
import { getKeySeries, getLatestSnapshot, getWindowEnds } from './db/read.ts'
import { BadRequest, parseInteger, parseKey, parseKind } from './http/params.ts'
import { findMovers, toSeries } from './trends/math.ts'

/** Builds the Express app around a database pool, so tests can pass their own. */
export function createApp(db: pg.Pool): express.Express {
  const app = express()

  app.get('/api/health', async (_req, res) => {
    try {
      const { rows } = await db.query<{ last: string | null }>(
        "SELECT to_char(max(taken_on), 'YYYY-MM-DD') AS last FROM snapshots",
      )
      res.json({ ok: true, lastSnapshot: rows[0]?.last ?? null })
    } catch (error) {
      console.error('Health check failed:', error)
      res.status(503).json({ ok: false, error: 'Database unavailable' })
    }
  })

  app.get('/api/snapshots/latest', async (_req, res) => {
    const latest = await getLatestSnapshot(db)
    if (!latest) {
      res.status(404).json({ error: 'No snapshot yet' })
      return
    }
    res.json(latest)
  })

  app.get('/api/trends', async (req, res) => {
    const kind = parseKind(req.query)
    const key = parseKey(req.query)
    const days = parseInteger(req.query, 'days', { min: 7, max: 365, fallback: 90 })
    res.json({ kind, key, days, series: toSeries(await getKeySeries(db, kind, key, days)) })
  })

  app.get('/api/trends/movers', async (req, res) => {
    const kind = parseKind(req.query)
    const days = parseInteger(req.query, 'days', { min: 7, max: 365, fallback: 30 })
    const limit = parseInteger(req.query, 'limit', { min: 1, max: 20, fallback: 5 })

    const ends = await getWindowEnds(db, kind, days)
    // With a single day there is nothing to compare yet: empty lists, not an error.
    if (!ends) {
      res.json({ kind, days, from: null, to: null, up: [], down: [] })
      return
    }
    res.json({ kind, days, from: ends.from, to: ends.to, ...findMovers(ends.first, ends.last, { limit }) })
  })

  // Express 5 sends errors thrown in async handlers here.
  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (error instanceof BadRequest) {
      res.status(400).json({ error: error.message })
      return
    }
    console.error('Request failed:', error)
    res.status(500).json({ error: 'Internal server error' })
  })

  return app
}
