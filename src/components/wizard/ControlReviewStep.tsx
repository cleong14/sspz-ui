import { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Typography,
  Button,
  Chip,
  CircularProgress,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  TablePagination,
} from '@mui/material'
import {
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material'
import { Baseline, SelectedTool } from '../../types/ssp'
import { OSCALControl } from '../../types/oscal'
import { loadCatalog, getBaselineControls } from '../../services/oscal-catalog'
import { loadToolMappings } from '../../services/tool-mappings'
import {
  calculateControlCoverage,
  CoverageStatus,
  ControlCoverage,
} from '../../services/coverage-calculator'

interface ControlWithCoverage extends OSCALControl {
  coverage: ControlCoverage
}

type FilterStatus = 'all' | CoverageStatus

interface ControlReviewStepProps {
  onNext: () => void
  onBack: () => void
  baseline: Baseline
  selectedTools: SelectedTool[]
}

export function ControlReviewStep({
  onNext,
  onBack,
  baseline,
  selectedTools,
}: ControlReviewStepProps) {
  const [loading, setLoading] = useState(true)
  const [controls, setControls] = useState<ControlWithCoverage[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)

  useEffect(() => {
    async function loadData() {
      try {
        const [catalog, allTools] = await Promise.all([
          loadCatalog(),
          loadToolMappings(),
        ])

        // Get selected tool mappings
        const toolMappings = allTools.filter((t) =>
          selectedTools.some((st) => st.toolId === t.toolId)
        )

        // Get baseline controls
        const baselineControls = getBaselineControls(catalog, baseline)

        // Calculate coverage
        const coverageReport = calculateControlCoverage(
          baseline,
          toolMappings,
          catalog
        )

        // Combine controls with coverage info
        const controlsWithCoverage: ControlWithCoverage[] =
          baselineControls.map((control) => {
            const coverage = coverageReport.coverage.find(
              (c) => c.controlId === control.id
            ) || {
              controlId: control.id,
              status: 'uncovered' as CoverageStatus,
              tools: [],
            }
            return { ...control, coverage }
          })

        setControls(controlsWithCoverage)
      } catch (error) {
        console.error('Error loading controls:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [baseline, selectedTools])

  const filteredControls = useMemo(() => {
    return controls.filter((control) => {
      // Apply status filter
      if (filterStatus !== 'all' && control.coverage.status !== filterStatus) {
        return false
      }

      // Apply search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        return (
          control.id.toLowerCase().includes(term) ||
          control.title.toLowerCase().includes(term) ||
          control.coverage.tools.some((t) => t.toLowerCase().includes(term))
        )
      }

      return true
    })
  }, [controls, filterStatus, searchTerm])

  const stats = useMemo(() => {
    const total = controls.length
    const covered = controls.filter(
      (c) => c.coverage.status === 'covered'
    ).length
    const partial = controls.filter(
      (c) => c.coverage.status === 'partial'
    ).length
    const uncovered = controls.filter(
      (c) => c.coverage.status === 'uncovered'
    ).length

    return { total, covered, partial, uncovered }
  }, [controls])

  const getStatusChip = (status: CoverageStatus) => {
    const config = {
      covered: { label: 'Covered', color: 'success' as const },
      partial: { label: 'Partial', color: 'warning' as const },
      uncovered: { label: 'Uncovered', color: 'error' as const },
    }
    return (
      <Chip
        label={config[status].label}
        color={config[status].color}
        size="small"
      />
    )
  }

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
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
        Step 4: Review Control Coverage
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Review which controls are covered by your selected tools. Uncovered
        controls will need manual implementation descriptions.
      </Typography>

      {/* Stats Summary */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Chip
          icon={<CheckCircleIcon />}
          label={`${stats.covered} Covered`}
          color="success"
          variant="outlined"
          onClick={() => setFilterStatus('covered')}
        />
        <Chip
          icon={<WarningIcon />}
          label={`${stats.partial} Partial`}
          color="warning"
          variant="outlined"
          onClick={() => setFilterStatus('partial')}
        />
        <Chip
          icon={<CancelIcon />}
          label={`${stats.uncovered} Uncovered`}
          color="error"
          variant="outlined"
          onClick={() => setFilterStatus('uncovered')}
        />
        <Chip
          label={`${stats.total} Total`}
          variant="outlined"
          onClick={() => setFilterStatus('all')}
        />
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search controls..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 250 }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status Filter</InputLabel>
          <Select
            value={filterStatus}
            label="Status Filter"
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="covered">Covered</MenuItem>
            <MenuItem value="partial">Partial</MenuItem>
            <MenuItem value="uncovered">Uncovered</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Control Table */}
      <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', width: 100 }}>
                Control ID
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: 100 }}>
                Status
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Providing Tools</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredControls
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((control) => (
                <TableRow key={control.id} hover>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: 'monospace' }}
                    >
                      {control.id.toUpperCase()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip
                      title={control.parts?.[0]?.prose || 'No description'}
                      placement="top"
                    >
                      <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                        {control.title}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    {getStatusChip(control.coverage.status)}
                  </TableCell>
                  <TableCell>
                    {control.coverage.tools.length > 0 ? (
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {control.coverage.tools.map((tool) => (
                          <Chip
                            key={tool}
                            label={tool}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        None
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={filteredControls.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={onBack}>Back</Button>
        <Button variant="contained" color="primary" onClick={onNext}>
          Next
        </Button>
      </Box>
    </Box>
  )
}
