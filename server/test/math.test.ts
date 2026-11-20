import { describe, expect, it } from 'vitest'
import { findMovers, shareOf, toSeries } from '../src/trends/math.ts'

describe('shareOf', () => {
  it('gives the percentage with one decimal', () => {
    expect(shareOf(1, 3)).toBe(33.3)
    expect(shareOf(150, 800)).toBe(18.8)
  })

  it('is 0 on a day with no jobs', () => {
    expect(shareOf(0, 0)).toBe(0)
  })
})

describe('toSeries', () => {
  it('sorts days oldest first and adds the share', () => {
    expect(
      toSeries([
        { date: '2026-11-21', count: 180, total: 800 },
        { date: '2026-11-20', count: 160, total: 800 },
      ]),
    ).toEqual([
      { date: '2026-11-20', count: 160, total: 800, share: 20 },
      { date: '2026-11-21', count: 180, total: 800, share: 22.5 },
    ])
  })

  it('handles no data', () => {
    expect(toSeries([])).toEqual([])
  })
})

describe('findMovers', () => {
  const first = { total: 800, counts: { React: 145, Angular: 200, Java: 240, Rust: 2 } }
  const last = { total: 820, counts: { React: 183, Angular: 180, Java: 246, Go: 12, Rust: 4 } }

  it('ranks rises and falls by percentage points', () => {
    const { up, down } = findMovers(first, last)
    expect(up).toEqual([
      { key: 'React', from: 18.1, to: 22.3, change: 4.2 },
      { key: 'Go', from: 0, to: 1.5, change: 1.5 },
    ])
    expect(down).toEqual([{ key: 'Angular', from: 25, to: 22, change: -3 }])
  })

  it('skips keys that are tiny on both days', () => {
    const { up } = findMovers(first, last)
    expect(up.map((m) => m.key)).not.toContain('Rust')
  })

  it('treats a key that disappeared as 0 on the last day', () => {
    const { down } = findMovers({ total: 100, counts: { Cobol: 10 } }, { total: 100, counts: {} })
    expect(down).toEqual([{ key: 'Cobol', from: 10, to: 0, change: -10 }])
  })

  it('respects the limit and breaks ties by name', () => {
    const counts = { B: 10, A: 10, C: 10 }
    const { up } = findMovers({ total: 100, counts: {} }, { total: 100, counts }, { limit: 2 })
    expect(up.map((m) => m.key)).toEqual(['A', 'B'])
  })

  it('leaves out keys whose share did not change', () => {
    const same = { total: 100, counts: { Java: 30 } }
    expect(findMovers(same, same)).toEqual({ up: [], down: [] })
  })
})
