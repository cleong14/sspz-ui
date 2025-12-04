/**
 * ControlSearch Component Tests
 * @module views/Controls/components/__tests__/ControlSearch.test
 */

import { render, screen, fireEvent, act } from '@testing-library/react'
import ControlSearch from '../ControlSearch'

describe('ControlSearch', () => {
  const mockOnChange = jest.fn()

  beforeEach(() => {
    jest.useFakeTimers()
    mockOnChange.mockClear()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should render search input with placeholder', () => {
    render(<ControlSearch value="" onChange={mockOnChange} />)

    const input = screen.getByPlaceholderText(
      /Search controls by ID, title, or keyword/i
    )
    expect(input).toBeInTheDocument()
  })

  it('should render with custom placeholder', () => {
    render(
      <ControlSearch
        value=""
        onChange={mockOnChange}
        placeholder="Custom placeholder"
      />
    )

    const input = screen.getByPlaceholderText('Custom placeholder')
    expect(input).toBeInTheDocument()
  })

  it('should display the input value', () => {
    render(<ControlSearch value="AC-1" onChange={mockOnChange} />)

    const input = screen.getByDisplayValue('AC-1')
    expect(input).toBeInTheDocument()
  })

  it('should debounce input changes by 300ms', async () => {
    render(<ControlSearch value="" onChange={mockOnChange} />)

    // Clear mock after initial mount (useEffect calls onChange with initial value)
    mockOnChange.mockClear()

    const input = screen.getByRole('textbox')

    // Type in the input
    fireEvent.change(input, { target: { value: 'test' } })

    // onChange should not be called immediately after typing
    expect(mockOnChange).not.toHaveBeenCalled()

    // Fast-forward 300ms
    act(() => {
      jest.advanceTimersByTime(300)
    })

    // Now onChange should be called with debounced value
    expect(mockOnChange).toHaveBeenCalledWith('test')
    expect(mockOnChange).toHaveBeenCalledTimes(1)
  })

  it('should show clear button when value is not empty', () => {
    render(<ControlSearch value="test" onChange={mockOnChange} />)

    const clearButton = screen.getByLabelText(/Clear search/i)
    expect(clearButton).toBeInTheDocument()
  })

  it('should not show clear button when value is empty', () => {
    render(<ControlSearch value="" onChange={mockOnChange} />)

    const clearButton = screen.queryByLabelText(/Clear search/i)
    expect(clearButton).not.toBeInTheDocument()
  })

  it('should call onChange with empty string on clear', () => {
    render(<ControlSearch value="test" onChange={mockOnChange} />)

    const clearButton = screen.getByLabelText(/Clear search/i)
    fireEvent.click(clearButton)

    expect(mockOnChange).toHaveBeenCalledWith('')
  })

  it('should clear input on ESC key press', () => {
    render(<ControlSearch value="test" onChange={mockOnChange} />)

    const input = screen.getByRole('textbox')
    fireEvent.keyDown(input, { key: 'Escape' })

    expect(mockOnChange).toHaveBeenCalledWith('')
  })

  it('should display result count when provided', () => {
    render(
      <ControlSearch value="test" onChange={mockOnChange} resultCount={42} />
    )

    const resultCount = screen.getByText('42 results')
    expect(resultCount).toBeInTheDocument()
  })

  it('should not display result count when not provided', () => {
    render(<ControlSearch value="test" onChange={mockOnChange} />)

    const resultCount = screen.queryByText(/results/)
    expect(resultCount).not.toBeInTheDocument()
  })

  it('should display result count of 0', () => {
    render(
      <ControlSearch value="test" onChange={mockOnChange} resultCount={0} />
    )

    const resultCount = screen.getByText('0 results')
    expect(resultCount).toBeInTheDocument()
  })

  it('should update input value from external prop changes', () => {
    const { rerender } = render(
      <ControlSearch value="initial" onChange={mockOnChange} />
    )

    expect(screen.getByDisplayValue('initial')).toBeInTheDocument()

    rerender(<ControlSearch value="updated" onChange={mockOnChange} />)

    expect(screen.getByDisplayValue('updated')).toBeInTheDocument()
  })

  it('should have accessible label', () => {
    render(<ControlSearch value="" onChange={mockOnChange} />)

    const input = screen.getByLabelText(/Search controls/i)
    expect(input).toBeInTheDocument()
  })
})
