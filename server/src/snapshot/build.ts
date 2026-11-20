import { countBy } from '../../../src/lib/aggregate.ts'
import type { Job } from '../../../src/lib/types.ts'

export type CountKind = 'tech' | 'area' | 'city' | 'work_mode'

export interface SnapshotCount {
  kind: CountKind
  key: string
  count: number
}

export interface Snapshot {
  totalJobs: number
  juniorJobs: number
  counts: SnapshotCount[]
}

// Every key is kept (not just a top 10): a technology that is small today may be the riser next month.
const ALL = Number.POSITIVE_INFINITY

/** Reduces a day's jobs to the aggregated numbers we store. Same counting rules as the site. */
export function buildSnapshot(jobs: Job[]): Snapshot {
  const kinds: Record<CountKind, (job: Job) => string[]> = {
    tech: (job) => job.technologies,
    area: (job) => [job.area],
    city: (job) => job.cities,
    // Jobs without a work model are left out rather than invented.
    work_mode: (job) => (job.workMode ? [job.workMode] : []),
  }

  const counts = (Object.keys(kinds) as CountKind[]).flatMap((kind) =>
    countBy(jobs, kinds[kind], ALL).map(({ label, count }) => ({ kind, key: label, count })),
  )

  return {
    totalJobs: jobs.length,
    juniorJobs: jobs.filter((job) => job.junior).length,
    counts,
  }
}
