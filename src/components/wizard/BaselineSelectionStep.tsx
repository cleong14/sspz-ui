import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from '@mui/material'
import {
  Security as SecurityIcon,
  Shield as ShieldIcon,
  VerifiedUser as VerifiedUserIcon,
} from '@mui/icons-material'
import { Baseline } from '../../types/ssp'
import { loadCatalog, getBaselineControls } from '../../services/oscal-catalog'
import { OSCALControl, OSCALCatalog } from '../../types/oscal'

interface BaselineOption {
  value: Baseline
  label: string
  description: string
  icon: React.ReactNode
  color: string
}

const BASELINE_OPTIONS: BaselineOption[] = [
  {
    value: 'low',
    label: 'Low Impact',
    description:
      'For systems where loss would have limited adverse effect. Suitable for public information systems.',
    icon: <SecurityIcon sx={{ fontSize: 48 }} />,
    color: '#4caf50',
  },
  {
    value: 'moderate',
    label: 'Moderate Impact',
    description:
      'For systems where loss would have serious adverse effect. Most common baseline for business systems.',
    icon: <ShieldIcon sx={{ fontSize: 48 }} />,
    color: '#ff9800',
  },
  {
    value: 'high',
    label: 'High Impact',
    description:
      'For systems where loss would have severe or catastrophic effect. Required for critical infrastructure.',
    icon: <VerifiedUserIcon sx={{ fontSize: 48 }} />,
    color: '#f44336',
  },
]

interface BaselineSelectionStepProps {
  onNext: (baseline: Baseline) => void
  onBack: () => void
  initialBaseline?: Baseline
}

export function BaselineSelectionStep({
  onNext,
  onBack,
  initialBaseline = 'moderate',
}: BaselineSelectionStepProps) {
  const [selectedBaseline, setSelectedBaseline] =
    useState<Baseline>(initialBaseline)
  const [catalog, setCatalog] = useState<OSCALCatalog | null>(null)
  const [controlCounts, setControlCounts] = useState<Record<Baseline, number>>({
    low: 0,
    moderate: 0,
    high: 0,
  })
  const [loading, setLoading] = useState(true)
  const [controlListOpen, setControlListOpen] = useState(false)
  const [previewControls, setPreviewControls] = useState<OSCALControl[]>([])

  useEffect(() => {
    async function loadData() {
      try {
        const loadedCatalog = await loadCatalog()
        setCatalog(loadedCatalog)

        // Calculate control counts for each baseline
        const counts: Record<Baseline, number> = {
          low: getBaselineControls(loadedCatalog, 'low').length,
          moderate: getBaselineControls(loadedCatalog, 'moderate').length,
          high: getBaselineControls(loadedCatalog, 'high').length,
        }
        setControlCounts(counts)
      } catch (error) {
        console.error('Error loading catalog:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleBaselineSelect = (baseline: Baseline) => {
    setSelectedBaseline(baseline)
  }

  const handleViewControls = () => {
    if (catalog) {
      const controls = getBaselineControls(catalog, selectedBaseline)
      setPreviewControls(controls)
      setControlListOpen(true)
    }
  }

  const handleNext = () => {
    onNext(selectedBaseline)
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 300,
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Step 2: Select Security Baseline
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Choose the NIST 800-53 baseline that matches your system&apos;s security
        categorization. This determines which controls are required for your
        SSP.
      </Typography>

      <Grid container spacing={3}>
        {BASELINE_OPTIONS.map((option) => (
          <Grid item xs={12} md={4} key={option.value}>
            <Card
              sx={{
                height: '100%',
                border:
                  selectedBaseline === option.value
                    ? `2px solid ${option.color}`
                    : '2px solid transparent',
                transition: 'border-color 0.2s',
              }}
            >
              <CardActionArea
                onClick={() => handleBaselineSelect(option.value)}
                sx={{ height: '100%' }}
              >
                <CardContent
                  sx={{
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Box sx={{ color: option.color }}>{option.icon}</Box>
                  <Typography variant="h6" component="div">
                    {option.label}
                  </Typography>
                  <Chip
                    label={`${controlCounts[option.value]} Controls`}
                    size="small"
                    sx={{ backgroundColor: option.color, color: 'white' }}
                  />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    {option.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button variant="outlined" onClick={handleViewControls} sx={{ mr: 2 }}>
          View Control List ({controlCounts[selectedBaseline]} controls)
        </Button>
      </Box>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={onBack}>Back</Button>
        <Button variant="contained" color="primary" onClick={handleNext}>
          Next
        </Button>
      </Box>

      <Dialog
        open={controlListOpen}
        onClose={() => setControlListOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {BASELINE_OPTIONS.find((o) => o.value === selectedBaseline)?.label}{' '}
          Controls ({previewControls.length})
        </DialogTitle>
        <DialogContent dividers>
          <List dense>
            {previewControls.map((control) => (
              <ListItem key={control.id}>
                <ListItemText
                  primary={`${control.id.toUpperCase()} - ${control.title}`}
                  secondary={
                    control.parts?.[0]?.prose?.substring(0, 150) + '...'
                  }
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setControlListOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
