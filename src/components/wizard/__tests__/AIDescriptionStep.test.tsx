import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AIDescriptionStep } from '../AIDescriptionStep'
import { resetCatalogCache } from '../../../services/oscal-catalog'

describe('AIDescriptionStep', () => {
  const mockOnNext = jest.fn()

  beforeEach(() => {
    resetCatalogCache()
    jest.clearAllMocks()
  })

  it('renders step title', async () => {
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

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ catalog: mockCatalog }),
    })

    render(
      <AIDescriptionStep
        onNext={mockOnNext}
        selectedBaseline="moderate"
        selectedTools={[]}
      />
    )

    expect(
      await screen.findByText(/Step 5: AI Description Generation/i)
    ).toBeInTheDocument()
  })

  it('loads controls and displays generate buttons', async () => {
    const mockCatalog = {
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
              title: 'Policy',
              parts: [],
              props: [{ name: 'baseline-impact', value: 'moderate' }],
            },
          ],
        },
      ],
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ catalog: mockCatalog }),
    })

    render(
      <AIDescriptionStep
        onNext={mockOnNext}
        selectedBaseline="moderate"
        selectedTools={[]}
      />
    )

    expect(await screen.findByText(/ac-1/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Generate' })).toBeInTheDocument()
  })

  it('generates description for a control', async () => {
    const mockCatalog = {
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
              title: 'Policy',
              parts: [],
              props: [{ name: 'baseline-impact', value: 'moderate' }],
            },
          ],
        },
      ],
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ catalog: mockCatalog }),
    })

    const user = userEvent.setup()
    render(
      <AIDescriptionStep
        onNext={mockOnNext}
        selectedBaseline="moderate"
        selectedTools={[
          { toolId: 'semgrep', toolName: 'Semgrep', version: '1.0.0' },
        ]}
      />
    )

    await screen.findByText(/ac-1/)

    const generateButton = screen.getByRole('button', { name: 'Generate' })
    await user.click(generateButton)

    expect(screen.getByText(/AI Generated/i)).toBeInTheDocument()
  })
})
