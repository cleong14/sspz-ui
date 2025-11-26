import { SSPProject } from '../ssp'

describe('SSP Types', () => {
  it('should create valid SSP project structure', () => {
    const project: SSPProject = {
      metadata: {
        title: 'Test System',
        lastModified: new Date(),
        version: '1.0.0',
        oscalVersion: '1.0.4',
      },
      systemCharacteristics: {
        systemName: 'Test System',
        systemId: 'test-001',
        description: 'Test description',
        securityImpactLevel: {
          confidentiality: 'moderate',
          integrity: 'moderate',
          availability: 'moderate',
        },
        systemType: 'SaaS',
        authorizationBoundary: 'Cloud environment',
      },
      controlBaseline: 'moderate',
      selectedTools: [],
      controlImplementations: [],
      responsibleParties: [],
    }

    expect(project.metadata.oscalVersion).toBe('1.0.4')
    expect(project.controlBaseline).toBe('moderate')
  })
})
