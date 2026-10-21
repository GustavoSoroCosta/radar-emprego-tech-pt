import { describe, expect, it } from 'vitest'
import { applyFilters, DEFAULT_FILTERS, filtersFromSearch, filtersToSearch, isMine, type Filters } from './filters'
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

describe('isMine', () => {
  it('accepts remote anywhere, hybrid in Porto and on-site in Viana do Castelo', () => {
    expect(isMine(job({ workMode: 'remote', cities: ['Lisboa'] }))).toBe(true)
    expect(isMine(job({ workMode: 'hybrid', cities: ['Porto'] }))).toBe(true)
    expect(isMine(job({ workMode: 'onsite', cities: ['Viana do Castelo'] }))).toBe(true)
  })

  it('rejects on-site in Porto, hybrid in Lisboa and unknown work modes', () => {
    expect(isMine(job({ workMode: 'onsite', cities: ['Porto'] }))).toBe(false)
    expect(isMine(job({ workMode: 'hybrid', cities: ['Lisboa'] }))).toBe(false)
    expect(isMine(job({ workMode: null, cities: ['Porto'] }))).toBe(false)
  })
})

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

  it('"mine" ignores city and work mode but keeps the area', () => {
    expect(ids(applyFilters(jobs, filters({ mine: true, city: 'Lisboa' })))).toEqual([1, 3])
    expect(ids(applyFilters(jobs, filters({ mine: true, area: 'frontend' })))).toEqual([1])
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

  it('accepts the new areas, including "other", from the URL', () => {
    expect(filtersFromSearch(new URLSearchParams('?area=data')).area).toBe('data')
    expect(filtersFromSearch(new URLSearchParams('?area=other')).area).toBe('other')
  })

  it('ignores invalid values coming from the URL', () => {
    expect(filtersFromSearch(new URLSearchParams('?area=hacker&regime=lua&minhas=sim'))).toEqual(DEFAULT_FILTERS)
  })
})
