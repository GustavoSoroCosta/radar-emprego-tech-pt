import { useAnimatedNumber } from '@/hooks/useAnimatedNumber'

interface StatCardProps {
  label: string
  value: number
  /** Shown right after the number, e.g. "%". */
  suffix?: string
  detail?: string
  /** 0–100; draws a small proportion bar under the number. */
  share?: number
  /** Entrance delay in ms, so the cards appear one after the other. */
  delay?: number
}

/** One headline number. The label comes first in the DOM so screen readers read "Vagas remotas, 15%". */
export function StatCard({ label, value, suffix = '', detail, share, delay = 0 }: StatCardProps) {
  const shown = useAnimatedNumber(value)
  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className="flex flex-col rounded-xl border border-zinc-200 bg-white p-5 shadow-sm motion-safe:animate-rise dark:border-zinc-800 dark:bg-zinc-900/50"
    >
      <dt className="text-sm text-zinc-600 dark:text-zinc-400">{label}</dt>
      <dd className="order-first text-3xl font-bold tabular-nums">
        {shown}
        {suffix}
      </dd>
      {share !== undefined && (
        // Decorative: the number above already says the same thing.
        <dd aria-hidden="true" className="order-first mt-2 mb-2 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div
            className="h-full origin-left rounded-full bg-violet-600 motion-safe:animate-grow motion-safe:transition-[width] motion-safe:duration-500 dark:bg-violet-400"
            style={{ width: `${share}%`, animationDelay: `${delay + 200}ms` }}
          />
        </dd>
      )}
      {detail && <dd className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{detail}</dd>}
    </div>
  )
}
