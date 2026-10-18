import { describe, expect, it } from 'vitest'
import { countBy, countTechnologies, countWorkModes, isFrontendJob, percent } from './aggregate'
import type { Job } from './types'

const job = (overrides: Partial<Job> = {}): Job => ({
  id: 0,
  title: '',
  company: '',
  cities: [],
  workMode: 'remote',
  technologies: [],
  junior: false,
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

describe('isFrontendJob', () => {
  it.each(['Frontend Developer', 'Front-End Engineer', 'React Developer', 'Angular Developer', 'UI Developer'])(
    'treats "%s" as frontend',
    (title) => expect(isFrontendJob(job({ title }))).toBe(true),
  )

  it.each(['Java Back-End Developer', 'Build Engineer', 'Data Engineer'])('does not treat "%s" as frontend', (title) =>
    expect(isFrontendJob(job({ title }))).toBe(false),
  )
})

describe('percent', () => {
  it('rounds to a whole number and handles zero', () => {
    expect(percent(1, 3)).toBe(33)
    expect(percent(5, 0)).toBe(0)
  })
})
