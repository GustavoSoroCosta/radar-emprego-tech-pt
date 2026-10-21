'use client'

import { useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { BarChart } from '@/components/BarChart'
import { FilterBar } from '@/components/FilterBar'
import { StatCard } from '@/components/StatCard'
import { countAreas, countBy, countTechnologies, countWorkModes, jobsLabel, percent } from '@/lib/aggregate'
import { applyFilters, filtersFromSearch, filtersToSearch, type AreaFilter, type Filters } from '@/lib/filters'
import type { Job } from '@/lib/types'

// How each area reads inside a sentence: "A mostrar 20 vagas de frontend".
const AREA_NAMES: Record<AreaFilter, string> = {
  all: '',
  frontend: ' de frontend',
  backend: ' de backend',
  fullstack: ' fullstack',
  mobile: ' de mobile',
  data: ' de dados e IA',
  devops: ' de DevOps e cloud',
  qa: ' de QA e testes',
  other: ' de outras áreas',
}

/** Interactive dashboard: filters live in React state and are mirrored in the URL so a view can be shared. */
export function Dashboard({ jobs }: { jobs: Job[] }) {
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState(() => filtersFromSearch(new URLSearchParams(searchParams.toString())))

  // Top cities are worked out once from all jobs, so the list does not jump around while filtering.
  const cities = useMemo(() => countBy(jobs, (job) => job.cities, 12).map((c) => c.label), [jobs])

  function changeFilters(next: Filters) {
    setFilters(next)
    // Next.js keeps useSearchParams in sync with history.replaceState, without a server round trip.
    window.history.replaceState(null, '', `${window.location.pathname}${filtersToSearch(next)}`)
  }

  return (
    <>
      <FilterBar filters={filters} cities={cities} onChange={changeFilters} />
      <DashboardView jobs={jobs} filters={filters} />
    </>
  )
}

/** The charts for a given set of filters. No hooks, so the server can also render it as the fallback. */
export function DashboardView({ jobs, filters }: { jobs: Job[]; filters: Filters }) {
  // Filtering ~800 jobs takes well under a millisecond, so there is no need to memoise it,
  // and keeping this component free of hooks lets the server render it as the fallback.
  const visible = applyFilters(jobs, filters)
  const total = visible.length
  const remote = visible.filter((job) => job.workMode === 'remote').length
  const hybrid = visible.filter((job) => job.workMode === 'hybrid').length
  const junior = visible.filter((job) => job.junior).length
  const frontendJobs = visible.filter((job) => job.area === 'frontend')
  const areaName = AREA_NAMES[filters.area]

  return (
    <>
      <p role="status" aria-live="polite" className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
        A mostrar {jobsLabel(total)}
        {areaName}
        {filters.mine && ' que encaixam nas minhas preferências'}.
      </p>

      {total === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
          Nenhuma vaga com estes filtros. Experimente limpar algum.
        </p>
      ) : (
        <>
          <dl className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard label="Vagas" value={String(total)} />
            <StatCard
              label="Remotas"
              value={`${percent(remote, total)}%`}
              share={percent(remote, total)}
              detail={jobsLabel(remote)}
            />
            <StatCard
              label="Híbridas"
              value={`${percent(hybrid, total)}%`}
              share={percent(hybrid, total)}
              detail={jobsLabel(hybrid)}
            />
            <StatCard
              label="Júnior"
              value={`${percent(junior, total)}%`}
              share={percent(junior, total)}
              detail={`${jobsLabel(junior)} com júnior, estágio ou trainee no título`}
            />
          </dl>

          <div className="grid gap-12 md:grid-cols-2">
            <BarChart
              title={`Tecnologias mais pedidas nas vagas${areaName}`}
              data={countTechnologies(visible)}
              total={total}
            />
            {filters.area === 'all' && (
              <>
                <BarChart
                  title="Tecnologias nas vagas de frontend"
                  data={countTechnologies(frontendJobs)}
                  total={frontendJobs.length}
                />
                <BarChart title="Vagas por área" labelHeader="Área" data={countAreas(visible)} total={total} />
              </>
            )}
            <BarChart
              title="Vagas por cidade"
              labelHeader="Cidade"
              data={countBy(visible, (job) => job.cities, 8)}
              total={total}
            />
            <BarChart
              title="Vagas por regime de trabalho"
              labelHeader="Regime"
              data={countWorkModes(visible)}
              total={total}
            />
          </div>
        </>
      )}
    </>
  )
}
