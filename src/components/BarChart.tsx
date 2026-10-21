import { scaleBand, scaleLinear } from 'd3'
import { useId } from 'react'
import { jobsLabel, type CountItem } from '@/lib/aggregate'
import { shareLabel, SMALL_SAMPLE } from '@/lib/insights'

interface BarChartProps {
  title: string
  data: CountItem[]
  /** Number of jobs the counts come from; bars show their share of it. */
  total: number
  /** Header of the first column in the accessible table. */
  labelHeader?: string
  width?: number
}

const BAR_HEIGHT = 28
const MARGIN = { top: 8, right: 40, bottom: 8, left: 110 }

/**
 * Horizontal bar chart. D3 only computes the scales; React draws the SVG,
 * so the chart renders on the server and needs no client JavaScript.
 * Accessible: the title is an h2 so screen reader users can jump between charts,
 * and a visually hidden table carries the data. The SVG itself is hidden from
 * assistive tech so the numbers are not read twice.
 */
export function BarChart({ title, data, total, labelHeader = 'Tecnologia', width = 560 }: BarChartProps) {
  const id = useId()
  const height = MARGIN.top + MARGIN.bottom + data.length * BAR_HEIGHT
  const max = Math.max(0, ...data.map((d) => d.count))

  const x = scaleLinear().domain([0, max]).range([0, width - MARGIN.left - MARGIN.right])
  const y = scaleBand<string>()
    .domain(data.map((d) => d.label))
    .range([MARGIN.top, height - MARGIN.bottom])
    .padding(0.25)

  return (
    <figure>
      <figcaption>
        <h2 id={id} className="font-semibold">
          {title}
        </h2>
        <p className="mb-2 text-xs text-zinc-600 dark:text-zinc-400">
          Base: {jobsLabel(total)}.
          {total < SMALL_SAMPLE && (
            <span className="text-amber-700 dark:text-amber-400"> Amostra pequena, ler com cautela.</span>
          )}
        </p>
      </figcaption>
      <svg viewBox={`0 0 ${width} ${height}`} aria-hidden="true" className="w-full text-sm">
        {/* Positions go through CSS (style) rather than SVG attributes so they can be transitioned
            when the filters change; motion-safe turns the animation off for prefers-reduced-motion. */}
        {data.map((d) => (
          <g
            key={d.label}
            style={{ transform: `translateY(${y(d.label)}px)` }}
            className="motion-safe:transition-transform motion-safe:duration-500"
          >
            <text x={MARGIN.left - 8} y={y.bandwidth() / 2} dy="0.35em" textAnchor="end" className="fill-current">
              {d.label}
            </text>
            <rect
              x={MARGIN.left}
              height={y.bandwidth()}
              rx={3}
              style={{ width: x(d.count) }}
              className="fill-violet-600 motion-safe:transition-[width] motion-safe:duration-500"
            />
            <text
              x={MARGIN.left + 6}
              y={y.bandwidth() / 2}
              dy="0.35em"
              style={{ transform: `translateX(${x(d.count)}px)` }}
              className="fill-current motion-safe:transition-transform motion-safe:duration-500"
            >
              {shareLabel(d.count, total)}
            </text>
          </g>
        ))}
      </svg>
      <table aria-labelledby={id} className="sr-only">
        <thead>
          <tr>
            <th scope="col">{labelHeader}</th>
            <th scope="col">% das vagas</th>
            <th scope="col">Vagas</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.label}>
              <th scope="row">{d.label}</th>
              <td>{shareLabel(d.count, total)}</td>
              <td>{d.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
