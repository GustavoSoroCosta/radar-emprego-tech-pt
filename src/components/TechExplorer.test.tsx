import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Job } from '@/lib/types'
import { TechExplorer } from './TechExplorer'

const job = (id: number, technologies: string[]): Job => ({
  id,
  title: '',
  company: '',
  cities: [],
  workMode: 'remote',
  technologies,
  junior: false,
  area: 'frontend',
  publishedAt: '2026-10-01',
})

const jobs = [job(1, ['React', 'TypeScript']), job(2, ['React', 'TypeScript', 'CSS']), job(3, ['Angular'])]

describe('TechExplorer', () => {
  it('says what most often comes with the selected technology and links to the jobs', () => {
    render(<TechExplorer jobs={jobs} options={['React', 'Angular']} selected="React" onSelect={() => {}} />)
    expect(screen.getByText('Quem pede React também pede TypeScript em 100% dos casos.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Procurar vagas de React/ })).toHaveAttribute(
      'href',
      'https://www.itjobs.pt/emprego?q=React',
    )
  })

  it('reports a new pick from the select', () => {
    const onSelect = vi.fn()
    render(<TechExplorer jobs={jobs} options={['React', 'Angular']} selected="React" onSelect={onSelect} />)
    fireEvent.change(screen.getByRole('combobox', { name: 'Tecnologia' }), { target: { value: 'Angular' } })
    expect(onSelect).toHaveBeenCalledWith('Angular')
  })
})
