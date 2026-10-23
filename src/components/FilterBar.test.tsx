import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DEFAULT_FILTERS } from '@/lib/filters'
import { FilterBar } from './FilterBar'

describe('FilterBar', () => {
  it('shows a city from a shared link even when it is not among the top cities', () => {
    render(<FilterBar filters={{ ...DEFAULT_FILTERS, city: 'Bragança' }} cities={['Lisboa', 'Porto']} onChange={() => {}} />)
    expect(screen.getByRole('combobox', { name: 'Cidade' })).toHaveDisplayValue('Bragança')
  })
})
