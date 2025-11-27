/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import FolderIcon from '@mui/icons-material/Folder'
import { SspStatsCard } from './SspStatsCard'

describe('SspStatsCard', () => {
  it('renders title and value', () => {
    render(<SspStatsCard title="Total Projects" value={42} />)
    expect(screen.getByText('Total Projects')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('renders string values', () => {
    render(<SspStatsCard title="Status" value="Active" />)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('renders with icon', () => {
    render(
      <SspStatsCard
        title="Projects"
        value={10}
        icon={<FolderIcon data-testid="folder-icon" />}
      />
    )
    expect(screen.getByTestId('folder-icon')).toBeInTheDocument()
  })

  it('renders zero value correctly', () => {
    render(<SspStatsCard title="Empty" value={0} />)
    expect(screen.getByText('0')).toBeInTheDocument()
  })
})
