/**
 * Review Step (Step 5)
 * @module views/SspWizard/steps/ReviewStep
 *
 * Final review and summary of the complete SSP.
 *
 * Story 5.8: Implement SSP Review Summary
 *
 * FR8: Users can save work-in-progress and resume later
 * FR26: Users can track implementation progress by control family
 */
import { useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Chip from '@mui/material/Chip'
import LinearProgress from '@mui/material/LinearProgress'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import WarningIcon from '@mui/icons-material/Warning'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import EditIcon from '@mui/icons-material/Edit'
import InfoIcon from '@mui/icons-material/Info'
import BusinessIcon from '@mui/icons-material/Business'
import SecurityIcon from '@mui/icons-material/Security'
import CloudIcon from '@mui/icons-material/Cloud'
import AssignmentIcon from '@mui/icons-material/Assignment'

import type { WizardStepProps } from '../SspWizard'
import type { ImplementationStatus } from '@/types/control'

// ============================================================================
// Types
// ============================================================================

interface ValidationIssue {
  section: string
  field: string
  message: string
  severity: 'error' | 'warning'
}

interface SectionSummary {
  title: string
  icon: React.ReactNode
  status: 'complete' | 'incomplete' | 'warning'
  items: { label: string; value: string }[]
  onEdit?: () => void
}

// ============================================================================
// Constants
// ============================================================================

const CONTROL_FAMILIES = [
  { id: 'AC', name: 'Access Control' },
  { id: 'AT', name: 'Awareness and Training' },
  { id: 'AU', name: 'Audit and Accountability' },
  { id: 'CA', name: 'Assessment, Authorization, and Monitoring' },
  { id: 'CM', name: 'Configuration Management' },
  { id: 'CP', name: 'Contingency Planning' },
  { id: 'IA', name: 'Identification and Authentication' },
  { id: 'IR', name: 'Incident Response' },
  { id: 'MA', name: 'Maintenance' },
  { id: 'MP', name: 'Media Protection' },
  { id: 'PE', name: 'Physical and Environmental Protection' },
  { id: 'PL', name: 'Planning' },
  { id: 'PM', name: 'Program Management' },
  { id: 'PS', name: 'Personnel Security' },
  { id: 'PT', name: 'PII Processing and Transparency' },
  { id: 'RA', name: 'Risk Assessment' },
  { id: 'SA', name: 'System and Services Acquisition' },
  { id: 'SC', name: 'System and Communications Protection' },
  { id: 'SI', name: 'System and Information Integrity' },
  { id: 'SR', name: 'Supply Chain Risk Management' },
]

// ============================================================================
// Component
// ============================================================================

/**
 * Review Step component.
 */
const ReviewStep: React.FC<WizardStepProps> = ({ project, onUpdate }) => {
  const navigate = useNavigate()

  // Validate SSP and collect issues
  const validationIssues = useMemo<ValidationIssue[]>(() => {
    const issues: ValidationIssue[] = []

    // System Info validation
    if (!project.systemInfo.systemName) {
      issues.push({
        section: 'System Information',
        field: 'systemName',
        message: 'System name is required',
        severity: 'error',
      })
    }
    if (!project.systemInfo.description) {
      issues.push({
        section: 'System Information',
        field: 'description',
        message: 'System description is required',
        severity: 'error',
      })
    }
    if (project.systemInfo.boundary.components.length === 0) {
      issues.push({
        section: 'System Boundary',
        field: 'components',
        message: 'At least one system component should be defined',
        severity: 'warning',
      })
    }

    // Contacts validation
    if (!project.systemInfo.contacts.systemOwner.name) {
      issues.push({
        section: 'Contacts',
        field: 'systemOwner',
        message: 'System owner name is required',
        severity: 'error',
      })
    }
    if (!project.systemInfo.contacts.systemOwner.email) {
      issues.push({
        section: 'Contacts',
        field: 'systemOwner',
        message: 'System owner email is required',
        severity: 'error',
      })
    }

    // Environment validation
    if (
      project.systemInfo.environment.deploymentModel !== 'on-premise' &&
      !project.systemInfo.environment.cloudProvider
    ) {
      issues.push({
        section: 'Environment',
        field: 'cloudProvider',
        message: 'Cloud provider should be specified for cloud deployments',
        severity: 'warning',
      })
    }

    // Control implementations validation
    const notStartedCount = project.implementations.filter(
      (impl) => impl.status === 'NOT_STARTED'
    ).length
    const totalImplementations = project.implementations.length

    if (totalImplementations === 0) {
      issues.push({
        section: 'Control Implementations',
        field: 'implementations',
        message: 'No control implementations have been documented',
        severity: 'warning',
      })
    } else if (notStartedCount > totalImplementations * 0.5) {
      issues.push({
        section: 'Control Implementations',
        field: 'implementations',
        message: `${notStartedCount} controls are still marked as "Not Started"`,
        severity: 'warning',
      })
    }

    return issues
  }, [project])

  // Calculate implementation statistics
  const implementationStats = useMemo(() => {
    const byStatus: Record<ImplementationStatus, number> = {
      NOT_STARTED: 0,
      IMPLEMENTED: 0,
      PARTIALLY_IMPLEMENTED: 0,
      PLANNED: 0,
      NOT_APPLICABLE: 0,
    }

    project.implementations.forEach((impl) => {
      byStatus[impl.status]++
    })

    const total = project.implementations.length
    const completed =
      byStatus.IMPLEMENTED +
      byStatus.NOT_APPLICABLE +
      byStatus.PARTIALLY_IMPLEMENTED
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

    return { byStatus, total, completed, percentage }
  }, [project.implementations])

  // Calculate per-family statistics
  const familyStats = useMemo(() => {
    return CONTROL_FAMILIES.map((family) => {
      const familyImplementations = project.implementations.filter((impl) =>
        impl.controlId.startsWith(family.id)
      )
      const completed = familyImplementations.filter(
        (impl) =>
          impl.status === 'IMPLEMENTED' ||
          impl.status === 'NOT_APPLICABLE' ||
          impl.status === 'PARTIALLY_IMPLEMENTED'
      ).length
      const total = familyImplementations.length

      return {
        ...family,
        total,
        completed,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      }
    }).filter((f) => f.total > 0)
  }, [project.implementations])

  // Determine overall readiness
  const isReadyForExport = useMemo(() => {
    const hasErrors = validationIssues.some(
      (issue) => issue.severity === 'error'
    )
    const hasMinimumProgress = implementationStats.percentage >= 10
    return !hasErrors && hasMinimumProgress
  }, [validationIssues, implementationStats.percentage])

  // Handle status update
  const handleMarkComplete = useCallback(() => {
    onUpdate({ status: 'COMPLETE' })
  }, [onUpdate])

  const handleMarkInReview = useCallback(() => {
    onUpdate({ status: 'REVIEW' })
  }, [onUpdate])

  // Section summaries
  const sections: SectionSummary[] = useMemo(
    () => [
      {
        title: 'System Identification',
        icon: <BusinessIcon color="primary" />,
        status:
          project.systemInfo.systemName && project.systemInfo.description
            ? 'complete'
            : 'incomplete',
        items: [
          { label: 'System Name', value: project.systemInfo.systemName || '-' },
          {
            label: 'System ID',
            value: project.systemInfo.systemId || 'Not specified',
          },
          {
            label: 'System Type',
            value: project.systemInfo.systemType?.replace('-', ' ') || '-',
          },
          {
            label: 'Components',
            value: `${project.systemInfo.boundary.components.length} defined`,
          },
          {
            label: 'External Connections',
            value: `${project.systemInfo.boundary.externalConnections.length} defined`,
          },
        ],
      },
      {
        title: 'Security Categorization',
        icon: <SecurityIcon color="primary" />,
        status: project.baseline ? 'complete' : 'incomplete',
        items: [
          {
            label: 'Confidentiality',
            value: project.systemInfo.categorization.confidentiality,
          },
          {
            label: 'Integrity',
            value: project.systemInfo.categorization.integrity,
          },
          {
            label: 'Availability',
            value: project.systemInfo.categorization.availability,
          },
          {
            label: 'Selected Baseline',
            value: project.baseline.replace('_', ' '),
          },
        ],
      },
      {
        title: 'System Environment',
        icon: <CloudIcon color="primary" />,
        status:
          project.systemInfo.environment.deploymentModel &&
          project.systemInfo.contacts.systemOwner.name
            ? 'complete'
            : 'incomplete',
        items: [
          {
            label: 'Deployment Model',
            value:
              project.systemInfo.environment.deploymentModel?.replace(
                '-',
                ' '
              ) || '-',
          },
          {
            label: 'Cloud Provider',
            value: project.systemInfo.environment.cloudProvider || 'N/A',
          },
          {
            label: 'Technologies',
            value: `${project.systemInfo.environment.technologies.length} listed`,
          },
          {
            label: 'System Owner',
            value:
              project.systemInfo.contacts.systemOwner.name || 'Not specified',
          },
        ],
      },
      {
        title: 'Control Implementations',
        icon: <AssignmentIcon color="primary" />,
        status:
          implementationStats.percentage >= 80
            ? 'complete'
            : implementationStats.percentage >= 20
              ? 'warning'
              : 'incomplete',
        items: [
          {
            label: 'Implemented',
            value: String(implementationStats.byStatus.IMPLEMENTED),
          },
          {
            label: 'Partially Implemented',
            value: String(implementationStats.byStatus.PARTIALLY_IMPLEMENTED),
          },
          {
            label: 'Planned',
            value: String(implementationStats.byStatus.PLANNED),
          },
          {
            label: 'Not Applicable',
            value: String(implementationStats.byStatus.NOT_APPLICABLE),
          },
          {
            label: 'Not Started',
            value: String(implementationStats.byStatus.NOT_STARTED),
          },
        ],
      },
    ],
    [project, implementationStats]
  )

  return (
    <Box>
      {/* Header */}
      <Typography variant="h6" gutterBottom>
        SSP Review Summary
        <Tooltip title="Review your SSP before exporting">
          <IconButton size="small" sx={{ ml: 1 }}>
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Review your System Security Plan and address any issues before
        exporting.
      </Typography>

      {/* Validation Issues */}
      {validationIssues.length > 0 && (
        <Box sx={{ mb: 3 }}>
          {validationIssues.filter((i) => i.severity === 'error').length >
            0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <AlertTitle>Required Information Missing</AlertTitle>
              <List dense disablePadding>
                {validationIssues
                  .filter((i) => i.severity === 'error')
                  .map((issue, index) => (
                    <ListItem key={index} disablePadding>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <ErrorIcon color="error" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${issue.section}: ${issue.message}`}
                      />
                    </ListItem>
                  ))}
              </List>
            </Alert>
          )}

          {validationIssues.filter((i) => i.severity === 'warning').length >
            0 && (
            <Alert severity="warning">
              <AlertTitle>Recommendations</AlertTitle>
              <List dense disablePadding>
                {validationIssues
                  .filter((i) => i.severity === 'warning')
                  .map((issue, index) => (
                    <ListItem key={index} disablePadding>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <WarningIcon color="warning" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${issue.section}: ${issue.message}`}
                      />
                    </ListItem>
                  ))}
              </List>
            </Alert>
          )}
        </Box>
      )}

      {/* Overall Progress */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Overall Completion</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={project.status.replace('_', ' ')}
              color={
                project.status === 'COMPLETE'
                  ? 'success'
                  : project.status === 'REVIEW'
                    ? 'info'
                    : 'default'
              }
            />
          </Box>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Implementation Progress</Typography>
            <Typography variant="body2" fontWeight={600}>
              {implementationStats.completed} / {implementationStats.total}{' '}
              controls ({implementationStats.percentage}%)
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={implementationStats.percentage}
            sx={{ height: 10, borderRadius: 1 }}
            color={
              implementationStats.percentage >= 80
                ? 'success'
                : implementationStats.percentage >= 50
                  ? 'warning'
                  : 'error'
            }
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            icon={<CheckCircleIcon />}
            label={`${implementationStats.byStatus.IMPLEMENTED} Implemented`}
            color="success"
            variant="outlined"
            size="small"
          />
          <Chip
            label={`${implementationStats.byStatus.PARTIALLY_IMPLEMENTED} Partial`}
            color="warning"
            variant="outlined"
            size="small"
          />
          <Chip
            label={`${implementationStats.byStatus.PLANNED} Planned`}
            color="info"
            variant="outlined"
            size="small"
          />
          <Chip
            label={`${implementationStats.byStatus.NOT_APPLICABLE} N/A`}
            variant="outlined"
            size="small"
          />
          <Chip
            label={`${implementationStats.byStatus.NOT_STARTED} Not Started`}
            variant="outlined"
            size="small"
          />
        </Box>
      </Paper>

      {/* Section Summaries */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {sections.map((section) => (
          <Grid item xs={12} md={6} key={section.title}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {section.icon}
                  <Typography variant="subtitle1" fontWeight={600}>
                    {section.title}
                  </Typography>
                </Box>
                {section.status === 'complete' && (
                  <CheckCircleIcon color="success" fontSize="small" />
                )}
                {section.status === 'incomplete' && (
                  <ErrorIcon color="error" fontSize="small" />
                )}
                {section.status === 'warning' && (
                  <WarningIcon color="warning" fontSize="small" />
                )}
              </Box>
              <List dense disablePadding>
                {section.items.map((item) => (
                  <ListItem key={item.label} disablePadding sx={{ py: 0.5 }}>
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            {item.label}
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {item.value}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Progress by Control Family */}
      {familyStats.length > 0 && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" fontWeight={600}>
              Progress by Control Family
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={1}>
              {familyStats.map((family) => (
                <Grid item xs={12} sm={6} md={4} key={family.id}>
                  <Paper variant="outlined" sx={{ p: 1.5 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2" fontWeight={500}>
                        {family.id}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {family.completed}/{family.total}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={family.percentage}
                      sx={{ height: 4, borderRadius: 1 }}
                      color={
                        family.percentage === 100
                          ? 'success'
                          : family.percentage >= 50
                            ? 'warning'
                            : 'error'
                      }
                    />
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      )}

      <Divider sx={{ my: 3 }} />

      {/* Actions */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          {project.status !== 'REVIEW' && (
            <Button variant="outlined" onClick={handleMarkInReview}>
              Mark for Review
            </Button>
          )}
          {project.status !== 'COMPLETE' && isReadyForExport && (
            <Button
              variant="outlined"
              color="success"
              onClick={handleMarkComplete}
            >
              Mark Complete
            </Button>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<FileDownloadIcon />}
            onClick={() => navigate(`/app/projects/${project.id}/export`)}
            disabled={!isReadyForExport}
          >
            Export SSP
          </Button>
        </Box>
      </Box>

      {!isReadyForExport && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Please address all required fields before exporting. Use the Back
          button to navigate to previous steps and make corrections.
        </Alert>
      )}
    </Box>
  )
}

export default ReviewStep
