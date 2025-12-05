/**
 * FamilyTabs Component Tests
 * @module views/Controls/components/__tests__/FamilyTabs.test
 */

import { render, screen, fireEvent } from '@testing-library/react'
import type { ControlFamily } from '@/types/control'
import FamilyTabs from '../FamilyTabs'

const mockFamilies: ControlFamily[] = [
  {
    id: 'AC',
    name: 'Access Control',
    description: 'Access control description.',
    totalControls: 147,
    baseControls: 25,
    byBaseline: { low: 11, moderate: 39, high: 46 },
  },
  {
    id: 'AT',
    name: 'Awareness and Training',
    description: 'Training description.',
    totalControls: 17,
    baseControls: 6,
    byBaseline: { low: 5, moderate: 6, high: 6 },
  },
  {
    id: 'AU',
    name: 'Audit and Accountability',
    description: 'Audit description.',
    totalControls: 69,
    baseControls: 16,
    byBaseline: { low: 10, moderate: 16, high: 25 },
  },
]

describe('FamilyTabs', () => {
  const mockOnFamilyChange = jest.fn()

  beforeEach(() => {
    mockOnFamilyChange.mockClear()
  })

  it('should render tabs for all families', () => {
    render(
      <FamilyTabs
        families={mockFamilies}
        selectedFamily="AC"
        onFamilyChange={mockOnFamilyChange}
      />
    )

    expect(screen.getByRole('tab', { name: /AC/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /AT/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /AU/i })).toBeInTheDocument()
  })

  it('should show control count badges', () => {
    render(
      <FamilyTabs
        families={mockFamilies}
        selectedFamily="AC"
        onFamilyChange={mockOnFamilyChange}
      />
    )

    // Check that badges with counts are rendered
    expect(screen.getByText('147')).toBeInTheDocument()
    expect(screen.getByText('17')).toBeInTheDocument()
    expect(screen.getByText('69')).toBeInTheDocument()
  })

  it('should highlight selected family', () => {
    render(
      <FamilyTabs
        families={mockFamilies}
        selectedFamily="AT"
        onFamilyChange={mockOnFamilyChange}
      />
    )

    const atTab = screen.getByRole('tab', { name: /AT/i })
    expect(atTab).toHaveAttribute('aria-selected', 'true')
  })

  it('should call onFamilyChange when tab is clicked', () => {
    render(
      <FamilyTabs
        families={mockFamilies}
        selectedFamily="AC"
        onFamilyChange={mockOnFamilyChange}
      />
    )

    const auTab = screen.getByRole('tab', { name: /AU/i })
    fireEvent.click(auTab)

    expect(mockOnFamilyChange).toHaveBeenCalledWith('AU')
  })

  it('should render tablist role', () => {
    render(
      <FamilyTabs
        families={mockFamilies}
        selectedFamily="AC"
        onFamilyChange={mockOnFamilyChange}
      />
    )

    expect(screen.getByRole('tablist')).toBeInTheDocument()
  })

  it('should have proper accessibility attributes', () => {
    render(
      <FamilyTabs
        families={mockFamilies}
        selectedFamily="AC"
        onFamilyChange={mockOnFamilyChange}
      />
    )

    const acTab = screen.getByRole('tab', { name: /AC/i })
    expect(acTab).toHaveAttribute('id', 'family-tab-AC')
    expect(acTab).toHaveAttribute('aria-controls', 'family-tabpanel-AC')
  })

  it('should render empty when no families provided', () => {
    render(
      <FamilyTabs
        families={[]}
        selectedFamily=""
        onFamilyChange={mockOnFamilyChange}
      />
    )

    expect(screen.queryAllByRole('tab')).toHaveLength(0)
  })
})
