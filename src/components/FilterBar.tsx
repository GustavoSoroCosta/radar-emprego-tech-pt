import { AREA_LABELS, WORK_MODE_LABELS } from '@/lib/aggregate'
import { DEFAULT_FILTERS, type AreaFilter, type Filters } from '@/lib/filters'
import type { Area, WorkMode } from '@/lib/types'

const AREA_OPTIONS: { value: AreaFilter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  ...(Object.entries(AREA_LABELS) as [Area, string][]).map(([value, label]) => ({ value, label })),
]

interface FilterBarProps {
  filters: Filters
  cities: string[]
  onChange: (filters: Filters) => void
}

// Same visible focus ring on every control; the browser default is hard to see on the dark background.
const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500'

const buttonClass =
  `shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm transition-colors ${focusRing} ` +
  'border-zinc-300 hover:bg-zinc-100 aria-pressed:border-violet-600 aria-pressed:bg-violet-600 aria-pressed:text-white ' +
  'dark:border-zinc-700 dark:hover:bg-zinc-800 dark:aria-pressed:bg-violet-600 ' +
  // High contrast mode drops background colours, so the pressed state would vanish; use the system highlight instead.
  'forced-colors:aria-pressed:forced-color-adjust-none forced-colors:aria-pressed:border-[Highlight] ' +
  'forced-colors:aria-pressed:bg-[Highlight] forced-colors:aria-pressed:text-[HighlightText]'

const selectClass = `min-w-0 flex-1 md:flex-none rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 disabled:opacity-50 dark:border-zinc-700 ${focusRing}`

/** Filter controls. Toggle buttons expose their state with aria-pressed; selects are native for free keyboard support. */
export function FilterBar({ filters, cities, onChange }: FilterBarProps) {
  const set = (changes: Partial<Filters>) => onChange({ ...filters, ...changes })

  return (
    // On wider screens the filters stay pinned while scrolling through the charts. The frosted
    // background is mostly opaque, so the text keeps its contrast whatever passes underneath.
    <div className="mb-8 flex flex-col gap-4 md:sticky md:top-0 md:z-20 md:-mx-4 md:border-b md:border-zinc-200/80 md:bg-background/90 md:px-4 md:py-4 md:backdrop-blur-md md:dark:border-zinc-800/80">
      {/* One swipeable row on phones instead of three rows of chips; wraps normally from md up. */}
      <div
        role="group"
        aria-label="Área"
        className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:pb-0"
      >
        <span className="mr-1 shrink-0 text-sm text-zinc-600 dark:text-zinc-400" aria-hidden="true">
          Área
        </span>
        {AREA_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={filters.area === option.value}
            onClick={() => set({ area: option.value })}
            className={buttonClass}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 items-center gap-3 md:flex md:flex-wrap">
        <button
          type="button"
          aria-pressed={filters.mine}
          onClick={() => set({ mine: !filters.mine })}
          className={buttonClass}
          aria-describedby="mine-hint"
        >
          ★ As minhas vagas
        </button>

        <label className="flex min-w-0 items-center gap-2 text-sm">
          Cidade
          <select
            name="cidade"
            className={selectClass}
            value={filters.city ?? ''}
            disabled={filters.mine}
            onChange={(event) => set({ city: event.target.value || null })}
          >
            <option value="">Todas</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>

        <label className="flex min-w-0 items-center gap-2 text-sm">
          Regime
          <select
            name="regime"
            className={selectClass}
            value={filters.workMode ?? ''}
            disabled={filters.mine}
            onChange={(event) => set({ workMode: (event.target.value || null) as WorkMode | null })}
          >
            <option value="">Todos</option>
            {(Object.keys(WORK_MODE_LABELS) as WorkMode[]).map((mode) => (
              <option key={mode} value={mode}>
                {WORK_MODE_LABELS[mode]}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={() => onChange(DEFAULT_FILTERS)}
          className={`inline-flex min-h-6 items-center justify-self-end text-sm text-zinc-600 underline hover:no-underline dark:text-zinc-400 ${focusRing}`}
        >
          Limpar filtros
        </button>
      </div>

      {/* Shown while the shortcut is on, so the page stays clean otherwise. Screen readers always
          get it through aria-describedby, which also reads hidden elements. */}
      <p id="mine-hint" className={`-mt-2 text-xs text-zinc-600 dark:text-zinc-400 ${filters.mine ? '' : 'hidden'}`}>
        ★ As minhas vagas: os critérios do autor, presencial em Viana do Castelo, híbrido no Porto ou remoto.
      </p>
    </div>
  )
}
