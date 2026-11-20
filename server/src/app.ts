import express from 'express'
import type pg from 'pg'

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

  return app
}
