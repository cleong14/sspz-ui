/**
 * ControlCard Component Tests
 * @module views/Controls/components/__tests__/ControlCard.test
 */

import { render, screen, fireEvent } from '@testing-library/react'
import type { Control } from '@/types/control'
import ControlCard from '../ControlCard'

const mockControl: Control = {
  id: 'AC-1',
  family: 'AC',
  title: 'Policy and Procedures',
  description: 'Access control policy and procedures.',
  baselines: { low: true, moderate: true, high: true },
}

const mockEnhancement: Control = {
  id: 'AC-2(1)',
  family: 'AC',
  title: 'Automated Account Management',
  description: 'Automated account management support.',
  baselines: { low: false, moderate: true, high: true },
  parentControl: 'AC-2',
}

const mockNoBaseline: Control = {
  id: 'PM-1',
  family: 'PM',
  title: 'Program Plan',
  description: 'Develop program plan.',
  baselines: { low: false, moderate: false, high: false },
}

describe('ControlCard', () => {
  const mockOnClick = jest.fn()

  beforeEach(() => {
    mockOnClick.mockClear()
  })

  it('should render control ID', () => {
    render(<ControlCard control={mockControl} onClick={mockOnClick} />)

    expect(screen.getByText('AC-1')).toBeInTheDocument()
  })

  it('should render control title', () => {
    render(<ControlCard control={mockControl} onClick={mockOnClick} />)

    expect(screen.getByText('Policy and Procedures')).toBeInTheDocument()
  })

  it('should render baseline badges', () => {
    render(<ControlCard control={mockControl} onClick={mockOnClick} />)

    expect(screen.getByText('Low')).toBeInTheDocument()
    expect(screen.getByText('Moderate')).toBeInTheDocument()
    expect(screen.getByText('High')).toBeInTheDocument()
  })

  it('should render subset of baseline badges', () => {
    render(<ControlCard control={mockEnhancement} onClick={mockOnClick} />)

    expect(screen.queryByText('Low')).not.toBeInTheDocument()
    expect(screen.getByText('Moderate')).toBeInTheDocument()
    expect(screen.getByText('High')).toBeInTheDocument()
  })

  it('should show "No Baseline" chip when control has no baselines', () => {
    render(<ControlCard control={mockNoBaseline} onClick={mockOnClick} />)

    expect(screen.getByText('No Baseline')).toBeInTheDocument()
  })

  it('should show "Enhancement" chip for enhancement controls', () => {
    render(<ControlCard control={mockEnhancement} onClick={mockOnClick} />)

    expect(screen.getByText('Enhancement')).toBeInTheDocument()
  })

  it('should not show "Enhancement" chip for base controls', () => {
    render(<ControlCard control={mockControl} onClick={mockOnClick} />)

    expect(screen.queryByText('Enhancement')).not.toBeInTheDocument()
  })

  it('should call onClick when card is clicked', () => {
    render(<ControlCard control={mockControl} onClick={mockOnClick} />)

    const card = screen.getByRole('button')
    fireEvent.click(card)

    expect(mockOnClick).toHaveBeenCalledWith(mockControl)
  })

  it('should call onClick when Enter key is pressed', () => {
    render(<ControlCard control={mockControl} onClick={mockOnClick} />)

    const card = screen.getByRole('button')
    fireEvent.keyDown(card, { key: 'Enter' })

    expect(mockOnClick).toHaveBeenCalledWith(mockControl)
  })

  it('should call onClick when Space key is pressed', () => {
    render(<ControlCard control={mockControl} onClick={mockOnClick} />)

    const card = screen.getByRole('button')
    fireEvent.keyDown(card, { key: ' ' })

    expect(mockOnClick).toHaveBeenCalledWith(mockControl)
  })

  it('should have accessible label', () => {
    render(<ControlCard control={mockControl} onClick={mockOnClick} />)

    const card = screen.getByRole('button', {
      name: /View details for control AC-1: Policy and Procedures/i,
    })
    expect(card).toBeInTheDocument()
  })

  it('should work without onClick handler', () => {
    render(<ControlCard control={mockControl} />)

    const card = screen.getByRole('button')
    // Should not throw
    fireEvent.click(card)
  })
})
