import { useEffect, useState } from 'react'

/** Copies the current URL, which already holds the filters, so a view can be shared in one click. */
export function CopyLinkButton() {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
    } catch {
      // Clipboard can be blocked (permissions, insecure context); the address bar still works.
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={copy}
        className="inline-flex shrink-0 touch-manipulation items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1 text-xs text-muted transition-colors hover:border-ink/40 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
      >
        <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5 fill-none stroke-current" strokeWidth="1.6">
          {copied ? (
            <path d="M3 8.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
          ) : (
            <path
              d="M6.5 9.5a3 3 0 0 0 4.2 0l2.1-2.1a3 3 0 0 0-4.2-4.2l-.7.7M9.5 6.5a3 3 0 0 0-4.2 0L3.2 8.6a3 3 0 0 0 4.2 4.2l.7-.7"
              strokeLinecap="round"
            />
          )}
        </svg>
        {copied ? 'Link copiado' : 'Copiar link desta vista'}
      </button>
      <span role="status" className="sr-only">
        {copied ? 'Link copiado para a área de transferência.' : ''}
      </span>
    </>
  )
}
