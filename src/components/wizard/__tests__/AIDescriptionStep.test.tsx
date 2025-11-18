import { render, screen, waitFor } from '@testing-library/react'
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
    const user = userEvent.setup()

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
        selectedTools={[
          { toolId: 'semgrep', toolName: 'Semgrep', version: '1.0.0' },
        ]}
      />
    )

    // Wait for the control to be rendered
    await screen.findByText(/ac-1/)
    expect(screen.getByText(/pending/)).toBeInTheDocument()

    // Get the Generate button for the control (not "Generate All")
    const generateButton = screen
      .getAllByRole('button')
      .find((btn) => btn.textContent?.trim() === 'Generate')

    expect(generateButton).toBeInTheDocument()
    expect(generateButton).toBeEnabled()

    // Click the button using userEvent while simultaneously waiting for the state update
    // This ensures React has time to process the state update and commit it before the
    // test continues, avoiding "act(...)" warnings from React Testing Library
    const [, aiGeneratedElement] = await Promise.all([
      user.click(generateButton!),
      screen.findByText(/\[AI Generated\]/),
    ])

    expect(aiGeneratedElement).toBeInTheDocument()
  })

  it('allows accepting a generated description', async () => {
    const user = userEvent.setup()

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
        selectedTools={[
          { toolId: 'semgrep', toolName: 'Semgrep', version: '1.0.0' },
        ]}
      />
    )

    // Wait for the control to be rendered
    await screen.findByText(/ac-1/)
    expect(screen.getByText(/pending/)).toBeInTheDocument()

    // Get the Generate button for the control (not "Generate All")
    const generateButton = screen
      .getAllByRole('button')
      .find((btn) => btn.textContent?.trim() === 'Generate')

    expect(generateButton).toBeInTheDocument()
    expect(generateButton).toBeEnabled()

    // Click the Generate button and wait for the description to appear
    const [, aiGeneratedElement] = await Promise.all([
      user.click(generateButton!),
      screen.findByText(/\[AI Generated\]/),
    ])

    expect(aiGeneratedElement).toBeInTheDocument()

    // Find and click the accept button (CheckCircle icon button)
    // The accept button appears when status is 'generated' and has the success color
    const allButtons = screen.getAllByRole('button')
    const acceptButton = allButtons.find((btn) => {
      return (
        btn.querySelector('svg') &&
        btn.className.includes('MuiIconButton-colorSuccess')
      )
    })

    expect(acceptButton).toBeDefined()
    await user.click(acceptButton!)

    // Verify acceptance was recorded - status should show "Accepted: 1"
    expect(await screen.findByText(/Accepted: 1/i)).toBeInTheDocument()
  })
})
