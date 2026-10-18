import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchAllJobs, PAGE_SIZE, type ItjobsJob } from './itjobs'

const fakeJob = (id: number): ItjobsJob => ({
  id,
  title: `Job ${id}`,
  body: '',
  company: { id: 1, name: 'Empresa' },
  publishedAt: '2026-10-01 10:00:00',
})

const page = (ids: number[], total: number) =>
  new Response(JSON.stringify({ total, page: 1, limit: PAGE_SIZE, results: ids.map(fakeJob) }))

const range = (from: number, count: number) => Array.from({ length: count }, (_, i) => from + i)

afterEach(() => vi.unstubAllGlobals())

describe('fetchAllJobs', () => {
  it('keeps fetching pages until it has every job', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(page(range(1, PAGE_SIZE), PAGE_SIZE + 3))
      .mockResolvedValueOnce(page(range(PAGE_SIZE + 1, 3), PAGE_SIZE + 3))
    vi.stubGlobal('fetch', fetchMock)

    const jobs = await fetchAllJobs('secret')

    expect(jobs).toHaveLength(PAGE_SIZE + 3)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls[1][0]).toContain('page=2')
  })

  it('sends the key and caches each page for a day', async () => {
    const fetchMock = vi.fn().mockResolvedValue(page([1], 1))
    vi.stubGlobal('fetch', fetchMock)

    await fetchAllJobs('my key')

    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toContain('api_key=my%20key')
    expect(options).toEqual({ next: { revalidate: 86400 } })
  })

  it('fails loudly when the API answers with an error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('nope', { status: 401 })))

    await expect(fetchAllJobs('wrong')).rejects.toThrow('401')
  })
})
