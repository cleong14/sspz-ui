import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ControlReviewStep } from '../ControlReviewStep'
import * as oscalCatalog from '../../../services/oscal-catalog'
import * as toolMappings from '../../../services/tool-mappings'
import * as coverageCalculator from '../../../services/coverage-calculator'

// Mock the services
jest.mock('../../../services/oscal-catalog', () => ({
  loadCatalog: jest.fn(),
  getBaselineControls: jest.fn(),
}))

jest.mock('../../../services/tool-mappings', () => ({
  loadToolMappings: jest.fn(),
}))

jest.mock('../../../services/coverage-calculator', () => ({
  calculateControlCoverage: jest.fn(),
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

const mockControls = [
  {
    id: 'ac-1',
    class: 'AC',
    title: 'Access Control Policy',
    parts: [{ name: 'statement', prose: 'Test prose for AC-1' }],
  },
  {
    id: 'ac-2',
    class: 'AC',
    title: 'Account Management',
    parts: [{ name: 'statement', prose: 'Test prose for AC-2' }],
  },
  {
    id: 'si-10',
    class: 'SI',
    title: 'Information Input Validation',
    parts: [{ name: 'statement', prose: 'Test prose for SI-10' }],
  },
]

const mockTools = [
  {
    toolId: 'semgrep',
    toolName: 'Semgrep',
    vendor: 'Semgrep, Inc.',
    category: 'SAST',
    controlMappings: [
      { controlId: 'si-10', coverage: 'full', rationale: 'Test' },
    ],
  },
]

describe('ControlReviewStep', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(oscalCatalog.loadCatalog as jest.Mock).mockResolvedValue(mockCatalog)
    ;(oscalCatalog.getBaselineControls as jest.Mock).mockReturnValue(
      mockControls
    )
    ;(toolMappings.loadToolMappings as jest.Mock).mockResolvedValue(mockTools)
    ;(coverageCalculator.calculateControlCoverage as jest.Mock).mockReturnValue(
      {
        coverage: [
          { controlId: 'ac-1', status: 'uncovered', tools: [] },
          { controlId: 'ac-2', status: 'uncovered', tools: [] },
          { controlId: 'si-10', status: 'covered', tools: ['Semgrep'] },
        ],
        stats: { total: 3, covered: 1, partial: 0, uncovered: 2 },
      }
    )
  })

  it('should render control list', async () => {
    const onNext = jest.fn()
    const onBack = jest.fn()

    render(
      <ControlReviewStep
        onNext={onNext}
        onBack={onBack}
        baseline="moderate"
        selectedTools={[{ toolId: 'semgrep', toolName: 'Semgrep' }]}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Access Control Policy')).toBeInTheDocument()
      expect(screen.getByText('Account Management')).toBeInTheDocument()
      expect(
        screen.getByText('Information Input Validation')
      ).toBeInTheDocument()
    })
  })

  it('should show coverage stats', async () => {
    const onNext = jest.fn()
    const onBack = jest.fn()

    render(
      <ControlReviewStep
        onNext={onNext}
        onBack={onBack}
        baseline="moderate"
        selectedTools={[{ toolId: 'semgrep', toolName: 'Semgrep' }]}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('1 Covered')).toBeInTheDocument()
      expect(screen.getByText('0 Partial')).toBeInTheDocument()
      expect(screen.getByText('2 Uncovered')).toBeInTheDocument()
      expect(screen.getByText('3 Total')).toBeInTheDocument()
    })
  })

  it('should filter controls by search term', async () => {
    const onNext = jest.fn()
    const onBack = jest.fn()

    render(
      <ControlReviewStep
        onNext={onNext}
        onBack={onBack}
        baseline="moderate"
        selectedTools={[{ toolId: 'semgrep', toolName: 'Semgrep' }]}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Access Control Policy')).toBeInTheDocument()
    })

    // Search for "si-10"
    const searchInput = screen.getByPlaceholderText('Search controls...')
    fireEvent.change(searchInput, { target: { value: 'si-10' } })

    await waitFor(() => {
      expect(
        screen.getByText('Information Input Validation')
      ).toBeInTheDocument()
      expect(
        screen.queryByText('Access Control Policy')
      ).not.toBeInTheDocument()
    })
  })

  it('should filter controls by status', async () => {
    const onNext = jest.fn()
    const onBack = jest.fn()

    render(
      <ControlReviewStep
        onNext={onNext}
        onBack={onBack}
        baseline="moderate"
        selectedTools={[{ toolId: 'semgrep', toolName: 'Semgrep' }]}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Access Control Policy')).toBeInTheDocument()
    })

    // Click on "Covered" filter chip
    fireEvent.click(screen.getByText('1 Covered'))

    await waitFor(() => {
      expect(
        screen.getByText('Information Input Validation')
      ).toBeInTheDocument()
      expect(
        screen.queryByText('Access Control Policy')
      ).not.toBeInTheDocument()
    })
  })

  it('should call onNext when Next button is clicked', async () => {
    const onNext = jest.fn()
    const onBack = jest.fn()

    render(
      <ControlReviewStep
        onNext={onNext}
        onBack={onBack}
        baseline="moderate"
        selectedTools={[{ toolId: 'semgrep', toolName: 'Semgrep' }]}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Access Control Policy')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /next/i }))

    expect(onNext).toHaveBeenCalled()
  })

  it('should call onBack when Back button is clicked', async () => {
    const onNext = jest.fn()
    const onBack = jest.fn()

    render(
      <ControlReviewStep
        onNext={onNext}
        onBack={onBack}
        baseline="moderate"
        selectedTools={[{ toolId: 'semgrep', toolName: 'Semgrep' }]}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Access Control Policy')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /back/i }))

    expect(onBack).toHaveBeenCalled()
  })

  it('should show providing tools for covered controls', async () => {
    const onNext = jest.fn()
    const onBack = jest.fn()

    render(
      <ControlReviewStep
        onNext={onNext}
        onBack={onBack}
        baseline="moderate"
        selectedTools={[{ toolId: 'semgrep', toolName: 'Semgrep' }]}
      />
    )

    await waitFor(() => {
      // Find the Semgrep chip in the tools column
      const semgrepChips = screen.getAllByText('Semgrep')
      expect(semgrepChips.length).toBeGreaterThan(0)
    })
  })
})
