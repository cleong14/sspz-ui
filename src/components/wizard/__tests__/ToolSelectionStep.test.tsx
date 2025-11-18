import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToolSelectionStep } from '../ToolSelectionStep'
import * as toolMappingsService from '../../../services/tool-mappings'

jest.mock('../../../services/tool-mappings')

describe('ToolSelectionStep', () => {
  const mockOnNext = jest.fn()
  const mockLoadToolMappings =
    toolMappingsService.loadToolMappings as jest.MockedFunction<
      typeof toolMappingsService.loadToolMappings
    >

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders step title', async () => {
    mockLoadToolMappings.mockResolvedValueOnce([])

    render(
      <ToolSelectionStep onNext={mockOnNext} selectedBaseline="moderate" />
    )

    expect(
      await screen.findByText(/Step 3: Tool Selection/i)
    ).toBeInTheDocument()
  })

  it('loads and displays available tools', async () => {
    const mockTools = [
      {
        id: 'semgrep',
        name: 'Semgrep',
        category: 'SAST' as const,
        version: '1.0.0',
        controlMappings: [],
      },
    ]

    mockLoadToolMappings.mockResolvedValueOnce(mockTools)

    render(
      <ToolSelectionStep onNext={mockOnNext} selectedBaseline="moderate" />
    )

    expect(await screen.findByText('Semgrep')).toBeInTheDocument()
  })

  it('allows selecting and deselecting tools', async () => {
    const mockTools = [
      {
        id: 'semgrep',
        name: 'Semgrep',
        category: 'SAST' as const,
        version: '1.0.0',
        controlMappings: [],
      },
    ]

    mockLoadToolMappings.mockResolvedValueOnce(mockTools)

    const user = userEvent.setup()
    render(
      <ToolSelectionStep onNext={mockOnNext} selectedBaseline="moderate" />
    )

    const checkbox = await screen.findByRole('checkbox', { name: /Select/i })
    await user.click(checkbox)

    expect(screen.getByText(/1 tool\(s\) selected/i)).toBeInTheDocument()
  })

  it('calls onNext with selected tools', async () => {
    const mockTools = [
      {
        id: 'semgrep',
        name: 'Semgrep',
        category: 'SAST' as const,
        version: '1.0.0',
        controlMappings: [],
      },
    ]

    mockLoadToolMappings.mockResolvedValueOnce(mockTools)

    const user = userEvent.setup()
    render(
      <ToolSelectionStep onNext={mockOnNext} selectedBaseline="moderate" />
    )

    const checkbox = await screen.findByRole('checkbox', { name: /Select/i })
    await user.click(checkbox)

    const nextButton = screen.getByRole('button', { name: /Next/i })
    await user.click(nextButton)

    expect(mockOnNext).toHaveBeenCalledWith([
      {
        toolId: 'semgrep',
        toolName: 'Semgrep',
        version: '1.0.0',
      },
    ])
  })
})
