import { WORK_MODE_LABELS } from '@/lib/aggregate'
import { DEFAULT_FILTERS, type AreaFilter, type Filters } from '@/lib/filters'
import type { WorkMode } from '@/lib/types'

const AREA_OPTIONS: { value: AreaFilter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'fullstack', label: 'Fullstack' },
]

interface FilterBarProps {
  filters: Filters
  cities: string[]
  onChange: (filters: Filters) => void
}

// Same visible focus ring on every control; the browser default is hard to see on the dark background.
const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500'

const buttonClass =
  `rounded-full border px-3 py-1.5 text-sm transition-colors ${focusRing} ` +
  'border-zinc-300 hover:bg-zinc-100 aria-pressed:border-violet-600 aria-pressed:bg-violet-600 aria-pressed:text-white ' +
  'dark:border-zinc-700 dark:hover:bg-zinc-800 dark:aria-pressed:bg-violet-600 ' +
  // High contrast mode drops background colours, so the pressed state would vanish; use the system highlight instead.
  'forced-colors:aria-pressed:forced-color-adjust-none forced-colors:aria-pressed:border-[Highlight] ' +
  'forced-colors:aria-pressed:bg-[Highlight] forced-colors:aria-pressed:text-[HighlightText]'

const selectClass = `rounded-md border border-zinc-300 bg-transparent px-2 py-1.5 text-sm disabled:opacity-50 dark:border-zinc-700 ${focusRing}`

/** Filter controls. Toggle buttons expose their state with aria-pressed; selects are native for free keyboard support. */
export function FilterBar({ filters, cities, onChange }: FilterBarProps) {
  const set = (changes: Partial<Filters>) => onChange({ ...filters, ...changes })

  return (
    <div className="mb-8 flex flex-col gap-4">
      <div role="group" aria-label="Área" className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm text-zinc-600 dark:text-zinc-400" aria-hidden="true">
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

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          aria-pressed={filters.mine}
          onClick={() => set({ mine: !filters.mine })}
          className={buttonClass}
          title="Presencial em Viana do Castelo, híbrido no Porto ou remoto"
        >
          ★ As minhas vagas
        </button>

        <label className="flex items-center gap-2 text-sm">
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

        <label className="flex items-center gap-2 text-sm">
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
          className={`text-sm text-zinc-600 underline hover:no-underline dark:text-zinc-400 ${focusRing}`}
        >
          Limpar filtros
        </button>
      </div>
    </div>
  )
}
