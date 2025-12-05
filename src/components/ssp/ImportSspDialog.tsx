/**
 * Import SSP Dialog
 * @module components/ssp/ImportSspDialog
 *
 * Dialog for importing OSCAL SSP files (JSON, YAML, XML).
 *
 * Story: 6.6 - Implement OSCAL Import
 * Story: 6.7 - Implement Import Validation and Error Handling
 */

import { useState, useCallback, useRef } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Chip,
  Divider,
  Collapse,
  IconButton,
} from '@mui/material'
import {
  CloudUpload as UploadIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Info as InfoIcon,
} from '@mui/icons-material'
import {
  parseOscalFile,
  generateErrorReport,
  type ParseResult,
} from '@/lib/oscal'
import type { SspProject } from '@/types/ssp'

interface ImportSspDialogProps {
  /** Whether the dialog is open */
  open: boolean
  /** Callback when dialog is closed */
  onClose: () => void
  /** Callback when import is successful */
  onImport: (project: SspProject) => Promise<void>
  /** Whether a save operation is in progress */
  isSubmitting?: boolean
}

type ImportStep = 'select' | 'parsing' | 'preview' | 'error'

export default function ImportSspDialog({
  open,
  onClose,
  onImport,
  isSubmitting = false,
}: ImportSspDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<ImportStep>('select')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [parseResult, setParseResult] = useState<ParseResult | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [showAllErrors, setShowAllErrors] = useState(false)
  const [showAllWarnings, setShowAllWarnings] = useState(false)

  const resetState = useCallback(() => {
    setStep('select')
    setSelectedFile(null)
    setParseResult(null)
    setDragOver(false)
    setShowAllErrors(false)
    setShowAllWarnings(false)
  }, [])

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      resetState()
      onClose()
    }
  }, [isSubmitting, onClose, resetState])

  const handleFileSelect = useCallback(async (file: File) => {
    setSelectedFile(file)
    setStep('parsing')

    try {
      const result = await parseOscalFile(file)
      setParseResult(result)
      setStep(result.success ? 'preview' : 'error')
    } catch (error) {
      setParseResult({
        success: false,
        errors: [
          {
            code: 'UNEXPECTED_ERROR',
            message:
              error instanceof Error
                ? error.message
                : 'An unexpected error occurred',
          },
        ],
        warnings: [],
      })
      setStep('error')
    }
  }, [])

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        handleFileSelect(file)
      }
    },
    [handleFileSelect]
  )

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      setDragOver(false)
      const file = event.dataTransfer.files?.[0]
      if (file) {
        handleFileSelect(file)
      }
    },
    [handleFileSelect]
  )

  const handleImport = useCallback(async () => {
    if (!parseResult?.project) return

    try {
      await onImport(parseResult.project)
      resetState()
    } catch (error) {
      // Error will be handled by parent component
    }
  }, [parseResult, onImport, resetState])

  const handleSelectAnother = useCallback(() => {
    resetState()
    fileInputRef.current?.click()
  }, [resetState])

  const handleDownloadErrorReport = useCallback(() => {
    if (!parseResult) return

    const report = generateErrorReport(parseResult, selectedFile?.name)
    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `import-error-report-${Date.now()}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [parseResult, selectedFile])

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { minHeight: 300 },
      }}
    >
      <DialogTitle>Import OSCAL SSP</DialogTitle>
      <DialogContent>
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.yaml,.yml,.xml"
          onChange={handleInputChange}
          style={{ display: 'none' }}
        />

        {/* Step: Select File */}
        {step === 'select' && (
          <Box
            sx={{
              border: '2px dashed',
              borderColor: dragOver ? 'primary.main' : 'grey.300',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              bgcolor: dragOver ? 'action.hover' : 'background.default',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: 'primary.light',
                bgcolor: 'action.hover',
              },
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Drop your OSCAL file here
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              or click to browse
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Chip label="JSON" size="small" sx={{ mx: 0.5 }} />
              <Chip label="YAML" size="small" sx={{ mx: 0.5 }} />
              <Chip label="XML" size="small" sx={{ mx: 0.5 }} />
            </Box>
          </Box>
        )}

        {/* Step: Parsing */}
        {step === 'parsing' && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <LinearProgress sx={{ mb: 3 }} />
            <Typography variant="body1">
              Parsing {selectedFile?.name}...
            </Typography>
          </Box>
        )}

        {/* Step: Preview */}
        {step === 'preview' && parseResult?.project && (
          <Box>
            <Alert severity="success" sx={{ mb: 2 }}>
              <AlertTitle>File parsed successfully</AlertTitle>
              Ready to import as a new SSP project
            </Alert>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                System Name
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {parseResult.project.name}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Baseline
              </Typography>
              <Chip
                label={parseResult.project.baseline.replace('_', ' ')}
                size="small"
                color={
                  parseResult.project.baseline.includes('HIGH')
                    ? 'error'
                    : parseResult.project.baseline.includes('MODERATE')
                      ? 'warning'
                      : 'success'
                }
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Control Implementations
              </Typography>
              <Typography variant="body1">
                {parseResult.project.implementations?.length || 0} controls
              </Typography>
            </Box>

            {parseResult.detectedFormat && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Source Format
                </Typography>
                <Chip
                  label={parseResult.detectedFormat.toUpperCase()}
                  size="small"
                  variant="outlined"
                />
              </Box>
            )}

            {/* Warnings */}
            {parseResult.warnings.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <AlertTitle
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>{parseResult.warnings.length} warning(s)</span>
                    {parseResult.warnings.length > 3 && (
                      <IconButton
                        size="small"
                        onClick={() => setShowAllWarnings(!showAllWarnings)}
                        sx={{ ml: 1, p: 0 }}
                      >
                        {showAllWarnings ? (
                          <ExpandLessIcon />
                        ) : (
                          <ExpandMoreIcon />
                        )}
                      </IconButton>
                    )}
                  </AlertTitle>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    These issues won't prevent import but should be reviewed.
                  </Typography>
                  <List dense disablePadding>
                    {(showAllWarnings
                      ? parseResult.warnings
                      : parseResult.warnings.slice(0, 3)
                    ).map((warning, idx) => (
                      <ListItem
                        key={idx}
                        disableGutters
                        sx={{
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          py: 0.5,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <WarningIcon fontSize="small" color="warning" />
                          </ListItemIcon>
                          <ListItemText
                            primary={warning.message}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </Box>
                        {warning.suggestion && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ pl: 4, mt: 0.25 }}
                          >
                            {warning.suggestion}
                          </Typography>
                        )}
                      </ListItem>
                    ))}
                  </List>
                  {!showAllWarnings && parseResult.warnings.length > 3 && (
                    <Typography variant="caption" color="text.secondary">
                      ...and {parseResult.warnings.length - 3} more warnings
                    </Typography>
                  )}
                </Alert>
              </>
            )}
          </Box>
        )}

        {/* Step: Error */}
        {step === 'error' && (
          <Box>
            <Alert severity="error" sx={{ mb: 2 }}>
              <AlertTitle>Import failed</AlertTitle>
              The file could not be parsed as a valid OSCAL SSP document.
              {parseResult?.errors && parseResult.errors.length > 0 && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {parseResult.errors.length} error(s) found
                </Typography>
              )}
            </Alert>

            {parseResult?.errors && parseResult.errors.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1,
                  }}
                >
                  <Typography variant="subtitle2" color="error">
                    Errors
                  </Typography>
                  {parseResult.errors.length > 3 && (
                    <IconButton
                      size="small"
                      onClick={() => setShowAllErrors(!showAllErrors)}
                    >
                      {showAllErrors ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  )}
                </Box>
                <List dense disablePadding>
                  {(showAllErrors
                    ? parseResult.errors
                    : parseResult.errors.slice(0, 3)
                  ).map((error, idx) => (
                    <ListItem
                      key={idx}
                      sx={{
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        bgcolor: 'error.lighter',
                        borderRadius: 1,
                        mb: 1,
                        py: 1,
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          width: '100%',
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <ErrorIcon color="error" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={error.message}
                          secondary={
                            <Box component="span">
                              <Chip
                                label={error.code}
                                size="small"
                                variant="outlined"
                                sx={{ mr: 1, fontSize: '0.7rem', height: 20 }}
                              />
                              {error.line !== undefined && (
                                <Typography
                                  component="span"
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Line {error.line}
                                  {error.column && `, Col ${error.column}`}
                                </Typography>
                              )}
                            </Box>
                          }
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </Box>
                      {error.suggestion && (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            mt: 1,
                            pl: 4,
                          }}
                        >
                          <InfoIcon
                            sx={{
                              fontSize: 14,
                              mr: 0.5,
                              mt: 0.25,
                              color: 'info.main',
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {error.suggestion}
                          </Typography>
                        </Box>
                      )}
                    </ListItem>
                  ))}
                </List>
                {!showAllErrors && parseResult.errors.length > 3 && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', textAlign: 'center' }}
                  >
                    ...and {parseResult.errors.length - 3} more errors
                  </Typography>
                )}
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Button
                size="small"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadErrorReport}
                variant="outlined"
              >
                Download Error Report
              </Button>
              <Typography variant="caption" color="text.secondary">
                Save for review and fixing
              </Typography>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Please ensure your file is a valid OSCAL SSP document in JSON,
              YAML, or XML format. For more information, visit{' '}
              <Typography
                component="a"
                href="https://pages.nist.gov/OSCAL/reference/latest/system-security-plan/"
                target="_blank"
                rel="noopener noreferrer"
                variant="body2"
                color="primary"
              >
                OSCAL SSP Reference
              </Typography>
              .
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        {step === 'error' && (
          <Button onClick={handleSelectAnother} color="primary">
            Select Another File
          </Button>
        )}
        {step === 'preview' && (
          <Button
            variant="contained"
            onClick={handleImport}
            disabled={isSubmitting}
            startIcon={isSubmitting ? undefined : <SuccessIcon />}
          >
            {isSubmitting ? 'Importing...' : 'Import SSP'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
