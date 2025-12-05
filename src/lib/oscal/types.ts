/**
 * OSCAL SSP Type Definitions
 * @module lib/oscal/types
 *
 * These types define the OSCAL System Security Plan structure
 * following NIST OSCAL v1.1.3 specification.
 *
 * Story: 6.1 - Implement OSCAL SSP Generator
 */

// ============================================================================
// Common OSCAL Types
// ============================================================================

/**
 * A property with a name and value
 */
export interface OscalProperty {
  name: string
  value: string
  class?: string
  ns?: string
  uuid?: string
}

/**
 * A link to another resource
 */
export interface OscalLink {
  href: string
  rel?: string
  text?: string
  'media-type'?: string
}

/**
 * A role definition
 */
export interface OscalRole {
  id: string
  title: string
  'short-name'?: string
  description?: string
}

/**
 * Party (organization or person)
 */
export interface OscalParty {
  uuid: string
  type: 'organization' | 'person'
  name?: string
  'short-name'?: string
  'email-addresses'?: string[]
  'telephone-numbers'?: Array<{ type?: string; number: string }>
  addresses?: OscalAddress[]
}

/**
 * Address information
 */
export interface OscalAddress {
  type?: string
  'addr-lines'?: string[]
  city?: string
  state?: string
  'postal-code'?: string
  country?: string
}

/**
 * Responsible party assignment
 */
export interface OscalResponsibleParty {
  'role-id': string
  'party-uuids': string[]
}

/**
 * Responsible role reference
 */
export interface OscalResponsibleRole {
  'role-id': string
  'party-uuids'?: string[]
  props?: OscalProperty[]
}

// ============================================================================
// SSP Metadata
// ============================================================================

/**
 * Document metadata section
 */
export interface OscalMetadata {
  title: string
  'last-modified': string
  version: string
  'oscal-version': string
  revisions?: OscalRevision[]
  roles?: OscalRole[]
  parties?: OscalParty[]
  'responsible-parties'?: OscalResponsibleParty[]
  props?: OscalProperty[]
  links?: OscalLink[]
  remarks?: string
}

/**
 * Revision history entry
 */
export interface OscalRevision {
  title?: string
  published?: string
  'last-modified'?: string
  version?: string
  'oscal-version'?: string
  props?: OscalProperty[]
}

// ============================================================================
// Import Profile
// ============================================================================

/**
 * Import profile reference
 */
export interface OscalImportProfile {
  href: string
  remarks?: string
}

// ============================================================================
// System Characteristics
// ============================================================================

/**
 * System identifier
 */
export interface OscalSystemId {
  'identifier-type'?: string
  id: string
}

/**
 * Security impact level
 */
export interface OscalSecurityImpactLevel {
  'security-objective-confidentiality': string
  'security-objective-integrity': string
  'security-objective-availability': string
}

/**
 * Information type categorization
 */
export interface OscalCategorization {
  system: string
  'information-type-ids'?: string[]
}

/**
 * Impact level for information type
 */
export interface OscalImpact {
  base: string
  selected?: string
  'adjustment-justification'?: string
}

/**
 * Information type definition
 */
export interface OscalInformationType {
  uuid: string
  title: string
  description: string
  categorizations?: OscalCategorization[]
  'confidentiality-impact': OscalImpact
  'integrity-impact': OscalImpact
  'availability-impact': OscalImpact
}

/**
 * System information section
 */
export interface OscalSystemInformation {
  'information-types': OscalInformationType[]
  props?: OscalProperty[]
}

/**
 * Authorization boundary
 */
export interface OscalAuthorizationBoundary {
  description: string
  props?: OscalProperty[]
  links?: OscalLink[]
  diagrams?: OscalDiagram[]
  remarks?: string
}

/**
 * Diagram reference
 */
export interface OscalDiagram {
  uuid: string
  description?: string
  props?: OscalProperty[]
  links?: OscalLink[]
  caption?: string
}

/**
 * System status
 */
export interface OscalStatus {
  state:
    | 'operational'
    | 'under-development'
    | 'under-major-modification'
    | 'disposition'
    | 'other'
  remarks?: string
}

/**
 * System characteristics section
 */
export interface OscalSystemCharacteristics {
  'system-ids': OscalSystemId[]
  'system-name': string
  'system-name-short'?: string
  description: string
  props?: OscalProperty[]
  links?: OscalLink[]
  'date-authorized'?: string
  'security-sensitivity-level'?: string
  'system-information': OscalSystemInformation
  'security-impact-level': OscalSecurityImpactLevel
  status: OscalStatus
  'authorization-boundary': OscalAuthorizationBoundary
  'network-architecture'?: OscalAuthorizationBoundary
  'data-flow'?: OscalAuthorizationBoundary
  'responsible-parties'?: OscalResponsibleParty[]
  remarks?: string
}

// ============================================================================
// System Implementation
// ============================================================================

/**
 * System user definition
 */
export interface OscalUser {
  uuid: string
  title?: string
  'short-name'?: string
  description?: string
  props?: OscalProperty[]
  'role-ids'?: string[]
  'authorized-privileges'?: OscalPrivilege[]
}

/**
 * User privilege
 */
export interface OscalPrivilege {
  title: string
  description?: string
  'functions-performed': string[]
}

/**
 * System component
 */
export interface OscalComponent {
  uuid: string
  type: string
  title: string
  description: string
  purpose?: string
  props?: OscalProperty[]
  links?: OscalLink[]
  status: OscalStatus
  'responsible-roles'?: OscalResponsibleRole[]
  protocols?: OscalProtocol[]
  remarks?: string
}

/**
 * Protocol definition
 */
export interface OscalProtocol {
  uuid?: string
  name: string
  title?: string
  'port-ranges'?: OscalPortRange[]
}

/**
 * Port range definition
 */
export interface OscalPortRange {
  start: number
  end: number
  transport: 'TCP' | 'UDP'
}

/**
 * Inventory item
 */
export interface OscalInventoryItem {
  uuid: string
  description: string
  props?: OscalProperty[]
  links?: OscalLink[]
  'responsible-parties'?: OscalResponsibleParty[]
  'implemented-components'?: OscalImplementedComponent[]
  remarks?: string
}

/**
 * Implemented component reference
 */
export interface OscalImplementedComponent {
  'component-uuid': string
  props?: OscalProperty[]
  links?: OscalLink[]
  remarks?: string
}

/**
 * System implementation section
 */
export interface OscalSystemImplementation {
  users: OscalUser[]
  components: OscalComponent[]
  'inventory-items'?: OscalInventoryItem[]
  'leveraged-authorizations'?: OscalLeveragedAuthorization[]
  remarks?: string
}

/**
 * Leveraged authorization (for inherited controls)
 */
export interface OscalLeveragedAuthorization {
  uuid: string
  title: string
  props?: OscalProperty[]
  links?: OscalLink[]
  'party-uuid': string
  'date-authorized': string
  remarks?: string
}

// ============================================================================
// Control Implementation
// ============================================================================

/**
 * Set parameter value
 */
export interface OscalSetParameter {
  'param-id': string
  values: string[]
  remarks?: string
}

/**
 * Statement implementation
 */
export interface OscalStatement {
  'statement-id': string
  uuid: string
  props?: OscalProperty[]
  links?: OscalLink[]
  'responsible-roles'?: OscalResponsibleRole[]
  'by-components'?: OscalByComponent[]
  remarks?: string
}

/**
 * Implementation by component
 */
export interface OscalByComponent {
  'component-uuid': string
  uuid: string
  description: string
  props?: OscalProperty[]
  links?: OscalLink[]
  'set-parameters'?: OscalSetParameter[]
  'implementation-status'?: OscalImplementationStatus
  'responsible-roles'?: OscalResponsibleRole[]
  remarks?: string
}

/**
 * Implementation status
 */
export interface OscalImplementationStatus {
  state:
    | 'implemented'
    | 'partial'
    | 'planned'
    | 'alternative'
    | 'not-applicable'
  remarks?: string
}

/**
 * Implemented requirement (control implementation)
 */
export interface OscalImplementedRequirement {
  uuid: string
  'control-id': string
  props?: OscalProperty[]
  links?: OscalLink[]
  'set-parameters'?: OscalSetParameter[]
  'responsible-roles'?: OscalResponsibleRole[]
  statements?: OscalStatement[]
  'by-components'?: OscalByComponent[]
  remarks?: string
}

/**
 * Control implementation section
 */
export interface OscalControlImplementation {
  description: string
  'set-parameters'?: OscalSetParameter[]
  'implemented-requirements': OscalImplementedRequirement[]
}

// ============================================================================
// Back Matter
// ============================================================================

/**
 * Resource in back matter
 */
export interface OscalResource {
  uuid: string
  title?: string
  description?: string
  props?: OscalProperty[]
  'document-ids'?: Array<{ scheme?: string; identifier: string }>
  citation?: {
    text: string
    props?: OscalProperty[]
    links?: OscalLink[]
  }
  rlinks?: Array<{
    href: string
    'media-type'?: string
    hashes?: Array<{ algorithm: string; value: string }>
  }>
  base64?: {
    filename?: string
    'media-type'?: string
    value: string
  }
  remarks?: string
}

/**
 * Back matter section
 */
export interface OscalBackMatter {
  resources?: OscalResource[]
}

// ============================================================================
// Complete SSP Document
// ============================================================================

/**
 * Complete OSCAL System Security Plan
 */
export interface OscalSystemSecurityPlan {
  uuid: string
  metadata: OscalMetadata
  'import-profile': OscalImportProfile
  'system-characteristics': OscalSystemCharacteristics
  'system-implementation': OscalSystemImplementation
  'control-implementation': OscalControlImplementation
  'back-matter'?: OscalBackMatter
}

/**
 * Root OSCAL SSP document wrapper
 */
export interface OscalSspDocument {
  'system-security-plan': OscalSystemSecurityPlan
}

// ============================================================================
// Export Format Options
// ============================================================================

/**
 * Supported OSCAL export formats
 */
export type OscalFormat = 'json' | 'yaml' | 'xml'

/**
 * Export options
 */
export interface OscalExportOptions {
  /** Output format */
  format: OscalFormat
  /** Whether to include FedRAMP extensions */
  fedramp?: boolean
  /** Whether to pretty-print output */
  prettyPrint?: boolean
  /** Custom profile href (defaults to NIST baseline) */
  profileHref?: string
}
