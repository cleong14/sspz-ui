/**
 * Control Catalog View
 * @module views/Controls/ControlCatalog
 *
 * Displays the NIST 800-53 control catalog for browsing and searching.
 * Features family tabs, control grid, search, detail view, baseline filter,
 * and responsive layout.
 *
 * Story: 3.3 - Build Control Catalog Browse Page
 * Story: 3.4 - Implement Control Search
 * Story: 3.5 - Build Control Detail View
 * Story: 3.6 - Implement Baseline Filter
 */

import * as React from 'react'
import { useSearchParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Alert from '@mui/material/Alert'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import type {
  Control,
  ControlCatalog as ControlCatalogType,
  ControlFamily,
} from '@/types/control'
import {
  loadControlCatalog,
  loadControlFamilies,
  loadFedRampBaselines,
  getControlsByFamily,
  getControlById,
  filterControlsBySearch,
  filterControlsByBaseline,
  type BaselineFilterValue,
} from '@/lib/controls'
import {
  BaselineFilter,
  FamilyTabs,
  ControlGrid,
  ControlSearch,
  ControlDetailSheet,
} from './components'

// Type for FedRAMP baselines data
type FedRampBaselinesData = {
  low: Set<string>
  moderate: Set<string>
  high: Set<string>
  liSaas: Set<string>
}

/**
 * Hook for loading control catalog data
 */
function useControlCatalog() {
  const [catalog, setCatalog] = React.useState<ControlCatalogType | null>(null)
  const [families, setFamilies] = React.useState<ControlFamily[]>([])
  const [fedRampBaselines, setFedRampBaselines] =
    React.useState<FedRampBaselinesData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let mounted = true

    async function loadData() {
      try {
        setLoading(true)
        setError(null)

        const [catalogData, familiesData, fedRampData] = await Promise.all([
          loadControlCatalog(),
          loadControlFamilies(),
          loadFedRampBaselines(),
        ])

        if (mounted) {
          setCatalog(catalogData)
          setFamilies(familiesData.families)
          setFedRampBaselines(fedRampData)
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load control catalog'
          )
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      mounted = false
    }
  }, [])

  return { catalog, families, fedRampBaselines, loading, error }
}

/**
 * Component that renders the control catalog view.
 */
const ControlCatalog: React.FC = (): JSX.Element => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { catalog, families, fedRampBaselines, loading, error } =
    useControlCatalog()
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedControl, setSelectedControl] = React.useState<Control | null>(
    null
  )
  const [detailOpen, setDetailOpen] = React.useState(false)

  // Get selected family from URL or default to first family
  const selectedFamily =
    searchParams.get('family') || (families.length > 0 ? families[0].id : 'AC')

  // Get baseline filter from URL or default to 'all'
  const baselineFilter =
    (searchParams.get('baseline') as BaselineFilterValue) || 'all'

  // Check if we're in search mode (searching across all families)
  const isSearchMode = searchQuery.trim().length > 0

  // Check if baseline filter is active
  const isBaselineFiltered = baselineFilter !== 'all'

  // Get controls for selected family
  const familyControls = React.useMemo(() => {
    if (!catalog) return []
    return getControlsByFamily(catalog, selectedFamily)
  }, [catalog, selectedFamily])

  // Get all controls for search
  const allControls = React.useMemo(() => {
    if (!catalog?.controls) return []
    return catalog.controls
  }, [catalog])

  // Filter controls based on search, family, and baseline
  const displayedControls = React.useMemo(() => {
    let controls: Control[]

    // Start with either all controls (search mode) or family controls
    if (isSearchMode) {
      controls = filterControlsBySearch(allControls, searchQuery)
    } else {
      controls = familyControls
    }

    // Apply baseline filter
    if (isBaselineFiltered && fedRampBaselines) {
      controls = filterControlsByBaseline(
        controls,
        baselineFilter,
        fedRampBaselines
      )
    } else if (isBaselineFiltered) {
      controls = filterControlsByBaseline(controls, baselineFilter)
    }

    return controls
  }, [
    isSearchMode,
    allControls,
    familyControls,
    searchQuery,
    isBaselineFiltered,
    baselineFilter,
    fedRampBaselines,
  ])

  // Get current family info
  const currentFamily = React.useMemo(() => {
    return families.find((f) => f.id === selectedFamily)
  }, [families, selectedFamily])

  // Handle family tab change
  const handleFamilyChange = React.useCallback(
    (familyId: string) => {
      const newParams = new URLSearchParams(searchParams)
      newParams.set('family', familyId)
      setSearchParams(newParams)
      setSearchQuery('') // Clear search when changing families
    },
    [searchParams, setSearchParams]
  )

  // Handle baseline filter change
  const handleBaselineChange = React.useCallback(
    (baseline: BaselineFilterValue) => {
      const newParams = new URLSearchParams(searchParams)
      if (baseline === 'all') {
        newParams.delete('baseline')
      } else {
        newParams.set('baseline', baseline)
      }
      setSearchParams(newParams)
    },
    [searchParams, setSearchParams]
  )

  // Handle search change
  const handleSearchChange = React.useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  // Handle control click - opens detail view
  const handleControlClick = React.useCallback((control: Control) => {
    setSelectedControl(control)
    setDetailOpen(true)
  }, [])

  // Handle detail sheet close
  const handleDetailClose = React.useCallback(() => {
    setDetailOpen(false)
  }, [])

  // Handle related control click (from detail sheet)
  const handleRelatedControlClick = React.useCallback(
    (controlId: string) => {
      if (!catalog) return

      const control = getControlById(catalog, controlId)
      if (control) {
        setSelectedControl(control)
        // Keep detail sheet open, just switch content
      }
    },
    [catalog]
  )

  // Loading state
  if (loading) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Control Catalog
        </Typography>
        <Skeleton variant="rectangular" height={40} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={48} sx={{ mb: 3 }} />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 2,
          }}
        >
          {[...Array(9)].map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={140} />
          ))}
        </Box>
      </Box>
    )
  }

  // Error state
  if (error) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Control Catalog
        </Typography>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Control Catalog
        </Typography>
        <Typography variant="body2" color="text.secondary">
          NIST 800-53 Rev 5 Security and Privacy Controls •{' '}
          {catalog?.statistics?.totalControls.toLocaleString() || 0} controls
          across {families.length} families
        </Typography>
      </Box>

      {/* Search and Filter Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', sm: 'center' }}
        >
          <Box sx={{ flex: 1 }}>
            <ControlSearch
              value={searchQuery}
              onChange={handleSearchChange}
              resultCount={
                isSearchMode || isBaselineFiltered
                  ? displayedControls.length
                  : undefined
              }
            />
          </Box>
          <BaselineFilter
            value={baselineFilter}
            onChange={handleBaselineChange}
            showFedRamp={fedRampBaselines !== null}
          />
        </Stack>
      </Paper>

      {/* Family Tabs - Hidden during search mode */}
      {!isSearchMode && (
        <Paper sx={{ mb: 3 }}>
          <FamilyTabs
            families={families}
            selectedFamily={selectedFamily}
            onFamilyChange={handleFamilyChange}
          />
        </Paper>
      )}

      {/* Family Info - Hidden during search mode */}
      {!isSearchMode && currentFamily && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            {currentFamily.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {currentFamily.description}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isBaselineFiltered
              ? `${displayedControls.length} controls (filtered)`
              : `${familyControls.length} controls`}{' '}
            • {currentFamily.baseControls} base controls •{' '}
            <Box component="span" sx={{ color: 'success.main' }}>
              {currentFamily.byBaseline?.low || 0} Low
            </Box>
            {' • '}
            <Box component="span" sx={{ color: 'warning.main' }}>
              {currentFamily.byBaseline?.moderate || 0} Moderate
            </Box>
            {' • '}
            <Box component="span" sx={{ color: 'error.main' }}>
              {currentFamily.byBaseline?.high || 0} High
            </Box>
          </Typography>
        </Box>
      )}

      {/* Search Results Header */}
      {isSearchMode && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Search Results
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Found {displayedControls.length} controls matching "{searchQuery}"
            {isBaselineFiltered && ' (filtered by baseline)'}
          </Typography>
        </Box>
      )}

      <ControlGrid
        controls={displayedControls}
        onControlClick={handleControlClick}
        emptyMessage={
          isSearchMode
            ? `No controls found matching "${searchQuery}"${isBaselineFiltered ? ' with selected baseline' : ''}`
            : isBaselineFiltered
              ? `No controls in ${selectedFamily} family match the selected baseline`
              : `No controls found in ${selectedFamily} family`
        }
      />

      {/* Control Detail Sheet */}
      <ControlDetailSheet
        control={selectedControl}
        open={detailOpen}
        onClose={handleDetailClose}
        onRelatedControlClick={handleRelatedControlClick}
      />
    </Box>
  )
}

export default ControlCatalog
