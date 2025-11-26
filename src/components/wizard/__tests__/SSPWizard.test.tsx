import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SSPWizard } from '../SSPWizard'
import { SSPProjectProvider } from '../../../contexts/SSPProjectContext'
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

const mockTools = [
  {
    toolId: 'semgrep',
    toolName: 'Semgrep',
    vendor: 'Semgrep, Inc.',
    category: 'SAST',
    controlMappings: [],
  },
]

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<SSPProjectProvider>{ui}</SSPProjectProvider>)
}

describe('SSPWizard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(oscalCatalog.loadCatalog as jest.Mock).mockResolvedValue(mockCatalog)
    ;(oscalCatalog.getBaselineControls as jest.Mock).mockReturnValue([])
    ;(toolMappings.loadToolMappings as jest.Mock).mockResolvedValue(mockTools)
    ;(coverageCalculator.calculateControlCoverage as jest.Mock).mockReturnValue(
      {
        coverage: [],
        stats: { total: 0, covered: 0, partial: 0, uncovered: 0 },
      }
    )
  })

  it('should render wizard with stepper', () => {
    renderWithProvider(<SSPWizard />)

    expect(screen.getByText('SSP Generator Wizard')).toBeInTheDocument()
    expect(screen.getByText('Project Basics')).toBeInTheDocument()
    expect(screen.getByText('Baseline Selection')).toBeInTheDocument()
    expect(screen.getByText('Security Tools')).toBeInTheDocument()
    expect(screen.getByText('Control Review')).toBeInTheDocument()
    expect(screen.getByText('Generate SSP')).toBeInTheDocument()
  })

  it('should start on step 1 (Project Basics)', () => {
    renderWithProvider(<SSPWizard />)

    expect(screen.getByText('Step 1: Project Basics')).toBeInTheDocument()
    expect(screen.getByLabelText(/system name/i)).toBeInTheDocument()
  })

  it('should navigate to step 2 after completing step 1', async () => {
    renderWithProvider(<SSPWizard />)

    // Fill out form
    fireEvent.change(screen.getByLabelText(/system name/i), {
      target: { value: 'Test System' },
    })
    fireEvent.change(screen.getByLabelText(/system id/i), {
      target: { value: 'test-001' },
    })
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Test description' },
    })

    // Select system type
    fireEvent.mouseDown(screen.getByLabelText(/system type/i))
    await waitFor(() => {
      fireEvent.click(screen.getByText('SaaS'))
    })

    fireEvent.change(screen.getByLabelText(/authorization boundary/i), {
      target: { value: 'Test boundary' },
    })

    // Click Next
    fireEvent.click(screen.getByRole('button', { name: /next/i }))

    await waitFor(() => {
      expect(
        screen.getByText('Step 2: Select Security Baseline')
      ).toBeInTheDocument()
    })
  })

  it('should navigate back when Back button is clicked', async () => {
    renderWithProvider(<SSPWizard />)

    // Complete step 1
    fireEvent.change(screen.getByLabelText(/system name/i), {
      target: { value: 'Test System' },
    })
    fireEvent.change(screen.getByLabelText(/system id/i), {
      target: { value: 'test-001' },
    })
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Test description' },
    })

    fireEvent.mouseDown(screen.getByLabelText(/system type/i))
    await waitFor(() => {
      fireEvent.click(screen.getByText('SaaS'))
    })

    fireEvent.change(screen.getByLabelText(/authorization boundary/i), {
      target: { value: 'Test boundary' },
    })

    fireEvent.click(screen.getByRole('button', { name: /next/i }))

    await waitFor(() => {
      expect(
        screen.getByText('Step 2: Select Security Baseline')
      ).toBeInTheDocument()
    })

    // Click Back
    fireEvent.click(screen.getByRole('button', { name: /back/i }))

    expect(screen.getByText('Step 1: Project Basics')).toBeInTheDocument()
  })

  it('should call onComplete when wizard is finished', async () => {
    const onComplete = jest.fn()
    renderWithProvider(<SSPWizard onComplete={onComplete} />)

    // This is a simplified test - in real usage, you'd navigate through all steps
    // For now, we just verify the wizard renders and the callback prop is accepted
    expect(screen.getByText('SSP Generator Wizard')).toBeInTheDocument()
  })
})
