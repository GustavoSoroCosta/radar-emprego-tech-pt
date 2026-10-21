import { describe, expect, it } from 'vitest'
import { countAreas, countBy, countTechnologies, countWorkModes, jobsLabel, percent } from './aggregate'
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

describe('countWorkModes', () => {
  it('uses Portuguese labels and counts jobs without a work mode', () => {
    const result = countWorkModes([job({ workMode: 'hybrid' }), job({ workMode: 'hybrid' }), job({ workMode: null })])
    expect(result).toEqual([
      { label: 'Híbrido', count: 2 },
      { label: 'Não indicado', count: 1 },
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
  it('counts jobs per area with readable labels', () => {
    const jobs = [job({ area: 'data' }), job({ area: 'data' }), job({ area: 'other' })]
    expect(countAreas(jobs)).toEqual([
      { label: 'Dados e IA', count: 2 },
      { label: 'Outras', count: 1 },
    ])
  })
})
