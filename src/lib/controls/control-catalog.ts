/**
 * Control Catalog Service
 * @module lib/controls/control-catalog
 *
 * Service for loading and managing NIST 800-53 control catalog data.
 *
 * Story: 3.3 - Build Control Catalog Browse Page
 */

import type { ControlCatalog, Control, ControlFamily } from '@/types/control'

// Cache for loaded data
let catalogCache: ControlCatalog | null = null
let familiesCache: { families: ControlFamily[]; familyIds: string[] } | null =
  null

/**
 * Load the NIST 800-53 Rev 5 control catalog
 */
export async function loadControlCatalog(): Promise<ControlCatalog> {
  if (catalogCache) {
    return catalogCache
  }

  const response = await fetch('/data/nist-800-53-rev5.json')
  if (!response.ok) {
    throw new Error(`Failed to load control catalog: ${response.statusText}`)
  }

  catalogCache = await response.json()
  return catalogCache!
}

/**
 * Load the control families index
 */
export async function loadControlFamilies(): Promise<{
  families: ControlFamily[]
  familyIds: string[]
}> {
  if (familiesCache) {
    return familiesCache
  }

  const response = await fetch('/data/control-families.json')
  if (!response.ok) {
    throw new Error(`Failed to load control families: ${response.statusText}`)
  }

  familiesCache = await response.json()
  return familiesCache!
}

/**
 * Get controls for a specific family
 */
export function getControlsByFamily(
  catalog: ControlCatalog,
  familyId: string
): Control[] {
  if (!catalog.controls) return []
  return catalog.controls.filter((c) => c.family === familyId)
}

/**
 * Get a specific control by ID
 */
export function getControlById(
  catalog: ControlCatalog,
  controlId: string
): Control | undefined {
  if (!catalog.controls) return undefined
  return catalog.controls.find((c) => c.id === controlId)
}

/**
 * Get family metadata
 */
export function getFamilyById(
  families: ControlFamily[],
  familyId: string
): ControlFamily | undefined {
  return families.find((f) => f.id === familyId)
}

/**
 * Clear the cache (useful for testing)
 */
export function clearCache(): void {
  catalogCache = null
  familiesCache = null
}

/**
 * Check if a control is in a specific baseline
 */
export function isInBaseline(
  control: Control,
  baseline: 'low' | 'moderate' | 'high'
): boolean {
  if (typeof control.baselines === 'object' && 'low' in control.baselines) {
    return control.baselines[baseline]
  }
  return false
}

/**
 * Get baseline badges for a control
 */
export function getBaselineBadges(control: Control): string[] {
  const badges: string[] = []
  if (typeof control.baselines === 'object' && 'low' in control.baselines) {
    if (control.baselines.low) badges.push('Low')
    if (control.baselines.moderate) badges.push('Moderate')
    if (control.baselines.high) badges.push('High')
  }
  return badges
}

/**
 * Search result with match information
 */
export interface SearchResult {
  control: Control
  matchType: 'id' | 'title' | 'description' | 'guidance'
  matchScore: number
}

/**
 * Search controls by ID, title, or description
 * Returns results sorted by relevance (match score)
 *
 * Story: 3.4 - Implement Control Search
 */
export function searchControls(
  controls: Control[],
  query: string
): SearchResult[] {
  if (!query.trim()) {
    return []
  }

  const normalizedQuery = query.toLowerCase().trim()
  const results: SearchResult[] = []

  for (const control of controls) {
    // Check ID match (highest priority)
    if (control.id.toLowerCase().includes(normalizedQuery)) {
      const exactMatch = control.id.toLowerCase() === normalizedQuery
      results.push({
        control,
        matchType: 'id',
        matchScore: exactMatch ? 100 : 90,
      })
      continue
    }

    // Check title match (high priority)
    if (control.title.toLowerCase().includes(normalizedQuery)) {
      const wordMatch = control.title
        .toLowerCase()
        .split(/\s+/)
        .some((word) => word.startsWith(normalizedQuery))
      results.push({
        control,
        matchType: 'title',
        matchScore: wordMatch ? 80 : 70,
      })
      continue
    }

    // Check description match (medium priority)
    if (control.description?.toLowerCase().includes(normalizedQuery)) {
      results.push({
        control,
        matchType: 'description',
        matchScore: 50,
      })
      continue
    }

    // Check guidance match (lower priority)
    if (control.guidance?.toLowerCase().includes(normalizedQuery)) {
      results.push({
        control,
        matchType: 'guidance',
        matchScore: 30,
      })
    }
  }

  // Sort by match score (highest first)
  return results.sort((a, b) => b.matchScore - a.matchScore)
}

/**
 * Filter controls by search query (simpler version that returns just controls)
 */
export function filterControlsBySearch(
  controls: Control[],
  query: string
): Control[] {
  if (!query.trim()) {
    return controls
  }

  const results = searchControls(controls, query)
  return results.map((r) => r.control)
}

/**
 * Highlight matching text in a string
 */
export function highlightMatch(text: string, query: string): string {
  if (!query.trim()) {
    return text
  }

  const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

/**
 * Escape special regex characters
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Baseline filter type
 */
export type BaselineFilterValue =
  | 'all'
  | 'low'
  | 'moderate'
  | 'high'
  | 'fedramp_low'
  | 'fedramp_moderate'
  | 'fedramp_high'
  | 'fedramp_li_saas'

// Cache for FedRAMP baselines
let fedRampCache: {
  low: Set<string>
  moderate: Set<string>
  high: Set<string>
  liSaas: Set<string>
} | null = null

/**
 * Load FedRAMP baselines data
 */
export async function loadFedRampBaselines(): Promise<{
  low: Set<string>
  moderate: Set<string>
  high: Set<string>
  liSaas: Set<string>
}> {
  if (fedRampCache) {
    return fedRampCache
  }

  try {
    const response = await fetch('/data/fedramp-baselines.json')
    if (!response.ok) {
      throw new Error('Failed to load FedRAMP baselines')
    }

    const data = await response.json()
    fedRampCache = {
      low: new Set(
        data.baselines.find((b: { id: string }) => b.id === 'FEDRAMP_LOW')
          ?.controlIds || []
      ),
      moderate: new Set(
        data.baselines.find((b: { id: string }) => b.id === 'FEDRAMP_MODERATE')
          ?.controlIds || []
      ),
      high: new Set(
        data.baselines.find((b: { id: string }) => b.id === 'FEDRAMP_HIGH')
          ?.controlIds || []
      ),
      liSaas: new Set(
        data.baselines.find((b: { id: string }) => b.id === 'FEDRAMP_LI_SAAS')
          ?.controlIds || []
      ),
    }

    return fedRampCache
  } catch {
    // Return empty sets if FedRAMP data not available
    return {
      low: new Set(),
      moderate: new Set(),
      high: new Set(),
      liSaas: new Set(),
    }
  }
}

/**
 * Filter controls by baseline
 *
 * Story: 3.6 - Implement Baseline Filter
 */
export function filterControlsByBaseline(
  controls: Control[],
  baseline: BaselineFilterValue,
  fedRampBaselines?: {
    low: Set<string>
    moderate: Set<string>
    high: Set<string>
    liSaas: Set<string>
  }
): Control[] {
  if (baseline === 'all') {
    return controls
  }

  // NIST baselines
  if (baseline === 'low' || baseline === 'moderate' || baseline === 'high') {
    return controls.filter((control) => {
      // Handle BaselineApplicability object type
      if (
        typeof control.baselines === 'object' &&
        !Array.isArray(control.baselines) &&
        'low' in control.baselines
      ) {
        return control.baselines[baseline]
      }
      return false
    })
  }

  // FedRAMP baselines (require fedRampBaselines data)
  if (!fedRampBaselines) {
    return controls
  }

  switch (baseline) {
    case 'fedramp_low':
      return controls.filter((c) => fedRampBaselines.low.has(c.id))
    case 'fedramp_moderate':
      return controls.filter((c) => fedRampBaselines.moderate.has(c.id))
    case 'fedramp_high':
      return controls.filter((c) => fedRampBaselines.high.has(c.id))
    case 'fedramp_li_saas':
      return controls.filter((c) => fedRampBaselines.liSaas.has(c.id))
    default:
      return controls
  }
}
