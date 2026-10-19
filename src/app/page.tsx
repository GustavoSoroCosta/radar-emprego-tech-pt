import { Suspense } from 'react'
import { Dashboard, DashboardView } from '@/components/Dashboard'
import { DEFAULT_FILTERS } from '@/lib/filters'
import { getJobs } from '@/lib/jobs'

// Rebuild the page at most once a day, matching the cache of the API calls.
export const revalidate = 86400

export default async function Home() {
  const { jobs, source, error } = await getJobs()

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12">
      <header className="mb-8">
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

      {/* The fallback is the full, unfiltered dashboard, so the page is complete before React loads. */}
      <Suspense fallback={<DashboardView jobs={jobs} filters={DEFAULT_FILTERS} />}>
        <Dashboard jobs={jobs} />
      </Suspense>

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
