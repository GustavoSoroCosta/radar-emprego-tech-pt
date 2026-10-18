export type WorkMode = 'onsite' | 'hybrid' | 'remote'

/** A job posting already reduced to the fields the dashboard needs. */
export interface Job {
  id: number
  title: string
  company: string
  cities: string[]
  workMode: WorkMode | null
  technologies: string[]
  junior: boolean
  publishedAt: string // ISO date
}
