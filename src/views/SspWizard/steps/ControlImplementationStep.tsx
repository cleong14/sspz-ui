/**
 * Control Implementation Step (Step 4)
 * @module views/SspWizard/steps/ControlImplementationStep
 *
 * Interface for documenting control implementations.
 *
 * Story 5.6: Build Control Implementation Interface
 * Story 5.7: Build Implementation Statement Editor
 *
 * FR20: System automatically loads applicable controls for selected baseline
 * FR21: Users can set implementation status per control
 * FR22: Users can write control implementation statements
 * FR23: Users can customize control parameters where applicable
 * FR24: Users can mark controls as inherited from other systems
 * FR25: Users can attach evidence or references to controls
 * FR26: Users can track implementation progress by control family
 */
import { useCallback, useMemo, useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction'
import Drawer from '@mui/material/Drawer'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Chip from '@mui/material/Chip'
import LinearProgress from '@mui/material/LinearProgress'
import Divider from '@mui/material/Divider'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Tooltip from '@mui/material/Tooltip'
import Alert from '@mui/material/Alert'
import InputAdornment from '@mui/material/InputAdornment'
import CircularProgress from '@mui/material/CircularProgress'
import CloseIcon from '@mui/icons-material/Close'
import SearchIcon from '@mui/icons-material/Search'
import FilterListIcon from '@mui/icons-material/FilterList'
import InfoIcon from '@mui/icons-material/Info'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ScheduleIcon from '@mui/icons-material/Schedule'
import ErrorIcon from '@mui/icons-material/Error'
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle'
import HelpIcon from '@mui/icons-material/Help'

import { v4 as uuidv4 } from 'uuid'

import type { WizardStepProps } from '../SspWizard'
import type {
  Control,
  ControlImplementation,
  ImplementationStatus,
  Evidence,
  InheritedControl,
} from '@/types/control'
import { useControlCatalog } from '@/hooks/useControlCatalog'

// ============================================================================
// Constants
// ============================================================================

const STATUS_OPTIONS: {
  value: ImplementationStatus
  label: string
  color: 'default' | 'success' | 'warning' | 'error' | 'info'
  icon: React.ReactElement
}[] = [
  {
    value: 'NOT_STARTED',
    label: 'Not Started',
    color: 'default',
    icon: <HelpIcon fontSize="small" />,
  },
  {
    value: 'IMPLEMENTED',
    label: 'Implemented',
    color: 'success',
    icon: <CheckCircleIcon fontSize="small" />,
  },
  {
    value: 'PARTIALLY_IMPLEMENTED',
    label: 'Partially Implemented',
    color: 'warning',
    icon: <ScheduleIcon fontSize="small" />,
  },
  {
    value: 'PLANNED',
    label: 'Planned',
    color: 'info',
    icon: <ScheduleIcon fontSize="small" />,
  },
  {
    value: 'NOT_APPLICABLE',
    label: 'Not Applicable',
    color: 'default',
    icon: <RemoveCircleIcon fontSize="small" />,
  },
]

const EVIDENCE_TYPES = [
  { value: 'document', label: 'Document' },
  { value: 'screenshot', label: 'Screenshot' },
  { value: 'log', label: 'Log File' },
  { value: 'report', label: 'Report' },
  { value: 'link', label: 'External Link' },
  { value: 'other', label: 'Other' },
] as const

// ============================================================================
// Helper Functions
// ============================================================================

function getStatusInfo(status: ImplementationStatus) {
  return STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0]
}

// ============================================================================
// Component
// ============================================================================

/**
 * Control Implementation Step component.
 */
const ControlImplementationStep: React.FC<WizardStepProps> = ({
  project,
  onUpdate,
}) => {
  // Load real control catalog data
  const {
    families,
    loading: catalogLoading,
    error: catalogError,
    getControlsForFamily,
    getFamilyControlCount,
    getBaselineControlCount,
  } = useControlCatalog(project.baseline)

  // State
  const [selectedFamily, setSelectedFamily] = useState<string>('')
  const [selectedControl, setSelectedControl] = useState<Control | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<
    ImplementationStatus | 'ALL'
  >('ALL')
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Set initial selected family when catalog loads
  useEffect(() => {
    if (families.length > 0 && !selectedFamily) {
      setSelectedFamily(families[0].id)
    }
  }, [families, selectedFamily])

  // Get controls for selected family, filtered by baseline
  const familyControls = useMemo(() => {
    if (!selectedFamily) return []
    return getControlsForFamily(selectedFamily, project.baseline)
  }, [selectedFamily, project.baseline, getControlsForFamily])

  // Get implementation for a control
  const getImplementation = useCallback(
    (controlId: string): ControlImplementation | undefined => {
      return project.implementations.find(
        (impl) => impl.controlId === controlId
      )
    },
    [project.implementations]
  )

  // Filter controls
  const filteredControls = useMemo(() => {
    let controls = familyControls

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      controls = controls.filter(
        (c) =>
          c.id.toLowerCase().includes(query) ||
          c.title.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      controls = controls.filter((c) => {
        const impl = getImplementation(c.id)
        const status = impl?.status || 'NOT_STARTED'
        return status === statusFilter
      })
    }

    return controls
  }, [familyControls, searchQuery, statusFilter, getImplementation])

  // Calculate family progress
  const calculateFamilyProgress = useCallback(
    (familyId: string) => {
      const familyControlCount = getFamilyControlCount(
        familyId,
        project.baseline
      )
      const familyImplementations = project.implementations.filter((impl) =>
        impl.controlId.toUpperCase().startsWith(familyId.toUpperCase())
      )
      const completed = familyImplementations.filter(
        (impl) =>
          impl.status === 'IMPLEMENTED' ||
          impl.status === 'NOT_APPLICABLE' ||
          impl.status === 'PARTIALLY_IMPLEMENTED'
      ).length

      return {
        total: familyControlCount,
        completed,
        percentage:
          familyControlCount > 0
            ? Math.round((completed / familyControlCount) * 100)
            : 0,
      }
    },
    [getFamilyControlCount, project.baseline, project.implementations]
  )

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    const totalControls = getBaselineControlCount(project.baseline)
    const completedControls = project.implementations.filter(
      (impl) =>
        impl.status === 'IMPLEMENTED' ||
        impl.status === 'NOT_APPLICABLE' ||
        impl.status === 'PARTIALLY_IMPLEMENTED'
    ).length

    return {
      total: totalControls,
      completed: completedControls,
      percentage:
        totalControls > 0
          ? Math.round((completedControls / totalControls) * 100)
          : 0,
    }
  }, [project.implementations, project.baseline, getBaselineControlCount])

  // Handlers
  const handleFamilyChange = useCallback(
    (_event: React.SyntheticEvent, newValue: string) => {
      setSelectedFamily(newValue)
    },
    []
  )

  const handleControlClick = useCallback((control: Control) => {
    setSelectedControl(control)
    setDrawerOpen(true)
  }, [])

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false)
    setSelectedControl(null)
  }, [])

  const handleUpdateImplementation = useCallback(
    (controlId: string, updates: Partial<ControlImplementation>) => {
      const existingIndex = project.implementations.findIndex(
        (impl) => impl.controlId === controlId
      )

      const now = new Date().toISOString()
      let newImplementations: ControlImplementation[]

      if (existingIndex >= 0) {
        // Update existing
        newImplementations = [...project.implementations]
        newImplementations[existingIndex] = {
          ...newImplementations[existingIndex],
          ...updates,
          updatedAt: now,
        }
      } else {
        // Create new
        const newImpl: ControlImplementation = {
          controlId,
          status: 'NOT_STARTED',
          aiGenerated: false,
          createdAt: now,
          updatedAt: now,
          ...updates,
        }
        newImplementations = [...project.implementations, newImpl]
      }

      onUpdate({ implementations: newImplementations })
    },
    [project.implementations, onUpdate]
  )

  const handleStatusChange = useCallback(
    (controlId: string, status: ImplementationStatus) => {
      handleUpdateImplementation(controlId, { status })
    },
    [handleUpdateImplementation]
  )

  const handleStatementChange = useCallback(
    (controlId: string, statement: string) => {
      handleUpdateImplementation(controlId, { statement })
    },
    [handleUpdateImplementation]
  )

  const handleInheritedChange = useCallback(
    (controlId: string, inherited: InheritedControl | undefined) => {
      handleUpdateImplementation(controlId, { inherited })
    },
    [handleUpdateImplementation]
  )

  const handleAddEvidence = useCallback(
    (controlId: string, evidence: Evidence) => {
      const impl = getImplementation(controlId)
      const existingEvidence = impl?.evidence || []
      handleUpdateImplementation(controlId, {
        evidence: [...existingEvidence, evidence],
      })
    },
    [getImplementation, handleUpdateImplementation]
  )

  const handleRemoveEvidence = useCallback(
    (controlId: string, evidenceId: string) => {
      const impl = getImplementation(controlId)
      const existingEvidence = impl?.evidence || []
      handleUpdateImplementation(controlId, {
        evidence: existingEvidence.filter((e) => e.id !== evidenceId),
      })
    },
    [getImplementation, handleUpdateImplementation]
  )

  // Current control implementation
  const currentImplementation = selectedControl
    ? getImplementation(selectedControl.id)
    : undefined

  // Loading state
  if (catalogLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 4,
        }}
      >
        <CircularProgress sx={{ mb: 2 }} />
        <Typography color="text.secondary">
          Loading control catalog...
        </Typography>
      </Box>
    )
  }

  // Error state
  if (catalogError) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load control catalog: {catalogError}
        </Alert>
        <Typography variant="body2" color="text.secondary">
          Please try refreshing the page. If the problem persists, check that
          the control catalog files are accessible.
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      {/* Header with progress */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Control Implementations
          <Tooltip title="Document how your system implements each security control">
            <IconButton size="small" sx={{ ml: 1 }}>
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Baseline: <strong>{project.baseline.replace('_', ' ')}</strong> •
          Select controls from each family to document their implementation.
        </Typography>

        {/* Overall Progress */}
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Overall Progress</Typography>
            <Typography variant="body2" fontWeight={600}>
              {overallProgress.completed} / {overallProgress.total} controls (
              {overallProgress.percentage}%)
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={overallProgress.percentage}
            sx={{ height: 8, borderRadius: 1 }}
          />
        </Paper>
      </Box>

      <Grid container spacing={3}>
        {/* Left Panel: Family Tabs and Control List */}
        <Grid item xs={12} md={4}>
          {/* Family Tabs */}
          <Paper sx={{ mb: 2 }}>
            <Tabs
              value={selectedFamily}
              onChange={handleFamilyChange}
              variant="scrollable"
              scrollButtons="auto"
              orientation="vertical"
              sx={{ maxHeight: 300 }}
            >
              {families.map((family) => {
                const progress = calculateFamilyProgress(family.id)
                return (
                  <Tab
                    key={family.id}
                    value={family.id}
                    label={
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          width: '100%',
                          alignItems: 'center',
                        }}
                      >
                        <Typography variant="body2" sx={{ textAlign: 'left' }}>
                          {family.id} - {family.name}
                        </Typography>
                        <Chip
                          label={`${progress.completed}/${progress.total}`}
                          size="small"
                          color={
                            progress.percentage === 100
                              ? 'success'
                              : progress.percentage > 0
                                ? 'warning'
                                : 'default'
                          }
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    }
                    sx={{ alignItems: 'flex-start', textTransform: 'none' }}
                  />
                )
              })}
            </Tabs>
          </Paper>
        </Grid>

        {/* Right Panel: Controls List */}
        <Grid item xs={12} md={8}>
          {/* Search and Filter */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              size="small"
              placeholder="Search controls..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 1 }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>
                <FilterListIcon sx={{ fontSize: 16, mr: 0.5 }} />
                Status
              </InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value as ImplementationStatus | 'ALL'
                  )
                }
              >
                <MenuItem value="ALL">All Status</MenuItem>
                {STATUS_OPTIONS.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Controls List */}
          <Paper variant="outlined" sx={{ maxHeight: 500, overflow: 'auto' }}>
            {filteredControls.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  No controls match your filters
                </Typography>
              </Box>
            ) : (
              <List disablePadding>
                {filteredControls.map((control, index) => {
                  const impl = getImplementation(control.id)
                  const statusInfo = getStatusInfo(
                    impl?.status || 'NOT_STARTED'
                  )

                  return (
                    <ListItem
                      key={control.id}
                      disablePadding
                      divider={index < filteredControls.length - 1}
                    >
                      <ListItemButton
                        onClick={() => handleControlClick(control)}
                      >
                        <ListItemText
                          primary={
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                              }}
                            >
                              <Typography variant="subtitle2">
                                {control.id}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  flex: 1,
                                }}
                              >
                                {control.title}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                mt: 0.5,
                              }}
                            >
                              <Chip
                                icon={statusInfo.icon}
                                label={statusInfo.label}
                                size="small"
                                color={statusInfo.color}
                                variant="outlined"
                              />
                              {impl?.inherited && (
                                <Chip
                                  label="Inherited"
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                              {impl?.aiGenerated && (
                                <Chip
                                  label="AI"
                                  size="small"
                                  color="secondary"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  )
                })}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Implementation Editor Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleCloseDrawer}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 500 } },
        }}
      >
        {selectedControl && (
          <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                mb: 3,
              }}
            >
              <Box>
                <Typography variant="h6">{selectedControl.id}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedControl.title}
                </Typography>
              </Box>
              <IconButton onClick={handleCloseDrawer}>
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Control Description */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
              <Typography variant="body2">
                {selectedControl.description}
              </Typography>
              {selectedControl.guidance && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="caption" color="text.secondary">
                    <strong>Guidance:</strong> {selectedControl.guidance}
                  </Typography>
                </>
              )}
            </Paper>

            {/* Implementation Status */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Implementation Status</InputLabel>
              <Select
                value={currentImplementation?.status || 'NOT_STARTED'}
                label="Implementation Status"
                onChange={(e) =>
                  handleStatusChange(
                    selectedControl.id,
                    e.target.value as ImplementationStatus
                  )
                }
              >
                {STATUS_OPTIONS.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {status.icon}
                      {status.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Implementation Statement */}
            <TextField
              fullWidth
              multiline
              rows={6}
              label="Implementation Statement"
              value={currentImplementation?.statement || ''}
              onChange={(e) =>
                handleStatementChange(selectedControl.id, e.target.value)
              }
              helperText={`${(currentImplementation?.statement || '').length}/5000 characters`}
              inputProps={{ maxLength: 5000 }}
              sx={{ mb: 3 }}
            />

            {/* Inherited Control */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={!!currentImplementation?.inherited}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleInheritedChange(selectedControl.id, {
                          systemId: '',
                          systemName: '',
                          description: '',
                        })
                      } else {
                        handleInheritedChange(selectedControl.id, undefined)
                      }
                    }}
                  />
                }
                label="Mark as Inherited"
              />
              {currentImplementation?.inherited && (
                <Box sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Source System Name"
                    value={currentImplementation.inherited.systemName || ''}
                    onChange={(e) =>
                      handleInheritedChange(selectedControl.id, {
                        ...currentImplementation.inherited!,
                        systemName: e.target.value,
                      })
                    }
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    rows={2}
                    label="Inheritance Description"
                    value={currentImplementation.inherited.description || ''}
                    onChange={(e) =>
                      handleInheritedChange(selectedControl.id, {
                        ...currentImplementation.inherited!,
                        description: e.target.value,
                      })
                    }
                  />
                </Box>
              )}
            </Paper>

            {/* Evidence/References */}
            <Box sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <Typography variant="subtitle2">
                  Evidence & References
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    const newEvidence: Evidence = {
                      id: uuidv4(),
                      title: 'New Evidence',
                      reference: '',
                      type: 'document',
                      uploadedAt: new Date().toISOString(),
                    }
                    handleAddEvidence(selectedControl.id, newEvidence)
                  }}
                >
                  Add
                </Button>
              </Box>
              {currentImplementation?.evidence &&
              currentImplementation.evidence.length > 0 ? (
                <List dense>
                  {currentImplementation.evidence.map((evidence) => (
                    <ListItem key={evidence.id} disablePadding>
                      <ListItemText
                        primary={evidence.title}
                        secondary={
                          <>
                            {evidence.type} •{' '}
                            {evidence.reference || 'No reference'}
                          </>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          size="small"
                          onClick={() =>
                            handleRemoveEvidence(
                              selectedControl.id,
                              evidence.id
                            )
                          }
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No evidence attached
                </Typography>
              )}
            </Box>

            {/* Responsible Role */}
            <TextField
              fullWidth
              size="small"
              label="Responsible Role/Team"
              value={currentImplementation?.responsibleRole || ''}
              onChange={(e) =>
                handleUpdateImplementation(selectedControl.id, {
                  responsibleRole: e.target.value,
                })
              }
              sx={{ mb: 2 }}
            />

            {/* Notes */}
            <TextField
              fullWidth
              size="small"
              multiline
              rows={2}
              label="Internal Notes"
              value={currentImplementation?.notes || ''}
              onChange={(e) =>
                handleUpdateImplementation(selectedControl.id, {
                  notes: e.target.value,
                })
              }
              helperText="Internal notes (not included in export)"
            />
          </Box>
        )}
      </Drawer>
    </Box>
  )
}

export default ControlImplementationStep
