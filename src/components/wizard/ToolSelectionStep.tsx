import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Alert,
  Divider,
  LinearProgress,
} from '@mui/material'
import {
  Code as CodeIcon,
  VpnKey as KeyIcon,
  BugReport as BugIcon,
  Security as SecurityIcon,
  Cloud as CloudIcon,
  Storage as StorageIcon,
} from '@mui/icons-material'
import { ToolControlMapping, ToolCategory } from '../../types/tools'
import { SelectedTool, Baseline } from '../../types/ssp'
import { loadToolMappings } from '../../services/tool-mappings'
import { loadCatalog } from '../../services/oscal-catalog'
import { calculateControlCoverage } from '../../services/coverage-calculator'

const CATEGORY_ICONS: Record<ToolCategory, React.ReactNode> = {
  SAST: <CodeIcon />,
  secrets: <KeyIcon />,
  SCA: <BugIcon />,
  DAST: <SecurityIcon />,
  IaC: <CloudIcon />,
  container: <StorageIcon />,
  other: <SecurityIcon />,
}

const CATEGORY_COLORS: Record<ToolCategory, string> = {
  SAST: '#2196f3',
  secrets: '#9c27b0',
  SCA: '#ff9800',
  DAST: '#4caf50',
  IaC: '#00bcd4',
  container: '#607d8b',
  other: '#795548',
}

interface ToolSelectionStepProps {
  onNext: (tools: SelectedTool[]) => void
  onBack: () => void
  baseline: Baseline
  initialTools?: SelectedTool[]
}

export function ToolSelectionStep({
  onNext,
  onBack,
  baseline,
  initialTools = [],
}: ToolSelectionStepProps) {
  const [availableTools, setAvailableTools] = useState<ToolControlMapping[]>([])
  const [selectedToolIds, setSelectedToolIds] = useState<Set<string>>(
    new Set(initialTools.map((t) => t.toolId))
  )
  const [loading, setLoading] = useState(true)
  const [coverageStats, setCoverageStats] = useState({
    total: 0,
    covered: 0,
    partial: 0,
    uncovered: 0,
  })

  useEffect(() => {
    async function loadData() {
      try {
        const tools = await loadToolMappings()
        setAvailableTools(tools)
      } catch (error) {
        console.error('Error loading tools:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    async function updateCoverage() {
      if (availableTools.length === 0) return

      try {
        const catalog = await loadCatalog()
        const selectedTools = availableTools.filter((t) =>
          selectedToolIds.has(t.toolId)
        )
        const coverage = calculateControlCoverage(
          baseline,
          selectedTools,
          catalog
        )
        setCoverageStats(coverage.stats)
      } catch (error) {
        console.error('Error calculating coverage:', error)
      }
    }

    updateCoverage()
  }, [selectedToolIds, availableTools, baseline])

  const handleToolToggle = (toolId: string) => {
    setSelectedToolIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(toolId)) {
        newSet.delete(toolId)
      } else {
        newSet.add(toolId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    setSelectedToolIds(new Set(availableTools.map((t) => t.toolId)))
  }

  const handleClearAll = () => {
    setSelectedToolIds(new Set())
  }

  const handleNext = () => {
    const selectedTools: SelectedTool[] = availableTools
      .filter((t) => selectedToolIds.has(t.toolId))
      .map((t) => ({
        toolId: t.toolId,
        toolName: t.toolName,
      }))
    onNext(selectedTools)
  }

  const coveragePercentage =
    coverageStats.total > 0
      ? Math.round(
          ((coverageStats.covered + coverageStats.partial * 0.5) /
            coverageStats.total) *
            100
        )
      : 0

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
        Step 3: Select Security Tools
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Select the security tools your organization uses. Each tool provides
        coverage for specific NIST 800-53 controls.
      </Typography>

      {/* Coverage Preview */}
      <Card sx={{ mb: 3, bgcolor: 'grey.50' }}>
        <CardContent>
          <Typography variant="subtitle2" gutterBottom>
            Control Coverage Preview
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <LinearProgress
              variant="determinate"
              value={coveragePercentage}
              sx={{ flexGrow: 1, height: 10, borderRadius: 5 }}
              color={
                coveragePercentage > 60
                  ? 'success'
                  : coveragePercentage > 30
                    ? 'warning'
                    : 'error'
              }
            />
            <Typography variant="body2" sx={{ minWidth: 45 }}>
              {coveragePercentage}%
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip
              label={`${coverageStats.covered} Covered`}
              size="small"
              color="success"
              variant="outlined"
            />
            <Chip
              label={`${coverageStats.partial} Partial`}
              size="small"
              color="warning"
              variant="outlined"
            />
            <Chip
              label={`${coverageStats.uncovered} Uncovered`}
              size="small"
              color="error"
              variant="outlined"
            />
            <Chip
              label={`${coverageStats.total} Total Controls`}
              size="small"
              variant="outlined"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
        <Button size="small" onClick={handleSelectAll}>
          Select All
        </Button>
        <Button size="small" onClick={handleClearAll}>
          Clear All
        </Button>
        <Typography variant="body2" sx={{ ml: 'auto', alignSelf: 'center' }}>
          {selectedToolIds.size} of {availableTools.length} tools selected
        </Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Tool Grid */}
      <Grid container spacing={2}>
        {availableTools.map((tool) => (
          <Grid item xs={12} sm={6} md={4} key={tool.toolId}>
            <Card
              sx={{
                height: '100%',
                border: selectedToolIds.has(tool.toolId)
                  ? `2px solid ${CATEGORY_COLORS[tool.category]}`
                  : '2px solid transparent',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: 3,
                },
              }}
            >
              <CardContent>
                <Box
                  sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedToolIds.has(tool.toolId)}
                        onChange={() => handleToolToggle(tool.toolId)}
                      />
                    }
                    label=""
                    sx={{ mr: 0 }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                    >
                      <Box sx={{ color: CATEGORY_COLORS[tool.category] }}>
                        {CATEGORY_ICONS[tool.category]}
                      </Box>
                      <Typography variant="subtitle1" component="span">
                        {tool.toolName}
                      </Typography>
                    </Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      {tool.vendor}
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      <Chip
                        label={tool.category}
                        size="small"
                        sx={{
                          backgroundColor: CATEGORY_COLORS[tool.category],
                          color: 'white',
                          fontSize: '0.7rem',
                        }}
                      />
                      <Chip
                        label={`${tool.controlMappings.length} controls`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {selectedToolIds.size === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Select at least one tool to see control coverage. You can also proceed
          without tools and manually address all controls.
        </Alert>
      )}

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={onBack}>Back</Button>
        <Button variant="contained" color="primary" onClick={handleNext}>
          Next
        </Button>
      </Box>
    </Box>
  )
}
