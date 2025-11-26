import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BaselineSelectionStep } from '../BaselineSelectionStep'
import * as oscalCatalog from '../../../services/oscal-catalog'

// Mock the oscal-catalog service
jest.mock('../../../services/oscal-catalog', () => ({
  loadCatalog: jest.fn(),
  getBaselineControls: jest.fn(),
}))

const mockCatalog = {
  uuid: 'test-uuid',
  metadata: {
    title: 'Test Catalog',
    lastModified: '2024-01-01',
    version: '1.0.0',
    oscalVersion: '1.0.4',
  },
  groups: [],
}

describe('BaselineSelectionStep', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(oscalCatalog.loadCatalog as jest.Mock).mockResolvedValue(mockCatalog)
    ;(oscalCatalog.getBaselineControls as jest.Mock).mockImplementation(
      (_catalog, baseline) => {
        const counts: Record<string, number> = {
          low: 127,
          moderate: 325,
          high: 421,
        }
        return Array(counts[baseline]).fill({
          id: 'test-control',
          title: 'Test Control',
        })
      }
    )
  })

  it('should render all three baseline options', async () => {
    const onNext = jest.fn()
    const onBack = jest.fn()

    render(<BaselineSelectionStep onNext={onNext} onBack={onBack} />)

    await waitFor(() => {
      expect(screen.getByText('Low Impact')).toBeInTheDocument()
      expect(screen.getByText('Moderate Impact')).toBeInTheDocument()
      expect(screen.getByText('High Impact')).toBeInTheDocument()
    })
  })

  it('should show control counts for each baseline', async () => {
    const onNext = jest.fn()
    const onBack = jest.fn()

    render(<BaselineSelectionStep onNext={onNext} onBack={onBack} />)

    await waitFor(() => {
      expect(screen.getByText('127 Controls')).toBeInTheDocument()
      expect(screen.getByText('325 Controls')).toBeInTheDocument()
      expect(screen.getByText('421 Controls')).toBeInTheDocument()
    })
  })

  it('should select moderate baseline by default', async () => {
    const onNext = jest.fn()
    const onBack = jest.fn()

    render(<BaselineSelectionStep onNext={onNext} onBack={onBack} />)

    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name: /view control list \(325 controls\)/i,
        })
      ).toBeInTheDocument()
    })
  })

  it('should call onNext with selected baseline', async () => {
    const onNext = jest.fn()
    const onBack = jest.fn()

    render(<BaselineSelectionStep onNext={onNext} onBack={onBack} />)

    await waitFor(() => {
      expect(screen.getByText('Low Impact')).toBeInTheDocument()
    })

    // Click on Low baseline
    fireEvent.click(screen.getByText('Low Impact'))

    // Click Next
    fireEvent.click(screen.getByRole('button', { name: /next/i }))

    expect(onNext).toHaveBeenCalledWith('low')
  })

  it('should call onBack when Back button is clicked', async () => {
    const onNext = jest.fn()
    const onBack = jest.fn()

    render(<BaselineSelectionStep onNext={onNext} onBack={onBack} />)

    await waitFor(() => {
      expect(screen.getByText('Low Impact')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /back/i }))

    expect(onBack).toHaveBeenCalled()
  })

  it('should open control list dialog when View Control List is clicked', async () => {
    const onNext = jest.fn()
    const onBack = jest.fn()

    render(<BaselineSelectionStep onNext={onNext} onBack={onBack} />)

    await waitFor(() => {
      expect(screen.getByText('Moderate Impact')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /view control list/i }))

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  it('should use initial baseline if provided', async () => {
    const onNext = jest.fn()
    const onBack = jest.fn()

    render(
      <BaselineSelectionStep
        onNext={onNext}
        onBack={onBack}
        initialBaseline="high"
      />
    )

    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name: /view control list \(421 controls\)/i,
        })
      ).toBeInTheDocument()
    })
  })
})
