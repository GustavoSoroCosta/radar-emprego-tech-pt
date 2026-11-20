/** One day of one key (e.g. React on 2026-11-20): how many jobs asked for it out of the day's total. */
export interface DayCount {
  date: string // YYYY-MM-DD
  count: number
  total: number
}

export interface SeriesPoint extends DayCount {
  share: number // percentage of the day's jobs, one decimal
}

/** Day totals and per-key counts of one snapshot. A key missing from `counts` had 0 jobs that day. */
export interface DayTotals {
  total: number
  counts: Record<string, number>
}

export interface Mover {
  key: string
  from: number // share on the first day, %
  to: number // share on the last day, %
  change: number // percentage points, positive = more demand
}

/** Share in %, rounded to one decimal; 0 on a day with no jobs instead of dividing by zero. */
export function shareOf(count: number, total: number): number {
  return total === 0 ? 0 : Math.round((count / total) * 1000) / 10
}

/**
 * Adds the share to each day, oldest first. Shares, not raw counts, are what we compare:
 * the number of ads on itjobs changes from day to day, so raw counts mostly follow that.
 */
export function toSeries(days: DayCount[]): SeriesPoint[] {
  return [...days]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((day) => ({ ...day, share: shareOf(day.count, day.total) }))
}

/**
 * Keys whose share changed most between the first and the last day of a window.
 * Keys with fewer than `minCount` jobs on both days are skipped: going from 1 to 2 jobs
 * doubles the share but says nothing about the market.
 */
export function findMovers(
  first: DayTotals,
  last: DayTotals,
  { limit = 5, minCount = 5 }: { limit?: number; minCount?: number } = {},
): { up: Mover[]; down: Mover[] } {
  const keys = new Set([...Object.keys(first.counts), ...Object.keys(last.counts)])

  const movers: Mover[] = []
  for (const key of keys) {
    const before = first.counts[key] ?? 0
    const after = last.counts[key] ?? 0
    if (Math.max(before, after) < minCount) continue

    const from = shareOf(before, first.total)
    const to = shareOf(after, last.total)
    // Round again so 22.3 - 18.1 gives 4.2, not 4.199999999999999.
    const change = Math.round((to - from) * 10) / 10
    if (change !== 0) movers.push({ key, from, to, change })
  }

  const byKey = (a: Mover, b: Mover) => a.key.localeCompare(b.key)
  return {
    up: movers.filter((m) => m.change > 0).sort((a, b) => b.change - a.change || byKey(a, b)).slice(0, limit),
    down: movers.filter((m) => m.change < 0).sort((a, b) => a.change - b.change || byKey(a, b)).slice(0, limit),
  }
}
