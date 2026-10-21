import { scaleBand, scaleLinear } from 'd3'
import { useEffect, useId, useRef, useState } from 'react'
import { jobsLabel, type CountItem } from '@/lib/aggregate'
import { shareLabel, SMALL_SAMPLE, topInsight } from '@/lib/insights'

interface BarChartProps {
  title: string
  data: CountItem[]
  /** Number of jobs the counts come from; bars show their share of it. */
  total: number
  /** Header of the first column in the accessible table. */
  labelHeader?: string
}

const BAR_HEIGHT = 28
const MARGIN = { top: 8, right: 40, bottom: 8, left: 110 }
// Width used on the server and before the first measurement; close to a card on desktop.
const DEFAULT_WIDTH = 400

/**
 * Horizontal bar chart. D3 only computes the scales; React draws the SVG.
 * The viewBox follows the real width of the chart (ResizeObserver), so the text stays
 * at 14px on any screen instead of shrinking with the drawing.
 * Accessible: the title is an h2 so screen reader users can jump between charts,
 * and a visually hidden table carries the data. The SVG itself is hidden from
 * assistive tech so the numbers are not read twice.
 */
export function BarChart({ title, data, total, labelHeader = 'Tecnologia' }: BarChartProps) {
  const id = useId()
  const svgRef = useRef<SVGSVGElement>(null)
  const [measured, setMeasured] = useState(DEFAULT_WIDTH)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(([entry]) => setMeasured(Math.round(entry.contentRect.width)))
    observer.observe(svg)
    return () => observer.disconnect()
  }, [])

  // Never narrower than the label column plus a little room for the bars.
  const width = Math.max(measured, MARGIN.left + MARGIN.right + 60)
  const height = MARGIN.top + MARGIN.bottom + data.length * BAR_HEIGHT
  const max = Math.max(0, ...data.map((d) => d.count))
  const insight = topInsight(data, total)

  const x = scaleLinear().domain([0, max]).range([0, width - MARGIN.left - MARGIN.right])
  const y = scaleBand<string>()
    .domain(data.map((d) => d.label))
    .range([MARGIN.top, height - MARGIN.bottom])
    .padding(0.25)

  return (
    <figure className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
      <figcaption>
        <h2 id={id} className="font-semibold">
          {title}
        </h2>
        {/* The takeaway in words, as data journalism does, so the reader does not have to work it out. */}
        {insight && <p className="mt-1 text-sm">{insight}</p>}
        <p className="mb-2 text-xs text-zinc-600 dark:text-zinc-400">
          Base: {jobsLabel(total)}.
          {total < SMALL_SAMPLE && (
            <span className="text-amber-700 dark:text-amber-400"> Amostra pequena, ler com cautela.</span>
          )}
        </p>
      </figcaption>
      <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" className="w-full text-sm">
        {/* Positions go through CSS (style) rather than SVG attributes so they can be transitioned
            when the filters change; motion-safe turns the animation off for prefers-reduced-motion. */}
        {data.map((d, index) => (
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
              // The leader gets the darker shade, matching the sentence above the chart.
              // Both shades keep at least 3:1 against the card, in light and dark mode.
              className={`motion-safe:transition-[width] motion-safe:duration-500 ${
                index === 0 ? 'fill-violet-700 dark:fill-violet-300' : 'fill-violet-500'
              }`}
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
