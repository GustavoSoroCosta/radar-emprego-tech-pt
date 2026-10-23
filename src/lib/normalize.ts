import type { ItjobsJob } from './itjobs'
import type { Area, Job, WorkMode } from './types'

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

const FRONT_FRAMEWORK = /react|angular|vue/i
const BACK_LANGUAGE = /\bjava\b(?!\s*script)|\.net|\bc#|node|\bphp\b|python|golang|ruby/i

// The title decides, in this order, because the first match wins: "React Native" is mobile
// before it is frontend, "Python Data Engineer" is data before it is backend, and
// "Java/Angular Developer" names both sides, so it is fullstack.
const AREA_BY_TITLE: [Area, (title: string) => boolean][] = [
  // Closed platforms and design roles have their own skill set; their bodies often mention
  // Angular or Java (ServiceNow, SAP Fiori...), which would otherwise pull them into an area.
  ['other', (t) => /\bsap\b|salesforce|service\s?now|outsystems|mulesoft|tibco|cobol|\brpa\b|designer|\bux\b/i.test(t)],
  ['fullstack', (t) => /full[- ]?stack/i.test(t)],
  ['mobile', (t) => /mobile|android|\bios\b|flutter|react\s*native|\bswift\b/i.test(t)],
  ['frontend', (t) => /front[- ]?end|\bui\b|web developer/i.test(t)],
  ['backend', (t) => /back[- ]?end/i.test(t)],
  ['qa', (t) => /\bqae?\b|\btest(?:er|ing)?\b|quality/i.test(t)],
  ['data', (t) => /\bdata\b|dados|analytics|\bbi\b|machine learning|\b(?:ai|ia|ml)\b|intelig[eê]ncia artificial|\bdba\b/i.test(t)],
  ['devops', (t) => /devops|devsecops|\bsre\b|site reliability|cloud|platform|kubernetes|finops/i.test(t)],
  ['fullstack', (t) => FRONT_FRAMEWORK.test(t) && BACK_LANGUAGE.test(t)],
  ['frontend', (t) => FRONT_FRAMEWORK.test(t)],
  ['backend', (t) => BACK_LANGUAGE.test(t)],
]

// Titles like "Software Engineer" say nothing about the area, so the technologies decide.
// Only frameworks and server languages count: plain JavaScript or SQL show up in every kind of job.
const GENERIC_DEV_TITLE = /developer|programador|desenvolvedor|software engineer|engenheiro de software/i
const FRONTEND_TECH = new Set(['React', 'Angular', 'Vue', 'Next.js'])
const BACKEND_TECH = new Set(['Java', 'Spring', 'C#', '.NET', 'Node.js', 'Python', 'PHP', 'Go'])

export function classifyArea(title: string, technologies: string[] = []): Area {
  const byTitle = AREA_BY_TITLE.find(([, matches]) => matches(title))
  if (byTitle) return byTitle[0]
  if (!GENERIC_DEV_TITLE.test(title)) return 'other'

  const front = technologies.some((t) => FRONTEND_TECH.has(t))
  const back = technologies.some((t) => BACKEND_TECH.has(t))
  if (front && back) return 'fullstack'
  if (front) return 'frontend'
  if (back) return 'backend'
  return 'other'
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
  const technologies = extractTechnologies(`${raw.title} ${htmlToText(raw.body ?? '')}`)
  return {
    id: raw.id,
    title: raw.title,
    company: raw.company?.name ?? '',
    // itjobs names jobs abroad in English; the page is in Portuguese (WCAG 3.1.2, language of parts).
    cities: (raw.locations ?? []).map((l) => (l.name === 'International' ? 'Internacional' : l.name)),
    workMode: toWorkMode(raw.workModel),
    technologies,
    junior: isJunior(raw.title),
    area: classifyArea(raw.title, technologies),
    publishedAt: raw.publishedAt,
  }
}
