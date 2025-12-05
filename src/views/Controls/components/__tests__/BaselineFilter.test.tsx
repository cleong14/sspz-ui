/**
 * BaselineFilter Component Tests
 * @module views/Controls/components/__tests__/BaselineFilter.test
 */

import { render, screen, fireEvent } from '@testing-library/react'
import BaselineFilter from '../BaselineFilter'
import type { BaselineFilterValue } from '../BaselineFilter'

describe('BaselineFilter', () => {
  const mockOnChange = jest.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  it('should render with default "All Controls" value', () => {
    render(<BaselineFilter value="all" onChange={mockOnChange} />)

    expect(screen.getByText('All Controls')).toBeInTheDocument()
  })

  it('should display NIST baseline options', () => {
    render(<BaselineFilter value="all" onChange={mockOnChange} />)

    // Open the dropdown
    const select = screen.getByRole('combobox')
    fireEvent.mouseDown(select)

    // Check NIST options
    expect(screen.getByText('NIST 800-53')).toBeInTheDocument()
    expect(screen.getByText('NIST Low')).toBeInTheDocument()
    expect(screen.getByText('NIST Moderate')).toBeInTheDocument()
    expect(screen.getByText('NIST High')).toBeInTheDocument()
  })

  it('should display FedRAMP baseline options when showFedRamp is true', () => {
    render(
      <BaselineFilter value="all" onChange={mockOnChange} showFedRamp={true} />
    )

    // Open the dropdown
    const select = screen.getByRole('combobox')
    fireEvent.mouseDown(select)

    // Check FedRAMP options
    expect(screen.getByText('FedRAMP')).toBeInTheDocument()
    expect(screen.getByText('FedRAMP Low')).toBeInTheDocument()
    expect(screen.getByText('FedRAMP Moderate')).toBeInTheDocument()
    expect(screen.getByText('FedRAMP High')).toBeInTheDocument()
    expect(screen.getByText('FedRAMP LI-SaaS')).toBeInTheDocument()
  })

  it('should hide FedRAMP options when showFedRamp is false', () => {
    render(
      <BaselineFilter value="all" onChange={mockOnChange} showFedRamp={false} />
    )

    // Open the dropdown
    const select = screen.getByRole('combobox')
    fireEvent.mouseDown(select)

    // FedRAMP options should not be present
    expect(screen.queryByText('FedRAMP Low')).not.toBeInTheDocument()
    expect(screen.queryByText('FedRAMP Moderate')).not.toBeInTheDocument()
    expect(screen.queryByText('FedRAMP High')).not.toBeInTheDocument()
  })

  it('should call onChange when selection changes', () => {
    render(<BaselineFilter value="all" onChange={mockOnChange} />)

    // Open the dropdown
    const select = screen.getByRole('combobox')
    fireEvent.mouseDown(select)

    // Click on NIST Low option
    const lowOption = screen.getByText('NIST Low')
    fireEvent.click(lowOption)

    expect(mockOnChange).toHaveBeenCalledWith('low')
  })

  it('should display selected NIST Low value', () => {
    render(<BaselineFilter value="low" onChange={mockOnChange} />)

    expect(screen.getByText('NIST Low')).toBeInTheDocument()
  })

  it('should display selected FedRAMP Moderate value', () => {
    render(
      <BaselineFilter
        value="fedramp_moderate"
        onChange={mockOnChange}
        showFedRamp={true}
      />
    )

    expect(screen.getByText('FedRAMP Moderate')).toBeInTheDocument()
  })

  it('should be disabled when disabled prop is true', () => {
    render(
      <BaselineFilter value="all" onChange={mockOnChange} disabled={true} />
    )

    const select = screen.getByRole('combobox')
    expect(select).toHaveAttribute('aria-disabled', 'true')
  })

  it('should not be disabled by default', () => {
    render(<BaselineFilter value="all" onChange={mockOnChange} />)

    const select = screen.getByRole('combobox')
    expect(select).not.toHaveAttribute('aria-disabled', 'true')
  })

  it('should handle all baseline values', () => {
    const values: BaselineFilterValue[] = [
      'all',
      'low',
      'moderate',
      'high',
      'fedramp_low',
      'fedramp_moderate',
      'fedramp_high',
      'fedramp_li_saas',
    ]

    values.forEach((value) => {
      const { unmount } = render(
        <BaselineFilter
          value={value}
          onChange={mockOnChange}
          showFedRamp={true}
        />
      )
      // Should not throw
      expect(screen.getByRole('combobox')).toBeInTheDocument()
      unmount()
    })
  })
})
