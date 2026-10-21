import { useEffect, useRef, useState } from 'react'

/**
 * Follows `target`, counting from the number on screen to the new one with an ease-out curve.
 * The first render already shows the target, so server HTML and hydration agree; only later
 * changes (a filter click) animate. With reduced motion it jumps straight to the value.
 */
export function useAnimatedNumber(target: number, duration = 500): number {
  const [value, setValue] = useState(target)
  const shown = useRef(target)

  useEffect(() => {
    const from = shown.current
    if (from === target) return
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    const start = performance.now()
    let frame = 0

    const tick = (now: number) => {
      const progress = reduceMotion ? 1 : Math.min(1, (now - start) / duration)
      const eased = 1 - (1 - progress) ** 3
      shown.current = Math.round(from + (target - from) * eased)
      setValue(shown.current)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])

  return value
}
