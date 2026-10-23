import { describe, expect, it } from 'vitest'
import {
  countAreas,
  countBy,
  countCompanies,
  countTechnologies,
  jobsLabel,
  percent,
  relatedTechnologies,
} from './aggregate'
import type { Job } from './types'

const job = (overrides: Partial<Job> = {}): Job => ({
  id: 0,
  title: '',
  company: '',
  cities: [],
  workMode: 'remote',
  technologies: [],
  junior: false,
  area: 'other',
  publishedAt: '2026-01-01',
  ...overrides,
})

describe('countTechnologies', () => {
  it('counts and sorts by frequency, then alphabetically', () => {
    const result = countTechnologies([
      job({ technologies: ['React', 'CSS'] }),
      job({ technologies: ['React'] }),
      job({ technologies: ['Vue'] }),
    ])
    expect(result).toEqual([
      { label: 'React', count: 2 },
      { label: 'CSS', count: 1 },
      { label: 'Vue', count: 1 },
    ])
  })

  it('counts a technology once per job', () => {
    expect(countTechnologies([job({ technologies: ['React', 'React'] })])).toEqual([{ label: 'React', count: 1 }])
  })

  it('respects the limit', () => {
    expect(countTechnologies([job({ technologies: ['A', 'B', 'C'] })], 2)).toHaveLength(2)
  })
})

describe('countBy', () => {
  it('counts a job once for each of its keys', () => {
    const result = countBy([job({ cities: ['Porto', 'Lisboa'] }), job({ cities: ['Porto'] })], (j) => j.cities)
    expect(result).toEqual([
      { label: 'Porto', count: 2 },
      { label: 'Lisboa', count: 1 },
    ])
  })
})

describe('percent', () => {
  it('rounds to a whole number and handles zero', () => {
    expect(percent(1, 3)).toBe(33)
    expect(percent(5, 0)).toBe(0)
  })
})

describe('jobsLabel', () => {
  it('uses the singular only for exactly one job', () => {
    expect(jobsLabel(1)).toBe('1 vaga')
    expect(jobsLabel(0)).toBe('0 vagas')
    expect(jobsLabel(22)).toBe('22 vagas')
  })
})

describe('countAreas', () => {
  it('counts jobs per area and puts "Outras" last and muted, even when it is the biggest', () => {
    const jobs = [job({ area: 'other' }), job({ area: 'other' }), job({ area: 'other' }), job({ area: 'data' })]
    expect(countAreas(jobs)).toEqual([
      { label: 'Dados e IA', count: 1 },
      { label: 'Outras', count: 3, muted: true },
    ])
  })
})

describe('countCompanies', () => {
  it('counts each company once and ignores missing names', () => {
    const jobs = [job({ company: 'A' }), job({ company: 'A' }), job({ company: 'B' }), job({ company: '' })]
    expect(countCompanies(jobs)).toBe(2)
  })
})

describe('relatedTechnologies', () => {
  const jobs = [
    job({ id: 1, technologies: ['React', 'TypeScript', 'CSS'] }),
    job({ id: 2, technologies: ['React', 'TypeScript'] }),
    job({ id: 3, technologies: ['React', 'Java'] }),
    job({ id: 4, technologies: ['Angular', 'TypeScript'] }),
  ]

  it('counts what else the jobs asking for a technology ask for, leaving it out', () => {
    const { jobs: withReact, related } = relatedTechnologies(jobs, 'React')
    expect(withReact.map((j) => j.id)).toEqual([1, 2, 3])
    expect(related).toEqual([
      { label: 'TypeScript', count: 2 },
      { label: 'CSS', count: 1 },
      { label: 'Java', count: 1 },
    ])
  })

  it('returns nothing for a technology no job asks for', () => {
    expect(relatedTechnologies(jobs, 'Vue')).toEqual({ jobs: [], related: [] })
  })
})
