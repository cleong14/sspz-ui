/**
 * Control Catalog View
 * @module views/Controls/ControlCatalog
 *
 * Displays the NIST 800-53 control catalog for browsing and searching.
 * Features family tabs, control grid, search, and responsive layout.
 *
 * Story: 3.3 - Build Control Catalog Browse Page
 * Story: 3.4 - Implement Control Search
 */

import * as React from 'react'
import { useSearchParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Alert from '@mui/material/Alert'
import Skeleton from '@mui/material/Skeleton'
import type {
  Control,
  ControlCatalog as ControlCatalogType,
  ControlFamily,
} from '@/types/control'
import {
  loadControlCatalog,
  loadControlFamilies,
  getControlsByFamily,
  filterControlsBySearch,
} from '@/lib/controls'
import { FamilyTabs, ControlGrid, ControlSearch } from './components'

/**
 * Hook for loading control catalog data
 */
function useControlCatalog() {
  const [catalog, setCatalog] = React.useState<ControlCatalogType | null>(null)
  const [families, setFamilies] = React.useState<ControlFamily[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let mounted = true

    async function loadData() {
      try {
        setLoading(true)
        setError(null)

        const [catalogData, familiesData] = await Promise.all([
          loadControlCatalog(),
          loadControlFamilies(),
        ])

        if (mounted) {
          setCatalog(catalogData)
          setFamilies(familiesData.families)
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

  return { catalog, families, loading, error }
}

/**
 * Component that renders the control catalog view.
 */
const ControlCatalog: React.FC = (): JSX.Element => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { catalog, families, loading, error } = useControlCatalog()
  const [searchQuery, setSearchQuery] = React.useState('')

  // Get selected family from URL or default to first family
  const selectedFamily =
    searchParams.get('family') || (families.length > 0 ? families[0].id : 'AC')

  // Check if we're in search mode (searching across all families)
  const isSearchMode = searchQuery.trim().length > 0

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

  // Filter controls based on search (search across all families when in search mode)
  const displayedControls = React.useMemo(() => {
    if (isSearchMode) {
      return filterControlsBySearch(allControls, searchQuery)
    }
    return familyControls
  }, [isSearchMode, allControls, familyControls, searchQuery])

  // Get current family info
  const currentFamily = React.useMemo(() => {
    return families.find((f) => f.id === selectedFamily)
  }, [families, selectedFamily])

  // Handle family tab change
  const handleFamilyChange = React.useCallback(
    (familyId: string) => {
      setSearchParams({ family: familyId })
      setSearchQuery('') // Clear search when changing families
    },
    [setSearchParams]
  )

  // Handle search change
  const handleSearchChange = React.useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  // Handle control click - will open detail view in Story 3.5
  const handleControlClick = React.useCallback((control: Control) => {
    // TODO: Open control detail sheet (Story 3.5)
    console.log('Selected control:', control.id)
  }, [])

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

      {/* Search Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <ControlSearch
          value={searchQuery}
          onChange={handleSearchChange}
          resultCount={isSearchMode ? displayedControls.length : undefined}
        />
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
            {familyControls.length} controls • {currentFamily.baseControls} base
            controls •{' '}
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
          </Typography>
        </Box>
      )}

      <ControlGrid
        controls={displayedControls}
        onControlClick={handleControlClick}
        emptyMessage={
          isSearchMode
            ? `No controls found matching "${searchQuery}"`
            : `No controls found in ${selectedFamily} family`
        }
      />
    </Box>
  )
}

export default ControlCatalog
