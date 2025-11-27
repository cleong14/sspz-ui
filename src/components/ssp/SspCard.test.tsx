/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { SspCard } from './SspCard'
import type { SspProject } from '@/types/ssp'

const mockProject: SspProject = {
  id: 'test-id-123',
  name: 'Test System',
  description: 'A test system for unit testing',
  baseline: 'MODERATE',
  status: 'IN_PROGRESS',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-15T00:00:00.000Z',
  systemInfo: {
    systemName: 'Test System',
    systemType: 'major-application',
    description: 'A test system',
    boundary: {
      description: '',
      components: [],
      externalConnections: [],
    },
    categorization: {
      confidentiality: 'MODERATE',
      integrity: 'MODERATE',
      availability: 'MODERATE',
    },
    environment: {
      deploymentModel: 'cloud',
      operatingSystems: [],
      technologies: [],
      dataTypes: [],
    },
    contacts: {
      systemOwner: { name: '', title: '', email: '' },
      authorizingOfficial: { name: '', title: '', email: '' },
      securityPoc: { name: '', title: '', email: '' },
      technicalPoc: { name: '', title: '', email: '' },
    },
  },
  implementations: [
    {
      controlId: 'AC-1',
      status: 'IMPLEMENTED',
      aiGenerated: false,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      controlId: 'AC-2',
      status: 'NOT_STARTED',
      aiGenerated: false,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
  ],
  selectedTools: [],
  aiSuggestionFeedback: [],
}

const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('SspCard', () => {
  it('renders project name', () => {
    renderWithRouter(<SspCard project={mockProject} />)
    expect(screen.getByText('Test System')).toBeInTheDocument()
  })

  it('renders project description', () => {
    renderWithRouter(<SspCard project={mockProject} />)
    expect(
      screen.getByText('A test system for unit testing')
    ).toBeInTheDocument()
  })

  it('renders status chip', () => {
    renderWithRouter(<SspCard project={mockProject} />)
    expect(screen.getByText('In Progress')).toBeInTheDocument()
  })

  it('renders baseline chip', () => {
    renderWithRouter(<SspCard project={mockProject} />)
    expect(screen.getByText('Moderate')).toBeInTheDocument()
  })

  it('renders progress ring with calculated percentage', () => {
    renderWithRouter(<SspCard project={mockProject} />)
    // 1 implemented out of 2 = 50%
    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  it('renders last updated date', () => {
    renderWithRouter(<SspCard project={mockProject} />)
    expect(screen.getByText('Jan 15, 2024')).toBeInTheDocument()
  })

  it('calls onOpen when card is clicked', () => {
    const onOpen = jest.fn()
    renderWithRouter(<SspCard project={mockProject} onOpen={onOpen} />)

    fireEvent.click(screen.getByText('Test System'))
    expect(onOpen).toHaveBeenCalledWith(mockProject)
  })

  it('renders menu button', () => {
    renderWithRouter(<SspCard project={mockProject} />)
    expect(screen.getByLabelText('More actions')).toBeInTheDocument()
  })

  it('shows archive option for active projects', async () => {
    renderWithRouter(<SspCard project={mockProject} />)

    fireEvent.click(screen.getByLabelText('More actions'))

    expect(await screen.findByText('Archive')).toBeInTheDocument()
  })

  it('shows restore option for archived projects', async () => {
    const archivedProject = {
      ...mockProject,
      archivedAt: '2024-01-20T00:00:00.000Z',
    }
    renderWithRouter(<SspCard project={archivedProject} />)

    fireEvent.click(screen.getByLabelText('More actions'))

    expect(await screen.findByText('Restore')).toBeInTheDocument()
  })

  it('calls onDuplicate when duplicate is clicked', async () => {
    const onDuplicate = jest.fn()
    renderWithRouter(
      <SspCard project={mockProject} onDuplicate={onDuplicate} />
    )

    fireEvent.click(screen.getByLabelText('More actions'))
    fireEvent.click(await screen.findByText('Duplicate'))

    expect(onDuplicate).toHaveBeenCalledWith(mockProject)
  })

  it('calls onArchive when archive is clicked', async () => {
    const onArchive = jest.fn()
    renderWithRouter(<SspCard project={mockProject} onArchive={onArchive} />)

    fireEvent.click(screen.getByLabelText('More actions'))
    fireEvent.click(await screen.findByText('Archive'))

    expect(onArchive).toHaveBeenCalledWith(mockProject)
  })

  it('calls onDelete when delete is clicked', async () => {
    const onDelete = jest.fn()
    renderWithRouter(<SspCard project={mockProject} onDelete={onDelete} />)

    fireEvent.click(screen.getByLabelText('More actions'))
    fireEvent.click(await screen.findByText('Delete'))

    expect(onDelete).toHaveBeenCalledWith(mockProject)
  })
})
