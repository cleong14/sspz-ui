/**
 * Control and Control Implementation Type Definitions
 * @module types/control
 *
 * These types define NIST 800-53 controls (catalog) and their implementations
 * within SSP projects.
 *
 * Story: 1.2 - Create SSP Type Definitions
 * Story: 9.2 - Transform OSCAL to Application Schema
 */

import type { Baseline } from './ssp'

// ============================================================================
// Implementation Types (Story 1.2)
// ============================================================================

/**
 * Implementation status for a control within an SSP.
 */
export type ImplementationStatus =
  | 'NOT_STARTED'
  | 'IMPLEMENTED'
  | 'PARTIALLY_IMPLEMENTED'
  | 'PLANNED'
  | 'NOT_APPLICABLE'

/**
 * AI confidence level for generated suggestions.
 */
export type AiConfidence = 'HIGH' | 'MEDIUM' | 'LOW'

/**
 * Evidence attachment for control implementation.
 */
export interface Evidence {
  /** Unique identifier for the evidence */
  id: string
  /** Evidence title or name */
  title: string
  /** Description of the evidence */
  description?: string
  /** File path or URL reference */
  reference: string
  /** Type of evidence */
  type: 'document' | 'screenshot' | 'log' | 'report' | 'link' | 'other'
  /** Upload timestamp */
  uploadedAt: string
}

/**
 * Inherited control information.
 * Used when a control is inherited from another system.
 */
export interface InheritedControl {
  /** ID of the system providing the control */
  systemId: string
  /** Name of the system providing the control */
  systemName: string
  /** Description of what is inherited */
  description?: string
}

/**
 * Control implementation record within an SSP.
 */
export interface ControlImplementation {
  /** Control ID (e.g., "AC-1", "AC-2(1)") */
  controlId: string
  /** Current implementation status */
  status: ImplementationStatus
  /** Implementation statement narrative */
  statement?: string
  /** Whether this was AI-generated */
  aiGenerated: boolean
  /** AI confidence level (if AI-generated) */
  aiConfidence?: AiConfidence
  /** Control parameter values */
  parameters?: Record<string, string>
  /** Inherited control information (if inherited) */
  inherited?: InheritedControl
  /** Supporting evidence */
  evidence?: Evidence[]
  /** Responsible party or team */
  responsibleRole?: string
  /** Implementation notes (internal) */
  notes?: string
  /** Creation timestamp (ISO 8601) */
  createdAt: string
  /** Last update timestamp (ISO 8601) */
  updatedAt: string
}

/**
 * Summary statistics for control implementation progress.
 */
export interface ImplementationProgress {
  /** Total controls applicable to the SSP */
  total: number
  /** Controls marked as implemented */
  implemented: number
  /** Controls partially implemented */
  partiallyImplemented: number
  /** Controls planned for implementation */
  planned: number
  /** Controls marked as not applicable */
  notApplicable: number
  /** Controls not yet started */
  notStarted: number
  /** Completion percentage */
  percentComplete: number
}

// ============================================================================
// Catalog Types (Story 9.2)
// ============================================================================

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
  /** Description of the parameter */
  description?: string
  /** Suggested values or constraints */
  values?: string[]
  /** Selection options if parameter is a choice */
  select?: {
    howMany?: 'one' | 'one-or-more'
    choices: string[]
  }
  /** FedRAMP-specific guidance or default value */
  fedRampGuidance?: string
  /** Whether this parameter is required */
  required?: boolean
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
  family?: string
  /** Control title */
  title: string
  /** Control description/statement - the actual requirement text */
  description: string
  /** Supplemental guidance providing implementation context */
  guidance?: string
  /** Baseline applicability flags (catalog format) */
  baselines: BaselineApplicability | Baseline[]
  /** Customizable parameters within this control */
  parameters?: ControlParameter[]
  /** Enhancement IDs that belong to this base control (catalog format) */
  enhancements?: string[] | Control[]
  /** Parent control ID (for enhancements only) */
  parentControl?: string
  /** Related control IDs */
  relatedControls?: string[]
  /** Priority for implementation (P1, P2, P3) */
  priority?: string
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
  description?: string
  /** Controls within this family */
  controls?: Control[]
  /** Total number of controls including enhancements */
  totalControls?: number
  /** Number of base controls (no parenthetical) */
  baseControls?: number
  /** Control counts per baseline */
  byBaseline?: {
    low: number
    moderate: number
    high: number
  }
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

/**
 * The complete control catalog containing all controls and families.
 * This is the top-level structure output by the transform script.
 */
export interface ControlCatalog {
  /** Schema version for this catalog format */
  version: string
  /** ISO 8601 timestamp when this file was generated */
  generatedAt?: string
  /** Last update timestamp (ISO 8601) */
  lastUpdated?: string
  /** Source description (e.g., "NIST SP 800-53 Rev 5") */
  source: string
  /** URL to the original source data */
  sourceUrl?: string
  /** All controls in the catalog (flat list) */
  controls?: Control[]
  /** All control families with aggregated statistics */
  families: ControlFamily[]
  /** Summary statistics */
  statistics?: CatalogStatistics
}

// ============================================================================
// FedRAMP Types (Story 1.2)
// ============================================================================

/**
 * FedRAMP-specific baseline extension.
 */
export interface FedRampBaseline {
  /** Baseline identifier */
  id: 'FEDRAMP_LOW' | 'FEDRAMP_MODERATE' | 'FEDRAMP_HIGH' | 'FEDRAMP_LI_SAAS'
  /** Baseline display name */
  name: string
  /** Number of controls in baseline */
  controlCount: number
  /** Control IDs included in this baseline */
  controlIds: string[]
  /** FedRAMP-specific parameter values */
  parameterDefaults?: Record<string, string>
}

/**
 * FedRAMP baselines data structure.
 */
export interface FedRampBaselines {
  /** Data version */
  version: string
  /** Last update timestamp */
  lastUpdated: string
  /** Baseline definitions */
  baselines: FedRampBaseline[]
}
