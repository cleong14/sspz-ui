/**
 * Import SSP Dialog
 * @module components/ssp/ImportSspDialog
 *
 * Dialog for importing OSCAL SSP files (JSON, YAML, XML).
 *
 * Story: 6.6 - Implement OSCAL Import
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
} from '@mui/material'
import {
  CloudUpload as UploadIcon,
  Description as FileIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
} from '@mui/icons-material'
import { parseOscalFile, type ParseResult } from '@/lib/oscal'
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

  const resetState = useCallback(() => {
    setStep('select')
    setSelectedFile(null)
    setParseResult(null)
    setDragOver(false)
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
                  <AlertTitle>
                    {parseResult.warnings.length} warning(s)
                  </AlertTitle>
                  <List dense disablePadding>
                    {parseResult.warnings.slice(0, 5).map((warning, idx) => (
                      <ListItem key={idx} disableGutters sx={{ py: 0 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <WarningIcon fontSize="small" color="warning" />
                        </ListItemIcon>
                        <ListItemText
                          primary={warning.message}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                    {parseResult.warnings.length > 5 && (
                      <Typography variant="caption" color="text.secondary">
                        ...and {parseResult.warnings.length - 5} more
                      </Typography>
                    )}
                  </List>
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
            </Alert>

            {parseResult?.errors && parseResult.errors.length > 0 && (
              <List dense>
                {parseResult.errors.map((error, idx) => (
                  <ListItem key={idx}>
                    <ListItemIcon>
                      <ErrorIcon color="error" />
                    </ListItemIcon>
                    <ListItemText
                      primary={error.message}
                      secondary={error.code}
                    />
                  </ListItem>
                ))}
              </List>
            )}

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Please ensure your file is a valid OSCAL SSP document in JSON,
              YAML, or XML format.
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
