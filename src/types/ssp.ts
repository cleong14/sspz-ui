/**
 * System Security Plan (SSP) Type Definitions
 */

export type ImpactLevel = 'low' | 'moderate' | 'high'
export type ImplementationStatus = 'implemented' | 'planned' | 'not-applicable'
export type Baseline = 'low' | 'moderate' | 'high'

export interface SecurityImpactLevel {
  confidentiality: ImpactLevel
  integrity: ImpactLevel
  availability: ImpactLevel
}

export interface SSPMetadata {
  title: string
  lastModified: Date
  version: string
  oscalVersion: '1.0.4'
}

export interface SystemCharacteristics {
  systemName: string
  systemId: string
  description: string
  securityImpactLevel: SecurityImpactLevel
  systemType: string
  authorizationBoundary: string
  networkArchitecture?: string
}

export interface SelectedTool {
  toolId: string
  toolName: string
  version?: string
  configuration?: Record<string, any>
  customMapping?: boolean
}

export interface ControlImplementation {
  controlId: string
  implementationStatus: ImplementationStatus
  responsibleRole: string
  description: string
  providingTools: string[]
  customNotes?: string
}

export interface ResponsibleParty {
  roleId: string
  title: string
  contacts: Array<{ name: string; email: string }>
}

export interface SSPProject {
  id?: string
  metadata: SSPMetadata
  systemCharacteristics: SystemCharacteristics
  controlBaseline: Baseline
  selectedTools: SelectedTool[]
  controlImplementations: ControlImplementation[]
  responsibleParties: ResponsibleParty[]
  customFields?: Record<string, any>
}
