import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BarChart } from './BarChart'

const data = [
  { label: 'React', count: 5 },
  { label: 'Vue', count: 2 },
]

describe('BarChart', () => {
  it('gives the chart a level 2 heading and hides the drawing from screen readers', () => {
    render(<BarChart title="Tecnologias mais pedidas" data={data} total={10} />)
    expect(screen.getByRole('heading', { level: 2, name: 'Tecnologias mais pedidas' })).toBeInTheDocument()
    // The table already carries the numbers; exposing the SVG too would read them twice.
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('includes a table with the share and the count of each row', () => {
    render(<BarChart title="Tecnologias mais pedidas" data={data} total={10} />)
    expect(screen.getByRole('table', { name: 'Tecnologias mais pedidas' })).toBeInTheDocument()
    const react = screen.getByRole('rowheader', { name: 'React' }).closest('tr')
    expect(react).toHaveTextContent('50%')
    expect(react).toHaveTextContent('5')
  })

  it('shows the takeaway sentence under the title', () => {
    render(<BarChart title="T" data={data} total={10} />)
    expect(screen.getByText('React lidera, em 50% das vagas. Em segundo lugar: Vue (20%).')).toBeInTheDocument()
  })

  it('states the base and warns when the sample is small', () => {
    const { rerender } = render(<BarChart title="T" data={data} total={10} />)
    expect(screen.getByText(/Base: 10 vagas/)).toBeInTheDocument()
    expect(screen.getByText(/Amostra pequena/)).toBeInTheDocument()

    rerender(<BarChart title="T" data={data} total={804} />)
    expect(screen.queryByText(/Amostra pequena/)).not.toBeInTheDocument()
  })
})
