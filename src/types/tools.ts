/**
 * Security Tool Control Mapping Type Definitions
 */

export type ToolCategory =
  | 'SAST'
  | 'secrets'
  | 'SCA'
  | 'DAST'
  | 'IaC'
  | 'container'
  | 'other'
export type Coverage = 'full' | 'partial'

export interface ControlMapping {
  controlId: string
  coverage: Coverage
  rationale: string
  evidence?: string
}

export interface ToolControlMapping {
  toolId: string
  toolName: string
  vendor: string
  category: ToolCategory
  controlMappings: ControlMapping[]
  defaultConfiguration?: Record<string, any>
}
