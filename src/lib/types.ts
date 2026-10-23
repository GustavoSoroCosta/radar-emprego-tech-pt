export type WorkMode = 'onsite' | 'hybrid' | 'remote'

export type Area = 'frontend' | 'backend' | 'fullstack' | 'mobile' | 'data' | 'devops' | 'qa' | 'other'

/** A job posting already reduced to the fields the dashboard needs. */
export interface Job {
  id: number
  title: string
  company: string
  cities: string[]
  workMode: WorkMode | null
  technologies: string[]
  junior: boolean
  area: Area
  publishedAt: string // starts with YYYY-MM-DD; itjobs adds the time ("2026-10-17 14:05:00")
  /** The ad on itjobs.pt. Missing for the sample data, which are not real jobs. */
  url?: string
}
