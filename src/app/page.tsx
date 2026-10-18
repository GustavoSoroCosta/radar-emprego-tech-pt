import { BarChart } from '@/components/BarChart'
import { countTechnologies } from '@/lib/aggregate'
import { getJobs } from '@/lib/jobs'

// Rebuild the page at most once a day, matching the cache of the API calls.
export const revalidate = 86400

export default async function Home() {
  const { jobs, source, error } = await getJobs()
  const technologies = countTechnologies(jobs)

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Radar do Emprego Tech PT</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          O que as empresas tech em Portugal estão a pedir nas vagas.{' '}
          {source === 'itjobs'
            ? `${jobs.length} vagas analisadas.`
            : `${jobs.length} vagas de exemplo.`}
        </p>
        {error && (
          <p role="status" className="mt-2 text-sm text-amber-700 dark:text-amber-400">
            {error} A mostrar dados de exemplo.
          </p>
        )}
      </header>

      <BarChart title="Tecnologias mais pedidas" data={technologies} />

      <footer className="mt-12 border-t border-zinc-200 pt-4 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
        Dados:{' '}
        <a href="https://www.itjobs.pt" className="underline hover:no-underline">
          itjobs.pt
        </a>
        , atualizados uma vez por dia.
      </footer>
    </main>
  )
}
