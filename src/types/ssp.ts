/**
 * Type definitions for System Security Plan (SSP) data structures
 * @module types/ssp
 */

export interface SSPData {
  // System Information
  systemName: string
  systemVersion: string
  systemType?: string
  systemPurpose?: string
  systemDescription?: string
  systemBoundaries?: string
  operatingEnvironment?: string
  dataClassification?: string

  // Control Framework
  controlCatalog: string
  controlVersion: string
  controlBaseline: string

  // Organization Information
  organization?: {
    name: string
    logo?: string
    address?: string
    contact?: string
  }

  // Security Classification
  classification?: string

  // Architecture
  architectureOverview?: string
  architectureDiagram?: string
  systemComponents?: SystemComponent[]

  // Controls and Tools
  controls?: SecurityControl[]
  tools?: SecurityTool[]

  // Metadata
  createdDate?: string
  lastModified?: string
  version?: string
  author?: string
  reviewer?: string
}

export interface SystemComponent {
  name: string
  description: string
  securityLevel: string
  type?: string
  location?: string
  dependencies?: string[]
}

export interface SecurityControl {
  id: string
  name: string
  family: string
  description: string
  status: ControlStatus
  implementationGuidance?: string
  implementingTools?: string[]
  responsibleRole?: string
  implementationDate?: string
  testingProcedure?: string
  evidence?: string[]
  notes?: string
}

export interface SecurityTool {
  name: string
  category: string
  version?: string
  purpose: string
  description?: string
  vendor?: string
  implementedControls?: string[]
  configuration?: string
  location?: string
}

export type ControlStatus =
  | 'implemented'
  | 'partial'
  | 'planned'
  | 'not-implemented'
  | 'not-applicable'

export interface ControlFamily {
  id: string
  name: string
  description: string
  controls: SecurityControl[]
}

export interface ControlCatalog {
  name: string
  version: string
  description: string
  families: ControlFamily[]
}

export interface SSPGenerationOptions {
  includeControlDetails: boolean
  includeImplementationGuidance: boolean
  includeArchitectureDiagram: boolean
  includeToolDetails: boolean
  format: 'html' | 'pdf' | 'csv' | 'json'
  template?: 'standard' | 'government' | 'custom'
}

export interface SSPExportData {
  data: SSPData
  options: SSPGenerationOptions
  generatedDate: string
  exportFormat: string
}
