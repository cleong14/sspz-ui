/**
 * SSP Wizard View
 * @module views/SspWizard/SspWizard
 *
 * Multi-step wizard for creating and editing SSP projects.
 * Guides users through: System Info, Baseline, System Details, Controls, Review
 *
 * Story 5.1: Build SSP Wizard Framework
 */
import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import StepButton from '@mui/material/StepButton'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import CircularProgress from '@mui/material/CircularProgress'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import SaveIcon from '@mui/icons-material/Save'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

import { useSsp } from '@/contexts/SspContext'
import type { SspProject, SystemInfo } from '@/types/ssp'
import type { ControlImplementation } from '@/types/control'

// Import step components
import SystemIdentificationStep from './steps/SystemIdentificationStep'
import SecurityCategorizationStep from './steps/SecurityCategorizationStep'
import SystemEnvironmentStep from './steps/SystemEnvironmentStep'
import ControlImplementationStep from './steps/ControlImplementationStep'
import ReviewStep from './steps/ReviewStep'

// ============================================================================
// Types
// ============================================================================

export interface WizardStepConfig {
  label: string
  description: string
  component: React.ComponentType<WizardStepProps>
}

export interface WizardStepProps {
  project: SspProject
  onUpdate: (updates: Partial<SspProject>) => void
  onNext: () => void
  onBack: () => void
  isFirstStep: boolean
  isLastStep: boolean
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

// ============================================================================
// Constants
// ============================================================================

const WIZARD_STEPS: WizardStepConfig[] = [
  {
    label: 'System Info',
    description: 'System identification and boundary',
    component: SystemIdentificationStep,
  },
  {
    label: 'Categorization',
    description: 'Security categorization and baseline',
    component: SecurityCategorizationStep,
  },
  {
    label: 'Environment',
    description: 'System environment and contacts',
    component: SystemEnvironmentStep,
  },
  {
    label: 'Controls',
    description: 'Control implementations',
    component: ControlImplementationStep,
  },
  {
    label: 'Review',
    description: 'Review and export',
    component: ReviewStep,
  },
]

const AUTO_SAVE_DELAY = 2000 // 2 seconds debounce

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate step completion status based on project data.
 */
function getStepCompletion(project: SspProject, stepIndex: number): boolean {
  switch (stepIndex) {
    case 0: // System Info
      return !!(
        project.systemInfo?.systemName &&
        project.systemInfo?.description &&
        project.systemInfo?.systemType
      )
    case 1: // Categorization
      return !!(
        project.systemInfo?.categorization?.confidentiality &&
        project.systemInfo?.categorization?.integrity &&
        project.systemInfo?.categorization?.availability &&
        project.baseline
      )
    case 2: // Environment
      return !!(
        project.systemInfo?.environment?.deploymentModel &&
        project.systemInfo?.contacts?.systemOwner?.name &&
        project.systemInfo?.contacts?.systemOwner?.email
      )
    case 3: // Controls
      // At least one control should be addressed (not NOT_STARTED)
      return (
        project.implementations?.some(
          (impl) => impl.status !== 'NOT_STARTED'
        ) || false
      )
    case 4: // Review
      // All previous steps should be complete
      return [0, 1, 2, 3].every((i) => getStepCompletion(project, i))
    default:
      return false
  }
}

// ============================================================================
// Component
// ============================================================================

/**
 * SSP Wizard component for step-by-step SSP creation.
 */
const SspWizard: React.FC = (): JSX.Element => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const {
    currentProject,
    setCurrentProject,
    getProjectById,
    updateProject,
    hasDirectoryAccess,
    loadProjects,
  } = useSsp()

  // Local state
  const [activeStep, setActiveStep] = useState(0)
  const [localProject, setLocalProject] = useState<SspProject | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [saveTimer, setSaveTimer] = useState<NodeJS.Timeout | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')

  // Load project on mount
  useEffect(() => {
    const loadProject = async () => {
      if (!id) {
        setError('No project ID provided')
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      // If we don't have directory access, try to get it
      if (!hasDirectoryAccess) {
        setError('Please connect your projects folder to continue')
        setIsLoading(false)
        return
      }

      // Try to find project in context first
      let project = getProjectById(id)

      // If not found, reload projects
      if (!project) {
        await loadProjects()
        project = getProjectById(id)
      }

      if (project) {
        setLocalProject(project)
        setCurrentProject(project)
        setError(null)
      } else {
        setError('Project not found')
      }

      setIsLoading(false)
    }

    loadProject()

    // Cleanup on unmount
    return () => {
      if (saveTimer) {
        clearTimeout(saveTimer)
      }
    }
  }, [id, hasDirectoryAccess, getProjectById, loadProjects, setCurrentProject])

  /**
   * Save project to storage.
   */
  const saveProject = useCallback(
    async (project: SspProject) => {
      setSaveStatus('saving')
      try {
        await updateProject(project)
        setSaveStatus('saved')
        setSnackbarMessage('Changes saved')
        setSnackbarOpen(true)

        // Reset to idle after 2 seconds
        setTimeout(() => {
          setSaveStatus('idle')
        }, 2000)
      } catch (err) {
        setSaveStatus('error')
        setSnackbarMessage('Failed to save changes')
        setSnackbarOpen(true)
        console.error('Failed to save project:', err)
      }
    },
    [updateProject]
  )

  /**
   * Handle project updates with auto-save.
   */
  const handleUpdate = useCallback(
    (updates: Partial<SspProject>) => {
      if (!localProject) return

      // Merge updates
      const updatedProject: SspProject = {
        ...localProject,
        ...updates,
        systemInfo: {
          ...localProject.systemInfo,
          ...(updates.systemInfo || {}),
          boundary: {
            ...localProject.systemInfo.boundary,
            ...(updates.systemInfo?.boundary || {}),
          },
          categorization: {
            ...localProject.systemInfo.categorization,
            ...(updates.systemInfo?.categorization || {}),
          },
          environment: {
            ...localProject.systemInfo.environment,
            ...(updates.systemInfo?.environment || {}),
          },
          contacts: {
            ...localProject.systemInfo.contacts,
            ...(updates.systemInfo?.contacts || {}),
          },
        },
      }

      // Update local state immediately
      setLocalProject(updatedProject)
      setCurrentProject(updatedProject)

      // Clear existing timer
      if (saveTimer) {
        clearTimeout(saveTimer)
      }

      // Set new debounced save
      const timer = setTimeout(() => {
        saveProject(updatedProject)
      }, AUTO_SAVE_DELAY)

      setSaveTimer(timer)
      setSaveStatus('idle')
    },
    [localProject, setCurrentProject, saveProject, saveTimer]
  )

  /**
   * Handle immediate save (manual save button).
   */
  const handleManualSave = useCallback(() => {
    if (!localProject) return

    // Clear any pending auto-save
    if (saveTimer) {
      clearTimeout(saveTimer)
      setSaveTimer(null)
    }

    saveProject(localProject)
  }, [localProject, saveTimer, saveProject])

  /**
   * Navigate to next step.
   */
  const handleNext = useCallback(() => {
    if (activeStep < WIZARD_STEPS.length - 1) {
      setActiveStep((prev) => prev + 1)
    }
  }, [activeStep])

  /**
   * Navigate to previous step.
   */
  const handleBack = useCallback(() => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1)
    }
  }, [activeStep])

  /**
   * Navigate to specific step.
   */
  const handleStepClick = useCallback((stepIndex: number) => {
    setActiveStep(stepIndex)
  }, [])

  /**
   * Close snackbar.
   */
  const handleSnackbarClose = useCallback(() => {
    setSnackbarOpen(false)
  }, [])

  // Step completion status
  const stepCompletions = useMemo(() => {
    if (!localProject) return WIZARD_STEPS.map(() => false)
    return WIZARD_STEPS.map((_, index) =>
      getStepCompletion(localProject, index)
    )
  }, [localProject])

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={80} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={400} />
      </Box>
    )
  }

  // Error state
  if (error || !localProject) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Failed to load project'}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/app/projects')}>
          Back to Projects
        </Button>
      </Box>
    )
  }

  // Get current step component
  const CurrentStepComponent = WIZARD_STEPS[activeStep].component

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {localProject.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {localProject.baseline.replace('_', ' ')} Baseline • Status:{' '}
            {localProject.status.replace('_', ' ')}
          </Typography>
        </Box>

        {/* Save indicator */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {saveStatus === 'saving' && (
            <>
              <CircularProgress size={16} />
              <Typography variant="body2" color="text.secondary">
                Saving...
              </Typography>
            </>
          )}
          {saveStatus === 'saved' && (
            <>
              <CheckCircleIcon color="success" fontSize="small" />
              <Typography variant="body2" color="success.main">
                Saved
              </Typography>
            </>
          )}
          {saveStatus === 'error' && (
            <Typography variant="body2" color="error">
              Save failed
            </Typography>
          )}
          <Button
            variant="outlined"
            size="small"
            startIcon={<SaveIcon />}
            onClick={handleManualSave}
            disabled={saveStatus === 'saving'}
          >
            Save
          </Button>
        </Box>
      </Box>

      {/* Stepper - Horizontal on desktop, Accordion on mobile */}
      {isMobile ? (
        // Mobile: Vertical accordion
        <Box sx={{ mb: 3 }}>
          {WIZARD_STEPS.map((step, index) => (
            <Accordion
              key={step.label}
              expanded={activeStep === index}
              onChange={() => handleStepClick(index)}
              sx={{
                '&:before': { display: 'none' },
                border: 1,
                borderColor: 'divider',
                '&:not(:last-child)': { mb: 1 },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  bgcolor:
                    activeStep === index ? 'action.selected' : 'transparent',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {stepCompletions[index] && (
                    <CheckCircleIcon color="success" fontSize="small" />
                  )}
                  <Typography fontWeight={activeStep === index ? 600 : 400}>
                    Step {index + 1}: {step.label}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  {step.description}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      ) : (
        // Desktop: Horizontal stepper
        <Paper sx={{ p: 2, mb: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {WIZARD_STEPS.map((step, index) => (
              <Step key={step.label} completed={stepCompletions[index]}>
                <StepButton onClick={() => handleStepClick(index)}>
                  <StepLabel
                    optional={
                      <Typography variant="caption">
                        {step.description}
                      </Typography>
                    }
                  >
                    {step.label}
                  </StepLabel>
                </StepButton>
              </Step>
            ))}
          </Stepper>
        </Paper>
      )}

      {/* Step Content */}
      <Paper sx={{ p: { xs: 2, md: 3 }, minHeight: 400 }}>
        <CurrentStepComponent
          project={localProject}
          onUpdate={handleUpdate}
          onNext={handleNext}
          onBack={handleBack}
          isFirstStep={activeStep === 0}
          isLastStep={activeStep === WIZARD_STEPS.length - 1}
        />
      </Paper>

      {/* Navigation Buttons */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mt: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Button variant="outlined" onClick={() => navigate('/app/projects')}>
          Exit Wizard
        </Button>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            disabled={activeStep === 0}
          >
            Back
          </Button>
          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            onClick={handleNext}
            disabled={activeStep === WIZARD_STEPS.length - 1}
          >
            Next
          </Button>
        </Box>
      </Box>

      {/* Snackbar for save notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  )
}

export default SspWizard
