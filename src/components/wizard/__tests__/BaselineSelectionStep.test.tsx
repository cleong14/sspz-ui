import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BaselineSelectionStep } from '../BaselineSelectionStep'

describe('BaselineSelectionStep', () => {
  it('renders step title', () => {
    const mockOnNext = jest.fn()
    render(<BaselineSelectionStep onNext={mockOnNext} />)

    expect(screen.getByText(/Step 2: Baseline Selection/i)).toBeInTheDocument()
  })

  it('renders all three baseline options', () => {
    const mockOnNext = jest.fn()
    render(<BaselineSelectionStep onNext={mockOnNext} />)

    expect(screen.getByText(/Low Baseline/i)).toBeInTheDocument()
    expect(screen.getByText(/Moderate Baseline/i)).toBeInTheDocument()
    expect(screen.getByText(/High Baseline/i)).toBeInTheDocument()
  })

  it('calls onNext with selected baseline when clicked', async () => {
    const mockOnNext = jest.fn()
    const user = userEvent.setup()

    render(<BaselineSelectionStep onNext={mockOnNext} />)

    const moderateOption = screen.getByText(/Moderate Baseline/i)
    await user.click(moderateOption)

    const nextButton = screen.getByRole('button', { name: /Next/i })
    await user.click(nextButton)

    expect(mockOnNext).toHaveBeenCalledWith('moderate')
  })

  it('pre-selects baseline from initialBaseline prop', () => {
    const mockOnNext = jest.fn()
    render(<BaselineSelectionStep onNext={mockOnNext} initialBaseline="high" />)

    const highCard = screen.getByText(/High Baseline/i).closest('.MuiCard-root')
    expect(highCard).toHaveStyle({ borderWidth: '2px' })
  })
})
