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
  publishedAt: string // ISO date
}
