import { Dashboard } from '@/components/Dashboard'
import { Methodology } from '@/components/Methodology'
import { RadarLogo } from '@/components/RadarLogo'
import { getJobs } from '@/lib/jobs'

// Rebuild the page at most once a day, matching the cache of the API calls.
export const revalidate = 86400

const linkClass =
  'underline hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500'

export default async function Home() {
  const { jobs, source, error } = await getJobs()
  // The page is generated right after the data is fetched, so the render time is the date of the data.
  const fetchedAt = new Date()
  const fetchedAtLabel = new Intl.DateTimeFormat('pt-PT', { dateStyle: 'long', timeZone: 'Europe/Lisbon' }).format(
    fetchedAt,
  )

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12">
      <header className="relative isolate mb-8 overflow-hidden rounded-2xl border border-violet-100 bg-linear-to-br from-violet-50 to-white p-6 sm:p-8 dark:border-violet-950 dark:from-violet-950/60 dark:to-zinc-950">
        {/* Decorative blurred orbs drifting behind the text; -z-10 inside the isolated header. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-16 -z-10 size-72 rounded-full bg-violet-300/40 blur-3xl motion-safe:animate-float dark:bg-violet-700/30"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 left-1/3 -z-10 size-72 rounded-full bg-fuchsia-200/50 blur-3xl [animation-delay:-7s] motion-safe:animate-float dark:bg-fuchsia-800/20"
        />
        <div className="flex items-center gap-3">
          <RadarLogo className="size-10 shrink-0" />
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Radar do Emprego{' '}
            <span className="bg-linear-to-r from-violet-700 to-fuchsia-600 bg-clip-text text-transparent forced-colors:text-[CanvasText] dark:from-violet-300 dark:to-fuchsia-300">
              Tech PT
            </span>
          </h1>
        </div>
        <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-400">
          O que as empresas tech em Portugal estão a pedir nas vagas, com base nas ofertas publicadas no
          itjobs.pt.{source === 'sample' && ' Neste momento com dados de exemplo.'}
        </p>
        {source === 'itjobs' && (
          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs text-zinc-700 ring-1 ring-violet-200 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-violet-900">
            {/* "Live" dot: a soft ring pulses around it while motion is allowed. */}
            <span className="relative flex size-2" aria-hidden="true">
              <span className="absolute inline-flex size-full rounded-full bg-emerald-400 opacity-75 motion-safe:animate-ping" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            <span>
              Dados de <time dateTime={fetchedAt.toISOString()}>{fetchedAtLabel}</time>, atualizados uma vez por dia
            </span>
          </p>
        )}
        {error && (
          <p role="status" className="mt-2 text-sm text-amber-700 dark:text-amber-400">
            {error} A mostrar dados de exemplo.
          </p>
        )}
      </header>

      {/* Rendered on the server with the default filters, so the page is complete before React loads. */}
      <Dashboard jobs={jobs} />

      <Methodology />

      <footer className="mt-8 space-y-2 border-t border-zinc-200 pt-4 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
        <p>
          Dados:{' '}
          <a href="https://www.itjobs.pt" className={linkClass}>
            itjobs.pt
          </a>
          , com autorização.
        </p>
        <p>
          Feito por Gustavo Soro Costa ·{' '}
          <a href="https://github.com/GustavoSoroCosta/radar-emprego-tech-pt" className={linkClass}>
            Código no GitHub
          </a>{' '}
          ·{' '}
          <a href="https://www.linkedin.com/in/gustavo-soro-costa" className={linkClass}>
            LinkedIn
          </a>
        </p>
      </footer>
    </main>
  )
}
