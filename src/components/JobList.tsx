import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { WORK_MODE_LABELS } from '@/lib/aggregate'
import type { Job } from '@/lib/types'

const PAGE_SIZE = 10

// From the date part only: itjobs sends "2026-10-17 14:05:00", which not every browser parses the
// same way, and a fixed UTC date renders identically on the server and in the browser.
const dateFormat = new Intl.DateTimeFormat('pt-PT', { day: 'numeric', month: 'long', timeZone: 'UTC' })

function publishedLabel(publishedAt: string) {
  const [year, month, day] = publishedAt.slice(0, 10).split('-').map(Number)
  return dateFormat.format(new Date(Date.UTC(year, month - 1, day)))
}

function placeAndMode(job: Job) {
  const mode = job.workMode && WORK_MODE_LABELS[job.workMode].toLowerCase()
  return [job.cities.join(', '), mode].filter(Boolean).join(', ')
}

/**
 * The jobs behind the numbers, newest first, each linking to its ad on itjobs.pt. Only the title,
 * company, place and date are shown: the ad itself stays on itjobs. Ten at a time, so a broad view
 * of 800 jobs does not turn the page into a feed.
 */
export function JobList({ jobs }: { jobs: Job[] }) {
  const [shown, setShown] = useState(PAGE_SIZE)
  const listRef = useRef<HTMLUListElement>(null)
  // A text compare is enough: every date starts with YYYY-MM-DD.
  const newest = [...jobs].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
  const remaining = newest.length - shown

  function showMore() {
    const firstNew = shown
    flushSync(() => setShown(shown + PAGE_SIZE))
    // Keyboard and screen reader users land on the first job that was added, not back on the button.
    listRef.current?.children[firstNew]?.querySelector('a')?.focus()
  }

  return (
    <section
      id="vagas"
      aria-labelledby="vagas-titulo"
      className="mb-6 rounded-lg border border-line bg-card p-5"
    >
      {/* No visible title: the dates and links speak for themselves. Screen reader users still get a
          heading to jump to, and the order, which sighted users read from the dates. */}
      <h2 id="vagas-titulo" className="sr-only">
        As vagas, da mais recente para a mais antiga
      </h2>
      <ul ref={listRef} className="-mt-3 divide-y divide-line">
        {newest.slice(0, shown).map((job) => {
          const rest = placeAndMode(job)
          return (
            // The date sits under the details on phones and on the right from sm up, never in between.
            <li key={job.id} className="py-3 sm:flex sm:items-baseline sm:justify-between sm:gap-x-4">
              <div className="min-w-0">
                {job.url ? (
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline decoration-line underline-offset-4 hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                  >
                    {job.title}{' '}
                    <span className="sr-only">(abre numa nova janela)</span>
                  </a>
                ) : (
                  <span className="font-medium">{job.title}</span>
                )}
                {/* The company in the darker colour, so it reads apart from a long list of cities. */}
                <p className="text-sm text-muted">
                  {job.company && (
                    <span className="text-ink">
                      {job.company}
                      {rest && ', '}
                    </span>
                  )}
                  {rest}
                </p>
              </div>
              <time dateTime={job.publishedAt.slice(0, 10)} className="block text-xs text-muted sm:shrink-0">
                {publishedLabel(job.publishedAt)}
              </time>
            </li>
          )
        })}
      </ul>
      {remaining > 0 && (
        <button
          type="button"
          onClick={showMore}
          className="mt-3 min-h-6 touch-manipulation rounded-full border border-line px-4 py-1.5 text-sm text-ink transition-colors hover:border-ink/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
        >
          Mostrar mais {Math.min(PAGE_SIZE, remaining)}
        </button>
      )}
    </section>
  )
}
