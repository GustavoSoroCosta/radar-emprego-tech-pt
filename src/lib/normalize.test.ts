import { describe, expect, it } from 'vitest'
import { classifyArea, extractTechnologies, htmlToText, isJunior, toJob, toWorkMode } from './normalize'

describe('extractTechnologies', () => {
  it('finds technologies regardless of case and punctuation', () => {
    expect(extractTechnologies('Experiência com React, TypeScript e node.js.')).toEqual([
      'TypeScript',
      'React',
      'Node.js',
    ])
  })

  it('does not confuse Java with JavaScript', () => {
    expect(extractTechnologies('JavaScript developer')).toEqual(['JavaScript'])
    expect(extractTechnologies('Java developer')).toEqual(['Java'])
    expect(extractTechnologies('Java e JavaScript')).toEqual(['JavaScript', 'Java'])
  })

  it('does not count the ".js" of framework names as JavaScript', () => {
    expect(extractTechnologies('Node.js e D3.js')).toEqual(['Node.js', 'D3.js'])
    expect(extractTechnologies('HTML, CSS e JS')).toEqual(['JavaScript', 'HTML', 'CSS'])
  })

  it('does not count React when the job is about React Native', () => {
    expect(extractTechnologies('React Native developer')).toEqual(['React Native'])
    expect(extractTechnologies('ReactJS e React Native')).toEqual(['React', 'React Native'])
  })

  it('tells C# and C++ apart and matches .NET', () => {
    expect(extractTechnologies('C# / .NET Core')).toEqual(['C#', '.NET'])
    expect(extractTechnologies('C++ embedded')).toEqual(['C++'])
  })

  it('ignores names inside other words', () => {
    // "network" contains "net", "Javanese" contains "java", "Goal" contains "go"
    expect(extractTechnologies('network engineer, Javanese speaker, Goal oriented')).toEqual([])
  })

  it('does not read "Pearson VUE" (an exam centre) as the Vue framework', () => {
    expect(extractTechnologies('online learning platforms, Pearson VUE exam center')).toEqual([])
    expect(extractTechnologies('Angular, React or Vue.js')).toEqual(['React', 'Angular', 'Vue'])
  })

  it('groups SQL dialects under SQL', () => {
    expect(extractTechnologies('PostgreSQL ou MySQL')).toEqual(['SQL'])
  })
})

describe('isJunior', () => {
  it.each([
    'Junior Frontend Developer',
    'Programador Júnior',
    'Estágio Profissional - Programador',
    'Developer Trainee',
    'Graduate Programme 2027',
  ])('detects "%s" as junior', (title) => {
    expect(isJunior(title)).toBe(true)
  })

  it('does not flag senior or plain roles', () => {
    expect(isJunior('Senior Frontend Engineer')).toBe(false)
    expect(isJunior('Frontend Developer')).toBe(false)
  })
})

describe('classifyArea', () => {
  it.each([
    ['Frontend Developer', 'frontend'],
    ['Front-End Engineer (Angular)', 'frontend'],
    ['React Developer', 'frontend'],
    ['UI Developer', 'frontend'],
    ['Fullstack Java + React Developer', 'fullstack'],
    ['Full Stack Engineer', 'fullstack'],
    ['Java Back-End Developer', 'backend'],
    ['.NET Developer', 'backend'],
    ['Python Developer', 'backend'],
    ['JavaScript Engineer', 'other'],
    ['Data Engineer', 'other'],
    ['Build Engineer', 'other'],
  ])('classifies "%s" as %s', (title, area) => {
    expect(classifyArea(title)).toBe(area)
  })
})

describe('toWorkMode', () => {
  it('maps the itjobs codes', () => {
    expect(toWorkMode(0)).toBe('onsite')
    expect(toWorkMode(1)).toBe('remote')
    expect(toWorkMode(2)).toBe('hybrid')
  })

  it('returns null for anything unknown', () => {
    expect(toWorkMode(9)).toBeNull()
    expect(toWorkMode(undefined)).toBeNull()
  })
})

describe('htmlToText', () => {
  it('strips tags and entities', () => {
    expect(htmlToText('<p>React&nbsp;e <b>CSS</b></p>&amp; mais')).toBe('React e CSS & mais')
  })
})

describe('toJob', () => {
  it('builds a Job from an API result', () => {
    const job = toJob({
      id: 7,
      title: 'Junior React Developer',
      body: '<ul><li>TypeScript</li></ul>',
      company: { id: 1, name: 'Empresa' },
      locations: [{ id: 18, name: 'Porto' }],
      workModel: 2,
      publishedAt: '2026-10-17 14:05:00',
    })
    expect(job).toEqual({
      id: 7,
      title: 'Junior React Developer',
      company: 'Empresa',
      cities: ['Porto'],
      workMode: 'hybrid',
      technologies: ['TypeScript', 'React'],
      junior: true,
      area: 'frontend',
      publishedAt: '2026-10-17 14:05:00',
    })
  })
})
