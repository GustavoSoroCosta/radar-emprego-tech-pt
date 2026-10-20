import type { Job, WorkMode } from './types'

export interface CountItem {
  label: string
  count: number
}

/** Counts jobs per key (a job with several keys counts once for each), most common first. */
export function countBy(jobs: Job[], keysOf: (job: Job) => string[], limit = 10): CountItem[] {
  const counts = new Map<string, number>()
  for (const job of jobs) {
    // A job that mentions React twice still counts as one job asking for React.
    for (const key of new Set(keysOf(job))) {
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
  }
  return [...counts]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, limit)
}

/** Counts how many jobs ask for each technology, most requested first. */
export function countTechnologies(jobs: Job[], limit = 10): CountItem[] {
  return countBy(jobs, (job) => job.technologies, limit)
}

export const WORK_MODE_LABELS: Record<WorkMode, string> = {
  onsite: 'Presencial',
  hybrid: 'Híbrido',
  remote: 'Remoto',
}

export function countWorkModes(jobs: Job[]): CountItem[] {
  return countBy(jobs, (job) => [job.workMode ? WORK_MODE_LABELS[job.workMode] : 'Não indicado'])
}

/** "1 vaga" / "3 vagas": the count with the right Portuguese plural. */
export function jobsLabel(count: number): string {
  return `${count} ${count === 1 ? 'vaga' : 'vagas'}`
}

/** Share of `part` in `total` as a whole percentage, 0 when there is nothing to divide. */
export function percent(part: number, total: number): number {
  return total === 0 ? 0 : Math.round((part / total) * 100)
}
