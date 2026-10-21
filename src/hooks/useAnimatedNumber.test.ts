import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAnimatedNumber } from './useAnimatedNumber'

describe('useAnimatedNumber', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] })
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows the target straight away on the first render', () => {
    const { result } = renderHook(() => useAnimatedNumber(804))
    expect(result.current).toBe(804)
  })

  it('counts towards a new target and stops exactly on it', () => {
    const { result, rerender } = renderHook(({ target }) => useAnimatedNumber(target, 500), {
      initialProps: { target: 0 },
    })
    rerender({ target: 100 })

    act(() => vi.advanceTimersByTime(250))
    expect(result.current).toBeGreaterThan(0)
    expect(result.current).toBeLessThan(100)

    act(() => vi.advanceTimersByTime(400))
    expect(result.current).toBe(100)
  })
})
