import { describe, expect, it, vi } from 'vitest'
import { sampleJobs } from '@/data/sample'
import { getJobs } from './jobs'
import { fetchAllJobs } from './itjobs'

vi.mock('./itjobs', () => ({ fetchAllJobs: vi.fn() }))

describe('getJobs', () => {
  it('uses the sample data when there is no API key', async () => {
    expect(await getJobs('')).toEqual({ jobs: sampleJobs, source: 'sample' })
    expect(fetchAllJobs).not.toHaveBeenCalled()
  })

  it('falls back to the sample data, with an error message, when the API fails', async () => {
    vi.mocked(fetchAllJobs).mockRejectedValueOnce(new Error('401'))
    vi.spyOn(console, 'error').mockImplementation(() => {})

    const result = await getJobs('key')

    expect(result.source).toBe('sample')
    expect(result.error).toBeTruthy()
  })

  it('normalizes the jobs from the API', async () => {
    vi.mocked(fetchAllJobs).mockResolvedValueOnce([
      { id: 1, title: 'React Developer', body: '', company: { id: 1, name: 'X' }, workModel: 1, publishedAt: '2026-10-01' },
    ])

    const result = await getJobs('key')

    expect(result.source).toBe('itjobs')
    expect(result.jobs[0]).toMatchObject({ technologies: ['React'], workMode: 'remote' })
  })
})
