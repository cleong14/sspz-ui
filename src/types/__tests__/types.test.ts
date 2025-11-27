/**
 * Type definition tests
 *
 * These tests verify that the SSP type definitions compile correctly
 * and can be used as expected. They serve as both documentation and
 * compile-time verification.
 */

import { describe, it, expect } from '@jest/globals'
import type {
  // SSP Types
  Baseline,
  SspStatus,
  ImpactLevel,
  Contact,
  CreateSspInput,
  // Control Types
  Control,
  ControlFamily,
  ControlImplementation,
  ImplementationStatus,
  ImplementationProgress,
  // Tool Types
  Tool,
  ToolCategory,
} from '../index'

describe('SSP Type Definitions', () => {
  describe('Baseline type', () => {
    it('should accept valid baseline values', () => {
      const baselines: Baseline[] = [
        'LOW',
        'MODERATE',
        'HIGH',
        'FEDRAMP_LOW',
        'FEDRAMP_MODERATE',
        'FEDRAMP_HIGH',
        'FEDRAMP_LI_SAAS',
      ]
      expect(baselines).toHaveLength(7)
    })
  })

  describe('SspStatus type', () => {
    it('should accept valid status values', () => {
      const statuses: SspStatus[] = [
        'DRAFT',
        'IN_PROGRESS',
        'REVIEW',
        'COMPLETE',
      ]
      expect(statuses).toHaveLength(4)
    })
  })

  describe('ImpactLevel type', () => {
    it('should accept valid impact levels', () => {
      const levels: ImpactLevel[] = ['LOW', 'MODERATE', 'HIGH']
      expect(levels).toHaveLength(3)
    })
  })

  describe('Contact interface', () => {
    it('should define contact structure', () => {
      const contact: Contact = {
        name: 'John Doe',
        title: 'System Owner',
        email: 'john.doe@example.gov',
        phone: '555-0100',
        organization: 'Example Agency',
      }
      expect(contact.name).toBe('John Doe')
      expect(contact.email).toContain('@')
    })
  })

  describe('CreateSspInput interface', () => {
    it('should define minimal creation input', () => {
      const input: CreateSspInput = {
        name: 'Test System',
        baseline: 'MODERATE',
      }
      expect(input.name).toBeDefined()
      expect(input.baseline).toBe('MODERATE')
    })

    it('should allow optional description', () => {
      const input: CreateSspInput = {
        name: 'Test System',
        description: 'A test system for verification',
        baseline: 'HIGH',
      }
      expect(input.description).toBeDefined()
    })
  })

  describe('ImplementationStatus type', () => {
    it('should accept valid implementation statuses', () => {
      const statuses: ImplementationStatus[] = [
        'NOT_STARTED',
        'IMPLEMENTED',
        'PARTIALLY_IMPLEMENTED',
        'PLANNED',
        'NOT_APPLICABLE',
      ]
      expect(statuses).toHaveLength(5)
    })
  })

  describe('ControlImplementation interface', () => {
    it('should define implementation structure', () => {
      const impl: ControlImplementation = {
        controlId: 'AC-1',
        status: 'IMPLEMENTED',
        statement: 'Access control policy is documented and enforced.',
        aiGenerated: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      expect(impl.controlId).toBe('AC-1')
      expect(impl.status).toBe('IMPLEMENTED')
    })

    it('should support AI-generated implementations', () => {
      const impl: ControlImplementation = {
        controlId: 'RA-5',
        status: 'IMPLEMENTED',
        statement: 'Vulnerability scanning is performed weekly using Trivy.',
        aiGenerated: true,
        aiConfidence: 'HIGH',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      expect(impl.aiGenerated).toBe(true)
      expect(impl.aiConfidence).toBe('HIGH')
    })
  })

  describe('Control interface', () => {
    it('should define control structure', () => {
      const control: Control = {
        id: 'AC-1',
        title: 'Policy and Procedures',
        description:
          'Develop, document, and disseminate access control policy.',
        baselines: ['LOW', 'MODERATE', 'HIGH'],
        guidance: 'Defines policy requirements for access control.',
      }
      expect(control.id).toBe('AC-1')
      expect(control.baselines).toContain('MODERATE')
    })

    it('should support control enhancements', () => {
      const control: Control = {
        id: 'AC-2',
        title: 'Account Management',
        description: 'Manage system accounts.',
        baselines: ['LOW', 'MODERATE', 'HIGH'],
        enhancements: [
          {
            id: 'AC-2(1)',
            title: 'Automated System Account Management',
            description:
              'Support account management using automated mechanisms.',
            baselines: ['MODERATE', 'HIGH'],
          },
        ],
      }
      expect(control.enhancements).toHaveLength(1)
      expect(control.enhancements![0].id).toBe('AC-2(1)')
    })
  })

  describe('ControlFamily interface', () => {
    it('should group controls by family', () => {
      const family: ControlFamily = {
        id: 'AC',
        name: 'Access Control',
        controls: [
          {
            id: 'AC-1',
            title: 'Policy and Procedures',
            description: 'Access control policy.',
            baselines: ['LOW', 'MODERATE', 'HIGH'],
          },
        ],
      }
      expect(family.id).toBe('AC')
      expect(family.controls).toHaveLength(1)
    })
  })

  describe('ToolCategory type', () => {
    it('should accept valid tool categories', () => {
      const categories: ToolCategory[] = [
        'vulnerability-scanner',
        'sast',
        'dast',
        'secrets-detection',
        'container-security',
        'iac-scanner',
        'siem',
        'identity',
        'endpoint',
      ]
      expect(categories.length).toBeGreaterThan(0)
    })
  })

  describe('Tool interface', () => {
    it('should define tool structure with mappings', () => {
      const tool: Tool = {
        id: 'trivy',
        name: 'Trivy',
        slug: 'trivy',
        description: 'Container and filesystem vulnerability scanner',
        category: 'vulnerability-scanner',
        vendor: 'Aqua Security',
        openSource: true,
        mappings: [
          {
            controlId: 'RA-5',
            implementationTemplate:
              'Vulnerability scanning is performed using Trivy to identify vulnerabilities in container images.',
            confidence: 'HIGH',
            source: 'vendor-docs',
          },
        ],
      }
      expect(tool.id).toBe('trivy')
      expect(tool.mappings).toHaveLength(1)
      expect(tool.mappings[0].controlId).toBe('RA-5')
    })
  })

  describe('ImplementationProgress interface', () => {
    it('should calculate progress metrics', () => {
      const progress: ImplementationProgress = {
        total: 100,
        implemented: 50,
        partiallyImplemented: 20,
        planned: 10,
        notApplicable: 5,
        notStarted: 15,
        percentComplete: 50,
      }
      expect(progress.total).toBe(100)
      expect(progress.percentComplete).toBe(50)
    })
  })
})

describe('Type Export Verification', () => {
  it('should export all SSP types from barrel', () => {
    // This test verifies the barrel export includes all expected types
    // by using type assertions. Compilation success = test pass.
    const checkTypes = () => {
      // SSP types
      const baseline: Baseline = 'MODERATE'
      const status: SspStatus = 'DRAFT'
      const impact: ImpactLevel = 'HIGH'

      // Control types
      const implStatus: ImplementationStatus = 'IMPLEMENTED'

      // Tool types
      const category: ToolCategory = 'sast'

      return { baseline, status, impact, implStatus, category }
    }

    const result = checkTypes()
    expect(result.baseline).toBe('MODERATE')
  })
})
