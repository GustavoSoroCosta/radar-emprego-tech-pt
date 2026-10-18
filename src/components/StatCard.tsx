interface StatCardProps {
  label: string
  value: string
  detail?: string
}

/** One headline number. The label comes first in the DOM so screen readers read "Vagas remotas, 15%". */
export function StatCard({ label, value, detail }: StatCardProps) {
  return (
    <div className="flex flex-col rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <dt className="text-sm text-zinc-600 dark:text-zinc-400">{label}</dt>
      <dd className="order-first text-3xl font-bold tabular-nums">{value}</dd>
      {detail && <dd className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">{detail}</dd>}
    </div>
  )
}
