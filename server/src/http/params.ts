import type { CountKind } from '../snapshot/build.ts'

const KINDS: readonly CountKind[] = ['tech', 'area', 'city', 'work_mode']

/** Thrown for a bad query string; the app turns it into a 400 with this message. */
export class BadRequest extends Error {}

type Query = Record<string, unknown>

/** Query values arrive as strings (or arrays, with ?a=1&a=2); anything else is treated as missing. */
function single(query: Query, name: string): string | undefined {
  const value = query[name]
  return typeof value === 'string' ? value : undefined
}

export function parseKind(query: Query): CountKind {
  const kind = single(query, 'kind') ?? 'tech'
  if (!KINDS.includes(kind as CountKind)) {
    throw new BadRequest(`kind must be one of: ${KINDS.join(', ')}`)
  }
  return kind as CountKind
}

export function parseKey(query: Query): string {
  const key = single(query, 'key')?.trim()
  if (!key) throw new BadRequest('key is required, e.g. key=React')
  if (key.length > 100) throw new BadRequest('key must be at most 100 characters')
  return key
}

/** Whole number within [min, max]; the default is used only when the parameter is absent. */
export function parseInteger(query: Query, name: string, { min, max, fallback }: { min: number; max: number; fallback: number }): number {
  const raw = single(query, name)
  if (raw === undefined) return fallback
  const value = Number(raw)
  if (!/^\d+$/.test(raw) || value < min || value > max) {
    throw new BadRequest(`${name} must be a whole number between ${min} and ${max}`)
  }
  return value
}
