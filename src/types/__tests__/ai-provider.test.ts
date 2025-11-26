import { GenerationPreferences, AIProviderConfig } from '../ai-provider'

describe('AI Provider Types', () => {
  it('should create valid generation preferences', () => {
    const prefs: GenerationPreferences = {
      length: 'standard',
      technicalLevel: 'professional',
      tone: 'formal',
      includeEvidence: true,
      includeReferences: true,
    }

    expect(prefs.length).toBe('standard')
  })

  it('should create valid AI provider config', () => {
    const config: AIProviderConfig = {
      name: 'anthropic-oauth',
      type: 'cloud',
      authMethod: 'oauth',
      enabled: true,
    }

    expect(config.type).toBe('cloud')
  })
})
