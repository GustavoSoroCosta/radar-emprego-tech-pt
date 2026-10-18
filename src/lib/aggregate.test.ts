import { describe, expect, it } from 'vitest'
import { countTechnologies } from './aggregate'
import type { Job } from './types'

const job = (technologies: string[]): Job => ({
  id: 0,
  title: '',
  company: '',
  cities: [],
  workMode: 'remote',
  technologies,
  junior: false,
  publishedAt: '2026-01-01',
})

describe('countTechnologies', () => {
  it('counts and sorts by frequency, then alphabetically', () => {
    const result = countTechnologies([job(['React', 'CSS']), job(['React']), job(['Vue'])])
    expect(result).toEqual([
      { label: 'React', count: 2 },
      { label: 'CSS', count: 1 },
      { label: 'Vue', count: 1 },
    ])
  })

  it('counts a technology once per job', () => {
    expect(countTechnologies([job(['React', 'React'])])).toEqual([{ label: 'React', count: 1 }])
  })

  it('respects the limit', () => {
    expect(countTechnologies([job(['A', 'B', 'C'])], 2)).toHaveLength(2)
  })
})
