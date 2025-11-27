/**
 * SSP Dashboard View
 * @module views/Dashboard/Dashboard
 *
 * The main dashboard displaying SSP project summary stats, project cards,
 * and quick actions. Shows empty state when no projects exist.
 *
 * Story 4.1: Build SSP Dashboard
 */
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import AddIcon from '@mui/icons-material/Add'
import FolderIcon from '@mui/icons-material/Folder'
import EditNoteIcon from '@mui/icons-material/EditNote'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ArchiveIcon from '@mui/icons-material/Archive'
import { useSsp } from '@/contexts/SspContext'
import { useAlert } from '@/hooks/useAlert'
import { SspCard, SspStatsCard, SspEmptyState } from '@/components/ssp'
import type { SspProject } from '@/types/ssp'

/**
 * SSP Dashboard component showing project overview and quick access.
 */
const Dashboard: React.FC = (): JSX.Element => {
  const navigate = useNavigate()
  const { setAlert } = useAlert()
  const {
    isLoading,
    hasDirectoryAccess,
    getActiveProjects,
    getProjectStats,
    requestDirectoryAccess,
    archiveProject,
    deleteProject,
    loadProjects,
  } = useSsp()

  // Load projects on mount if we have directory access
  useEffect(() => {
    if (hasDirectoryAccess) {
      loadProjects()
    }
  }, [hasDirectoryAccess, loadProjects])

  const activeProjects = getActiveProjects()
  const stats = getProjectStats()

  const handleConnectDirectory = async () => {
    try {
      await requestDirectoryAccess()
      setAlert({
        message: 'Projects folder connected successfully',
        severity: 'success',
      })
    } catch (error) {
      if (error instanceof Error && error.message.includes('cancelled')) {
        // User cancelled - don't show error
        return
      }
      setAlert({
        message: 'Failed to connect projects folder',
        severity: 'error',
      })
    }
  }

  const handleCreateClick = () => {
    navigate('/app/projects?action=create')
  }

  const handleOpenProject = (project: SspProject) => {
    navigate(`/app/projects/${project.id}`)
  }

  const handleDuplicateProject = (project: SspProject) => {
    navigate(`/app/projects?action=duplicate&id=${project.id}`)
  }

  const handleArchiveProject = async (project: SspProject) => {
    try {
      await archiveProject(project.id)
      setAlert({
        message: `"${project.name}" has been archived`,
        severity: 'success',
      })
    } catch {
      setAlert({
        message: 'Failed to archive project',
        severity: 'error',
      })
    }
  }

  const handleDeleteProject = async (project: SspProject) => {
    // In a real app, show confirmation dialog first
    try {
      await deleteProject(project.id)
      setAlert({
        message: `"${project.name}" has been deleted`,
        severity: 'success',
      })
    } catch {
      setAlert({
        message: 'Failed to delete project',
        severity: 'error',
      })
    }
  }

  // Loading state
  if (isLoading && hasDirectoryAccess) {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Skeleton variant="text" width={200} height={40} />
          <Skeleton variant="rectangular" width={150} height={36} />
        </Box>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={6} sm={3} key={i}>
              <Skeleton variant="rectangular" height={100} />
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
          ))}
        </Grid>
      </Box>
    )
  }

  // Empty state - no directory access or no projects
  if (!hasDirectoryAccess || activeProjects.length === 0) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <SspEmptyState
          hasDirectoryAccess={hasDirectoryAccess}
          onCreateClick={handleCreateClick}
          onConnectDirectory={handleConnectDirectory}
        />
      </Box>
    )
  }

  // Dashboard with projects
  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateClick}
        >
          Create New SSP
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={3}>
          <SspStatsCard
            title="Total SSPs"
            value={stats.total}
            icon={<FolderIcon />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <SspStatsCard
            title="In Progress"
            value={stats.inProgress + stats.draft}
            icon={<EditNoteIcon />}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <SspStatsCard
            title="Complete"
            value={stats.complete}
            icon={<CheckCircleIcon />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <SspStatsCard
            title="Archived"
            value={stats.archived}
            icon={<ArchiveIcon />}
            color="#757575"
          />
        </Grid>
      </Grid>

      {/* Projects Section */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" component="h2">
          Recent Projects
        </Typography>
      </Box>

      {/* Project Cards Grid */}
      <Grid container spacing={3}>
        {activeProjects.slice(0, 6).map((project) => (
          <Grid item xs={12} sm={6} md={4} key={project.id}>
            <SspCard
              project={project}
              onOpen={handleOpenProject}
              onDuplicate={handleDuplicateProject}
              onArchive={handleArchiveProject}
              onDelete={handleDeleteProject}
            />
          </Grid>
        ))}
      </Grid>

      {/* View All Projects Link */}
      {activeProjects.length > 6 && (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button variant="outlined" onClick={() => navigate('/app/projects')}>
            View All Projects ({activeProjects.length})
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default Dashboard
