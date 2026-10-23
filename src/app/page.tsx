import { Dashboard } from '@/components/Dashboard'
import { Methodology } from '@/components/Methodology'
import { RadarScope } from '@/components/RadarScope'
import { getJobs } from '@/lib/jobs'

// Rebuild the page at most once a day, matching the cache of the API calls.
export const revalidate = 86400

const linkClass =
  'text-ink underline underline-offset-2 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal'

export default async function Home() {
  const { jobs, source, error } = await getJobs()
  // The page is generated right after the data is fetched, so the render time is the date of the data.
  const fetchedAt = new Date()
  const fetchedAtLabel = new Intl.DateTimeFormat('pt-PT', { dateStyle: 'long', timeZone: 'Europe/Lisbon' }).format(
    fetchedAt,
  )

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:py-14">
      <header className="mb-10 grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <h1 className="font-display text-4xl leading-[1.05] font-bold tracking-tight text-balance [font-stretch:115%] sm:text-5xl">
            Radar do Emprego Tech PT
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted">
            O que as empresas tech em Portugal estão a pedir nas vagas, com base nas ofertas publicadas no itjobs.pt.
            {source === 'sample' && !error && ' Neste momento com dados de exemplo.'}
          </p>
          {source === 'itjobs' && (
            <p className="mt-5 flex items-start gap-2 text-sm text-muted">
              {/* Lined up with the first line, so it stays put when the sentence wraps on a phone. */}
              <span className="mt-1.5 size-2 shrink-0 rounded-full bg-signal" aria-hidden="true" />
              <span>
                Leitura de <time dateTime={fetchedAt.toISOString()}>{fetchedAtLabel}</time>. Atualiza uma vez por dia.
              </span>
            </p>
          )}
          {error && (
            <p role="status" className="mt-4 text-sm font-medium text-ink">
              {error} A mostrar dados de exemplo.
            </p>
          )}
        </div>
        <RadarScope className="hidden size-40 md:block lg:size-48" />
      </header>

      {/* Rendered on the server with the default filters, so the page is complete before React loads. */}
      <Dashboard jobs={jobs} />

      <Methodology />

      <footer className="mt-10 space-y-2 border-t border-line pt-5 text-sm text-muted">
        <p>
          Dados do{' '}
          <a href="https://www.itjobs.pt" className={linkClass}>
            itjobs.pt
          </a>
          , usados com autorização.
        </p>
        <p>
          Feito por Gustavo Soro Costa. O código está no{' '}
          <a href="https://github.com/GustavoSoroCosta/radar-emprego-tech-pt" className={linkClass}>
            GitHub
          </a>{' '}
          e o perfil no{' '}
          <a href="https://www.linkedin.com/in/gustavo-soro-costa" className={linkClass}>
            LinkedIn
          </a>
          .
        </p>
      </footer>
    </main>
  )
}
