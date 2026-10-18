import type { ItjobsJob } from './itjobs'
import type { Job, WorkMode } from './types'

// itjobs sends the work model as a number. Not documented; confirmed by opening
// two real job pages for each value on itjobs.pt (18 Oct 2026).
const WORK_MODELS: Record<number, WorkMode> = { 0: 'onsite', 1: 'remote', 2: 'hybrid' }

export function toWorkMode(value: unknown): WorkMode | null {
  return typeof value === 'number' ? (WORK_MODELS[value] ?? null) : null
}

// Letters, digits and the symbols that are part of tech names (C#, C++, .NET, Node.js).
// A match only counts if it is not glued to one of these on either side.
const WORD = '[\\p{L}\\p{N}#+]'
const tech = (label: string, pattern: string) => ({
  label,
  regex: new RegExp(`(?<!${WORD})(?:${pattern})(?!${WORD}|\\.\\p{L})`, 'iu'),
})

// Closed list on purpose: free-text extraction would also pick up noise like "Office".
const TECHNOLOGIES = [
  // A bare "JS" counts, but not the ".js" at the end of Node.js, Vue.js, D3.js...
  tech('JavaScript', 'javascript|(?<!\\.)js(?=\\s|,|\\)|/|$)'),
  tech('TypeScript', 'typescript'),
  tech('React', 'react(?:\\.?js)?(?!\\s*native)'),
  tech('React Native', 'react\\s*native'),
  tech('Angular', 'angular(?:js)?'),
  // Many postings carry the same company boilerplate about "Pearson VUE exam center".
  tech('Vue', '(?<!pearson\\s)vue(?:\\.?js)?'),
  tech('Next.js', 'next\\.?js'),
  tech('Node.js', 'node(?:\\.?js)?'),
  tech('HTML', 'html5?'),
  tech('CSS', 'css3?'),
  tech('Tailwind', 'tailwind(?:\\s*css)?'),
  tech('D3.js', 'd3(?:\\.js)?'),
  tech('Java', 'java(?!\\s*script)'),
  tech('Spring', 'spring(?:\\s*boot)?'),
  tech('Kotlin', 'kotlin'),
  tech('C#', 'c#'),
  tech('.NET', '\\.net(?:\\s*core)?'),
  tech('C++', 'c\\+\\+'),
  tech('Python', 'python'),
  tech('PHP', 'php'),
  tech('Go', 'golang'),
  tech('Swift', 'swift'),
  tech('SQL', 'sql|mysql|postgres(?:ql)?|sql\\s*server'),
  tech('AWS', 'aws'),
  tech('Azure', 'azure'),
  tech('Docker', 'docker'),
  tech('Kubernetes', 'kubernetes|k8s'),
]

/** Which technologies from the closed list a text mentions, in list order. */
export function extractTechnologies(text: string): string[] {
  return TECHNOLOGIES.filter((t) => t.regex.test(text)).map((t) => t.label)
}

const JUNIOR = /(?<!\p{L})(j[uú]nior|junior|est[aá]gi[oá]rio|est[aá]gio|trainee|graduate|rec[eé]m[- ]licenciad[oa]|entry[- ]level)(?!\p{L})/iu

// shortcut: only looks at the title; bodies often say "Júnior/Pleno/Sénior" for one role. Revisit if counts look low.
export function isJunior(title: string): boolean {
  return JUNIOR.test(title)
}

/** Turns HTML from the API into plain text good enough for keyword matching. */
export function htmlToText(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&[a-z]+;|&#\d+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function toJob(raw: ItjobsJob): Job {
  return {
    id: raw.id,
    title: raw.title,
    company: raw.company?.name ?? '',
    cities: (raw.locations ?? []).map((l) => l.name),
    workMode: toWorkMode(raw.workModel),
    technologies: extractTechnologies(`${raw.title} ${htmlToText(raw.body ?? '')}`),
    junior: isJunior(raw.title),
    publishedAt: raw.publishedAt,
  }
}
