import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BarChart } from './BarChart'

const data = [
  { label: 'React', count: 5 },
  { label: 'Vue', count: 2 },
]

describe('BarChart', () => {
  it('gives the chart a level 2 heading and hides the drawing from screen readers', () => {
    render(<BarChart title="Tecnologias mais pedidas" data={data} />)
    expect(screen.getByRole('heading', { level: 2, name: 'Tecnologias mais pedidas' })).toBeInTheDocument()
    // The table already carries the numbers; exposing the SVG too would read them twice.
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('includes a table with the same data', () => {
    render(<BarChart title="Tecnologias mais pedidas" data={data} />)
    expect(screen.getByRole('table', { name: 'Tecnologias mais pedidas' })).toBeInTheDocument()
    expect(screen.getByRole('rowheader', { name: 'React' })).toBeInTheDocument()
  })
})
