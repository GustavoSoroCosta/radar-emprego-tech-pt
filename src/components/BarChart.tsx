import { scaleBand, scaleLinear } from 'd3'
import { useEffect, useId, useRef, useState } from 'react'
import { jobsLabel, type CountItem } from '@/lib/aggregate'
import { shareLabel, topInsight } from '@/lib/insights'

interface BarChartProps {
  title: string
  data: CountItem[]
  /** Number of jobs the counts come from; bars show their share of it. */
  total: number
  /** Header of the first column in the accessible table. */
  labelHeader?: string
  /** Entrance delay in ms, so the cards on a page appear one after the other. */
  delay?: number
  /** Makes rows clickable (mouse shortcut; the explorer's select is the keyboard way). */
  onSelect?: (label: string) => void
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
export function BarChart({ title, data, total, labelHeader = 'Tecnologia', delay = 0, onSelect }: BarChartProps) {
  const id = useId()
  const svgRef = useRef<SVGSVGElement>(null)
  const [measured, setMeasured] = useState(DEFAULT_WIDTH)
  const [hovered, setHovered] = useState<number | null>(null)

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
    <figure
      style={{ animationDelay: `${delay}ms` }}
      className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm motion-safe:animate-rise dark:border-zinc-800 dark:bg-zinc-900/50"
    >
      <figcaption>
        <h2 id={id} className="font-semibold">
          {title}
        </h2>
        {/* The takeaway in words, as data journalism does, so the reader does not have to work it out. */}
        {insight && <p className="mt-1 text-sm">{insight}</p>}
        <p className="mb-2 text-xs text-zinc-600 dark:text-zinc-400">Base: {jobsLabel(total)}.</p>
      </figcaption>
      {/* Hovering a row dims the others and shows its job count. Mouse only: the same numbers are
          in the table for screen readers, so this adds no information that is missing elsewhere. */}
      <div className="relative" onPointerLeave={() => setHovered(null)}>
        <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" className="w-full text-sm">
          {/* Positions go through CSS (style) rather than SVG attributes so they can be transitioned
            when the filters change; motion-safe turns the animation off for prefers-reduced-motion. */}
          {data.map((d, index) => (
            <g
              key={d.label}
              style={{ transform: `translateY(${y(d.label)}px)` }}
              // Mouse only: on a touch screen there is no "leave", so a tap would leave the chart
              // dimmed with the tooltip stuck open.
              onPointerEnter={(event) => event.pointerType === 'mouse' && setHovered(index)}
              onClick={onSelect && (() => onSelect(d.label))}
              className={`transition-opacity motion-safe:transition-[transform,opacity] motion-safe:duration-500 ${
                hovered !== null && hovered !== index ? 'opacity-40' : ''
              } ${onSelect ? 'cursor-pointer' : ''}`}
            >
              {/* Invisible hit area across the whole row, so the gaps between bars do not flicker. */}
              <rect width={width} height={BAR_HEIGHT} y={-(BAR_HEIGHT - y.bandwidth()) / 2} fill="transparent" />
              <text x={MARGIN.left - 8} y={y.bandwidth() / 2} dy="0.35em" textAnchor="end" className="fill-current">
                {d.label}
              </text>
              <rect
                x={MARGIN.left}
                height={y.bandwidth()}
                rx={3}
                // On first paint each bar grows from the left, one row after the other; later
                // filter changes animate the width instead.
                style={{
                  width: x(d.count),
                  transformBox: 'fill-box',
                  transformOrigin: 'left',
                  animationDelay: `${delay + 150 + index * 40}ms`,
                }}
                // The leader gets the darker shade, matching the sentence above the chart; catch-all
                // buckets are grey. Every shade keeps at least 3:1 against the card, in both themes.
                className={`motion-safe:animate-grow motion-safe:transition-[width] motion-safe:duration-500 ${
                  d.muted
                    ? 'fill-zinc-500'
                    : index === 0
                      ? 'fill-violet-700 dark:fill-violet-300'
                      : 'fill-violet-500'
                }`}
              />
              <text
                x={MARGIN.left + 6}
                y={y.bandwidth() / 2}
                dy="0.35em"
                style={{
                  transform: `translateX(${x(d.count)}px)`,
                  animationDelay: `${delay + 500 + index * 40}ms`,
                }}
                className="fill-current motion-safe:animate-fade motion-safe:transition-transform motion-safe:duration-500"
              >
                {shareLabel(d.count, total)}
              </text>
            </g>
          ))}
        </svg>
        {hovered !== null && data[hovered] && (
          <div
            aria-hidden="true"
            // The viewBox matches the rendered width, so SVG units are pixels here. Centred over the
            // bar, but kept inside the card so it never gets cut off at either edge.
            style={{
              top: (y(data[hovered].label) ?? 0) - (onSelect ? 44 : 30),
              left: Math.min(Math.max(MARGIN.left + x(data[hovered].count) / 2, 100), width - 100),
            }}
            className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-md bg-zinc-900 px-2.5 py-1.5 text-center text-xs whitespace-nowrap text-white shadow-lg motion-safe:animate-fade dark:bg-zinc-100 dark:text-zinc-900"
          >
            <span className="font-semibold">{data[hovered].label}</span>: {jobsLabel(data[hovered].count)} (
            {shareLabel(data[hovered].count, total)})
            {onSelect && <span className="block text-[11px] opacity-75">Clique para explorar</span>}
          </div>
        )}
      </div>
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
