// Daily job: fetch the itjobs listings, reduce them to counts and store today's snapshot.
// Run with `npm run snapshot` (needs ITJOBS_API_KEY and DATABASE_URL).
import { fetchAllJobs } from '../../../src/lib/itjobs.ts'
import { toJob } from '../../../src/lib/normalize.ts'
import { createPool } from '../db/pool.ts'
import { saveSnapshot, todayInLisbon } from '../db/snapshots.ts'
import { buildSnapshot } from '../snapshot/build.ts'

const apiKey = process.env.ITJOBS_API_KEY
if (!apiKey) throw new Error('ITJOBS_API_KEY is not set')

const jobs = (await fetchAllJobs(apiKey)).map(toJob)
const snapshot = buildSnapshot(jobs)
const takenOn = todayInLisbon()

const pool = createPool()
try {
  await saveSnapshot(pool, takenOn, snapshot)
  console.log(`Saved snapshot for ${takenOn}: ${snapshot.totalJobs} jobs, ${snapshot.counts.length} counts.`)
} finally {
  await pool.end()
}
