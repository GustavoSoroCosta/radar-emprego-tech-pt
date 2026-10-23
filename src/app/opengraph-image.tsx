import { ImageResponse } from 'next/og'
import { countTechnologies, percent } from '@/lib/aggregate'
import { getJobs } from '@/lib/jobs'

// Same daily rhythm as the page, so the numbers in the preview match the dashboard.
export const revalidate = 86400

export const alt = 'Radar do Emprego Tech PT: o que as empresas tech em Portugal pedem nas vagas'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/** Preview shown when the link is shared on LinkedIn and similar sites, with the numbers of the day. */
export default async function Image() {
  const { jobs } = await getJobs()
  const remoteOrHybrid = jobs.filter((job) => job.workMode === 'remote' || job.workMode === 'hybrid').length
  const topTechnologies = countTechnologies(jobs, 3).map((t) => t.label)

  const stats = [
    { value: String(jobs.length), label: 'vagas analisadas' },
    { value: `${percent(remoteOrHybrid, jobs.length)}%`, label: 'remotas ou híbridas' },
    { value: topTechnologies.join(', '), label: 'tecnologias mais pedidas' },
  ]

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: '#102231',
          color: '#eef4f7',
          position: 'relative',
        }}
      >
        {/* Centred on the bottom-right corner, the only area the text never reaches. */}
        {[360, 240, 120].map((d) => (
          <div
            key={d}
            style={{
              position: 'absolute',
              bottom: -d / 2,
              right: -d / 2,
              width: d,
              height: d,
              borderRadius: d,
              border: '2px solid rgba(92, 196, 200, 0.35)',
            }}
          />
        ))}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 72 }}>Radar do Emprego Tech PT</div>
          <div style={{ fontSize: 32, color: '#a9bccb', marginTop: 16 }}>
            O que as empresas tech em Portugal estão a pedir nas vagas
          </div>
        </div>
        <div style={{ display: 'flex', gap: 48 }}>
          {stats.map((stat) => (
            <div key={stat.label} style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 56, color: '#5cc4c8' }}>{stat.value}</div>
              <div style={{ fontSize: 26, color: '#a9bccb' }}>{stat.label}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 24, color: '#a9bccb' }}>Dados do itjobs.pt. Feito por Gustavo Soro Costa.</div>
      </div>
    ),
    size,
  )
}
