import type { Area, Job, WorkMode } from './types'

export interface CountItem {
  label: string
  count: number
  /** A catch-all bucket ("Outras") that is shown for completeness but drawn in grey. */
  muted?: boolean
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

/**
 * What tends to come with a technology: among the jobs that ask for it, how many also ask for
 * each other technology. Answers "if I learn X, what should I learn next?".
 */
export function relatedTechnologies(jobs: Job[], technology: string, limit = 6) {
  const withTechnology = jobs.filter((job) => job.technologies.includes(technology))
  const related = countBy(withTechnology, (job) => job.technologies.filter((t) => t !== technology), limit)
  return { jobs: withTechnology, related }
}

export const WORK_MODE_LABELS: Record<WorkMode, string> = {
  onsite: 'Presencial',
  hybrid: 'Híbrido',
  remote: 'Remoto',
}

// Order used by the filter buttons: the developer areas first, "Outras" last.
export const AREA_LABELS: Record<Area, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  fullstack: 'Fullstack',
  mobile: 'Mobile',
  data: 'Dados e IA',
  devops: 'DevOps e cloud',
  qa: 'QA e testes',
  other: 'Outras',
}

/**
 * Jobs per area, with "Outras" moved to the end and muted. It is the biggest bucket, but
 * "Outras lidera" would tell the reader nothing; the named areas are the story.
 */
export function countAreas(jobs: Job[]): CountItem[] {
  const counts = countBy(jobs, (job) => [AREA_LABELS[job.area]])
  const other = counts.filter((item) => item.label === AREA_LABELS.other).map((item) => ({ ...item, muted: true }))
  return [...counts.filter((item) => item.label !== AREA_LABELS.other), ...other]
}

/** Number of different companies behind a set of jobs. */
export function countCompanies(jobs: Job[]): number {
  return new Set(jobs.map((job) => job.company).filter(Boolean)).size
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
