import type { Job } from './types'

export interface CountItem {
  label: string
  count: number
}

/** Counts how many jobs ask for each technology, most requested first. */
export function countTechnologies(jobs: Job[], limit = 10): CountItem[] {
  const counts = new Map<string, number>()
  for (const job of jobs) {
    // A job that mentions React twice still counts as one job asking for React.
    for (const tech of new Set(job.technologies)) {
      counts.set(tech, (counts.get(tech) ?? 0) + 1)
    }
  }
  return [...counts]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, limit)
}
