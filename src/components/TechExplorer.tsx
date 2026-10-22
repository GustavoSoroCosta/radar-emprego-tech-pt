import { jobsLabel, percent, relatedTechnologies } from '@/lib/aggregate'
import { shareLabel } from '@/lib/insights'
import type { Job } from '@/lib/types'

interface TechExplorerProps {
  jobs: Job[]
  /** Technologies the reader can pick, most requested first. */
  options: string[]
  selected: string
  onSelect: (technology: string) => void
  delay?: number
}

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500'

/**
 * Pick a technology and see what usually comes with it in the same job ads. The select is the
 * keyboard-friendly way in; clicking a bar in the charts above is a mouse shortcut to the same thing.
 */
export function TechExplorer({ jobs, options, selected, onSelect, delay = 0 }: TechExplorerProps) {
  const { jobs: withTechnology, related } = relatedTechnologies(jobs, selected)
  const total = withTechnology.length
  const remote = withTechnology.filter((job) => job.workMode === 'remote').length
  const junior = withTechnology.filter((job) => job.junior).length
  const [top] = related

  return (
    <section
      id="explorador"
      aria-labelledby="explorer-title"
      style={{ animationDelay: `${delay}ms` }}
      className="scroll-mt-40 rounded-xl border border-violet-200 bg-white p-5 shadow-sm motion-safe:animate-rise md:col-span-2 dark:border-violet-900 dark:bg-zinc-900/50"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="explorer-title" className="font-semibold">
            Explorar uma tecnologia
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Escolha uma tecnologia, ou clique numa barra dos gráficos, para ver o que costuma vir com ela.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          Tecnologia
          <select
            name="tecnologia"
            value={selected}
            onChange={(event) => onSelect(event.target.value)}
            className={`rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700 ${focusRing}`}
          >
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div>
          <p className="text-3xl font-bold">{selected}</p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Pedido em {jobsLabel(total)}, {shareLabel(total, jobs.length)} das vagas.
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-3">
            <div className="flex flex-col rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/60">
              <dt className="text-xs text-zinc-600 dark:text-zinc-400">Remotas</dt>
              <dd className="order-first text-xl font-semibold tabular-nums">{percent(remote, total)}%</dd>
            </div>
            <div className="flex flex-col rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/60">
              <dt className="text-xs text-zinc-600 dark:text-zinc-400">Júnior</dt>
              <dd className="order-first text-xl font-semibold tabular-nums">{junior}</dd>
            </div>
          </dl>
          <a
            href={`https://www.itjobs.pt/emprego?q=${encodeURIComponent(selected)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-4 inline-flex min-h-6 items-center gap-1 text-sm font-medium text-violet-700 underline-offset-4 hover:underline dark:text-violet-300 ${focusRing}`}
          >
            Procurar vagas de {selected} no itjobs.pt
            <span aria-hidden="true">↗</span>
            <span className="sr-only">(abre numa nova janela)</span>
          </a>
        </div>

        <div>
          {/* Announced when the pick changes, so screen reader users hear the result of the select. */}
          <p aria-live="polite" className="text-sm">
            {top
              ? `Quem pede ${selected} também pede ${top.label} em ${shareLabel(top.count, total)} dos casos.`
              : `Nenhuma outra tecnologia da lista aparece com ${selected}.`}
          </p>
          <ul aria-label={`Tecnologias pedidas com ${selected}`} className="mt-4 space-y-2.5">
            {related.map((item, index) => {
              const share = percent(item.count, total)
              return (
                <li key={item.label} className="grid grid-cols-[6.5rem_minmax(0,1fr)_3rem] items-center gap-3 text-sm">
                  <span className="truncate text-right">{item.label}</span>
                  <span aria-hidden="true" className="h-3 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <span
                      style={{ width: `${share}%` }}
                      className={`block h-full rounded-full motion-safe:transition-[width] motion-safe:duration-500 ${
                        index === 0 ? 'bg-violet-700 dark:bg-violet-300' : 'bg-violet-500'
                      }`}
                    />
                  </span>
                  <span className="tabular-nums">{shareLabel(item.count, total)}</span>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
