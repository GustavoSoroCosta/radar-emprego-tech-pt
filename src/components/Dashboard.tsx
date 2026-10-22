'use client'

import { useMemo, useState, useSyncExternalStore } from 'react'
import { BarChart } from '@/components/BarChart'
import { CopyLinkButton } from '@/components/CopyLinkButton'
import { FilterBar } from '@/components/FilterBar'
import { StatCard } from '@/components/StatCard'
import { TechExplorer } from '@/components/TechExplorer'
import { countAreas, countBy, countCompanies, countTechnologies, jobsLabel, percent } from '@/lib/aggregate'
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

// The URL is the single source of truth for the filters. history.replaceState fires no event,
// so the dashboard announces its own changes with this one.
const URL_CHANGE = 'radar:url-change'

function subscribeToUrl(onChange: () => void) {
  window.addEventListener('popstate', onChange)
  window.addEventListener(URL_CHANGE, onChange)
  return () => {
    window.removeEventListener('popstate', onChange)
    window.removeEventListener(URL_CHANGE, onChange)
  }
}

/**
 * Interactive dashboard: filters are read from the URL, so a view can be shared as a link.
 * The server has no URL query (the page is static), so it renders the default filters and the
 * browser hydrates that same markup before applying the query. One tree, rendered once, which
 * keeps the entrance animations from restarting.
 */
export function Dashboard({ jobs }: { jobs: Job[] }) {
  const search = useSyncExternalStore(
    subscribeToUrl,
    () => window.location.search,
    () => '',
  )
  const filters = useMemo(() => filtersFromSearch(new URLSearchParams(search)), [search])

  // Top cities are worked out once from all jobs, so the list does not jump around while filtering.
  const cities = useMemo(() => countBy(jobs, (job) => job.cities, 12).map((c) => c.label), [jobs])

  function changeFilters(next: Filters) {
    window.history.replaceState(null, '', `${window.location.pathname}${filtersToSearch(next)}`)
    window.dispatchEvent(new Event(URL_CHANGE))
  }

  return (
    <>
      <FilterBar filters={filters} cities={cities} onChange={changeFilters} />
      <DashboardView jobs={jobs} filters={filters} />
    </>
  )
}

/** The numbers and charts for a given set of filters. */
function DashboardView({ jobs, filters }: { jobs: Job[]; filters: Filters }) {
  // Filtering ~800 jobs takes well under a millisecond, so there is no need to memoise it.
  const visible = applyFilters(jobs, filters)
  const total = visible.length
  const remote = visible.filter((job) => job.workMode === 'remote').length
  const hybrid = visible.filter((job) => job.workMode === 'hybrid').length
  const junior = visible.filter((job) => job.junior).length
  const frontendJobs = visible.filter((job) => job.area === 'frontend')
  const companies = countCompanies(visible)
  const areaName = AREA_NAMES[filters.area]

  // The explorer's pick survives filter changes while the technology still appears; otherwise it
  // falls back to the most requested one.
  const [picked, setPicked] = useState<string | null>(null)
  const technologies = countTechnologies(visible, Infinity).map((item) => item.label)
  const selected = picked && technologies.includes(picked) ? picked : technologies[0]

  function explore(technology: string) {
    setPicked(technology)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.getElementById('explorador')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' })
  }

  const explorer = selected && (
    <TechExplorer jobs={visible} options={technologies} selected={selected} onSelect={setPicked} delay={400} />
  )
  const cityChart = (
    <BarChart
      title="Vagas por cidade"
      labelHeader="Cidade"
      data={countBy(visible, (job) => job.cities, 8)}
      total={total}
      delay={filters.area === 'all' ? 560 : 320}
    />
  )

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p role="status" aria-live="polite" className="text-sm text-zinc-600 dark:text-zinc-400">
          A mostrar {jobsLabel(total)}
          {areaName}
          {filters.mine && ' que encaixam nas minhas preferências'}.
        </p>
        <CopyLinkButton />
      </div>

      {total === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-400">
          Nenhuma vaga com estes filtros. Experimente limpar algum.
        </p>
      ) : (
        <>
          <dl className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard
              label="Vagas"
              value={total}
              detail={`de ${companies} ${companies === 1 ? 'empresa' : 'empresas'}`}
            />
            <StatCard
              label="Remotas"
              delay={60}
              value={percent(remote, total)}
              suffix="%"
              share={percent(remote, total)}
              detail={jobsLabel(remote)}
            />
            <StatCard
              label="Híbridas"
              delay={120}
              value={percent(hybrid, total)}
              suffix="%"
              share={percent(hybrid, total)}
              detail={jobsLabel(hybrid)}
            />
            <StatCard
              label="Júnior"
              delay={180}
              value={percent(junior, total)}
              suffix="%"
              share={percent(junior, total)}
              detail={`${jobsLabel(junior)} com júnior, estágio ou trainee no título`}
            />
          </dl>

          {/* Two charts per row with the explorer as a full-width band, so no card is left alone on a
              row. No work model chart: the remote and hybrid cards above already say it. */}
          <div className="grid gap-6 md:grid-cols-2">
            <BarChart
              title={`Tecnologias mais pedidas nas vagas${areaName}`}
              data={countTechnologies(visible)}
              total={total}
              onSelect={explore}
              delay={240}
            />
            {filters.area === 'all' ? (
              <>
                <BarChart
                  title="Tecnologias nas vagas de frontend"
                  data={countTechnologies(frontendJobs)}
                  total={frontendJobs.length}
                  onSelect={explore}
                  delay={320}
                />
                {explorer}
                <BarChart
                  title="Vagas por área"
                  labelHeader="Área"
                  data={countAreas(visible)}
                  total={total}
                  delay={480}
                />
                {cityChart}
              </>
            ) : (
              <>
                {cityChart}
                {explorer}
              </>
            )}
          </div>
        </>
      )}
    </>
  )
}
