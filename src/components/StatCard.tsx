import { useAnimatedNumber } from '@/hooks/useAnimatedNumber'

interface StatCardProps {
  label: string
  value: number
  /** Shown right after the number, e.g. "%". */
  suffix?: string
  detail?: string
  /** 0–100; draws a small proportion bar under the number. */
  share?: number
  /** Delay in ms for the share bar, so the bars fill one after the other. */
  delay?: number
}

/**
 * One reading in the strip of headline numbers. The label comes first in the DOM so screen readers
 * read "Remotas, 17%", while the number shows first on screen.
 */
export function StatCard({ label, value, suffix = '', detail, share, delay = 0 }: StatCardProps) {
  const shown = useAnimatedNumber(value)
  return (
    <div className="flex flex-col bg-card p-5">
      <dt className="text-sm text-muted">{label}</dt>
      {/* Without a share bar, the same 20px gap keeps the labels in line across the strip. */}
      <dd
        className={`order-first font-display text-4xl font-semibold tabular-nums [font-stretch:110%] ${
          share === undefined ? 'mb-5' : ''
        }`}
      >
        {shown}
        {suffix}
      </dd>
      {share !== undefined && (
        // Decorative: the number above already says the same thing.
        <dd aria-hidden="true" className="order-first mt-2 mb-2 h-1 overflow-hidden rounded-full bg-line">
          <div
            className="h-full origin-left rounded-full bg-signal motion-safe:animate-grow motion-safe:transition-[width] motion-safe:duration-500"
            style={{ width: `${share}%`, animationDelay: `${delay + 200}ms` }}
          />
        </dd>
      )}
      {detail && <dd className="mt-1 text-xs text-muted">{detail}</dd>}
    </div>
  )
}
