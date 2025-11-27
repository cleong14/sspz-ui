/**
 * Type definitions for NIST 800-53 control catalog data.
 * These types represent the transformed/optimized application schema.
 *
 * Story: 9.2 - Transform OSCAL to Application Schema
 */

/**
 * A control parameter that can be customized during implementation.
 * Parameters are placeholders in control text that organizations
 * must define (e.g., time periods, frequencies, specific values).
 */
export interface ControlParameter {
  /** Parameter ID (e.g., "ac-1_prm_1") */
  id: string
  /** Human-readable label describing the parameter */
  label?: string
  /** Usage guidelines for the parameter */
  guidelines?: string
  /** Suggested values or constraints */
  values?: string[]
  /** Selection options if parameter is a choice */
  select?: {
    howMany?: 'one' | 'one-or-more'
    choices: string[]
  }
}

/**
 * Baseline applicability flags indicating which baselines
 * require this control.
 */
export interface BaselineApplicability {
  /** Control is in NIST 800-53 LOW baseline */
  low: boolean
  /** Control is in NIST 800-53 MODERATE baseline */
  moderate: boolean
  /** Control is in NIST 800-53 HIGH baseline */
  high: boolean
}

/**
 * A NIST 800-53 security control or control enhancement.
 *
 * Controls are the primary security requirements. Enhancements
 * (indicated by parenthetical notation like AC-2(1)) add additional
 * functionality to base controls.
 */
export interface Control {
  /** Control ID (e.g., "AC-1", "AC-2(1)") */
  id: string
  /** Control family code (e.g., "AC") */
  family: string
  /** Control title */
  title: string
  /** Control description/statement - the actual requirement text */
  description: string
  /** Supplemental guidance providing implementation context */
  guidance?: string
  /** Baseline applicability flags */
  baselines: BaselineApplicability
  /** Customizable parameters within this control */
  parameters?: ControlParameter[]
  /** Enhancement IDs that belong to this base control */
  enhancements?: string[]
  /** Parent control ID (for enhancements only) */
  parentControl?: string
  /** Related control IDs */
  relatedControls?: string[]
}

/**
 * A control family grouping related controls.
 * NIST 800-53 Rev 5 has 20 control families.
 */
export interface ControlFamily {
  /** Family code (e.g., "AC") */
  id: string
  /** Family full name (e.g., "Access Control") */
  name: string
  /** Brief description of the family's focus area */
  description: string
  /** Total number of controls including enhancements */
  totalControls: number
  /** Number of base controls (no parenthetical) */
  baseControls: number
  /** Control counts per baseline */
  byBaseline: {
    low: number
    moderate: number
    high: number
  }
}

/**
 * The complete control catalog containing all controls and families.
 * This is the top-level structure output by the transform script.
 */
export interface ControlCatalog {
  /** Schema version for this catalog format */
  version: string
  /** ISO 8601 timestamp when this file was generated */
  generatedAt: string
  /** Source description (e.g., "NIST SP 800-53 Rev 5") */
  source: string
  /** URL to the original source data */
  sourceUrl: string
  /** All controls in the catalog */
  controls: Control[]
  /** All control families with aggregated statistics */
  families: ControlFamily[]
  /** Summary statistics */
  statistics: CatalogStatistics
}

/**
 * Summary statistics for the control catalog.
 */
export interface CatalogStatistics {
  /** Total number of controls including enhancements */
  totalControls: number
  /** Number of base controls (no enhancements) */
  baseControls: number
  /** Number of control enhancements */
  enhancements: number
  /** Number of control families */
  familyCount: number
  /** Controls per baseline */
  byBaseline: {
    low: number
    moderate: number
    high: number
  }
}
