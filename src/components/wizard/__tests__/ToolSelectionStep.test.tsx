import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ToolSelectionStep } from '../ToolSelectionStep'
import * as toolMappings from '../../../services/tool-mappings'
import * as oscalCatalog from '../../../services/oscal-catalog'
import * as coverageCalculator from '../../../services/coverage-calculator'

// Mock the services
jest.mock('../../../services/tool-mappings', () => ({
  loadToolMappings: jest.fn(),
}))

jest.mock('../../../services/oscal-catalog', () => ({
  loadCatalog: jest.fn(),
}))

jest.mock('../../../services/coverage-calculator', () => ({
  calculateControlCoverage: jest.fn(),
}))

const mockTools = [
  {
    toolId: 'semgrep',
    toolName: 'Semgrep',
    vendor: 'Semgrep, Inc.',
    category: 'SAST',
    controlMappings: [
      { controlId: 'si-10.1', coverage: 'full', rationale: 'Test' },
    ],
  },
  {
    toolId: 'gitleaks',
    toolName: 'Gitleaks',
    vendor: 'Gitleaks',
    category: 'secrets',
    controlMappings: [
      { controlId: 'ia-5.1', coverage: 'full', rationale: 'Test' },
    ],
  },
  {
    toolId: 'grype',
    toolName: 'Grype',
    vendor: 'Anchore',
    category: 'SCA',
    controlMappings: [
      { controlId: 'si-2.1', coverage: 'full', rationale: 'Test' },
    ],
  },
]

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

describe('ToolSelectionStep', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(toolMappings.loadToolMappings as jest.Mock).mockResolvedValue(mockTools)
    ;(oscalCatalog.loadCatalog as jest.Mock).mockResolvedValue(mockCatalog)
    ;(coverageCalculator.calculateControlCoverage as jest.Mock).mockReturnValue({
      coverage: [],
      stats: { total: 100, covered: 30, partial: 20, uncovered: 50 },
    })
  })

  it('should render all available tools', async () => {
    const onNext = jest.fn()
    const onBack = jest.fn()

    render(
      <ToolSelectionStep onNext={onNext} onBack={onBack} baseline="moderate" />
    )

    await waitFor(() => {
      expect(screen.getByText('Semgrep')).toBeInTheDocument()
      expect(screen.getByText('Gitleaks')).toBeInTheDocument()
      expect(screen.getByText('Grype')).toBeInTheDocument()
    })
  })

  it('should show coverage stats', async () => {
    const onNext = jest.fn()
    const onBack = jest.fn()

    render(
      <ToolSelectionStep onNext={onNext} onBack={onBack} baseline="moderate" />
    )

    await waitFor(() => {
      expect(screen.getByText('30 Covered')).toBeInTheDocument()
      expect(screen.getByText('20 Partial')).toBeInTheDocument()
      expect(screen.getByText('50 Uncovered')).toBeInTheDocument()
      expect(screen.getByText('100 Total Controls')).toBeInTheDocument()
    })
  })

  it('should toggle tool selection on click', async () => {
    const onNext = jest.fn()
    const onBack = jest.fn()

    render(
      <ToolSelectionStep onNext={onNext} onBack={onBack} baseline="moderate" />
    )

    await waitFor(() => {
      expect(screen.getByText('Semgrep')).toBeInTheDocument()
    })

    // Get the checkbox for Semgrep
    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[0])

    expect(checkboxes[0]).toBeChecked()
  })

  it('should call onNext with selected tools', async () => {
    const onNext = jest.fn()
    const onBack = jest.fn()

    render(
      <ToolSelectionStep onNext={onNext} onBack={onBack} baseline="moderate" />
    )

    await waitFor(() => {
      expect(screen.getByText('Semgrep')).toBeInTheDocument()
    })

    // Select Semgrep
    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[0])

    // Click Next
    fireEvent.click(screen.getByRole('button', { name: /next/i }))

    expect(onNext).toHaveBeenCalledWith([
      { toolId: 'semgrep', toolName: 'Semgrep' },
    ])
  })

  it('should call onBack when Back button is clicked', async () => {
    const onNext = jest.fn()
    const onBack = jest.fn()

    render(
      <ToolSelectionStep onNext={onNext} onBack={onBack} baseline="moderate" />
    )

    await waitFor(() => {
      expect(screen.getByText('Semgrep')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /back/i }))

    expect(onBack).toHaveBeenCalled()
  })

  it('should select all tools when Select All is clicked', async () => {
    const onNext = jest.fn()
    const onBack = jest.fn()

    render(
      <ToolSelectionStep onNext={onNext} onBack={onBack} baseline="moderate" />
    )

    await waitFor(() => {
      expect(screen.getByText('Semgrep')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /select all/i }))

    const checkboxes = screen.getAllByRole('checkbox')
    checkboxes.forEach((checkbox) => {
      expect(checkbox).toBeChecked()
    })
  })

  it('should clear all selections when Clear All is clicked', async () => {
    const onNext = jest.fn()
    const onBack = jest.fn()

    render(
      <ToolSelectionStep
        onNext={onNext}
        onBack={onBack}
        baseline="moderate"
        initialTools={[{ toolId: 'semgrep', toolName: 'Semgrep' }]}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Semgrep')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /clear all/i }))

    const checkboxes = screen.getAllByRole('checkbox')
    checkboxes.forEach((checkbox) => {
      expect(checkbox).not.toBeChecked()
    })
  })

  it('should pre-select initial tools', async () => {
    const onNext = jest.fn()
    const onBack = jest.fn()

    render(
      <ToolSelectionStep
        onNext={onNext}
        onBack={onBack}
        baseline="moderate"
        initialTools={[
          { toolId: 'semgrep', toolName: 'Semgrep' },
          { toolId: 'grype', toolName: 'Grype' },
        ]}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Semgrep')).toBeInTheDocument()
    })

    expect(screen.getByText('2 of 3 tools selected')).toBeInTheDocument()
  })
})
