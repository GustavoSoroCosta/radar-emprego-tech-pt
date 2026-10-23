import { describe, expect, it } from 'vitest'
import { applyFilters, DEFAULT_FILTERS, filtersFromSearch, filtersToSearch, type Filters } from './filters'
import type { Job } from './types'

const job = (overrides: Partial<Job> = {}): Job => ({
  id: 0,
  title: '',
  company: '',
  cities: [],
  workMode: null,
  technologies: [],
  junior: false,
  area: 'other',
  publishedAt: '2026-01-01',
  ...overrides,
})

const filters = (overrides: Partial<Filters>): Filters => ({ ...DEFAULT_FILTERS, ...overrides })

describe('applyFilters', () => {
  const jobs = [
    job({ id: 1, area: 'frontend', cities: ['Porto'], workMode: 'hybrid' }),
    job({ id: 2, area: 'frontend', cities: ['Lisboa'], workMode: 'onsite' }),
    job({ id: 3, area: 'backend', cities: ['Porto'], workMode: 'remote' }),
  ]
  const ids = (result: Job[]) => result.map((j) => j.id)

  it('returns everything with the default filters', () => {
    expect(ids(applyFilters(jobs, DEFAULT_FILTERS))).toEqual([1, 2, 3])
  })

  it('combines area, city and work mode', () => {
    expect(ids(applyFilters(jobs, filters({ area: 'frontend' })))).toEqual([1, 2])
    expect(ids(applyFilters(jobs, filters({ city: 'Porto' })))).toEqual([1, 3])
    expect(ids(applyFilters(jobs, filters({ area: 'frontend', workMode: 'hybrid' })))).toEqual([1])
  })
})

describe('URL round trip', () => {
  it('keeps the default URL clean', () => {
    expect(filtersToSearch(DEFAULT_FILTERS)).toBe('')
  })

  it('writes Portuguese slugs and reads them back', () => {
    const f = filters({ area: 'frontend', city: 'Porto', workMode: 'hybrid' })
    const search = filtersToSearch(f)
    expect(search).toBe('?area=frontend&cidade=Porto&regime=hibrido')
    expect(filtersFromSearch(new URLSearchParams(search))).toEqual(f)
  })

  it('keeps the explorer technology in the URL so reload and back bring it back', () => {
    const f = filters({ area: 'frontend', tech: 'Node.js' })
    const search = filtersToSearch(f)
    expect(search).toBe('?area=frontend&tecnologia=Node.js')
    expect(filtersFromSearch(new URLSearchParams(search))).toEqual(f)
  })

  it('accepts the new areas, including "other", from the URL', () => {
    expect(filtersFromSearch(new URLSearchParams('?area=data')).area).toBe('data')
    expect(filtersFromSearch(new URLSearchParams('?area=other')).area).toBe('other')
  })

  it('ignores invalid values coming from the URL', () => {
    expect(filtersFromSearch(new URLSearchParams('?area=hacker&regime=lua&minhas=1'))).toEqual(DEFAULT_FILTERS)
  })
})
