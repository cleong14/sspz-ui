/**
 * Project List View
 * @module views/Projects/ProjectList
 *
 * Displays a complete list of SSP projects with search, filtering,
 * sorting, and CRUD operations.
 *
 * Story 4.2: Implement Create New SSP
 * Story 4.3: Implement SSP List and Search
 * Story 4.4: Implement Duplicate SSP as Template
 * Story 4.5: Implement Archive and Delete SSP
 */
import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Skeleton from '@mui/material/Skeleton'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import FilterListIcon from '@mui/icons-material/FilterList'
import SortIcon from '@mui/icons-material/Sort'
import { useSsp } from '@/contexts/SspContext'
import { useAlert } from '@/hooks/useAlert'
import { SspCard, SspEmptyState, CreateSspDialog } from '@/components/ssp'
import type {
  SspProject,
  SspStatus,
  Baseline,
  CreateSspInput,
} from '@/types/ssp'

type SortOption = 'name' | 'createdAt' | 'updatedAt'
type SortDirection = 'asc' | 'desc'

interface FilterState {
  status: SspStatus | 'ALL' | 'ARCHIVED'
  baseline: Baseline | 'ALL'
}

/**
 * ProjectList component for managing SSP projects.
 */
const ProjectList: React.FC = (): JSX.Element => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { setAlert } = useAlert()
  const {
    projects,
    isLoading,
    hasDirectoryAccess,
    loadProjects,
    createProject,
    archiveProject,
    restoreProject,
    duplicateProject,
    deleteProject,
    requestDirectoryAccess,
  } = useSsp()

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<SspProject | null>(
    null
  )
  const [duplicateName, setDuplicateName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterState>({
    status: 'ALL',
    baseline: 'ALL',
  })
  const [sortBy, setSortBy] = useState<SortOption>('updatedAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Load projects on mount
  useEffect(() => {
    if (hasDirectoryAccess) {
      loadProjects()
    }
  }, [hasDirectoryAccess, loadProjects])

  // Handle URL params for actions
  useEffect(() => {
    const action = searchParams.get('action')
    const id = searchParams.get('id')

    if (action === 'create') {
      setCreateDialogOpen(true)
      // Clear the action from URL
      searchParams.delete('action')
      setSearchParams(searchParams, { replace: true })
    } else if (action === 'duplicate' && id) {
      const project = projects.find((p) => p.id === id)
      if (project) {
        setSelectedProject(project)
        setDuplicateName(`${project.name} (Copy)`)
        setDuplicateDialogOpen(true)
      }
      searchParams.delete('action')
      searchParams.delete('id')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, setSearchParams, projects])

  // Filtered and sorted projects
  const filteredProjects = useMemo(() => {
    let result = [...projects]

    // Filter by archived status
    if (filters.status === 'ARCHIVED') {
      result = result.filter((p) => p.archivedAt)
    } else {
      result = result.filter((p) => !p.archivedAt)
      // Filter by status
      if (filters.status !== 'ALL') {
        result = result.filter((p) => p.status === filters.status)
      }
    }

    // Filter by baseline
    if (filters.baseline !== 'ALL') {
      result = result.filter((p) => p.baseline === filters.baseline)
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      )
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'createdAt':
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'updatedAt':
          comparison =
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          break
      }
      return sortDirection === 'desc' ? -comparison : comparison
    })

    return result
  }, [projects, filters, searchQuery, sortBy, sortDirection])

  const handleConnectDirectory = async () => {
    try {
      await requestDirectoryAccess()
      setAlert({
        message: 'Projects folder connected successfully',
        severity: 'success',
      })
    } catch (error) {
      if (error instanceof Error && error.message.includes('cancelled')) {
        return
      }
      setAlert({
        message: 'Failed to connect projects folder',
        severity: 'error',
      })
    }
  }

  const handleCreateProject = async (input: CreateSspInput) => {
    setIsSubmitting(true)
    try {
      const project = await createProject(input)
      setCreateDialogOpen(false)
      setAlert({
        message: 'SSP created successfully',
        severity: 'success',
      })
      navigate(`/app/projects/${project.id}`)
    } catch {
      setAlert({
        message: 'Failed to create SSP',
        severity: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenProject = (project: SspProject) => {
    navigate(`/app/projects/${project.id}`)
  }

  const handleDuplicateClick = (project: SspProject) => {
    setSelectedProject(project)
    setDuplicateName(`${project.name} (Copy)`)
    setDuplicateDialogOpen(true)
  }

  const handleDuplicateProject = async () => {
    if (!selectedProject || !duplicateName.trim()) return

    setIsSubmitting(true)
    try {
      const newProject = await duplicateProject(
        selectedProject.id,
        duplicateName.trim()
      )
      setDuplicateDialogOpen(false)
      setSelectedProject(null)
      setDuplicateName('')
      setAlert({
        message: `"${newProject.name}" created from template`,
        severity: 'success',
      })
      navigate(`/app/projects/${newProject.id}`)
    } catch {
      setAlert({
        message: 'Failed to duplicate project',
        severity: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleArchiveProject = async (project: SspProject) => {
    try {
      if (project.archivedAt) {
        await restoreProject(project.id)
        setAlert({
          message: `"${project.name}" has been restored`,
          severity: 'success',
        })
      } else {
        await archiveProject(project.id)
        setAlert({
          message: `"${project.name}" has been archived`,
          severity: 'success',
        })
      }
    } catch {
      setAlert({
        message: project.archivedAt
          ? 'Failed to restore project'
          : 'Failed to archive project',
        severity: 'error',
      })
    }
  }

  const handleDeleteClick = (project: SspProject) => {
    setSelectedProject(project)
    setDeleteDialogOpen(true)
  }

  const handleDeleteProject = async () => {
    if (!selectedProject) return

    setIsSubmitting(true)
    try {
      await deleteProject(selectedProject.id)
      setDeleteDialogOpen(false)
      setAlert({
        message: `"${selectedProject.name}" has been deleted`,
        severity: 'success',
      })
      setSelectedProject(null)
    } catch {
      setAlert({
        message: 'Failed to delete project',
        severity: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setFilters((prev) => ({
      ...prev,
      status: event.target.value as SspStatus | 'ALL' | 'ARCHIVED',
    }))
  }

  const handleBaselineFilterChange = (event: SelectChangeEvent) => {
    setFilters((prev) => ({
      ...prev,
      baseline: event.target.value as Baseline | 'ALL',
    }))
  }

  const handleSortChange = (event: SelectChangeEvent) => {
    setSortBy(event.target.value as SortOption)
  }

  const handleSortDirectionToggle = () => {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
  }

  const clearFilters = () => {
    setSearchQuery('')
    setFilters({ status: 'ALL', baseline: 'ALL' })
  }

  const hasActiveFilters =
    filters.status !== 'ALL' ||
    filters.baseline !== 'ALL' ||
    searchQuery.trim() !== ''

  // Loading state
  if (isLoading && hasDirectoryAccess) {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Skeleton variant="text" width={150} height={40} />
          <Skeleton variant="rectangular" width={140} height={36} />
        </Box>
        <Skeleton variant="rectangular" height={56} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={220} />
            </Grid>
          ))}
        </Grid>
      </Box>
    )
  }

  // Empty state
  if (!hasDirectoryAccess || projects.length === 0) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Projects
        </Typography>
        <SspEmptyState
          hasDirectoryAccess={hasDirectoryAccess}
          onCreateClick={() => setCreateDialogOpen(true)}
          onConnectDirectory={handleConnectDirectory}
        />
        <CreateSspDialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          onSubmit={handleCreateProject}
          isSubmitting={isSubmitting}
        />
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          Projects
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create New SSP
        </Button>
      </Box>

      {/* Search and Filters */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="status-filter-label">
                <FilterListIcon
                  sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }}
                />
                Status
              </InputLabel>
              <Select
                labelId="status-filter-label"
                value={filters.status}
                label="Status"
                onChange={handleStatusFilterChange}
              >
                <MenuItem value="ALL">All Active</MenuItem>
                <MenuItem value="DRAFT">Draft</MenuItem>
                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                <MenuItem value="REVIEW">Review</MenuItem>
                <MenuItem value="COMPLETE">Complete</MenuItem>
                <MenuItem value="ARCHIVED">Archived</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="baseline-filter-label">Baseline</InputLabel>
              <Select
                labelId="baseline-filter-label"
                value={filters.baseline}
                label="Baseline"
                onChange={handleBaselineFilterChange}
              >
                <MenuItem value="ALL">All Baselines</MenuItem>
                <MenuItem value="LOW">NIST Low</MenuItem>
                <MenuItem value="MODERATE">NIST Moderate</MenuItem>
                <MenuItem value="HIGH">NIST High</MenuItem>
                <MenuItem value="FEDRAMP_LOW">FedRAMP Low</MenuItem>
                <MenuItem value="FEDRAMP_MODERATE">FedRAMP Moderate</MenuItem>
                <MenuItem value="FEDRAMP_HIGH">FedRAMP High</MenuItem>
                <MenuItem value="FEDRAMP_LI_SAAS">FedRAMP LI-SaaS</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="sort-label">
                <SortIcon
                  sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }}
                />
                Sort By
              </InputLabel>
              <Select
                labelId="sort-label"
                value={sortBy}
                label="Sort By"
                onChange={handleSortChange}
              >
                <MenuItem value="updatedAt">Last Updated</MenuItem>
                <MenuItem value="createdAt">Date Created</MenuItem>
                <MenuItem value="name">Name</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              size="medium"
              onClick={handleSortDirectionToggle}
              sx={{ height: 40 }}
            >
              {sortDirection === 'desc' ? 'Newest First' : 'Oldest First'}
            </Button>
          </Grid>
        </Grid>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap">
            {searchQuery && (
              <Chip
                label={`Search: "${searchQuery}"`}
                onDelete={() => setSearchQuery('')}
                size="small"
              />
            )}
            {filters.status !== 'ALL' && (
              <Chip
                label={`Status: ${filters.status.replace('_', ' ')}`}
                onDelete={() =>
                  setFilters((prev) => ({ ...prev, status: 'ALL' }))
                }
                size="small"
              />
            )}
            {filters.baseline !== 'ALL' && (
              <Chip
                label={`Baseline: ${filters.baseline.replace('_', ' ')}`}
                onDelete={() =>
                  setFilters((prev) => ({ ...prev, baseline: 'ALL' }))
                }
                size="small"
              />
            )}
            <Chip
              label="Clear All"
              onClick={clearFilters}
              size="small"
              variant="outlined"
            />
          </Stack>
        )}
      </Box>

      {/* Results count */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {filteredProjects.length} project
        {filteredProjects.length !== 1 ? 's' : ''} found
      </Typography>

      {/* Project Grid */}
      {filteredProjects.length > 0 ? (
        <Grid container spacing={3}>
          {filteredProjects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <SspCard
                project={project}
                onOpen={handleOpenProject}
                onDuplicate={handleDuplicateClick}
                onArchive={handleArchiveProject}
                onRestore={handleArchiveProject}
                onDelete={handleDeleteClick}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box
          sx={{
            textAlign: 'center',
            py: 6,
            bgcolor: 'background.paper',
            borderRadius: 1,
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No projects match your filters
          </Typography>
          <Button onClick={clearFilters}>Clear Filters</Button>
        </Box>
      )}

      {/* Create Dialog */}
      <CreateSspDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateProject}
        isSubmitting={isSubmitting}
      />

      {/* Duplicate Dialog */}
      <Dialog
        open={duplicateDialogOpen}
        onClose={() => {
          if (!isSubmitting) {
            setDuplicateDialogOpen(false)
            setSelectedProject(null)
            setDuplicateName('')
          }
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Duplicate SSP as Template</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Create a new SSP based on "{selectedProject?.name}". All system
            information and control implementations will be copied.
          </DialogContentText>
          <TextField
            autoFocus
            label="New System Name"
            value={duplicateName}
            onChange={(e) => setDuplicateName(e.target.value)}
            fullWidth
            disabled={isSubmitting}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDuplicateDialogOpen(false)
              setSelectedProject(null)
              setDuplicateName('')
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDuplicateProject}
            variant="contained"
            disabled={isSubmitting || !duplicateName.trim()}
          >
            {isSubmitting ? 'Duplicating...' : 'Duplicate'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          if (!isSubmitting) {
            setDeleteDialogOpen(false)
            setSelectedProject(null)
          }
        }}
      >
        <DialogTitle>Delete SSP?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete "{selectedProject?.name}
            "? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false)
              setSelectedProject(null)
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteProject}
            color="error"
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ProjectList
