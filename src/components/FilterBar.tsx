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
const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal'

const buttonClass =
  `shrink-0 touch-manipulation whitespace-nowrap rounded-full border px-3 py-1.5 text-sm transition-colors ${focusRing} ` +
  // Pressed chips take the ink colour; the tokens flip with the theme, so no dark: variants are needed.
  'border-line bg-card hover:border-ink/40 aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-paper ' +
  // High contrast mode drops background colours, so the pressed state would vanish; use the system highlight instead.
  'forced-colors:aria-pressed:forced-color-adjust-none forced-colors:aria-pressed:border-[Highlight] ' +
  'forced-colors:aria-pressed:bg-[Highlight] forced-colors:aria-pressed:text-[HighlightText]'

const selectClass = `min-w-0 flex-1 md:flex-none rounded-md border border-line bg-card px-2 py-1.5 text-sm text-ink ${focusRing}`

/** Filter controls. Toggle buttons expose their state with aria-pressed; selects are native for free keyboard support. */
export function FilterBar({ filters, cities, onChange }: FilterBarProps) {
  const set = (changes: Partial<Filters>) => onChange({ ...filters, ...changes })
  // Only offered when there is something to clear, so it never sits alone on an empty row.
  const filtered = filters.area !== 'all' || filters.city !== null || filters.workMode !== null

  return (
    // On wider screens the filters stay pinned while scrolling through the charts. The frosted
    // background is mostly opaque, so the text keeps its contrast whatever passes underneath.
    <div className="mb-8 flex flex-col gap-4 md:sticky md:top-0 md:z-20 md:-mx-4 md:border-b md:border-line md:bg-paper/90 md:px-4 md:py-4 md:backdrop-blur-md">
      {/* One swipeable row on phones instead of three rows of chips; wraps normally from md up. */}
      <div
        role="group"
        aria-label="Área"
        className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:pb-0"
      >
        <span className="mr-1 shrink-0 text-sm text-muted" aria-hidden="true">
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
        <label className="flex min-w-0 items-center gap-2 text-sm">
          Cidade
          <select
            name="cidade"
            className={selectClass}
            value={filters.city ?? ''}
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

        {filtered && (
          <button
            type="button"
            onClick={() => onChange(DEFAULT_FILTERS)}
            className={`col-span-2 inline-flex min-h-6 items-center justify-self-end text-sm text-muted underline underline-offset-2 hover:text-ink ${focusRing}`}
          >
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  )
}
