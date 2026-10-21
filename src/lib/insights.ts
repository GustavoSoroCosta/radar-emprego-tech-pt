import { percent, type CountItem } from './aggregate'

/** Below this many jobs a ranking is mostly noise, so the chart warns the reader. */
export const SMALL_SAMPLE = 30

/** Share of `count` in `total` for display; "<1%" instead of a misleading "0%" for rare items. */
export function shareLabel(count: number, total: number): string {
  const value = percent(count, total)
  return count > 0 && value === 0 ? '<1%' : `${value}%`
}

/**
 * The main takeaway of a ranking in one sentence, like the headline of a news chart:
 * "SQL lidera, em 29% das vagas, à frente de Azure (25%)."
 */
export function topInsight(items: CountItem[], total: number): string | null {
  const [first, second] = items
  if (!first || total === 0) return null
  const share = (item: CountItem) => shareLabel(item.count, total)

  if (second && second.count === first.count) {
    return `${first.label} e ${second.label} empatam, cada um em ${share(first)} das vagas.`
  }
  const lead = `${first.label} lidera, em ${share(first)} das vagas`
  return second ? `${lead}, à frente de ${second.label} (${share(second)}).` : `${lead}.`
}
