/**
 * OSCAL Generator Tests
 * @module lib/__tests__/oscal-generator.test
 *
 * Story: 6.1 - Implement OSCAL SSP Generator
 */

import { describe, it, expect } from '@jest/globals'
import {
  generateOscalSsp,
  exportOscalSsp,
  getOscalFileExtension,
  getOscalMimeType,
} from '../oscal'
import type { SspProject } from '../../types/ssp'
import type { OscalSspDocument } from '../oscal'

// Sample SSP project for testing
const mockProject: SspProject = {
  id: '12345678-1234-1234-1234-123456789012',
  name: 'Test System',
  description: 'A test system for OSCAL generation',
  baseline: 'MODERATE',
  status: 'IN_PROGRESS',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-15T00:00:00.000Z',
  systemInfo: {
    systemName: 'Test Information System',
    systemId: 'TEST-001',
    systemType: 'major-application',
    description:
      'This is a test information system for demonstrating OSCAL SSP generation.',
    boundary: {
      description:
        'The authorization boundary includes all components within the test environment.',
      components: [
        {
          id: 'comp-001',
          name: 'Web Server',
          description: 'Primary web application server',
          type: 'software',
          vendor: 'Apache',
          version: '2.4',
        },
        {
          id: 'comp-002',
          name: 'Database Server',
          description: 'PostgreSQL database for application data',
          type: 'software',
          vendor: 'PostgreSQL',
          version: '15.0',
        },
      ],
      externalConnections: [
        {
          id: 'conn-001',
          systemName: 'External API Gateway',
          organization: 'Partner Org',
          connectionType: 'API',
          dataDescription: 'User authentication tokens',
          authorizationStatus: 'authorized',
        },
      ],
      networkDiagramRef: 'diagrams/network-architecture.png',
    },
    categorization: {
      confidentiality: 'MODERATE',
      integrity: 'MODERATE',
      availability: 'LOW',
      overall: 'MODERATE',
    },
    environment: {
      deploymentModel: 'cloud',
      cloudProvider: 'AWS',
      cloudServiceModel: 'IaaS',
      operatingSystems: ['Amazon Linux 2', 'Ubuntu 22.04'],
      technologies: ['Node.js', 'React', 'PostgreSQL'],
      dataTypes: ['PII', 'System Logs'],
    },
    contacts: {
      systemOwner: {
        name: 'John Smith',
        title: 'System Owner',
        email: 'john.smith@example.com',
        phone: '+1-555-0100',
        organization: 'IT Department',
      },
      authorizingOfficial: {
        name: 'Jane Doe',
        title: 'Authorizing Official',
        email: 'jane.doe@example.com',
        organization: 'Security Office',
      },
      securityPoc: {
        name: 'Bob Wilson',
        title: 'ISSO',
        email: 'bob.wilson@example.com',
        organization: 'Security Team',
      },
      technicalPoc: {
        name: 'Alice Brown',
        title: 'Technical Lead',
        email: 'alice.brown@example.com',
        organization: 'Engineering',
      },
    },
  },
  implementations: [
    {
      controlId: 'AC-1',
      status: 'IMPLEMENTED',
      statement:
        'The organization has developed and documented an access control policy that addresses purpose, scope, roles, responsibilities, and compliance.',
      aiGenerated: false,
      parameters: {
        'ac-1_prm_1': 'annually',
        'ac-1_prm_2': '30 days',
      },
      responsibleRole: 'Security Team',
      createdAt: '2025-01-10T00:00:00.000Z',
      updatedAt: '2025-01-10T00:00:00.000Z',
    },
    {
      controlId: 'AC-2',
      status: 'PARTIALLY_IMPLEMENTED',
      statement: 'Account management procedures are partially documented.',
      aiGenerated: true,
      aiConfidence: 'MEDIUM',
      notes: 'Need to complete procedures for privileged accounts.',
      createdAt: '2025-01-11T00:00:00.000Z',
      updatedAt: '2025-01-12T00:00:00.000Z',
    },
    {
      controlId: 'AC-3',
      status: 'PLANNED',
      statement:
        'Access enforcement will be implemented using role-based access control.',
      aiGenerated: false,
      createdAt: '2025-01-13T00:00:00.000Z',
      updatedAt: '2025-01-13T00:00:00.000Z',
    },
    {
      controlId: 'AU-1',
      status: 'NOT_APPLICABLE',
      statement: 'This control is inherited from the cloud service provider.',
      aiGenerated: false,
      inherited: {
        systemId: 'aws-govcloud',
        systemName: 'AWS GovCloud',
        description: 'Audit and accountability policy is managed by AWS.',
      },
      createdAt: '2025-01-14T00:00:00.000Z',
      updatedAt: '2025-01-14T00:00:00.000Z',
    },
  ],
  selectedTools: ['trivy', 'semgrep'],
  aiSuggestionFeedback: [],
}

describe('OSCAL Generator', () => {
  describe('generateOscalSsp', () => {
    it('should generate a valid OSCAL SSP document structure', () => {
      const result = generateOscalSsp(mockProject)

      expect(result).toHaveProperty('system-security-plan')
      expect(result['system-security-plan']).toHaveProperty('uuid')
      expect(result['system-security-plan']).toHaveProperty('metadata')
      expect(result['system-security-plan']).toHaveProperty('import-profile')
      expect(result['system-security-plan']).toHaveProperty(
        'system-characteristics'
      )
      expect(result['system-security-plan']).toHaveProperty(
        'system-implementation'
      )
      expect(result['system-security-plan']).toHaveProperty(
        'control-implementation'
      )
    })

    it('should use the project ID as the SSP UUID', () => {
      const result = generateOscalSsp(mockProject)

      expect(result['system-security-plan'].uuid).toBe(mockProject.id)
    })

    it('should generate correct metadata', () => {
      const result = generateOscalSsp(mockProject)
      const metadata = result['system-security-plan'].metadata

      expect(metadata.title).toContain('Test Information System')
      expect(metadata.title).toContain('System Security Plan')
      expect(metadata['oscal-version']).toBe('1.1.3')
      expect(metadata.version).toBe('1.0')
      expect(metadata.roles).toBeDefined()
      expect(metadata.parties).toBeDefined()
    })

    it('should include all defined roles', () => {
      const result = generateOscalSsp(mockProject)
      const roles = result['system-security-plan'].metadata.roles || []
      const roleIds = roles.map((r) => r.id)

      expect(roleIds).toContain('system-owner')
      expect(roleIds).toContain('authorizing-official')
      expect(roleIds).toContain('security-poc')
      expect(roleIds).toContain('technical-poc')
    })

    it('should map contacts to parties', () => {
      const result = generateOscalSsp(mockProject)
      const parties = result['system-security-plan'].metadata.parties || []

      expect(parties.length).toBe(4)

      const partyNames = parties.map((p) => p.name)
      expect(partyNames).toContain('John Smith')
      expect(partyNames).toContain('Jane Doe')
      expect(partyNames).toContain('Bob Wilson')
      expect(partyNames).toContain('Alice Brown')
    })

    it('should set correct import profile for NIST baseline', () => {
      const result = generateOscalSsp(mockProject)
      const importProfile = result['system-security-plan']['import-profile']

      expect(importProfile.href).toContain('MODERATE')
      expect(importProfile.href).toContain('nist.gov')
    })

    it('should set correct import profile for FedRAMP baseline', () => {
      const fedrampProject = {
        ...mockProject,
        baseline: 'FEDRAMP_MODERATE' as const,
      }
      const result = generateOscalSsp(fedrampProject)
      const importProfile = result['system-security-plan']['import-profile']

      expect(importProfile.href).toContain('FedRAMP')
      expect(importProfile.href).toContain('MODERATE')
    })

    it('should generate correct system characteristics', () => {
      const result = generateOscalSsp(mockProject)
      const characteristics =
        result['system-security-plan']['system-characteristics']

      expect(characteristics['system-name']).toBe('Test Information System')
      expect(characteristics['system-ids'].length).toBeGreaterThanOrEqual(1)
      expect(characteristics['security-sensitivity-level']).toBe('moderate')
    })

    it('should include security impact levels', () => {
      const result = generateOscalSsp(mockProject)
      const impactLevel =
        result['system-security-plan']['system-characteristics'][
          'security-impact-level'
        ]

      expect(impactLevel['security-objective-confidentiality']).toBe(
        'fips-199-moderate'
      )
      expect(impactLevel['security-objective-integrity']).toBe(
        'fips-199-moderate'
      )
      expect(impactLevel['security-objective-availability']).toBe(
        'fips-199-low'
      )
    })

    it('should generate system implementation with components', () => {
      const result = generateOscalSsp(mockProject)
      const implementation =
        result['system-security-plan']['system-implementation']

      expect(implementation.users).toBeDefined()
      expect(implementation.users.length).toBeGreaterThan(0)
      expect(implementation.components).toBeDefined()
      expect(implementation.components.length).toBeGreaterThan(0)

      // Should include "this-system" component
      const thisSystem = implementation.components.find(
        (c) => c.type === 'this-system'
      )
      expect(thisSystem).toBeDefined()
    })

    it('should map control implementations correctly', () => {
      const result = generateOscalSsp(mockProject)
      const controlImpl =
        result['system-security-plan']['control-implementation']

      expect(controlImpl.description).toBeDefined()
      expect(controlImpl['implemented-requirements']).toBeDefined()
      expect(controlImpl['implemented-requirements'].length).toBe(4)
    })

    it('should map implementation status correctly', () => {
      const result = generateOscalSsp(mockProject)
      const requirements =
        result['system-security-plan']['control-implementation'][
          'implemented-requirements'
        ]

      const ac1 = requirements.find((r) => r['control-id'] === 'ac-1')
      const ac2 = requirements.find((r) => r['control-id'] === 'ac-2')
      const ac3 = requirements.find((r) => r['control-id'] === 'ac-3')

      expect(
        ac1?.['by-components']?.[0]?.['implementation-status']?.state
      ).toBe('implemented')
      expect(
        ac2?.['by-components']?.[0]?.['implementation-status']?.state
      ).toBe('partial')
      expect(
        ac3?.['by-components']?.[0]?.['implementation-status']?.state
      ).toBe('planned')
    })

    it('should include AI-generated markers', () => {
      const result = generateOscalSsp(mockProject)
      const requirements =
        result['system-security-plan']['control-implementation'][
          'implemented-requirements'
        ]

      const ac2 = requirements.find((r) => r['control-id'] === 'ac-2')
      const props = ac2?.['by-components']?.[0]?.props || []

      expect(props.find((p) => p.name === 'ai-generated')?.value).toBe('true')
      expect(props.find((p) => p.name === 'ai-confidence')?.value).toBe(
        'medium'
      )
    })

    it('should include inherited control information', () => {
      const result = generateOscalSsp(mockProject)
      const requirements =
        result['system-security-plan']['control-implementation'][
          'implemented-requirements'
        ]

      const au1 = requirements.find((r) => r['control-id'] === 'au-1')
      const props = au1?.props || []

      expect(props.find((p) => p.name === 'inherited')?.value).toBe('true')
      expect(props.find((p) => p.name === 'inherited-from-system')?.value).toBe(
        'AWS GovCloud'
      )
    })

    it('should include set-parameters for controls', () => {
      const result = generateOscalSsp(mockProject)
      const requirements =
        result['system-security-plan']['control-implementation'][
          'implemented-requirements'
        ]

      const ac1 = requirements.find((r) => r['control-id'] === 'ac-1')
      const params = ac1?.['set-parameters'] || []

      expect(params.length).toBe(2)
      expect(
        params.find((p) => p['param-id'] === 'ac-1_prm_1')?.values[0]
      ).toBe('annually')
    })
  })

  describe('exportOscalSsp', () => {
    it('should export valid JSON', () => {
      const result = exportOscalSsp(mockProject, 'json')

      expect(() => JSON.parse(result)).not.toThrow()

      const parsed = JSON.parse(result) as OscalSspDocument
      expect(parsed).toHaveProperty('system-security-plan')
    })

    it('should export YAML format', () => {
      const result = exportOscalSsp(mockProject, 'yaml')

      expect(result).toContain('system-security-plan:')
      expect(result).toContain('metadata:')
      expect(result).toContain('title:')
    })

    it('should export XML format', () => {
      const result = exportOscalSsp(mockProject, 'xml')

      expect(result).toContain('<?xml version="1.0"')
      expect(result).toContain('<system-security-plan')
      expect(result).toContain('xmlns="http://csrc.nist.gov/ns/oscal/1.0"')
    })

    it('should include FedRAMP props for FedRAMP baselines', () => {
      const fedrampProject = {
        ...mockProject,
        baseline: 'FEDRAMP_MODERATE' as const,
      }
      const result = exportOscalSsp(fedrampProject, 'json')
      const parsed = JSON.parse(result) as OscalSspDocument
      const metadata = parsed['system-security-plan'].metadata

      expect(metadata.props).toBeDefined()
      const fedrampProp = metadata.props?.find(
        (p) => p.name === 'fedramp-version'
      )
      expect(fedrampProp?.value).toBe('rev5')
    })
  })

  describe('getOscalFileExtension', () => {
    it('should return correct file extensions', () => {
      expect(getOscalFileExtension('json')).toBe('.json')
      expect(getOscalFileExtension('yaml')).toBe('.yaml')
      expect(getOscalFileExtension('xml')).toBe('.xml')
    })
  })

  describe('getOscalMimeType', () => {
    it('should return correct MIME types', () => {
      expect(getOscalMimeType('json')).toBe('application/json')
      expect(getOscalMimeType('yaml')).toBe('text/yaml')
      expect(getOscalMimeType('xml')).toBe('application/xml')
    })
  })

  describe('Edge cases', () => {
    it('should handle minimal project with no systemInfo', () => {
      const minimalProject: SspProject = {
        id: 'minimal-id',
        name: 'Minimal System',
        baseline: 'LOW',
        status: 'DRAFT',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
        systemInfo: {
          systemName: 'Minimal',
          systemType: 'other',
          description: '',
          boundary: {
            description: '',
            components: [],
            externalConnections: [],
          },
          categorization: {
            confidentiality: 'LOW',
            integrity: 'LOW',
            availability: 'LOW',
          },
          environment: {
            deploymentModel: 'on-premise',
            operatingSystems: [],
            technologies: [],
            dataTypes: [],
          },
          contacts: {
            systemOwner: { name: '', title: '', email: '' },
            authorizingOfficial: { name: '', title: '', email: '' },
            securityPoc: { name: '', title: '', email: '' },
            technicalPoc: { name: '', title: '', email: '' },
          },
        },
        implementations: [],
        selectedTools: [],
        aiSuggestionFeedback: [],
      }

      const result = generateOscalSsp(minimalProject)

      expect(result).toHaveProperty('system-security-plan')
      expect(
        result['system-security-plan']['system-characteristics']['system-name']
      ).toBeDefined()
    })

    it('should handle project with no implementations', () => {
      const noImplProject = { ...mockProject, implementations: [] }
      const result = generateOscalSsp(noImplProject)

      expect(
        result['system-security-plan']['control-implementation'][
          'implemented-requirements'
        ]
      ).toEqual([])
    })

    it('should escape special characters in XML output', () => {
      const specialCharsProject: SspProject = {
        ...mockProject,
        systemInfo: {
          ...mockProject.systemInfo,
          description: 'Test <system> with & special "characters"',
        },
      }
      const result = exportOscalSsp(specialCharsProject, 'xml')

      expect(result).toContain('&lt;')
      expect(result).toContain('&amp;')
      expect(result).toContain('&quot;')
    })
  })
})
