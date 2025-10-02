/**
 * Unit tests for SSP Generator component
 */
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import SSPGenerator from './SSPGenerator'

// Mock fetch
global.fetch = jest.fn()

const mockControlsData = {
  version: '5.1.1',
  publicationDate: '2024-02-04',
  controls: [
    {
      id: 'AC-1',
      family: 'AC',
      title: 'Policy and Procedures',
      priority: 'P1',
      description: 'Access control policy description',
      baselines: {
        privacy: 'x',
        security: { low: 'x', moderate: 'x', high: 'x' },
      },
      tools: [],
    },
    {
      id: 'AC-2',
      family: 'AC',
      title: 'Account Management',
      priority: 'P2',
      description: 'Account management description',
      baselines: {
        privacy: null,
        security: { low: 'x', moderate: 'x', high: 'x' },
      },
      tools: ['semgrep', 'checkov'],
    },
    {
      id: 'AC-3',
      family: 'AC',
      title: 'Access Enforcement',
      priority: 'P1',
      description: 'Access enforcement description',
      baselines: {
        privacy: null,
        security: { low: null, moderate: 'x', high: 'x' },
      },
      tools: ['gitleaks'],
    },
  ],
}

const createRouter = (initialEntries = ['/app/ssp-generator']) => {
  return createMemoryRouter(
    [
      {
        path: '/app/ssp-generator',
        element: <SSPGenerator />,
        loader: () => ({ username: 'testuser' }),
      },
    ],
    { initialEntries }
  )
}

describe('SSPGenerator', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockControlsData,
    })
  })

  it('should render SSP Generator heading', async () => {
    const router = createRouter()
    render(<RouterProvider router={router} />)

    await waitFor(() => {
      expect(screen.getByText('SSP Generator')).toBeInTheDocument()
    })
  })

  it('should display username from loader', async () => {
    const router = createRouter()
    render(<RouterProvider router={router} />)

    await waitFor(() => {
      expect(
        screen.getByText(/Welcome to the SSP Generator,/i)
      ).toBeInTheDocument()
      expect(screen.getByText('testuser')).toBeInTheDocument()
    })
  })

  it('should render system name and version inputs', async () => {
    const router = createRouter()
    render(<RouterProvider router={router} />)

    await waitFor(() => {
      expect(screen.getByLabelText(/System Name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/System Version/i)).toBeInTheDocument()
    })
  })

  it('should update system name on input change', async () => {
    const user = userEvent.setup()
    const router = createRouter()
    render(<RouterProvider router={router} />)

    await waitFor(() => {
      expect(screen.getByLabelText(/System Name/i)).toBeInTheDocument()
    })

    const systemNameInput = screen.getByLabelText(
      /System Name/i
    ) as HTMLInputElement
    await user.type(systemNameInput, 'Test System')

    expect(systemNameInput.value).toBe('Test System')
  })

  it('should update system version on input change', async () => {
    const user = userEvent.setup()
    const router = createRouter()
    render(<RouterProvider router={router} />)

    await waitFor(() => {
      expect(screen.getByLabelText(/System Version/i)).toBeInTheDocument()
    })

    const systemVersionInput = screen.getByLabelText(
      /System Version/i
    ) as HTMLInputElement
    await user.type(systemVersionInput, '1.0.0')

    expect(systemVersionInput.value).toBe('1.0.0')
  })

  it('should load NIST controls when framework is selected', async () => {
    const user = userEvent.setup()
    const router = createRouter()
    render(<RouterProvider router={router} />)

    await waitFor(() => {
      expect(
        screen.getByLabelText(/Security Controls Framework/i)
      ).toBeInTheDocument()
    })

    // Click framework dropdown
    const frameworkSelect = screen.getByLabelText(
      /Security Controls Framework/i
    )
    await user.click(frameworkSelect)

    // Select NIST SP 800-53 Rev. 5.1.1
    const nistOption = await screen.findByText('NIST SP 800-53 Rev. 5.1.1')
    await user.click(nistOption)

    // Wait for controls to load
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/src/data/nist/nist-800-53-rev5.json'
      )
    })

    // Verify table heading is displayed
    await waitFor(() => {
      expect(
        screen.getByText('NIST 800-53 Rev. 5.1.1 Controls')
      ).toBeInTheDocument()
    })
  })

  it('should display loading message when fetching controls', async () => {
    const user = userEvent.setup()
    ;(global.fetch as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () => resolve({ ok: true, json: async () => mockControlsData }),
            100
          )
        )
    )

    const router = createRouter()
    render(<RouterProvider router={router} />)

    await waitFor(() => {
      expect(
        screen.getByLabelText(/Security Controls Framework/i)
      ).toBeInTheDocument()
    })

    const frameworkSelect = screen.getByLabelText(
      /Security Controls Framework/i
    )
    await user.click(frameworkSelect)

    const nistOption = await screen.findByText('NIST SP 800-53 Rev. 5.1.1')
    await user.click(nistOption)

    expect(
      screen.getByText('Loading NIST 800-53 controls...')
    ).toBeInTheDocument()
  })

  it('should display error message when fetch fails', async () => {
    const user = userEvent.setup()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
    })

    const router = createRouter()
    render(<RouterProvider router={router} />)

    await waitFor(() => {
      expect(
        screen.getByLabelText(/Security Controls Framework/i)
      ).toBeInTheDocument()
    })

    const frameworkSelect = screen.getByLabelText(
      /Security Controls Framework/i
    )
    await user.click(frameworkSelect)

    const nistOption = await screen.findByText('NIST SP 800-53 Rev. 5.1.1')
    await user.click(nistOption)

    await waitFor(() => {
      expect(
        screen.getByText(/Failed to load NIST 800-53 controls/i)
      ).toBeInTheDocument()
    })
  })

  it('should filter controls by baseline', async () => {
    const user = userEvent.setup()
    const router = createRouter()
    render(<RouterProvider router={router} />)

    // Select framework
    await waitFor(() => {
      expect(
        screen.getByLabelText(/Security Controls Framework/i)
      ).toBeInTheDocument()
    })

    const frameworkSelect = screen.getByLabelText(
      /Security Controls Framework/i
    )
    await user.click(frameworkSelect)
    const nistOption = await screen.findByText('NIST SP 800-53 Rev. 5.1.1')
    await user.click(nistOption)

    // Wait for controls to load
    await waitFor(() => {
      expect(screen.getByText('AC-1')).toBeInTheDocument()
      expect(screen.getByText('AC-2')).toBeInTheDocument()
      expect(screen.getByText('AC-3')).toBeInTheDocument()
    })

    // Select baseline
    const baselineSelect = screen.getByLabelText(/Security Baseline/i)
    await user.click(baselineSelect)
    const moderateOption = await screen.findByText('Moderate')
    await user.click(moderateOption)

    // AC-1 should still be visible (in moderate baseline)
    expect(screen.getByText('AC-1')).toBeInTheDocument()
    // AC-3 should still be visible (in moderate baseline)
    expect(screen.getByText('AC-3')).toBeInTheDocument()
  })

  it('should filter controls by selected tools when baseline is selected', async () => {
    const user = userEvent.setup()
    const router = createRouter()
    render(<RouterProvider router={router} />)

    // Select framework
    await waitFor(() => {
      expect(
        screen.getByLabelText(/Security Controls Framework/i)
      ).toBeInTheDocument()
    })

    const frameworkSelect = screen.getByLabelText(
      /Security Controls Framework/i
    )
    await user.click(frameworkSelect)
    const nistOption = await screen.findByText('NIST SP 800-53 Rev. 5.1.1')
    await user.click(nistOption)

    // Wait for controls to load
    await waitFor(() => {
      expect(screen.getByText('AC-1')).toBeInTheDocument()
    })

    // Select a baseline first (tool filter only works with baseline selected)
    const baselineSelect = screen.getByLabelText(/Security Baseline/i)
    await user.click(baselineSelect)
    const lowOption = await screen.findByText('Low')
    await user.click(lowOption)

    // Now click the security tools selector
    const toolSelector = screen.getByLabelText(/Security Tools/i)
    await user.click(toolSelector)

    // Select semgrep tool
    const semgrepOption = await screen.findByText('Semgrep')
    await user.click(semgrepOption)

    // Click outside to close dropdown
    await user.keyboard('{Escape}')

    // Now only controls with semgrep tool should be visible
    await waitFor(() => {
      // AC-2 has semgrep tool and is in low baseline, should be visible
      expect(screen.getByText('AC-2')).toBeInTheDocument()
      // AC-1 has no tools, should not be visible
      expect(screen.queryByText('AC-1')).not.toBeInTheDocument()
      // AC-3 has gitleaks tool (not semgrep), should not be visible
      expect(screen.queryByText('AC-3')).not.toBeInTheDocument()
    })
  })

  it('should display tools as chips for controls with tools', async () => {
    const user = userEvent.setup()
    const router = createRouter()
    render(<RouterProvider router={router} />)

    // Select framework
    const frameworkSelect = await screen.findByLabelText(
      /Security Controls Framework/i
    )
    await user.click(frameworkSelect)
    const nistOption = await screen.findByText('NIST SP 800-53 Rev. 5.1.1')
    await user.click(nistOption)

    // Wait for controls table with tools
    await waitFor(() => {
      // AC-2 has semgrep and checkov tools
      expect(screen.getByText('semgrep')).toBeInTheDocument()
      expect(screen.getByText('checkov')).toBeInTheDocument()
      // AC-3 has gitleaks tool
      expect(screen.getByText('gitleaks')).toBeInTheDocument()
    })
  })

  it('should clear controls when selecting None framework', async () => {
    const user = userEvent.setup()
    const router = createRouter()
    render(<RouterProvider router={router} />)

    // First select NIST framework
    const frameworkSelect = await screen.findByLabelText(
      /Security Controls Framework/i
    )
    await user.click(frameworkSelect)
    const nistOption = await screen.findByText('NIST SP 800-53 Rev. 5.1.1')
    await user.click(nistOption)

    await waitFor(() => {
      expect(screen.getByText('AC-1')).toBeInTheDocument()
    })

    // Now select None
    await user.click(frameworkSelect)
    const noneOption = await screen.findByRole('option', { name: /None/i })
    await user.click(noneOption)

    // Controls table should not be visible
    await waitFor(() => {
      expect(screen.queryByText('AC-1')).not.toBeInTheDocument()
    })
  })
})
