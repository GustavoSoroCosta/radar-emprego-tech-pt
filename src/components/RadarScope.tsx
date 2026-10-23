/**
 * The radar from the title, drawn as a scope: rings, a crosshair and a few blips. On load the beam
 * sweeps once and the blips light up as it passes; that is the page's only unprompted motion.
 * With reduced motion the beam never shows and the blips are simply there. Decorative.
 */
const BLIPS = [
  { x: 128, y: 62, delay: 0.35 },
  { x: 150, y: 118, delay: 0.75 },
  { x: 92, y: 146, delay: 1.1 },
  { x: 58, y: 84, delay: 1.5 },
]

export function RadarScope({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--signal)" stopOpacity="0" />
          <stop offset="1" stopColor="var(--signal)" stopOpacity="0.45" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="var(--line)" strokeWidth="1.25">
        <circle cx="100" cy="100" r="96" />
        <circle cx="100" cy="100" r="66" />
        <circle cx="100" cy="100" r="36" />
        <path d="M100 4v192M4 100h192" />
      </g>
      {/* A 60° wedge ending on the beam line; rotated around the centre by the sweep keyframes. */}
      <g style={{ transformOrigin: '100px 100px' }} className="opacity-0 motion-safe:animate-sweep">
        <path d="M100 100 L196 100 A96 96 0 0 0 148 16.9 Z" fill="url(#beam)" />
        <path d="M100 100 L196 100" stroke="var(--signal)" strokeWidth="1.5" />
      </g>
      {BLIPS.map((blip) => (
        <circle
          key={`${blip.x}-${blip.y}`}
          cx={blip.x}
          cy={blip.y}
          r="4"
          fill="var(--signal)"
          style={{ animationDelay: `${blip.delay}s` }}
          className="motion-safe:animate-fade"
        />
      ))}
      <circle cx="100" cy="100" r="3" fill="var(--ink)" />
    </svg>
  )
}
