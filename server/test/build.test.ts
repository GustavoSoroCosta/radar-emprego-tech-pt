import { describe, expect, it } from 'vitest'
import type { Job } from '../../src/lib/types.ts'
import { buildSnapshot } from '../src/snapshot/build.ts'

function job(overrides: Partial<Job>): Job {
  return {
    id: 1,
    title: 'Developer',
    company: 'ACME',
    cities: ['Porto'],
    workMode: 'hybrid',
    technologies: [],
    junior: false,
    area: 'other',
    publishedAt: '2026-11-19',
    ...overrides,
  }
}

describe('buildSnapshot', () => {
  it('counts totals, juniors and every kind', () => {
    const snapshot = buildSnapshot([
      job({ id: 1, technologies: ['React', 'TypeScript'], area: 'frontend', junior: true }),
      job({ id: 2, technologies: ['React'], area: 'frontend', cities: ['Lisboa', 'Porto'], workMode: 'remote' }),
      job({ id: 3, technologies: ['Java'], area: 'backend', cities: ['Lisboa'] }),
    ])

    expect(snapshot.totalJobs).toBe(3)
    expect(snapshot.juniorJobs).toBe(1)
    expect(snapshot.counts).toEqual(
      expect.arrayContaining([
        { kind: 'tech', key: 'React', count: 2 },
        { kind: 'tech', key: 'TypeScript', count: 1 },
        { kind: 'tech', key: 'Java', count: 1 },
        { kind: 'area', key: 'frontend', count: 2 },
        { kind: 'area', key: 'backend', count: 1 },
        { kind: 'city', key: 'Porto', count: 2 },
        { kind: 'city', key: 'Lisboa', count: 2 },
        { kind: 'work_mode', key: 'hybrid', count: 2 },
        { kind: 'work_mode', key: 'remote', count: 1 },
      ]),
    )
    expect(snapshot.counts).toHaveLength(9)
  })

  it('keeps more than the top 10 technologies', () => {
    const technologies = Array.from({ length: 15 }, (_, i) => `Tech${i}`)
    const snapshot = buildSnapshot([job({ technologies })])
    expect(snapshot.counts.filter((c) => c.kind === 'tech')).toHaveLength(15)
  })

  it('leaves out jobs without a work model', () => {
    const snapshot = buildSnapshot([job({ workMode: null })])
    expect(snapshot.counts.filter((c) => c.kind === 'work_mode')).toEqual([])
  })

  it('handles a day with no jobs', () => {
    expect(buildSnapshot([])).toEqual({ totalJobs: 0, juniorJobs: 0, counts: [] })
  })
})
