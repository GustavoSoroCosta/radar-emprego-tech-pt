import type { Job } from '@/lib/types'

// Used while there is no ITJOBS_API_KEY, so the app always has something to show.
export const sampleJobs: Job[] = [
  { id: 1, title: 'Frontend Developer', company: 'Empresa A', cities: ['Porto'], workMode: 'hybrid', technologies: ['React', 'TypeScript', 'CSS'], junior: false, area: 'frontend', publishedAt: '2026-10-01' },
  { id: 2, title: 'Fullstack Developer', company: 'Empresa B', cities: ['Lisboa'], workMode: 'remote', technologies: ['React', 'Node.js', 'TypeScript'], junior: false, area: 'fullstack', publishedAt: '2026-10-02' },
  { id: 3, title: 'Backend Developer', company: 'Empresa C', cities: ['Braga'], workMode: 'onsite', technologies: ['C#', '.NET', 'SQL'], junior: false, area: 'backend', publishedAt: '2026-10-03' },
  { id: 4, title: 'Frontend Engineer', company: 'Empresa D', cities: ['Lisboa'], workMode: 'hybrid', technologies: ['Angular', 'TypeScript'], junior: false, area: 'frontend', publishedAt: '2026-10-04' },
  { id: 5, title: 'Data Engineer', company: 'Empresa E', cities: ['Porto'], workMode: 'remote', technologies: ['Python', 'SQL'], junior: false, area: 'data', publishedAt: '2026-10-05' },
  { id: 6, title: 'Junior Frontend Developer', company: 'Empresa F', cities: ['Viana do Castelo'], workMode: 'onsite', technologies: ['React', 'JavaScript', 'CSS'], junior: true, area: 'frontend', publishedAt: '2026-10-06' },
  { id: 7, title: 'Software Engineer', company: 'Empresa G', cities: ['Aveiro'], workMode: 'hybrid', technologies: ['Java', 'Spring', 'SQL'], junior: false, area: 'backend', publishedAt: '2026-10-07' },
  { id: 8, title: 'React Developer', company: 'Empresa H', cities: ['Porto'], workMode: 'hybrid', technologies: ['React', 'TypeScript', 'D3.js'], junior: true, area: 'frontend', publishedAt: '2026-10-08' },
]
