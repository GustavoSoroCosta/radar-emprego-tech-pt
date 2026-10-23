import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Job } from '@/lib/types'
import { JobList } from './JobList'

const job = (id: number, publishedAt: string, overrides: Partial<Job> = {}): Job => ({
  id,
  title: `Vaga ${id}`,
  company: 'Empresa',
  cities: ['Porto'],
  workMode: 'hybrid',
  technologies: [],
  junior: false,
  area: 'frontend',
  publishedAt,
  url: `https://www.itjobs.pt/oferta/${id}/vaga-${id}`,
  ...overrides,
})

describe('JobList', () => {
  it('lists the newest jobs first, each linking to its ad', () => {
    render(<JobList jobs={[job(1, '2026-10-01 09:00:00'), job(2, '2026-10-17 14:05:00')]} />)
    const items = screen.getAllByRole('listitem')
    expect(items[0]).toHaveTextContent('Vaga 2')
    expect(items[0]).toHaveTextContent('Empresa, Porto, híbrido')
    expect(items[0]).toHaveTextContent('17 de outubro')
    expect(within(items[0]).getByRole('link', { name: 'Vaga 2 (abre numa nova janela)' })).toHaveAttribute(
      'href',
      'https://www.itjobs.pt/oferta/2/vaga-2',
    )
  })

  it('shows the title without a link when there is no ad (sample data)', () => {
    render(<JobList jobs={[job(1, '2026-10-01', { url: undefined })]} />)
    expect(screen.getByText('Vaga 1')).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('shows ten at a time and moves focus to the first job added', () => {
    const jobs = Array.from({ length: 12 }, (_, i) => job(i + 1, `2026-10-${String(i + 1).padStart(2, '0')}`))
    render(<JobList jobs={jobs} />)
    expect(screen.getAllByRole('listitem')).toHaveLength(10)

    fireEvent.click(screen.getByRole('button', { name: 'Mostrar mais 2' }))
    expect(screen.getAllByRole('listitem')).toHaveLength(12)
    // Newest first, so the eleventh row is the second oldest job.
    expect(screen.getByRole('link', { name: /Vaga 2 / })).toHaveFocus()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
