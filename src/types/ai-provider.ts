/**
 * AI Provider Interface Type Definitions
 */

export type AIProviderType = 'cloud' | 'local'
export type AuthMethod = 'api-key' | 'oauth' | 'none'
export type LengthPreference = 'concise' | 'standard' | 'detailed'
export type TechnicalLevel = 'executive' | 'professional' | 'technical'
export type TonePreference = 'formal' | 'professional' | 'conversational'

export interface GenerationPreferences {
  length: LengthPreference
  technicalLevel: TechnicalLevel
  tone: TonePreference
  includeEvidence: boolean
  includeReferences: boolean
}

export interface AIProviderConfig {
  name: string
  type: AIProviderType
  authMethod: AuthMethod
  enabled: boolean
  apiKey?: string
  endpoint?: string
  model?: string
}

export interface ControlDescriptionRequest {
  controlId: string
  controlText: string
  controlEnhancements: string[]
  tools: Array<{
    name: string
    capabilities: string
  }>
  systemContext: {
    systemName: string
    systemType: string
    systemDescription: string
    baseline: string
  }
  userContext?: string
  preferences: GenerationPreferences
}

export interface AIProvider {
  name: string
  type: AIProviderType
  authMethod: AuthMethod

  generateControlDescription(
    request: ControlDescriptionRequest
  ): Promise<string>
  authenticate?(): Promise<void>
  isConfigured(): boolean
  validateConfig(): Promise<boolean>
}
