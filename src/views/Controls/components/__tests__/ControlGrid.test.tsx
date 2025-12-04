/**
 * ControlGrid Component Tests
 * @module views/Controls/components/__tests__/ControlGrid.test
 */

import { render, screen, fireEvent } from '@testing-library/react'
import type { Control } from '@/types/control'
import ControlGrid from '../ControlGrid'

const mockControls: Control[] = [
  {
    id: 'AC-1',
    family: 'AC',
    title: 'Policy and Procedures',
    description: 'Access control policy.',
    baselines: { low: true, moderate: true, high: true },
  },
  {
    id: 'AC-2',
    family: 'AC',
    title: 'Account Management',
    description: 'Manage accounts.',
    baselines: { low: true, moderate: true, high: true },
  },
  {
    id: 'AC-3',
    family: 'AC',
    title: 'Access Enforcement',
    description: 'Enforce access.',
    baselines: { low: true, moderate: true, high: true },
  },
]

describe('ControlGrid', () => {
  const mockOnControlClick = jest.fn()

  beforeEach(() => {
    mockOnControlClick.mockClear()
  })

  it('should render loading spinner when loading is true', () => {
    render(
      <ControlGrid
        controls={[]}
        loading={true}
        onControlClick={mockOnControlClick}
      />
    )

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('should not render loading spinner when loading is false', () => {
    render(
      <ControlGrid
        controls={mockControls}
        loading={false}
        onControlClick={mockOnControlClick}
      />
    )

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('should render empty message when controls array is empty', () => {
    render(
      <ControlGrid
        controls={[]}
        loading={false}
        onControlClick={mockOnControlClick}
      />
    )

    expect(screen.getByText('No controls found')).toBeInTheDocument()
  })

  it('should use custom empty message when provided', () => {
    render(
      <ControlGrid
        controls={[]}
        loading={false}
        onControlClick={mockOnControlClick}
        emptyMessage="Custom empty message"
      />
    )

    expect(screen.getByText('Custom empty message')).toBeInTheDocument()
  })

  it('should render control cards', () => {
    render(
      <ControlGrid
        controls={mockControls}
        onControlClick={mockOnControlClick}
      />
    )

    expect(screen.getByText('AC-1')).toBeInTheDocument()
    expect(screen.getByText('AC-2')).toBeInTheDocument()
    expect(screen.getByText('AC-3')).toBeInTheDocument()
  })

  it('should render all control titles', () => {
    render(
      <ControlGrid
        controls={mockControls}
        onControlClick={mockOnControlClick}
      />
    )

    expect(screen.getByText('Policy and Procedures')).toBeInTheDocument()
    expect(screen.getByText('Account Management')).toBeInTheDocument()
    expect(screen.getByText('Access Enforcement')).toBeInTheDocument()
  })

  it('should call onControlClick when card is clicked', () => {
    render(
      <ControlGrid
        controls={mockControls}
        onControlClick={mockOnControlClick}
      />
    )

    const firstCard = screen.getAllByRole('button')[0]
    fireEvent.click(firstCard)

    expect(mockOnControlClick).toHaveBeenCalledWith(mockControls[0])
  })

  it('should render correct number of cards', () => {
    render(
      <ControlGrid
        controls={mockControls}
        onControlClick={mockOnControlClick}
      />
    )

    const cards = screen.getAllByRole('button')
    expect(cards).toHaveLength(3)
  })

  it('should work without onControlClick handler', () => {
    render(<ControlGrid controls={mockControls} />)

    const firstCard = screen.getAllByRole('button')[0]
    // Should not throw
    fireEvent.click(firstCard)
  })

  it('should not show loading when loading prop is not provided', () => {
    render(
      <ControlGrid
        controls={mockControls}
        onControlClick={mockOnControlClick}
      />
    )

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })
})
