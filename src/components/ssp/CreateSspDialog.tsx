/**
 * Create SSP Dialog Component
 * @module components/ssp/CreateSspDialog
 *
 * A modal dialog for creating new SSP projects.
 * Story 4.2: Implement Create New SSP
 */
import { useState } from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormHelperText from '@mui/material/FormHelperText'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import type { Baseline, CreateSspInput } from '@/types/ssp'

interface CreateSspDialogProps {
  /** Whether the dialog is open */
  open: boolean
  /** Callback when dialog should close */
  onClose: () => void
  /** Callback when form is submitted */
  onSubmit: (input: CreateSspInput) => Promise<void>
  /** Whether form is currently submitting */
  isSubmitting?: boolean
}

// Baseline options for selection
const BASELINE_OPTIONS: {
  value: Baseline
  label: string
  description: string
}[] = [
  {
    value: 'LOW',
    label: 'NIST Low',
    description:
      'For systems with low impact to confidentiality, integrity, and availability',
  },
  {
    value: 'MODERATE',
    label: 'NIST Moderate',
    description: 'For systems with moderate impact - most common baseline',
  },
  {
    value: 'HIGH',
    label: 'NIST High',
    description: 'For systems with high impact requiring strongest protections',
  },
  {
    value: 'FEDRAMP_LOW',
    label: 'FedRAMP Low',
    description: 'For low-impact cloud systems seeking FedRAMP authorization',
  },
  {
    value: 'FEDRAMP_MODERATE',
    label: 'FedRAMP Moderate',
    description:
      'For moderate-impact cloud systems - most common FedRAMP baseline',
  },
  {
    value: 'FEDRAMP_HIGH',
    label: 'FedRAMP High',
    description: 'For high-impact cloud systems with strictest requirements',
  },
  {
    value: 'FEDRAMP_LI_SAAS',
    label: 'FedRAMP LI-SaaS',
    description: 'For low-impact SaaS with tailored requirements',
  },
]

interface FormErrors {
  name?: string
  baseline?: string
}

/**
 * Dialog for creating a new SSP project.
 */
export function CreateSspDialog({
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
}: CreateSspDialogProps): JSX.Element {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [baseline, setBaseline] = useState<Baseline>('MODERATE')
  const [errors, setErrors] = useState<FormErrors>({})

  const handleClose = () => {
    if (isSubmitting) return
    // Reset form state
    setName('')
    setDescription('')
    setBaseline('MODERATE')
    setErrors({})
    onClose()
  }

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setName(value)
    // Clear error when user starts typing
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: undefined }))
    }
  }

  const handleDescriptionChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDescription(event.target.value)
  }

  const handleBaselineChange = (event: SelectChangeEvent<Baseline>) => {
    setBaseline(event.target.value as Baseline)
    if (errors.baseline) {
      setErrors((prev) => ({ ...prev, baseline: undefined }))
    }
  }

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!name.trim()) {
      newErrors.name = 'System name is required'
    } else if (name.length > 200) {
      newErrors.name = 'System name must be 200 characters or less'
    }

    if (!baseline) {
      newErrors.baseline = 'Please select a baseline'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!validate()) return

    const input: CreateSspInput = {
      name: name.trim(),
      description: description.trim() || undefined,
      baseline,
    }

    await onSubmit(input)
  }

  const selectedBaselineOption = BASELINE_OPTIONS.find(
    (opt) => opt.value === baseline
  )

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="create-ssp-dialog-title"
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle id="create-ssp-dialog-title">Create New SSP</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <TextField
              autoFocus
              id="ssp-name"
              label="System Name"
              placeholder="Enter your system name"
              value={name}
              onChange={handleNameChange}
              error={Boolean(errors.name)}
              helperText={errors.name || `${name.length}/200 characters`}
              disabled={isSubmitting}
              required
              fullWidth
              inputProps={{ maxLength: 200 }}
            />

            <TextField
              id="ssp-description"
              label="Description"
              placeholder="Brief description of your system (optional)"
              value={description}
              onChange={handleDescriptionChange}
              disabled={isSubmitting}
              multiline
              rows={3}
              fullWidth
            />

            <FormControl fullWidth error={Boolean(errors.baseline)}>
              <InputLabel id="baseline-label">Security Baseline</InputLabel>
              <Select
                labelId="baseline-label"
                id="baseline-select"
                value={baseline}
                label="Security Baseline"
                onChange={handleBaselineChange}
                disabled={isSubmitting}
              >
                {BASELINE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {errors.baseline || selectedBaselineOption?.description}
              </FormHelperText>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={
              isSubmitting ? (
                <CircularProgress size={16} color="inherit" />
              ) : null
            }
          >
            {isSubmitting ? 'Creating...' : 'Create SSP'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default CreateSspDialog
