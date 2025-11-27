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
