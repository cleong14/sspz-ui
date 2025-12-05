/**
 * Security Categorization Step (Step 2)
 * @module views/SspWizard/steps/SecurityCategorizationStep
 *
 * Handles FIPS 199 security categorization and baseline selection.
 *
 * Story 5.4: Implement Security Categorization
 *
 * FR16: Users can specify system categorization (C/I/A)
 * FR19: Users can select appropriate baseline (Low, Moderate, High)
 */
import { useCallback, useMemo } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import InputLabel from '@mui/material/InputLabel'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Divider from '@mui/material/Divider'
import RadioGroup from '@mui/material/RadioGroup'
import Radio from '@mui/material/Radio'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActionArea from '@mui/material/CardActionArea'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import InfoIcon from '@mui/icons-material/Info'
import SecurityIcon from '@mui/icons-material/Security'
import LockIcon from '@mui/icons-material/Lock'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

import type { WizardStepProps } from '../SspWizard'
import type { ImpactLevel, Baseline } from '@/types/ssp'

// ============================================================================
// Types
// ============================================================================

interface BaselineOption {
  value: Baseline
  label: string
  description: string
  controlCount: number
  isFedRAMP: boolean
}

// ============================================================================
// Constants
// ============================================================================

const IMPACT_LEVELS: {
  value: ImpactLevel
  label: string
  description: string
  color: 'success' | 'warning' | 'error'
}[] = [
  {
    value: 'LOW',
    label: 'Low',
    description: 'Limited adverse effect on operations, assets, or individuals',
    color: 'success',
  },
  {
    value: 'MODERATE',
    label: 'Moderate',
    description: 'Serious adverse effect on operations, assets, or individuals',
    color: 'warning',
  },
  {
    value: 'HIGH',
    label: 'High',
    description:
      'Severe or catastrophic adverse effect on operations, assets, or individuals',
    color: 'error',
  },
]

const BASELINE_OPTIONS: BaselineOption[] = [
  {
    value: 'LOW',
    label: 'NIST Low',
    description: 'For systems with low impact across all security objectives',
    controlCount: 150,
    isFedRAMP: false,
  },
  {
    value: 'MODERATE',
    label: 'NIST Moderate',
    description:
      'For systems with moderate impact on at least one security objective',
    controlCount: 304,
    isFedRAMP: false,
  },
  {
    value: 'HIGH',
    label: 'NIST High',
    description:
      'For systems with high impact on at least one security objective',
    controlCount: 392,
    isFedRAMP: false,
  },
  {
    value: 'FEDRAMP_LOW',
    label: 'FedRAMP Low',
    description: 'For low-impact SaaS applications in federal cloud',
    controlCount: 125,
    isFedRAMP: true,
  },
  {
    value: 'FEDRAMP_MODERATE',
    label: 'FedRAMP Moderate',
    description: 'Most common FedRAMP baseline for cloud services',
    controlCount: 325,
    isFedRAMP: true,
  },
  {
    value: 'FEDRAMP_HIGH',
    label: 'FedRAMP High',
    description: 'For high-sensitivity federal cloud deployments',
    controlCount: 421,
    isFedRAMP: true,
  },
  {
    value: 'FEDRAMP_LI_SAAS',
    label: 'FedRAMP LI-SaaS',
    description: 'Low Impact SaaS for non-sensitive federal data',
    controlCount: 36,
    isFedRAMP: true,
  },
]

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate the overall security categorization based on C/I/A levels.
 * Per FIPS 199, the overall is the highest of the three.
 */
function calculateOverallCategorization(
  confidentiality: ImpactLevel,
  integrity: ImpactLevel,
  availability: ImpactLevel
): ImpactLevel {
  const levels = { LOW: 0, MODERATE: 1, HIGH: 2 }
  const max = Math.max(
    levels[confidentiality],
    levels[integrity],
    levels[availability]
  )
  return Object.entries(levels).find(
    ([, value]) => value === max
  )?.[0] as ImpactLevel
}

/**
 * Get recommended baseline based on categorization.
 */
function getRecommendedBaseline(overall: ImpactLevel): Baseline {
  switch (overall) {
    case 'LOW':
      return 'LOW'
    case 'MODERATE':
      return 'MODERATE'
    case 'HIGH':
      return 'HIGH'
    default:
      return 'MODERATE'
  }
}

// ============================================================================
// Component
// ============================================================================

/**
 * Security Categorization Step component.
 */
const SecurityCategorizationStep: React.FC<WizardStepProps> = ({
  project,
  onUpdate,
}) => {
  const { categorization } = project.systemInfo

  // Calculate overall categorization
  const overallCategorization = useMemo(
    () =>
      calculateOverallCategorization(
        categorization.confidentiality,
        categorization.integrity,
        categorization.availability
      ),
    [categorization]
  )

  // Get recommended baseline
  const recommendedBaseline = useMemo(
    () => getRecommendedBaseline(overallCategorization),
    [overallCategorization]
  )

  // Check if current baseline matches recommendation
  const isUsingRecommendedBaseline = useMemo(() => {
    const baselineWithoutFedRAMP = project.baseline.replace('FEDRAMP_', '')
    return (
      baselineWithoutFedRAMP === recommendedBaseline ||
      project.baseline === recommendedBaseline
    )
  }, [project.baseline, recommendedBaseline])

  // Handlers
  const handleImpactChange = useCallback(
    (dimension: 'confidentiality' | 'integrity' | 'availability') =>
      (event: SelectChangeEvent) => {
        const newCategorization = {
          ...categorization,
          [dimension]: event.target.value as ImpactLevel,
        }
        const newOverall = calculateOverallCategorization(
          newCategorization.confidentiality,
          newCategorization.integrity,
          newCategorization.availability
        )

        onUpdate({
          systemInfo: {
            ...project.systemInfo,
            categorization: {
              ...newCategorization,
              overall: newOverall,
            },
          },
        })
      },
    [categorization, project.systemInfo, onUpdate]
  )

  const handleBaselineChange = useCallback(
    (baseline: Baseline) => {
      onUpdate({
        baseline,
        // Update status to IN_PROGRESS when baseline is selected
        status: project.status === 'DRAFT' ? 'IN_PROGRESS' : project.status,
      })
    },
    [project.status, onUpdate]
  )

  // Separate NIST and FedRAMP baselines
  const nistBaselines = BASELINE_OPTIONS.filter((b) => !b.isFedRAMP)
  const fedRampBaselines = BASELINE_OPTIONS.filter((b) => b.isFedRAMP)

  return (
    <Box>
      {/* Section: FIPS 199 Categorization */}
      <Typography variant="h6" gutterBottom>
        Security Categorization (FIPS 199)
        <Tooltip title="Categorize your system based on potential impact to confidentiality, integrity, and availability">
          <IconButton size="small" sx={{ ml: 1 }}>
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Select the potential impact level for each security objective. The
        overall categorization is determined by the highest impact level.
      </Typography>

      <Grid container spacing={3}>
        {/* Confidentiality */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              height: '100%',
              borderTop: 3,
              borderColor: 'info.main',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <LockIcon color="info" />
              <Typography variant="subtitle1" fontWeight={600}>
                Confidentiality
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Impact if unauthorized disclosure occurs
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Impact Level</InputLabel>
              <Select
                value={categorization.confidentiality}
                label="Impact Level"
                onChange={handleImpactChange('confidentiality')}
              >
                {IMPACT_LEVELS.map((level) => (
                  <MenuItem key={level.value} value={level.value}>
                    <Box>
                      <Typography variant="body1">{level.label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {level.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>
        </Grid>

        {/* Integrity */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              height: '100%',
              borderTop: 3,
              borderColor: 'success.main',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <VerifiedUserIcon color="success" />
              <Typography variant="subtitle1" fontWeight={600}>
                Integrity
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Impact if unauthorized modification occurs
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Impact Level</InputLabel>
              <Select
                value={categorization.integrity}
                label="Impact Level"
                onChange={handleImpactChange('integrity')}
              >
                {IMPACT_LEVELS.map((level) => (
                  <MenuItem key={level.value} value={level.value}>
                    <Box>
                      <Typography variant="body1">{level.label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {level.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>
        </Grid>

        {/* Availability */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              height: '100%',
              borderTop: 3,
              borderColor: 'warning.main',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <AccessTimeIcon color="warning" />
              <Typography variant="subtitle1" fontWeight={600}>
                Availability
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Impact if access is disrupted
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Impact Level</InputLabel>
              <Select
                value={categorization.availability}
                label="Impact Level"
                onChange={handleImpactChange('availability')}
              >
                {IMPACT_LEVELS.map((level) => (
                  <MenuItem key={level.value} value={level.value}>
                    <Box>
                      <Typography variant="body1">{level.label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {level.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>
        </Grid>
      </Grid>

      {/* Overall Categorization Result */}
      <Alert
        severity={
          overallCategorization === 'HIGH'
            ? 'error'
            : overallCategorization === 'MODERATE'
              ? 'warning'
              : 'success'
        }
        icon={<SecurityIcon />}
        sx={{ mt: 3 }}
      >
        <AlertTitle>
          Overall Security Categorization: {overallCategorization}
        </AlertTitle>
        Based on your selections, your system should implement at least{' '}
        <strong>{recommendedBaseline}</strong> baseline controls. You may select
        a higher baseline if required by policy.
      </Alert>

      <Divider sx={{ my: 4 }} />

      {/* Section: Baseline Selection */}
      <Typography variant="h6" gutterBottom>
        Select Security Baseline
        <Tooltip title="The baseline determines which controls apply to your system">
          <IconButton size="small" sx={{ ml: 1 }}>
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Choose a NIST 800-53 or FedRAMP baseline. Controls will be automatically
        loaded based on your selection.
      </Typography>

      {!isUsingRecommendedBaseline && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <AlertTitle>Note</AlertTitle>
          You have selected a baseline that differs from the recommended{' '}
          <strong>{recommendedBaseline}</strong> baseline. Make sure this aligns
          with your organization's policies.
        </Alert>
      )}

      {/* NIST Baselines */}
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        NIST 800-53 Baselines
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {nistBaselines.map((baseline) => (
          <Grid item xs={12} sm={6} md={4} key={baseline.value}>
            <Card
              variant="outlined"
              sx={{
                height: '100%',
                border: 2,
                borderColor:
                  project.baseline === baseline.value
                    ? 'primary.main'
                    : 'divider',
                bgcolor:
                  project.baseline === baseline.value
                    ? 'action.selected'
                    : 'background.paper',
              }}
            >
              <CardActionArea
                onClick={() => handleBaselineChange(baseline.value)}
                sx={{ height: '100%', p: 2 }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 1,
                    }}
                  >
                    <Typography variant="h6">{baseline.label}</Typography>
                    {project.baseline === baseline.value && (
                      <CheckCircleIcon color="primary" />
                    )}
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {baseline.description}
                  </Typography>
                  <Chip
                    label={`${baseline.controlCount} controls`}
                    size="small"
                    variant="outlined"
                  />
                  {baseline.value === recommendedBaseline && (
                    <Chip
                      label="Recommended"
                      size="small"
                      color="success"
                      sx={{ ml: 1 }}
                    />
                  )}
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* FedRAMP Baselines */}
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        FedRAMP Baselines
        <Chip
          label="Cloud"
          size="small"
          color="primary"
          variant="outlined"
          sx={{ ml: 1 }}
        />
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Select a FedRAMP baseline if your system is a cloud service for federal
        agencies.
      </Typography>
      <Grid container spacing={2}>
        {fedRampBaselines.map((baseline) => (
          <Grid item xs={12} sm={6} md={3} key={baseline.value}>
            <Card
              variant="outlined"
              sx={{
                height: '100%',
                border: 2,
                borderColor:
                  project.baseline === baseline.value
                    ? 'primary.main'
                    : 'divider',
                bgcolor:
                  project.baseline === baseline.value
                    ? 'action.selected'
                    : 'background.paper',
              }}
            >
              <CardActionArea
                onClick={() => handleBaselineChange(baseline.value)}
                sx={{ height: '100%', p: 2 }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={600}>
                      {baseline.label}
                    </Typography>
                    {project.baseline === baseline.value && (
                      <CheckCircleIcon color="primary" />
                    )}
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1, minHeight: 40 }}
                  >
                    {baseline.description}
                  </Typography>
                  <Chip
                    label={`${baseline.controlCount} controls`}
                    size="small"
                    variant="outlined"
                  />
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default SecurityCategorizationStep
