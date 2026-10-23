import { jobsLabel, percent, relatedTechnologies } from '@/lib/aggregate'
import { shareLabel } from '@/lib/insights'
import type { Job } from '@/lib/types'

interface TechExplorerProps {
  jobs: Job[]
  /** Technologies the reader can pick, most requested first. */
  options: string[]
  selected: string
  onSelect: (technology: string) => void
}

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-panel-signal'

/**
 * Pick a technology and see what usually comes with it in the same job ads. The select is the
 * keyboard-friendly way in; clicking a bar in the charts above is a mouse shortcut to the same thing.
 * This is the page's one bold block: a navy panel in both themes, with its own light-on-dark colours.
 */
export function TechExplorer({ jobs, options, selected, onSelect }: TechExplorerProps) {
  const { jobs: withTechnology, related } = relatedTechnologies(jobs, selected)
  const total = withTechnology.length
  const remote = withTechnology.filter((job) => job.workMode === 'remote').length
  const junior = withTechnology.filter((job) => job.junior).length
  const [top] = related

  return (
    <section
      id="explorador"
      aria-labelledby="explorer-title"
      // color-scheme dark: the panel is dark even on the light page, so its select list must be too.
      className="scroll-mt-40 rounded-xl bg-panel p-6 text-panel-ink [color-scheme:dark] md:col-span-2 md:p-8"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="explorer-title" className="text-lg font-semibold">
            Explorar uma tecnologia
          </h2>
          <p className="mt-1 text-sm text-panel-muted">
            Escolha uma tecnologia, ou clique numa barra dos gráficos, para ver o que costuma vir com ela.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          Tecnologia
          <select
            name="tecnologia"
            value={selected}
            onChange={(event) => onSelect(event.target.value)}
            className={`rounded-md border border-white/25 bg-panel px-2 py-1.5 text-sm text-panel-ink ${focusRing}`}
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
          <p className="font-display text-4xl font-bold [font-stretch:115%]">{selected}</p>
          <p className="mt-1 text-sm text-panel-muted">
            Pedido em {jobsLabel(total)}, {shareLabel(total, jobs.length)} das vagas.
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-3">
            <div className="flex flex-col rounded-lg bg-white/8 p-3">
              <dt className="text-xs text-panel-muted">Remotas</dt>
              <dd className="order-first text-xl font-semibold tabular-nums">{percent(remote, total)}%</dd>
            </div>
            <div className="flex flex-col rounded-lg bg-white/8 p-3">
              <dt className="text-xs text-panel-muted">Júnior</dt>
              <dd className="order-first text-xl font-semibold tabular-nums">{junior}</dd>
            </div>
          </dl>
          <a
            href={`https://www.itjobs.pt/emprego?q=${encodeURIComponent(selected)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-4 inline-flex min-h-6 items-center gap-1 text-sm font-medium text-panel-signal-strong underline underline-offset-4 hover:no-underline ${focusRing}`}
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
                  <span aria-hidden="true" className="h-2.5 overflow-hidden rounded-full bg-white/12">
                    <span
                      style={{ width: `${share}%` }}
                      className={`block h-full rounded-full motion-safe:transition-[width] motion-safe:duration-500 ${
                        index === 0 ? 'bg-panel-signal-strong' : 'bg-panel-signal'
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
