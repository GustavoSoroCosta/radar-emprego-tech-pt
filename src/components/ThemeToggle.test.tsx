import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { THEME_KEY } from '@/lib/theme'
import { ThemeToggle } from './ThemeToggle'

describe('ThemeToggle', () => {
  beforeEach(() => {
    // jsdom has no matchMedia; this stands in for a system set to light.
    vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener() {}, removeEventListener() {} }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    delete document.documentElement.dataset.theme
    localStorage.clear()
  })

  it('starts from the system theme, then switches and remembers the pick', () => {
    render(<ThemeToggle />)
    const button = screen.getByRole('button', { name: 'Tema escuro' })
    expect(button).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(button)
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(localStorage.getItem(THEME_KEY)).toBe('dark')
    expect(button).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(button)
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(localStorage.getItem(THEME_KEY)).toBe('light')
    expect(button).toHaveAttribute('aria-pressed', 'false')
  })
})
