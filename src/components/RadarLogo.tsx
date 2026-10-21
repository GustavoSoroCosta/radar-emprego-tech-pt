/** The radar mark from the favicon, inline so it scales and needs no extra request. Decorative. */
export function RadarLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <rect width="32" height="32" rx="7" className="fill-violet-600" />
      <g fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
        <circle cx="16" cy="16" r="10" opacity=".5" />
        <circle cx="16" cy="16" r="5" opacity=".5" />
        <path d="M16 16 L23.5 9.5" />
      </g>
      <circle cx="16" cy="16" r="2" fill="#fff" />
      <circle cx="21" cy="19.5" r="1.8" fill="#fff" />
    </svg>
  )
}
