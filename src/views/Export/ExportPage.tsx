/**
 * SSP Export Page
 * @module views/Export/ExportPage
 *
 * Provides UI for exporting SSP documents in various formats:
 * - OSCAL (JSON, YAML, XML)
 * - Word Document
 * - PDF
 *
 * Story: 6.2 - Build Export Page UI
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Tooltip,
  Breadcrumbs,
  Link,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  Snackbar,
  LinearProgress,
} from '@mui/material'
import {
  Download as DownloadIcon,
  Code as CodeIcon,
  Description as DescriptionIcon,
  PictureAsPdf as PdfIcon,
  ArrowBack as ArrowBackIcon,
  ExpandMore as ExpandMoreIcon,
  ContentCopy as CopyIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  VerifiedUser as VerifiedUserIcon,
  Error as ErrorIcon,
} from '@mui/icons-material'
import { saveAs } from 'file-saver'

import { useSsp } from '@/contexts/SspContext'
import type { SspProject } from '@/types/ssp'
import type { OscalFormat } from '@/lib/oscal'
import {
  generateOscalSsp,
  exportOscalSsp,
  getOscalFileExtension,
  getOscalMimeType,
  validateSspProject,
  type ValidationResult,
} from '@/lib/oscal'
import {
  generateWordDocument,
  getWordFilename,
  generatePdfDocument,
  getPdfFilename,
} from '@/lib/export'

// ============================================================================
// Types
// ============================================================================

type ExportFormat = 'oscal-json' | 'oscal-yaml' | 'oscal-xml' | 'docx' | 'pdf'

interface ExportOption {
  id: ExportFormat
  label: string
  description: string
  icon: React.ReactNode
  available: boolean
  badge?: string
}

// ============================================================================
// Constants
// ============================================================================

const EXPORT_OPTIONS: ExportOption[] = [
  {
    id: 'oscal-json',
    label: 'OSCAL JSON',
    description:
      'Machine-readable JSON format following NIST OSCAL v1.1.3 specification',
    icon: <CodeIcon />,
    available: true,
    badge: 'Recommended',
  },
  {
    id: 'oscal-yaml',
    label: 'OSCAL YAML',
    description: 'Human-readable YAML format, easily editable',
    icon: <CodeIcon />,
    available: true,
  },
  {
    id: 'oscal-xml',
    label: 'OSCAL XML',
    description: 'XML format for legacy system compatibility',
    icon: <CodeIcon />,
    available: true,
  },
  {
    id: 'docx',
    label: 'Word Document',
    description: 'Formatted .docx document for stakeholder review',
    icon: <DescriptionIcon />,
    available: true,
  },
  {
    id: 'pdf',
    label: 'PDF',
    description: 'Read-only PDF for distribution and archival',
    icon: <PdfIcon />,
    available: true,
  },
]

// ============================================================================
// Component
// ============================================================================

export default function ExportPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getProjectById } = useSsp()

  // State
  const [project, setProject] = useState<SspProject | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [selectedFormat, setSelectedFormat] =
    useState<ExportFormat>('oscal-json')
  const [fedrampMode, setFedrampMode] = useState(false)
  const [previewContent, setPreviewContent] = useState<string>('')
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error'
  }>({
    open: false,
    message: '',
    severity: 'success',
  })
  const [validating, setValidating] = useState(false)
  const [oscalValidation, setOscalValidation] =
    useState<ValidationResult | null>(null)

  // Load project
  useEffect(() => {
    if (id) {
      const loadedProject = getProjectById(id)
      if (loadedProject) {
        setProject(loadedProject)
        setFedrampMode(loadedProject.baseline.startsWith('FEDRAMP'))
      }
      setLoading(false)
    }
  }, [id, getProjectById])

  // Generate preview content when format changes
  useEffect(() => {
    if (!project) return

    const generatePreview = () => {
      if (selectedFormat.startsWith('oscal-')) {
        const oscalFormat = selectedFormat.replace('oscal-', '') as OscalFormat
        const content = exportOscalSsp(project, oscalFormat, {
          fedramp: fedrampMode,
        })
        // Truncate for preview
        const maxLength = 5000
        if (content.length > maxLength) {
          return (
            content.substring(0, maxLength) + '\n\n... [truncated for preview]'
          )
        }
        return content
      }
      return `Preview not available for ${selectedFormat} format.\nClick "Download" to generate the full document.`
    }

    setPreviewContent(generatePreview())
  }, [project, selectedFormat, fedrampMode])

  // Validation status
  const validationStatus = useMemo(() => {
    if (!project) return { isValid: false, errors: [], warnings: [] }

    const errors: string[] = []
    const warnings: string[] = []

    // Check required fields
    if (!project.systemInfo?.systemName) {
      errors.push('System name is required')
    }
    if (!project.systemInfo?.description) {
      warnings.push('System description is recommended')
    }
    if (!project.implementations || project.implementations.length === 0) {
      warnings.push('No control implementations documented')
    }

    // Check contacts
    const contacts = project.systemInfo?.contacts
    if (!contacts?.systemOwner?.email) {
      warnings.push('System owner contact is recommended')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }, [project])

  // Export handler
  const handleExport = useCallback(async () => {
    if (!project) return

    setExporting(true)
    try {
      let content: string | Blob
      let filename: string
      let mimeType: string

      if (selectedFormat.startsWith('oscal-')) {
        const oscalFormat = selectedFormat.replace('oscal-', '') as OscalFormat
        content = exportOscalSsp(project, oscalFormat, { fedramp: fedrampMode })
        filename = `${project.systemInfo?.systemName || project.name}-ssp${getOscalFileExtension(oscalFormat)}`
        mimeType = getOscalMimeType(oscalFormat)
      } else if (selectedFormat === 'docx') {
        // Word document export
        content = await generateWordDocument(project, { fedramp: fedrampMode })
        filename = getWordFilename(project)
        mimeType =
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      } else if (selectedFormat === 'pdf') {
        // PDF export
        content = await generatePdfDocument(project, { fedramp: fedrampMode })
        filename = getPdfFilename(project)
        mimeType = 'application/pdf'
      } else {
        throw new Error(`Unknown format: ${selectedFormat}`)
      }

      // Create and download file
      const blob =
        content instanceof Blob
          ? content
          : new Blob([content], { type: mimeType })
      saveAs(blob, filename)

      setSnackbar({
        open: true,
        message: `Successfully exported ${filename}`,
        severity: 'success',
      })
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Export failed',
        severity: 'error',
      })
    } finally {
      setExporting(false)
    }
  }, [project, selectedFormat, fedrampMode])

  // Copy preview to clipboard
  const handleCopyPreview = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(previewContent)
      setSnackbar({
        open: true,
        message: 'Copied to clipboard',
        severity: 'success',
      })
    } catch {
      setSnackbar({
        open: true,
        message: 'Failed to copy to clipboard',
        severity: 'error',
      })
    }
  }, [previewContent])

  // OSCAL Validation handler
  const handleValidate = useCallback(() => {
    if (!project) return

    setValidating(true)
    // Use setTimeout to allow UI to update before validation
    setTimeout(() => {
      try {
        const result = validateSspProject(project, { fedramp: fedrampMode })
        setOscalValidation(result)

        if (result.isValid) {
          setSnackbar({
            open: true,
            message: 'SSP is OSCAL-compliant!',
            severity: 'success',
          })
        } else {
          setSnackbar({
            open: true,
            message: `Validation found ${result.errorCount} error(s)`,
            severity: 'error',
          })
        }
      } catch (error) {
        setSnackbar({
          open: true,
          message: error instanceof Error ? error.message : 'Validation failed',
          severity: 'error',
        })
      } finally {
        setValidating(false)
      }
    }, 100)
  }, [project, fedrampMode])

  // Loading state
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    )
  }

  // Not found state
  if (!project) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          SSP project not found. Please select a valid project from the
          dashboard.
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/app/projects')}
          sx={{ mt: 2 }}
        >
          Back to Projects
        </Button>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          component="button"
          underline="hover"
          color="inherit"
          onClick={() => navigate('/app/projects')}
        >
          Projects
        </Link>
        <Link
          component="button"
          underline="hover"
          color="inherit"
          onClick={() => navigate(`/app/projects/${project.id}`)}
        >
          {project.systemInfo?.systemName || project.name}
        </Link>
        <Typography color="text.primary">Export</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={4}
      >
        <Box>
          <Typography variant="h4" gutterBottom>
            Export SSP
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Export your System Security Plan in various formats for submission
            or review.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/app/projects/${project.id}`)}
        >
          Back to SSP
        </Button>
      </Box>

      {/* Validation Status */}
      {(validationStatus.errors.length > 0 ||
        validationStatus.warnings.length > 0) && (
        <Box mb={3}>
          {validationStatus.errors.map((error, index) => (
            <Alert key={`error-${index}`} severity="error" sx={{ mb: 1 }}>
              {error}
            </Alert>
          ))}
          {validationStatus.warnings.map((warning, index) => (
            <Alert key={`warning-${index}`} severity="warning" sx={{ mb: 1 }}>
              {warning}
            </Alert>
          ))}
        </Box>
      )}

      <Box display="flex" gap={4} flexDirection={{ xs: 'column', lg: 'row' }}>
        {/* Left Panel - Format Selection */}
        <Box flex="1" minWidth={0}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Select Export Format
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {/* Format Cards */}
            <Box display="flex" flexDirection="column" gap={2}>
              {EXPORT_OPTIONS.map((option) => (
                <Card
                  key={option.id}
                  variant={
                    selectedFormat === option.id ? 'outlined' : 'elevation'
                  }
                  sx={{
                    cursor: option.available ? 'pointer' : 'not-allowed',
                    opacity: option.available ? 1 : 0.5,
                    borderColor:
                      selectedFormat === option.id ? 'primary.main' : 'divider',
                    borderWidth: selectedFormat === option.id ? 2 : 1,
                    transition: 'all 0.2s',
                    '&:hover': option.available
                      ? {
                          borderColor: 'primary.light',
                          boxShadow: 2,
                        }
                      : {},
                  }}
                  onClick={() =>
                    option.available && setSelectedFormat(option.id)
                  }
                >
                  <CardContent sx={{ py: 2 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 1,
                          bgcolor:
                            selectedFormat === option.id
                              ? 'primary.main'
                              : 'grey.100',
                          color:
                            selectedFormat === option.id ? 'white' : 'grey.600',
                          display: 'flex',
                        }}
                      >
                        {option.icon}
                      </Box>
                      <Box flex={1}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {option.label}
                          </Typography>
                          {option.badge && (
                            <Chip
                              label={option.badge}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {option.description}
                        </Typography>
                      </Box>
                      {selectedFormat === option.id && (
                        <CheckCircleIcon color="primary" />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>

            {/* FedRAMP Option */}
            {selectedFormat.startsWith('oscal-') && (
              <Box mt={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={fedrampMode}
                      onChange={(e) => setFedrampMode(e.target.checked)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1">FedRAMP Format</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Include FedRAMP-specific extensions and metadata
                      </Typography>
                    </Box>
                  }
                />
              </Box>
            )}

            {/* OSCAL Validation Section */}
            {selectedFormat.startsWith('oscal-') && (
              <Box mt={3}>
                <Divider sx={{ mb: 2 }} />
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  mb={2}
                >
                  <Box>
                    <Typography variant="subtitle1" fontWeight="medium">
                      OSCAL Validation
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Validate SSP against OSCAL schema before export
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={
                      validating ? (
                        <CircularProgress size={16} />
                      ) : (
                        <VerifiedUserIcon />
                      )
                    }
                    onClick={handleValidate}
                    disabled={validating}
                  >
                    {validating ? 'Validating...' : 'Validate'}
                  </Button>
                </Box>

                {/* Validation Results */}
                {oscalValidation && (
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      bgcolor: oscalValidation.isValid
                        ? 'success.light'
                        : 'error.light',
                      border: 1,
                      borderColor: oscalValidation.isValid
                        ? 'success.main'
                        : 'error.main',
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      {oscalValidation.isValid ? (
                        <>
                          <CheckCircleIcon color="success" />
                          <Typography
                            variant="subtitle2"
                            color="success.dark"
                            fontWeight="bold"
                          >
                            SSP is OSCAL-compliant
                          </Typography>
                        </>
                      ) : (
                        <>
                          <ErrorIcon color="error" />
                          <Typography
                            variant="subtitle2"
                            color="error.dark"
                            fontWeight="bold"
                          >
                            {oscalValidation.errorCount} error(s) found
                          </Typography>
                        </>
                      )}
                      {oscalValidation.warningCount > 0 && (
                        <Chip
                          label={`${oscalValidation.warningCount} warning(s)`}
                          size="small"
                          color="warning"
                          variant="outlined"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>

                    {/* Error List */}
                    {oscalValidation.errors.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        {oscalValidation.errors.slice(0, 5).map((err, idx) => (
                          <Box key={idx} sx={{ mb: 0.5 }}>
                            <Typography variant="body2" color="error.dark">
                              {err.message}
                            </Typography>
                            {err.suggestion && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Fix: {err.suggestion}
                              </Typography>
                            )}
                          </Box>
                        ))}
                        {oscalValidation.errors.length > 5 && (
                          <Typography variant="caption" color="text.secondary">
                            ... and {oscalValidation.errors.length - 5} more
                            errors
                          </Typography>
                        )}
                      </Box>
                    )}

                    {/* Warning List */}
                    {oscalValidation.warnings.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        {oscalValidation.warnings
                          .slice(0, 3)
                          .map((warn, idx) => (
                            <Box key={idx} sx={{ mb: 0.5 }}>
                              <Typography variant="body2" color="warning.dark">
                                {warn.message}
                              </Typography>
                              {warn.suggestion && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Suggestion: {warn.suggestion}
                                </Typography>
                              )}
                            </Box>
                          ))}
                        {oscalValidation.warnings.length > 3 && (
                          <Typography variant="caption" color="text.secondary">
                            ... and {oscalValidation.warnings.length - 3} more
                            warnings
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            )}

            {/* Export Button */}
            <Box mt={4}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={
                  exporting ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <DownloadIcon />
                  )
                }
                onClick={handleExport}
                disabled={exporting || !validationStatus.isValid}
              >
                {exporting
                  ? 'Generating...'
                  : `Download ${EXPORT_OPTIONS.find((o) => o.id === selectedFormat)?.label}`}
              </Button>
              {!validationStatus.isValid && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ mt: 1, display: 'block' }}
                >
                  Please fix validation errors before exporting
                </Typography>
              )}
            </Box>
          </Paper>

          {/* SSP Summary */}
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              SSP Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  System Name
                </Typography>
                <Typography variant="body1">
                  {project.systemInfo?.systemName || project.name}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Baseline
                </Typography>
                <Chip
                  label={project.baseline.replace('_', ' ')}
                  size="small"
                  color={
                    project.baseline.includes('HIGH')
                      ? 'error'
                      : project.baseline.includes('MODERATE')
                        ? 'warning'
                        : 'success'
                  }
                />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Chip label={project.status} size="small" variant="outlined" />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Controls Documented
                </Typography>
                <Typography variant="body1">
                  {project.implementations?.length || 0}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Right Panel - Preview */}
        <Box flex="1.5" minWidth={0}>
          <Paper
            sx={{
              p: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb={2}
            >
              <Typography variant="h6">Preview</Typography>
              {selectedFormat.startsWith('oscal-') && (
                <Tooltip title="Copy to clipboard">
                  <IconButton onClick={handleCopyPreview} size="small">
                    <CopyIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            <Divider />
            <Box
              sx={{
                flex: 1,
                mt: 2,
                overflow: 'auto',
                bgcolor: 'grey.50',
                borderRadius: 1,
                p: 2,
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                maxHeight: '60vh',
              }}
            >
              {previewContent}
            </Box>
            {selectedFormat.startsWith('oscal-') && (
              <Box mt={2} display="flex" alignItems="center" gap={1}>
                <InfoIcon fontSize="small" color="info" />
                <Typography variant="caption" color="text.secondary">
                  Preview shows first 5,000 characters. Download for complete
                  document.
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Progress indicator during export */}
      {exporting && (
        <LinearProgress
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
          }}
        />
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}
