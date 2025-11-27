/**
 * Tool Library Type Definitions
 * @module types/tool
 *
 * These types define security tools and their control mappings
 * for auto-populating SSP implementations.
 */

/**
 * Security tool category.
 */
export type ToolCategory =
  | 'vulnerability-scanner'
  | 'sast'
  | 'dast'
  | 'secrets-detection'
  | 'container-security'
  | 'iac-scanner'
  | 'siem'
  | 'identity'
  | 'endpoint'
  | 'network'
  | 'backup'
  | 'encryption'
  | 'monitoring'
  | 'other'

/**
 * Confidence level for tool-to-control mappings.
 */
export type MappingConfidence = 'HIGH' | 'MEDIUM' | 'LOW'

/**
 * Source of the control mapping.
 */
export type MappingSource = 'vendor-docs' | 'community' | 'generated' | 'manual'

/**
 * Mapping between a tool and a specific control.
 */
export interface ToolControlMapping {
  /** Control ID this mapping applies to (e.g., "RA-5") */
  controlId: string
  /** Pre-written implementation statement template */
  implementationTemplate: string
  /** Confidence level of this mapping */
  confidence: MappingConfidence
  /** Source of this mapping */
  source: MappingSource
  /** Additional notes about the mapping */
  notes?: string
}

/**
 * Security tool definition.
 */
export interface Tool {
  /** Unique tool identifier */
  id: string
  /** Tool display name */
  name: string
  /** URL-friendly slug */
  slug: string
  /** Tool description */
  description: string
  /** Tool category */
  category: ToolCategory
  /** URL to tool logo (optional) */
  logoUrl?: string
  /** Tool website URL (optional) */
  websiteUrl?: string
  /** Tool vendor/organization */
  vendor?: string
  /** Whether this is an open source tool */
  openSource?: boolean
  /** Control mappings for this tool */
  mappings: ToolControlMapping[]
  /** Tags for searching */
  tags?: string[]
}

/**
 * Complete tool library structure.
 */
export interface ToolLibrary {
  /** Library version */
  version: string
  /** Last update timestamp (ISO 8601) */
  lastUpdated: string
  /** Tools in the library */
  tools: Tool[]
}

/**
 * Tool selection with approval status for SSP.
 */
export interface ToolSelection {
  /** Tool ID */
  toolId: string
  /** When the tool was selected */
  selectedAt: string
  /** Mapping approvals */
  approvals: MappingApproval[]
}

/**
 * Approval status for a tool-to-control mapping.
 */
export interface MappingApproval {
  /** Control ID */
  controlId: string
  /** Approval status */
  status: 'pending' | 'approved' | 'modified' | 'rejected'
  /** Modified implementation text (if status is 'modified') */
  modifiedText?: string
  /** Timestamp of the action */
  actionAt?: string
}

/**
 * Summary of pending tool mapping approvals.
 */
export interface PendingApprovalsSummary {
  /** Total pending approvals */
  totalPending: number
  /** Pending by confidence level */
  byConfidence: {
    high: number
    medium: number
    low: number
  }
  /** Tools with pending approvals */
  toolsWithPending: string[]
}
