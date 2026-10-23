'use client'

import { useSyncExternalStore } from 'react'
import { THEME_KEY, type Theme } from '@/lib/theme'

const DARK_QUERY = '(prefers-color-scheme: dark)'
// Setting data-theme fires no event, so the button announces its own changes with this one.
const THEME_CHANGE = 'radar:theme-change'

/** The theme on screen: the visitor's pick if there is one, otherwise the system's. */
function currentTheme(): Theme {
  const picked = document.documentElement.dataset.theme
  if (picked === 'light' || picked === 'dark') return picked
  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light'
}

function subscribeToTheme(onChange: () => void) {
  const system = window.matchMedia(DARK_QUERY)
  system.addEventListener('change', onChange)
  window.addEventListener(THEME_CHANGE, onChange)
  return () => {
    system.removeEventListener('change', onChange)
    window.removeEventListener(THEME_CHANGE, onChange)
  }
}

/**
 * Switches between the light and dark themes. Until the visitor clicks, the page follows the
 * system; after that the pick is kept in localStorage and applied before paint (see lib/theme.ts).
 * A toggle button with a fixed name, so screen readers hear "Tema escuro, pressed / not pressed".
 * One icon for both states, so nothing changes shape when React takes over from the server HTML.
 */
export function ThemeToggle({ className = '' }: { className?: string }) {
  // The server cannot know the theme; it renders "light" and the browser corrects it on hydration.
  const theme = useSyncExternalStore(subscribeToTheme, currentTheme, (): Theme => 'light')

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem(THEME_KEY, next)
    } catch {
      // Storage can be blocked; the theme still changes for this visit.
    }
    window.dispatchEvent(new Event(THEME_CHANGE))
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={theme === 'dark'}
      title="Tema escuro"
      className={`grid size-10 touch-manipulation place-items-center rounded-full border border-line bg-card text-muted transition-colors hover:border-ink/40 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal ${className}`}
    >
      {/* Half-filled circle: the usual sign for light and dark, and a nod to the radar. */}
      <svg viewBox="0 0 20 20" aria-hidden="true" className="size-4.5">
        <circle cx="10" cy="10" r="7.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 2.75a7.25 7.25 0 0 1 0 14.5z" fill="currentColor" />
      </svg>
      <span className="sr-only">Tema escuro</span>
    </button>
  )
}
