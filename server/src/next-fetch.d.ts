// src/lib/itjobs.ts (shared with the Next.js site) passes Next's `next: { revalidate }` fetch option.
// Plain Node ignores it at runtime; this only tells the type checker it exists.
interface RequestInit {
  next?: { revalidate?: number }
}
