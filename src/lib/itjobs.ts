// Client for the itjobs.pt API (https://www.itjobs.pt/api/docs/job). Server-only:
// it needs the API key, which must never reach the browser.

const LIST_URL = 'https://api.itjobs.pt/job/list.json'
const ONE_DAY = 86400

// shortcut: the docs do not state the maximum page size, 100 is a safe guess; raise it if the API allows more.
export const PAGE_SIZE = 100
// Safety net so a wrong `total` can never make us loop forever against their API.
const MAX_PAGES = 50

export interface ItjobsNamed {
  id: number
  name: string
}

/** A job exactly as the API returns it (only the fields we use). */
export interface ItjobsJob {
  id: number
  title: string
  body: string
  company: { id: number; name: string }
  locations?: ItjobsNamed[]
  types?: ItjobsNamed[]
  workModel?: unknown // format not documented; checked against real data before use
  publishedAt: string
}

interface ListResponse {
  total: number
  page: number
  limit: number
  results: ItjobsJob[]
}

/**
 * Fetches every published job, page by page. Responses are cached by Next.js
 * for a day, so the API is called at most once a day per page, as agreed with itjobs.
 */
export async function fetchAllJobs(apiKey: string): Promise<ItjobsJob[]> {
  const jobs: ItjobsJob[] = []

  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = `${LIST_URL}?api_key=${encodeURIComponent(apiKey)}&limit=${PAGE_SIZE}&page=${page}`
    const response = await fetch(url, { next: { revalidate: ONE_DAY } })
    if (!response.ok) {
      throw new Error(`itjobs API returned ${response.status} on page ${page}`)
    }

    const data: ListResponse = await response.json()
    jobs.push(...data.results)

    const isLastPage = data.results.length < PAGE_SIZE || jobs.length >= data.total
    if (isLastPage) break
  }

  return jobs
}
