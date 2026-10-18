import { BarChart } from '@/components/BarChart'
import { StatCard } from '@/components/StatCard'
import { countBy, countTechnologies, countWorkModes, isFrontendJob, percent } from '@/lib/aggregate'
import { getJobs } from '@/lib/jobs'

// Rebuild the page at most once a day, matching the cache of the API calls.
export const revalidate = 86400

export default async function Home() {
  const { jobs, source, error } = await getJobs()

  const total = jobs.length
  const frontendJobs = jobs.filter(isFrontendJob)
  const remote = jobs.filter((job) => job.workMode === 'remote').length
  const hybrid = jobs.filter((job) => job.workMode === 'hybrid').length
  const junior = jobs.filter((job) => job.junior).length

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Radar do Emprego Tech PT</h1>
        <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
          O que as empresas tech em Portugal estão a pedir nas vagas, com base nas ofertas publicadas no
          itjobs.pt.{source === 'sample' && ' Neste momento com dados de exemplo.'}
        </p>
        {error && (
          <p role="status" className="mt-2 text-sm text-amber-700 dark:text-amber-400">
            {error} A mostrar dados de exemplo.
          </p>
        )}
      </header>

      <dl className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Vagas analisadas" value={String(total)} />
        <StatCard label="Vagas remotas" value={`${percent(remote, total)}%`} detail={`${remote} vagas`} />
        <StatCard label="Vagas híbridas" value={`${percent(hybrid, total)}%`} detail={`${hybrid} vagas`} />
        <StatCard
          label="Vagas júnior"
          value={`${percent(junior, total)}%`}
          detail={`${junior} vagas com júnior, estágio ou trainee no título`}
        />
      </dl>

      <div className="grid gap-12 md:grid-cols-2">
        <BarChart
          title={`Tecnologias nas vagas de frontend (${frontendJobs.length} vagas)`}
          data={countTechnologies(frontendJobs)}
        />
        <BarChart title="Tecnologias mais pedidas em todas as vagas" data={countTechnologies(jobs)} />
        <BarChart title="Vagas por cidade" labelHeader="Cidade" data={countBy(jobs, (job) => job.cities, 8)} />
        <BarChart title="Vagas por regime de trabalho" labelHeader="Regime" data={countWorkModes(jobs)} />
      </div>

      <footer className="mt-12 border-t border-zinc-200 pt-4 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
        Dados:{' '}
        <a href="https://www.itjobs.pt" className="underline hover:no-underline">
          itjobs.pt
        </a>
        , atualizados uma vez por dia. Uma vaga pode contar em várias cidades e pedir várias tecnologias.
      </footer>
    </main>
  )
}
