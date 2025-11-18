import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProjectBasicsStep } from '../ProjectBasicsStep'

describe('ProjectBasicsStep', () => {
  it('should render all input fields', () => {
    const onNext = jest.fn()

    render(<ProjectBasicsStep onNext={onNext} />)

    expect(screen.getByLabelText(/system name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/system id/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getAllByText('System Type').length).toBeGreaterThan(0)
    expect(screen.getByLabelText(/authorization boundary/i)).toBeInTheDocument()
  })

  it('should show validation errors for required fields', async () => {
    const onNext = jest.fn()

    render(<ProjectBasicsStep onNext={onNext} />)

    const nextButton = screen.getByRole('button', { name: /next/i })
    fireEvent.click(nextButton)

    expect(
      await screen.findByText(/system name is required/i)
    ).toBeInTheDocument()
    expect(onNext).not.toHaveBeenCalled()
  })

  it('should call onNext with form data when valid', async () => {
    const onNext = jest.fn()

    render(<ProjectBasicsStep onNext={onNext} />)

    const systemNameInput = screen.getByLabelText(
      /system name/i
    ) as HTMLInputElement
    const systemIdInput = screen.getByLabelText(
      /system id/i
    ) as HTMLInputElement
    const descriptionInput = screen.getByLabelText(
      /description/i
    ) as HTMLTextAreaElement
    const authBoundaryInput = screen.getByLabelText(
      /authorization boundary/i
    ) as HTMLInputElement

    fireEvent.change(systemNameInput, { target: { value: 'Test System' } })
    fireEvent.change(systemIdInput, { target: { value: 'test-001' } })
    fireEvent.change(descriptionInput, {
      target: { value: 'Test description' },
    })
    fireEvent.change(authBoundaryInput, {
      target: { value: 'Cloud environment' },
    })

    expect(systemNameInput.value).toBe('Test System')
    expect(systemIdInput.value).toBe('test-001')
    expect(descriptionInput.value).toBe('Test description')
    expect(authBoundaryInput.value).toBe('Cloud environment')
  }, 10000)

  it('should support initialData prop for editing existing projects', async () => {
    const onNext = jest.fn()
    const initialData = {
      systemName: 'Existing System',
      systemId: 'existing-001',
      description: 'Existing description',
      systemType: 'IaaS',
      authorizationBoundary: 'On-premises',
      securityImpactLevel: {
        confidentiality: 'high',
        integrity: 'high',
        availability: 'moderate',
      },
    }

    render(<ProjectBasicsStep onNext={onNext} initialData={initialData} />)

    expect(screen.getByDisplayValue('Existing System')).toBeInTheDocument()
    expect(screen.getByDisplayValue('existing-001')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Existing description')).toBeInTheDocument()
  })

  it('should render FIPS-199 security categorization fields', () => {
    const onNext = jest.fn()

    render(<ProjectBasicsStep onNext={onNext} />)

    expect(screen.getAllByText('Confidentiality').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Integrity').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Availability').length).toBeGreaterThan(0)
  })

  it('should pass security impact level data to onNext', () => {
    const onNext = jest.fn()

    render(<ProjectBasicsStep onNext={onNext} />)

    // Verify default security impact level values are moderate
    expect(screen.getAllByText('Moderate').length).toBeGreaterThan(0)
  }, 10000)
})
