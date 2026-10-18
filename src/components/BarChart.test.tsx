import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BarChart } from './BarChart'

const data = [
  { label: 'React', count: 5 },
  { label: 'Vue', count: 2 },
]

describe('BarChart', () => {
  it('exposes the chart as an image with an accessible name', () => {
    render(<BarChart title="Tecnologias mais pedidas" data={data} />)
    const chart = screen.getByRole('img')
    expect(chart).toHaveAccessibleName(/Tecnologias mais pedidas/)
    expect(chart).toHaveAccessibleName(/React: 5, Vue: 2/)
  })

  it('includes a table with the same data', () => {
    render(<BarChart title="Tecnologias mais pedidas" data={data} />)
    expect(screen.getByRole('table', { name: 'Tecnologias mais pedidas' })).toBeInTheDocument()
    expect(screen.getByRole('rowheader', { name: 'React' })).toBeInTheDocument()
  })
})
