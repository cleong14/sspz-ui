/**
 * SSP (System Security Plan) Type Definitions
 * @module types/ssp
 *
 * These types define the core data structures for SSP projects,
 * matching the JSON file schema defined in the architecture document.
 */

import type { ControlImplementation } from './control'

/**
 * Security baseline levels for SSP categorization.
 * Includes both NIST 800-53 and FedRAMP baselines.
 */
export type Baseline =
  | 'LOW'
  | 'MODERATE'
  | 'HIGH'
  | 'FEDRAMP_LOW'
  | 'FEDRAMP_MODERATE'
  | 'FEDRAMP_HIGH'
  | 'FEDRAMP_LI_SAAS'

/**
 * SSP project lifecycle status.
 */
export type SspStatus = 'DRAFT' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETE'

/**
 * FIPS 199 impact levels for security categorization.
 */
export type ImpactLevel = 'LOW' | 'MODERATE' | 'HIGH'

/**
 * Contact information for system stakeholders.
 */
export interface Contact {
  /** Full name of the contact */
  name: string
  /** Job title or role */
  title: string
  /** Email address */
  email: string
  /** Phone number (optional) */
  phone?: string
  /** Organization or department (optional) */
  organization?: string
}

/**
 * System component within the authorization boundary.
 */
export interface SystemComponent {
  /** Unique identifier for the component */
  id: string
  /** Component name */
  name: string
  /** Component description */
  description: string
  /** Component category */
  type: 'hardware' | 'software' | 'service' | 'policy' | 'other'
  /** Vendor or provider (optional) */
  vendor?: string
  /** Version information (optional) */
  version?: string
}

/**
 * External system connection or interface.
 */
export interface ExternalConnection {
  /** Unique identifier for the connection */
  id: string
  /** Name of the external system */
  systemName: string
  /** Organization owning the external system */
  organization: string
  /** Type of connection */
  connectionType: string
  /** Description of data exchanged */
  dataDescription: string
  /** Security requirements for the connection */
  securityRequirements?: string
  /** Authorization status */
  authorizationStatus?: 'authorized' | 'pending' | 'not_required'
}

/**
 * System authorization boundary definition.
 */
export interface SystemBoundary {
  /** Narrative description of the boundary */
  description: string
  /** Components within the boundary */
  components: SystemComponent[]
  /** External connections crossing the boundary */
  externalConnections: ExternalConnection[]
  /** Reference to network diagram (file path or URL) */
  networkDiagramRef?: string
}

/**
 * FIPS 199 security categorization.
 */
export interface SecurityCategorization {
  /** Confidentiality impact level */
  confidentiality: ImpactLevel
  /** Integrity impact level */
  integrity: ImpactLevel
  /** Availability impact level */
  availability: ImpactLevel
  /** Overall system categorization (highest of the three) */
  overall?: ImpactLevel
}

/**
 * System environment and deployment information.
 */
export interface SystemEnvironment {
  /** Deployment model */
  deploymentModel: 'on-premise' | 'cloud' | 'hybrid'
  /** Cloud service provider (if applicable) */
  cloudProvider?: string
  /** Cloud service model (if applicable) */
  cloudServiceModel?: 'IaaS' | 'PaaS' | 'SaaS'
  /** Operating systems in use */
  operatingSystems: string[]
  /** Key technologies and frameworks */
  technologies: string[]
  /** Types of data processed by the system */
  dataTypes: string[]
}

/**
 * System contacts and stakeholders.
 */
export interface SystemContacts {
  /** System owner responsible for the system */
  systemOwner: Contact
  /** Authorizing official for the system */
  authorizingOfficial: Contact
  /** Security point of contact */
  securityPoc: Contact
  /** Technical point of contact */
  technicalPoc: Contact
}

/**
 * Complete system information for an SSP.
 */
export interface SystemInfo {
  /** Official system name */
  systemName: string
  /** System identifier or acronym (optional) */
  systemId?: string
  /** Type of system */
  systemType:
    | 'major-application'
    | 'general-support-system'
    | 'minor-application'
    | 'other'
  /** System description */
  description: string
  /** Authorization boundary */
  boundary: SystemBoundary
  /** Security categorization per FIPS 199 */
  categorization: SecurityCategorization
  /** System environment details */
  environment: SystemEnvironment
  /** System stakeholder contacts */
  contacts: SystemContacts
}

/**
 * AI suggestion feedback for learning loop.
 */
export interface AiFeedback {
  /** Control ID the feedback applies to */
  controlId: string
  /** Original AI-generated suggestion */
  originalSuggestion: string
  /** User's action on the suggestion */
  action: 'accepted' | 'modified' | 'rejected'
  /** User's modified version (if modified) */
  modifiedText?: string
  /** Timestamp of the feedback */
  timestamp: string
}

/**
 * Complete SSP Project structure.
 * This is the root type for SSP JSON files stored in ~/.ssp-gen/projects/
 */
export interface SspProject {
  /** Unique project identifier (UUID) */
  id: string
  /** Project/system name */
  name: string
  /** Project description (optional) */
  description?: string
  /** Selected security baseline */
  baseline: Baseline
  /** Current project status */
  status: SspStatus
  /** Creation timestamp (ISO 8601) */
  createdAt: string
  /** Last update timestamp (ISO 8601) */
  updatedAt: string
  /** Archived timestamp (ISO 8601, if archived) */
  archivedAt?: string
  /** Complete system information */
  systemInfo: SystemInfo
  /** Control implementation records */
  implementations: ControlImplementation[]
  /** IDs of selected security tools */
  selectedTools: string[]
  /** AI suggestion feedback for learning */
  aiSuggestionFeedback: AiFeedback[]
}

/**
 * Input type for creating a new SSP project.
 * Omits auto-generated fields like id, timestamps, and empty arrays.
 */
export interface CreateSspInput {
  name: string
  description?: string
  baseline: Baseline
}

/**
 * Input type for updating an existing SSP project.
 * All fields are optional except id.
 */
export interface UpdateSspInput {
  id: string
  name?: string
  description?: string
  baseline?: Baseline
  status?: SspStatus
  systemInfo?: Partial<SystemInfo>
  implementations?: ControlImplementation[]
  selectedTools?: string[]
}
