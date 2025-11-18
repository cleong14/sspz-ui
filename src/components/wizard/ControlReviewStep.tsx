import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import { SelectedTool, Baseline } from '../../types/ssp'
import { loadCatalog, getBaselineControls } from '../../services/oscal-catalog'
import { loadToolMappings } from '../../services/tool-mappings'
import {
  calculateControlCoverage,
  ControlCoverage,
  CoverageStatus,
} from '../../services/coverage-calculator'
import { OSCALControl } from '../../types/oscal'

interface ControlReviewStepProps {
  onNext: () => void
  selectedBaseline: Baseline
  selectedTools: SelectedTool[]
}

const statusColors: Record<CoverageStatus, 'success' | 'warning' | 'error'> = {
  covered: 'success',
  partial: 'warning',
  uncovered: 'error',
}

export function ControlReviewStep({
  onNext,
  selectedBaseline,
  selectedTools,
}: ControlReviewStepProps) {
  const [controls, setControls] = useState<OSCALControl[]>([])
  const [coverage, setCoverage] = useState<ControlCoverage[]>([])
  const [filterStatus, setFilterStatus] = useState<CoverageStatus | 'all'>(
    'all'
  )
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([loadCatalog(), loadToolMappings()])
      .then(([catalog, tools]) => {
        const baselineControls = getBaselineControls(catalog, selectedBaseline)
        setControls(baselineControls)

        const selectedToolMappings = tools.filter((t) =>
          selectedTools.some((st) => st.toolId === t.toolId)
        )

        const coverageReport = calculateControlCoverage(
          selectedBaseline,
          selectedToolMappings,
          catalog
        )
        setCoverage(coverageReport.coverage)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load controls:', err)
        setLoading(false)
      })
  }, [selectedBaseline, selectedTools])

  const filteredCoverage =
    filterStatus === 'all'
      ? coverage
      : coverage.filter((c) => c.status === filterStatus)

  const getControlById = (controlId: string) =>
    controls.find((c) => c.id === controlId)

  if (loading) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography>Loading controls...</Typography>
      </Box>
    )
  }

  const stats = {
    total: coverage.length,
    covered: coverage.filter((c) => c.status === 'covered').length,
    partial: coverage.filter((c) => c.status === 'partial').length,
    uncovered: coverage.filter((c) => c.status === 'uncovered').length,
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Step 4: Control Review
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Review security control coverage for {selectedBaseline} baseline
      </Typography>

      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Typography variant="body2">
          Total: {stats.total} | Covered: {stats.covered} | Partial:{' '}
          {stats.partial} | Uncovered: {stats.uncovered}
        </Typography>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={filterStatus}
            label="Filter by Status"
            onChange={(e) =>
              setFilterStatus(e.target.value as CoverageStatus | 'all')
            }
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="covered">Covered</MenuItem>
            <MenuItem value="partial">Partial</MenuItem>
            <MenuItem value="uncovered">Uncovered</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Control ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Tools</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCoverage.map((cov) => {
              const control = getControlById(cov.controlId)
              return (
                <TableRow key={cov.controlId}>
                  <TableCell>{cov.controlId}</TableCell>
                  <TableCell>{control?.title || 'Unknown'}</TableCell>
                  <TableCell>
                    <Chip
                      label={cov.status}
                      color={statusColors[cov.status]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {cov.tools.length > 0 ? cov.tools.join(', ') : '-'}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" color="primary" onClick={onNext}>
          Next
        </Button>
      </Box>
    </Box>
  )
}
