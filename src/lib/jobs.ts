import { sampleJobs } from '@/data/sample'
import { fetchAllJobs } from './itjobs'
import { toJob } from './normalize'
import type { Job } from './types'

export interface JobsResult {
  jobs: Job[]
  /** 'sample' when there is no API key or the API failed, so the page can say so. */
  source: 'itjobs' | 'sample'
  error?: string
}

/** Real jobs from itjobs when possible, sample data otherwise. Server-only (reads the API key). */
export async function getJobs(apiKey = process.env.ITJOBS_API_KEY): Promise<JobsResult> {
  if (!apiKey) return { jobs: sampleJobs, source: 'sample' }

  try {
    const raw = await fetchAllJobs(apiKey)
    return { jobs: raw.map(toJob), source: 'itjobs' }
  } catch (error) {
    // Keep the site up with sample data, but surface the reason instead of hiding it.
    console.error('Could not load jobs from itjobs:', error)
    return { jobs: sampleJobs, source: 'sample', error: 'Não foi possível carregar as vagas do itjobs.pt.' }
  }
}
