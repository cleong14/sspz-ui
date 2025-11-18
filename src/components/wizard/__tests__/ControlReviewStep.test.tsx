import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ControlReviewStep } from '../ControlReviewStep'
import * as oscalCatalogService from '../../../services/oscal-catalog'
import * as toolMappingsService from '../../../services/tool-mappings'

jest.mock('../../../services/oscal-catalog', () => ({
  ...jest.requireActual('../../../services/oscal-catalog'),
  loadCatalog: jest.fn(),
}))

jest.mock('../../../services/tool-mappings', () => ({
  ...jest.requireActual('../../../services/tool-mappings'),
  loadToolMappings: jest.fn(),
}))

describe('ControlReviewStep', () => {
  const mockOnNext = jest.fn()
  const mockLoadCatalog =
    oscalCatalogService.loadCatalog as jest.MockedFunction<
      typeof oscalCatalogService.loadCatalog
    >
  const mockLoadToolMappings =
    toolMappingsService.loadToolMappings as jest.MockedFunction<
      typeof toolMappingsService.loadToolMappings
    >

  const mockCatalog = {
    uuid: 'test',
    metadata: {
      title: 'Test',
      lastModified: '',
      version: '1.0',
      oscalVersion: '1.0.4',
    },
    groups: [],
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockLoadCatalog.mockResolvedValue(mockCatalog)
    mockLoadToolMappings.mockResolvedValue([])
  })

  it('renders step title', async () => {
    render(
      <ControlReviewStep
        onNext={mockOnNext}
        selectedBaseline="moderate"
        selectedTools={[]}
      />
    )

    expect(
      await screen.findByText(/Step 4: Control Review/i)
    ).toBeInTheDocument()
  })

  it('loads and displays controls with coverage status', async () => {
    const catalogWithControls = {
      uuid: 'test',
      metadata: {
        title: 'Test',
        lastModified: '',
        version: '1.0',
        oscalVersion: '1.0.4',
      },
      groups: [
        {
          id: 'ac',
          class: 'family',
          title: 'Access Control',
          controls: [
            {
              id: 'ac-1',
              class: 'AC',
              title: 'Policy and Procedures',
              parts: [],
              props: [{ name: 'baseline-impact', value: 'moderate' }],
            },
          ],
        },
      ],
    }

    const toolsWithMappings = [
      {
        toolId: 'semgrep',
        toolName: 'Semgrep',
        vendor: 'Semgrep Inc',
        category: 'SAST' as const,
        controlMappings: [
          { controlId: 'ac-1', coverage: 'full' as const, rationale: 'Test' },
        ],
      },
    ]

    mockLoadCatalog.mockResolvedValueOnce(catalogWithControls)
    mockLoadToolMappings.mockResolvedValueOnce(toolsWithMappings)

    render(
      <ControlReviewStep
        onNext={mockOnNext}
        selectedBaseline="moderate"
        selectedTools={[
          { toolId: 'semgrep', toolName: 'Semgrep', version: '1.0.0' },
        ]}
      />
    )

    expect(await screen.findByText('ac-1')).toBeInTheDocument()
    expect(screen.getByText('Policy and Procedures')).toBeInTheDocument()
  })

  it('filters controls by coverage status', async () => {
    const catalogWithMultipleControls = {
      uuid: 'test',
      metadata: {
        title: 'Test',
        lastModified: '',
        version: '1.0',
        oscalVersion: '1.0.4',
      },
      groups: [
        {
          id: 'ac',
          class: 'family',
          title: 'Access Control',
          controls: [
            {
              id: 'ac-1',
              class: 'AC',
              title: 'Control 1',
              parts: [],
              props: [{ name: 'baseline-impact', value: 'moderate' }],
            },
            {
              id: 'ac-2',
              class: 'AC',
              title: 'Control 2',
              parts: [],
              props: [{ name: 'baseline-impact', value: 'moderate' }],
            },
          ],
        },
      ],
    }

    const toolsWithPartialMappings = [
      {
        toolId: 'semgrep',
        toolName: 'Semgrep',
        vendor: 'Semgrep Inc',
        category: 'SAST' as const,
        controlMappings: [
          { controlId: 'ac-1', coverage: 'full' as const, rationale: 'Test' },
        ],
      },
    ]

    mockLoadCatalog.mockResolvedValueOnce(catalogWithMultipleControls)
    mockLoadToolMappings.mockResolvedValueOnce(toolsWithPartialMappings)

    const user = userEvent.setup()
    render(
      <ControlReviewStep
        onNext={mockOnNext}
        selectedBaseline="moderate"
        selectedTools={[
          { toolId: 'semgrep', toolName: 'Semgrep', version: '1.0.0' },
        ]}
      />
    )

    await screen.findByText('ac-1')
    expect(screen.getByText('ac-2')).toBeInTheDocument()

    const filterSelect = screen.getByRole('combobox')
    await user.click(filterSelect)

    const listbox = await screen.findByRole('listbox')
    const coveredOption = await screen.findAllByRole('option', {
      name: /^Covered$/i,
    })
    await user.click(coveredOption[0])

    expect(screen.getByText('ac-1')).toBeInTheDocument()
    expect(screen.queryByText('ac-2')).not.toBeInTheDocument()
  })
})
