import { scaleBand, scaleLinear } from 'd3'
import { useId } from 'react'
import type { CountItem } from '@/lib/aggregate'

interface BarChartProps {
  title: string
  data: CountItem[]
  /** Header of the first column in the accessible table. */
  labelHeader?: string
  width?: number
}

const BAR_HEIGHT = 28
const MARGIN = { top: 8, right: 40, bottom: 8, left: 110 }

/**
 * Horizontal bar chart. D3 only computes the scales; React draws the SVG,
 * so the chart renders on the server and needs no client JavaScript.
 * Accessible: the SVG has a title and description, and a visually hidden
 * table repeats the same data for screen readers.
 */
export function BarChart({ title, data, labelHeader = 'Tecnologia', width = 560 }: BarChartProps) {
  const id = useId()
  const height = MARGIN.top + MARGIN.bottom + data.length * BAR_HEIGHT
  const max = Math.max(0, ...data.map((d) => d.count))

  const x = scaleLinear().domain([0, max]).range([0, width - MARGIN.left - MARGIN.right])
  const y = scaleBand<string>()
    .domain(data.map((d) => d.label))
    .range([MARGIN.top, height - MARGIN.bottom])
    .padding(0.25)

  const summary = data.map((d) => `${d.label}: ${d.count}`).join(', ')

  return (
    <figure>
      <figcaption id={`${id}-title`} className="mb-2 font-semibold">
        {title}
      </figcaption>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-labelledby={`${id}-title ${id}-desc`}
        className="w-full text-sm"
      >
        <desc id={`${id}-desc`}>{summary}</desc>
        {/* Positions go through CSS (style) rather than SVG attributes so they can be transitioned
            when the filters change; motion-safe turns the animation off for prefers-reduced-motion. */}
        {data.map((d) => (
          <g
            key={d.label}
            style={{ transform: `translateY(${y(d.label)}px)` }}
            className="motion-safe:transition-transform motion-safe:duration-500"
            aria-hidden="true"
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
              {d.count}
            </text>
          </g>
        ))}
      </svg>
      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">{labelHeader}</th>
            <th scope="col">Vagas</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.label}>
              <th scope="row">{d.label}</th>
              <td>{d.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
