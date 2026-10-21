import { describe, expect, it } from 'vitest'
import { shareLabel, topInsight } from './insights'

describe('shareLabel', () => {
  it('shows a whole percentage', () => {
    expect(shareLabel(233, 804)).toBe('29%')
  })

  it('shows <1% for rare items instead of 0%', () => {
    expect(shareLabel(2, 804)).toBe('<1%')
    expect(shareLabel(0, 804)).toBe('0%')
  })
})

describe('topInsight', () => {
  it('names the leader and the runner-up with their shares', () => {
    const items = [
      { label: 'SQL', count: 233 },
      { label: 'Azure', count: 203 },
    ]
    expect(topInsight(items, 804)).toBe('SQL lidera, em 29% das vagas. Em segundo lugar: Azure (25%).')
  })

  it('reports a tie instead of picking a leader', () => {
    const items = [
      { label: 'Angular', count: 5 },
      { label: 'React', count: 5 },
    ]
    expect(topInsight(items, 10)).toBe('Angular e React empatam, cada um em 50% das vagas.')
  })

  it('handles a single item and empty data', () => {
    expect(topInsight([{ label: 'Remoto', count: 3 }], 3)).toBe('Remoto lidera, em 100% das vagas.')
    expect(topInsight([], 0)).toBeNull()
  })
})
