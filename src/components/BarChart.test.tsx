import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
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

  it('redraws at the measured width so the text keeps its size', () => {
    let resize: ResizeObserverCallback = () => {}
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: ResizeObserverCallback) {
          resize = callback
        }
        observe() {}
        disconnect() {}
      },
    )
    const { container } = render(<BarChart title="T" data={data} total={10} />)
    act(() => resize([{ contentRect: { width: 286 } } as ResizeObserverEntry], {} as ResizeObserver))
    expect(container.querySelector('svg')?.getAttribute('viewBox')).toMatch(/^0 0 286 /)
    vi.unstubAllGlobals()
  })

  it('shows the count on mouse hover and closes it with Escape (WCAG 1.4.13)', () => {
    const { container } = render(<BarChart title="T" data={data} total={10} />)
    fireEvent.pointerEnter(container.querySelector('svg g')!, { pointerType: 'mouse' })
    expect(screen.getByText(/5 vagas \(50%\)/)).toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByText(/5 vagas \(50%\)/)).not.toBeInTheDocument()
  })

  it('explores the technology the tooltip names when the tooltip itself is clicked', () => {
    const onSelect = vi.fn()
    const { container } = render(<BarChart title="T" data={data} total={10} onSelect={onSelect} />)
    fireEvent.pointerEnter(container.querySelectorAll('svg g')[1], { pointerType: 'mouse' })
    fireEvent.click(screen.getByText('Clique para explorar'))
    expect(onSelect).toHaveBeenCalledWith('Vue')
  })

  it('says why the card is empty instead of drawing nothing', () => {
    render(<BarChart title="T" data={[]} total={3} empty="Nenhuma tecnologia da lista aparece nestas vagas." />)
    expect(screen.getByText('Nenhuma tecnologia da lista aparece nestas vagas.')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('states how many jobs the chart is based on', () => {
    render(<BarChart title="T" data={data} total={10} />)
    expect(screen.getByText('Base: 10 vagas.')).toBeInTheDocument()
  })
})
