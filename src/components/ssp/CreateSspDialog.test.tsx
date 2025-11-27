/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateSspDialog } from './CreateSspDialog'

describe('CreateSspDialog', () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    onSubmit: jest.fn().mockResolvedValue(undefined),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders dialog when open', () => {
    render(<CreateSspDialog {...defaultProps} />)
    expect(screen.getByText('Create New SSP')).toBeInTheDocument()
  })

  it('does not render dialog when closed', () => {
    render(<CreateSspDialog {...defaultProps} open={false} />)
    expect(screen.queryByText('Create New SSP')).not.toBeInTheDocument()
  })

  it('renders form fields', () => {
    render(<CreateSspDialog {...defaultProps} />)
    expect(screen.getByLabelText(/system name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/security baseline/i)).toBeInTheDocument()
  })

  it('shows character count for name field', () => {
    render(<CreateSspDialog {...defaultProps} />)
    expect(screen.getByText('0/200 characters')).toBeInTheDocument()
  })

  it('updates character count as user types', async () => {
    const user = userEvent.setup()
    render(<CreateSspDialog {...defaultProps} />)

    const nameInput = screen.getByLabelText(/system name/i)
    await user.type(nameInput, 'Test')

    expect(screen.getByText('4/200 characters')).toBeInTheDocument()
  })

  it('does not submit when name is empty', async () => {
    const user = userEvent.setup()
    render(<CreateSspDialog {...defaultProps} />)

    // Clear and submit
    await user.click(screen.getByRole('button', { name: /create ssp/i }))

    // Wait a bit and check that onSubmit was never called
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(defaultProps.onSubmit).not.toHaveBeenCalled()
  })

  it('calls onSubmit with form data when valid', async () => {
    const user = userEvent.setup()
    render(<CreateSspDialog {...defaultProps} />)

    await user.type(screen.getByLabelText(/system name/i), 'My Test System')
    await user.type(screen.getByLabelText(/description/i), 'A test description')

    fireEvent.click(screen.getByRole('button', { name: /create ssp/i }))

    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalledWith({
        name: 'My Test System',
        description: 'A test description',
        baseline: 'MODERATE',
      })
    })
  })

  it('calls onClose when cancel is clicked', () => {
    render(<CreateSspDialog {...defaultProps} />)

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))

    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('shows loading state when submitting', () => {
    render(<CreateSspDialog {...defaultProps} isSubmitting={true} />)

    expect(
      screen.getByRole('button', { name: /creating/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /creating/i })).toBeDisabled()
  })

  it('disables form fields when submitting', () => {
    render(<CreateSspDialog {...defaultProps} isSubmitting={true} />)

    expect(screen.getByLabelText(/system name/i)).toBeDisabled()
    expect(screen.getByLabelText(/description/i)).toBeDisabled()
  })

  it('selects MODERATE as default baseline', () => {
    render(<CreateSspDialog {...defaultProps} />)

    expect(screen.getByText('NIST Moderate')).toBeInTheDocument()
  })

  it('trims whitespace from name before submitting', async () => {
    const user = userEvent.setup()
    render(<CreateSspDialog {...defaultProps} />)

    await user.type(screen.getByLabelText(/system name/i), '  Trimmed Name  ')

    fireEvent.click(screen.getByRole('button', { name: /create ssp/i }))

    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Trimmed Name',
        })
      )
    })
  })

  it('omits description if empty', async () => {
    const user = userEvent.setup()
    render(<CreateSspDialog {...defaultProps} />)

    await user.type(screen.getByLabelText(/system name/i), 'System Name')
    // Don't type in description

    fireEvent.click(screen.getByRole('button', { name: /create ssp/i }))

    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalledWith({
        name: 'System Name',
        description: undefined,
        baseline: 'MODERATE',
      })
    })
  })
})
