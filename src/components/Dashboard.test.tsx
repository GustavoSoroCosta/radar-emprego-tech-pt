import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import type { Job } from '@/lib/types'
import { Dashboard } from './Dashboard'

const job = (id: number, cities: string[]): Job => ({
  id,
  title: `Vaga ${id}`,
  company: 'Empresa',
  cities,
  workMode: 'onsite',
  technologies: ['React'],
  junior: false,
  area: 'frontend',
  publishedAt: '2026-10-01',
})

describe('Dashboard city chart', () => {
  afterEach(() => window.history.replaceState(null, '', '/'))

  it('shows the other cities of the same ads when a city is chosen, without the chosen one', () => {
    window.history.replaceState(null, '', '/?cidade=Lisboa')
    render(<Dashboard jobs={[job(1, ['Lisboa', 'Porto']), job(2, ['Lisboa'])]} />)
    const table = screen.getByRole('table', { name: 'Também anunciadas noutras cidades' })
    expect(within(table).getByRole('rowheader', { name: 'Porto' }).closest('tr')).toHaveTextContent('50%')
    expect(within(table).queryByRole('rowheader', { name: 'Lisboa' })).not.toBeInTheDocument()
  })

  it('says so when the ads name no other city', () => {
    window.history.replaceState(null, '', '/?cidade=Porto')
    render(<Dashboard jobs={[job(1, ['Porto'])]} />)
    expect(screen.getByText('Nenhuma: estas vagas não aparecem em mais nenhuma cidade.')).toBeInTheDocument()
  })
})
