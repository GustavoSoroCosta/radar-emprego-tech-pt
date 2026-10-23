import type { Area, Job, WorkMode } from './types'

export type AreaFilter = Area | 'all'

export interface Filters {
  area: AreaFilter
  city: string | null
  workMode: WorkMode | null
  /** Technology open in the explorer. Not a filter, but kept in the URL with the rest of the view so
      a reload, the back button or a shared link brings back the same pick. */
  tech: string | null
}

export const DEFAULT_FILTERS: Filters = { area: 'all', city: null, workMode: null, tech: null }

const AREAS: AreaFilter[] = ['all', 'frontend', 'backend', 'fullstack', 'mobile', 'data', 'devops', 'qa', 'other']

// Portuguese slugs in the URL, so a shared link reads naturally (?regime=hibrido).
const WORK_MODE_SLUGS: Record<WorkMode, string> = { onsite: 'presencial', hybrid: 'hibrido', remote: 'remoto' }
const SLUG_TO_WORK_MODE = Object.fromEntries(
  Object.entries(WORK_MODE_SLUGS).map(([mode, slug]) => [slug, mode as WorkMode]),
)

export function applyFilters(jobs: Job[], filters: Filters): Job[] {
  return jobs.filter((job) => {
    if (filters.area !== 'all' && job.area !== filters.area) return false
    if (filters.city && !job.cities.includes(filters.city)) return false
    if (filters.workMode && job.workMode !== filters.workMode) return false
    return true
  })
}

/** Reads filters from the URL. Values come from the user, so anything unknown falls back to the default. */
export function filtersFromSearch(params: URLSearchParams): Filters {
  const area = params.get('area') as AreaFilter | null
  return {
    area: area && AREAS.includes(area) ? area : 'all',
    city: params.get('cidade') || null,
    workMode: SLUG_TO_WORK_MODE[params.get('regime') ?? ''] ?? null,
    // Checked against the technologies on screen by the dashboard, which falls back to the top one.
    tech: params.get('tecnologia') || null,
  }
}

/** Writes only the filters that differ from the defaults, so the plain URL stays clean. */
export function filtersToSearch(filters: Filters): string {
  const params = new URLSearchParams()
  if (filters.area !== 'all') params.set('area', filters.area)
  if (filters.city) params.set('cidade', filters.city)
  if (filters.workMode) params.set('regime', WORK_MODE_SLUGS[filters.workMode])
  if (filters.tech) params.set('tecnologia', filters.tech)
  const query = params.toString()
  return query ? `?${query}` : ''
}
