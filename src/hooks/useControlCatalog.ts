/**
 * Control Catalog Hook
 * @module hooks/useControlCatalog
 *
 * Custom hook for loading and working with NIST 800-53 control catalog data.
 * Provides real control families, controls, and baseline filtering.
 */
import { useState, useEffect, useCallback, useMemo } from 'react'
import type { Control, ControlFamily } from '@/types/control'
import type { Baseline } from '@/types/ssp'

// ============================================================================
// Types
// ============================================================================

interface ControlCatalogData {
  version: string
  generatedAt: string
  source: string
  sourceUrl: string
  controls: CatalogControl[]
}

interface CatalogControl {
  id: string
  family: string
  title: string
  description: string
  baselines: {
    low: boolean
    moderate: boolean
    high: boolean
  }
  guidance?: string
  parameters?: CatalogParameter[]
  relatedControls?: string[]
  enhancements?: string[]
  parentControl?: string
}

interface CatalogParameter {
  id: string
  label?: string
  guidelines?: string
  select?: {
    howMany: string
    choices: string[]
  }
}

interface ControlFamiliesData {
  version: string
  generatedAt: string
  catalogVersion: string
  families: CatalogFamily[]
  familyIds: string[]
}

interface CatalogFamily {
  id: string
  name: string
  description: string
  totalControls: number
  baseControls: number
  byBaseline: {
    low: number
    moderate: number
    high: number
  }
}

interface FedRampBaselinesData {
  version: string
  generatedAt: string
  source: string
  sourceUrl: string
  baselines: FedRampBaseline[]
}

interface FedRampBaseline {
  id: string
  name: string
  description: string
  controlCount: number
  controlIds: string[]
  parameterDefaults: Record<string, string>
}

export interface UseControlCatalogResult {
  families: ControlFamily[]
  controls: Map<string, Control[]>
  allControls: Control[]
  baselineControlIds: Set<string>
  loading: boolean
  error: string | null
  getControlsForFamily: (familyId: string, baseline?: Baseline) => Control[]
  getControlById: (controlId: string) => Control | undefined
  isControlInBaseline: (controlId: string, baseline: Baseline) => boolean
  getBaselineControlCount: (baseline: Baseline) => number
  getFamilyControlCount: (familyId: string, baseline: Baseline) => number
}

// ============================================================================
// Constants
// ============================================================================

const CATALOG_URL = '/data/nist-800-53-rev5.json'
const FAMILIES_URL = '/data/control-families.json'
const BASELINES_URL = '/data/fedramp-baselines.json'

const BASELINE_MAP: Record<Baseline, string> = {
  LOW: 'FEDRAMP_LOW', // Map NIST LOW to FedRAMP LOW
  MODERATE: 'FEDRAMP_MODERATE', // Map NIST MODERATE to FedRAMP MODERATE
  HIGH: 'FEDRAMP_HIGH', // Map NIST HIGH to FedRAMP HIGH
  FEDRAMP_LOW: 'FEDRAMP_LOW',
  FEDRAMP_MODERATE: 'FEDRAMP_MODERATE',
  FEDRAMP_HIGH: 'FEDRAMP_HIGH',
  FEDRAMP_LI_SAAS: 'FEDRAMP_LI_SAAS',
}

/**
 * Normalize control ID for comparison.
 * Converts formats like "IA-2(1)" to "IA-2.1" for consistent matching.
 */
function normalizeControlId(id: string): string {
  return id
    .replace(/\((\d+)\)/g, '.$1') // Convert (1) to .1
    .toUpperCase()
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to load and work with the NIST 800-53 control catalog.
 * @param baseline - The FedRAMP baseline to filter controls by
 */
export function useControlCatalog(
  baseline?: Baseline
): UseControlCatalogResult {
  const [catalogData, setCatalogData] = useState<ControlCatalogData | null>(
    null
  )
  const [familiesData, setFamiliesData] = useState<ControlFamiliesData | null>(
    null
  )
  const [baselinesData, setBaselinesData] =
    useState<FedRampBaselinesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load all catalog data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)

      try {
        const [catalogRes, familiesRes, baselinesRes] = await Promise.all([
          fetch(CATALOG_URL),
          fetch(FAMILIES_URL),
          fetch(BASELINES_URL),
        ])

        if (!catalogRes.ok) {
          throw new Error(
            `Failed to load control catalog: ${catalogRes.statusText}`
          )
        }
        if (!familiesRes.ok) {
          throw new Error(
            `Failed to load control families: ${familiesRes.statusText}`
          )
        }
        if (!baselinesRes.ok) {
          throw new Error(
            `Failed to load baselines: ${baselinesRes.statusText}`
          )
        }

        const [catalog, families, baselines] = await Promise.all([
          catalogRes.json() as Promise<ControlCatalogData>,
          familiesRes.json() as Promise<ControlFamiliesData>,
          baselinesRes.json() as Promise<FedRampBaselinesData>,
        ])

        setCatalogData(catalog)
        setFamiliesData(families)
        setBaselinesData(baselines)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load control catalog'
        )
        console.error('Error loading control catalog:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Transform catalog families to ControlFamily type
  const families = useMemo((): ControlFamily[] => {
    if (!familiesData) return []

    return familiesData.families.map((f) => ({
      id: f.id,
      name: f.name,
      description: f.description,
      totalControls: f.baseControls,
      byBaseline: f.byBaseline,
    }))
  }, [familiesData])

  // Transform all controls to Control type and organize by family
  const { controls, allControls } = useMemo(() => {
    if (!catalogData)
      return { controls: new Map<string, Control[]>(), allControls: [] }

    const controlsByFamily = new Map<string, Control[]>()
    const all: Control[] = []

    for (const ctrl of catalogData.controls) {
      const control: Control = {
        id: ctrl.id,
        family: ctrl.family,
        title: ctrl.title,
        description: ctrl.description,
        baselines: ctrl.baselines,
        guidance: ctrl.guidance,
        parameters: ctrl.parameters?.map((p) => ({
          id: p.id,
          label: p.label || '',
          value: '',
        })),
        relatedControls: ctrl.relatedControls,
        parentControl: ctrl.parentControl,
      }

      all.push(control)

      if (!controlsByFamily.has(ctrl.family)) {
        controlsByFamily.set(ctrl.family, [])
      }
      controlsByFamily.get(ctrl.family)!.push(control)
    }

    return { controls: controlsByFamily, allControls: all }
  }, [catalogData])

  // Get set of control IDs for the selected baseline
  const baselineControlIds = useMemo((): Set<string> => {
    if (!baselinesData || !baseline) return new Set()

    const baselineId = BASELINE_MAP[baseline]
    const baselineInfo = baselinesData.baselines.find(
      (b) => b.id === baselineId
    )

    if (!baselineInfo) return new Set()

    // Normalize control IDs (some have dots, some have parentheses)
    return new Set(baselineInfo.controlIds.map((id) => normalizeControlId(id)))
  }, [baselinesData, baseline])

  // Check if a control is in the current baseline
  const isControlInBaseline = useCallback(
    (controlId: string, targetBaseline: Baseline): boolean => {
      if (!baselinesData) return false

      const baselineId = BASELINE_MAP[targetBaseline]
      const baselineInfo = baselinesData.baselines.find(
        (b) => b.id === baselineId
      )

      if (!baselineInfo) return false

      const normalizedId = normalizeControlId(controlId)
      return baselineInfo.controlIds.some(
        (id) => normalizeControlId(id) === normalizedId
      )
    },
    [baselinesData]
  )

  // Get controls for a specific family, optionally filtered by baseline
  const getControlsForFamily = useCallback(
    (familyId: string, targetBaseline?: Baseline): Control[] => {
      const familyControls = controls.get(familyId) || []

      if (!targetBaseline) return familyControls

      // Filter to only include controls in the baseline
      return familyControls.filter((ctrl) => {
        const normalizedId = normalizeControlId(ctrl.id)

        if (!baselinesData) return true

        const baselineId = BASELINE_MAP[targetBaseline]
        const baselineInfo = baselinesData.baselines.find(
          (b) => b.id === baselineId
        )

        if (!baselineInfo) return true

        return baselineInfo.controlIds.some(
          (id) => normalizeControlId(id) === normalizedId
        )
      })
    },
    [controls, baselinesData]
  )

  // Get a specific control by ID
  const getControlById = useCallback(
    (controlId: string): Control | undefined => {
      return allControls.find(
        (ctrl) => normalizeControlId(ctrl.id) === normalizeControlId(controlId)
      )
    },
    [allControls]
  )

  // Get total control count for a baseline
  const getBaselineControlCount = useCallback(
    (targetBaseline: Baseline): number => {
      if (!baselinesData) return 0

      const baselineId = BASELINE_MAP[targetBaseline]
      const baselineInfo = baselinesData.baselines.find(
        (b) => b.id === baselineId
      )

      return baselineInfo?.controlCount || 0
    },
    [baselinesData]
  )

  // Get control count for a family within a baseline
  const getFamilyControlCount = useCallback(
    (familyId: string, targetBaseline: Baseline): number => {
      return getControlsForFamily(familyId, targetBaseline).length
    },
    [getControlsForFamily]
  )

  return {
    families,
    controls,
    allControls,
    baselineControlIds,
    loading,
    error,
    getControlsForFamily,
    getControlById,
    isControlInBaseline,
    getBaselineControlCount,
    getFamilyControlCount,
  }
}

export default useControlCatalog
