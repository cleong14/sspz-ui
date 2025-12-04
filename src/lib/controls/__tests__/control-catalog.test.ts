/**
 * Control Catalog Service Tests
 * @module lib/controls/__tests__/control-catalog.test
 *
 * Unit tests for the control catalog service.
 */

import type { Control, ControlCatalog, ControlFamily } from '@/types/control'
import {
  getControlsByFamily,
  getControlById,
  getFamilyById,
  isInBaseline,
  getBaselineBadges,
  getBaselineColor,
  searchControls,
  filterControlsBySearch,
  highlightMatch,
  filterControlsByBaseline,
} from '../control-catalog'

// Mock control data
const mockControls: Control[] = [
  {
    id: 'AC-1',
    family: 'AC',
    title: 'Policy and Procedures',
    description: 'Develop, document, and disseminate access control policy.',
    guidance: 'Access control policy addresses the controls in the AC family.',
    baselines: { low: true, moderate: true, high: true },
  },
  {
    id: 'AC-2',
    family: 'AC',
    title: 'Account Management',
    description: 'Define and document account types.',
    baselines: { low: true, moderate: true, high: true },
  },
  {
    id: 'AC-2(1)',
    family: 'AC',
    title: 'Automated System Account Management',
    description: 'Support account management using automated mechanisms.',
    baselines: { low: false, moderate: true, high: true },
    parentControl: 'AC-2',
  },
  {
    id: 'AU-1',
    family: 'AU',
    title: 'Policy and Procedures',
    description: 'Develop audit policy and procedures.',
    baselines: { low: true, moderate: true, high: true },
  },
  {
    id: 'SC-13',
    family: 'SC',
    title: 'Cryptographic Protection',
    description:
      'Implement cryptographic mechanisms using FIPS-validated encryption.',
    guidance: 'Cryptography can be employed to support separation.',
    baselines: { low: false, moderate: true, high: true },
  },
  {
    id: 'PM-1',
    family: 'PM',
    title: 'Information Security Program Plan',
    description: 'Develop program plan.',
    baselines: { low: false, moderate: false, high: false },
  },
]

const mockFamilies: ControlFamily[] = [
  {
    id: 'AC',
    name: 'Access Control',
    description: 'Controls for managing access.',
    totalControls: 3,
    baseControls: 2,
    byBaseline: { low: 2, moderate: 3, high: 3 },
  },
  {
    id: 'AU',
    name: 'Audit and Accountability',
    description: 'Controls for audit logging.',
    totalControls: 1,
    baseControls: 1,
    byBaseline: { low: 1, moderate: 1, high: 1 },
  },
]

const mockCatalog: ControlCatalog = {
  version: '1.0',
  generatedAt: '2025-01-01T00:00:00Z',
  source: 'Test',
  controls: mockControls,
  families: mockFamilies,
}

describe('Control Catalog Service', () => {
  describe('getControlsByFamily', () => {
    it('should return controls for a specific family', () => {
      const acControls = getControlsByFamily(mockCatalog, 'AC')
      expect(acControls).toHaveLength(3)
      expect(acControls.every((c) => c.family === 'AC')).toBe(true)
    })

    it('should return empty array for invalid family', () => {
      const controls = getControlsByFamily(mockCatalog, 'INVALID')
      expect(controls).toHaveLength(0)
    })

    it('should return empty array when catalog has no controls', () => {
      const emptyCatalog: ControlCatalog = {
        version: '1.0',
        generatedAt: '2025-01-01',
        source: 'Test',
        controls: [],
        families: [],
      }
      const controls = getControlsByFamily(emptyCatalog, 'AC')
      expect(controls).toHaveLength(0)
    })
  })

  describe('getControlById', () => {
    it('should return control by ID', () => {
      const control = getControlById(mockCatalog, 'AC-1')
      expect(control).toBeDefined()
      expect(control?.id).toBe('AC-1')
      expect(control?.title).toBe('Policy and Procedures')
    })

    it('should return undefined for non-existent ID', () => {
      const control = getControlById(mockCatalog, 'INVALID-99')
      expect(control).toBeUndefined()
    })

    it('should find enhancement controls', () => {
      const control = getControlById(mockCatalog, 'AC-2(1)')
      expect(control).toBeDefined()
      expect(control?.parentControl).toBe('AC-2')
    })
  })

  describe('getFamilyById', () => {
    it('should return family by ID', () => {
      const family = getFamilyById(mockFamilies, 'AC')
      expect(family).toBeDefined()
      expect(family?.name).toBe('Access Control')
    })

    it('should return undefined for non-existent family', () => {
      const family = getFamilyById(mockFamilies, 'INVALID')
      expect(family).toBeUndefined()
    })
  })

  describe('isInBaseline', () => {
    it('should return true for control in low baseline', () => {
      expect(isInBaseline(mockControls[0], 'low')).toBe(true)
    })

    it('should return false for control not in low baseline', () => {
      expect(isInBaseline(mockControls[2], 'low')).toBe(false) // AC-2(1)
    })

    it('should return true for control in moderate baseline', () => {
      expect(isInBaseline(mockControls[2], 'moderate')).toBe(true)
    })

    it('should return true for control in high baseline', () => {
      expect(isInBaseline(mockControls[4], 'high')).toBe(true) // SC-13
    })

    it('should return false for control not in any baseline', () => {
      expect(isInBaseline(mockControls[5], 'low')).toBe(false) // PM-1
      expect(isInBaseline(mockControls[5], 'moderate')).toBe(false)
      expect(isInBaseline(mockControls[5], 'high')).toBe(false)
    })
  })

  describe('getBaselineBadges', () => {
    it('should return all badges for control in all baselines', () => {
      const badges = getBaselineBadges(mockControls[0]) // AC-1
      expect(badges).toEqual(['Low', 'Moderate', 'High'])
    })

    it('should return subset of badges for control in some baselines', () => {
      const badges = getBaselineBadges(mockControls[2]) // AC-2(1) - moderate/high only
      expect(badges).toEqual(['Moderate', 'High'])
    })

    it('should return empty array for control not in any baseline', () => {
      const badges = getBaselineBadges(mockControls[5]) // PM-1
      expect(badges).toEqual([])
    })
  })

  describe('getBaselineColor', () => {
    it('should return success for low baseline', () => {
      expect(getBaselineColor('low')).toBe('success')
      expect(getBaselineColor('Low')).toBe('success')
    })

    it('should return warning for moderate baseline', () => {
      expect(getBaselineColor('moderate')).toBe('warning')
      expect(getBaselineColor('Moderate')).toBe('warning')
    })

    it('should return error for high baseline', () => {
      expect(getBaselineColor('high')).toBe('error')
      expect(getBaselineColor('High')).toBe('error')
    })

    it('should return success for FedRAMP low', () => {
      expect(getBaselineColor('fedramp_low')).toBe('success')
    })

    it('should return warning for FedRAMP moderate', () => {
      expect(getBaselineColor('fedramp_moderate')).toBe('warning')
    })

    it('should return error for FedRAMP high', () => {
      expect(getBaselineColor('fedramp_high')).toBe('error')
    })

    it('should return info for FedRAMP LI-SaaS', () => {
      expect(getBaselineColor('fedramp_li_saas')).toBe('info')
    })

    it('should return default for unknown baseline', () => {
      expect(getBaselineColor('unknown')).toBe('default')
      expect(getBaselineColor('all')).toBe('default')
    })
  })

  describe('searchControls', () => {
    it('should return empty array for empty query', () => {
      const results = searchControls(mockControls, '')
      expect(results).toHaveLength(0)
    })

    it('should return empty array for whitespace-only query', () => {
      const results = searchControls(mockControls, '   ')
      expect(results).toHaveLength(0)
    })

    it('should match controls by ID with highest score', () => {
      const results = searchControls(mockControls, 'AC-1')
      expect(results).toHaveLength(1)
      expect(results[0].control.id).toBe('AC-1')
      expect(results[0].matchType).toBe('id')
      expect(results[0].matchScore).toBe(100) // Exact match
    })

    it('should match controls by partial ID', () => {
      const results = searchControls(mockControls, 'AC-2')
      expect(results).toHaveLength(2) // AC-2 and AC-2(1)
      expect(results.every((r) => r.matchType === 'id')).toBe(true)
    })

    it('should match controls by title', () => {
      const results = searchControls(mockControls, 'Cryptographic')
      expect(results).toHaveLength(1)
      expect(results[0].control.id).toBe('SC-13')
      expect(results[0].matchType).toBe('title')
    })

    it('should match controls by description', () => {
      const results = searchControls(mockControls, 'automated mechanisms')
      expect(results).toHaveLength(1)
      expect(results[0].control.id).toBe('AC-2(1)')
      expect(results[0].matchType).toBe('description')
    })

    it('should match controls by guidance', () => {
      const results = searchControls(mockControls, 'separation')
      expect(results).toHaveLength(1)
      expect(results[0].control.id).toBe('SC-13')
      expect(results[0].matchType).toBe('guidance')
    })

    it('should be case insensitive', () => {
      const results = searchControls(mockControls, 'ENCRYPTION')
      expect(results.length).toBeGreaterThan(0)
    })

    it('should sort results by score (highest first)', () => {
      // Add a control that matches in title to test sorting
      const results = searchControls(mockControls, 'Policy')
      expect(results.length).toBeGreaterThan(0)
      // Results should be sorted by matchScore descending
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].matchScore).toBeGreaterThanOrEqual(
          results[i].matchScore
        )
      }
    })

    it('should handle special characters in query', () => {
      // Should not throw error
      const results = searchControls(mockControls, 'AC-2(1)')
      expect(results).toHaveLength(1)
      expect(results[0].control.id).toBe('AC-2(1)')
    })
  })

  describe('filterControlsBySearch', () => {
    it('should return all controls for empty query', () => {
      const results = filterControlsBySearch(mockControls, '')
      expect(results).toEqual(mockControls)
    })

    it('should return filtered controls for valid query', () => {
      const results = filterControlsBySearch(mockControls, 'AC')
      expect(results.length).toBeGreaterThan(0)
      expect(results.every((c) => c.id.includes('AC'))).toBe(true)
    })

    it('should return controls array (not SearchResult)', () => {
      const results = filterControlsBySearch(mockControls, 'AC-1')
      expect(results[0]).toHaveProperty('id')
      expect(results[0]).not.toHaveProperty('matchScore')
    })
  })

  describe('highlightMatch', () => {
    it('should return original text for empty query', () => {
      const result = highlightMatch('Some text', '')
      expect(result).toBe('Some text')
    })

    it('should wrap matching text in mark tags', () => {
      const result = highlightMatch('Access Control Policy', 'Control')
      expect(result).toBe('Access <mark>Control</mark> Policy')
    })

    it('should be case insensitive', () => {
      const result = highlightMatch('Access Control Policy', 'CONTROL')
      expect(result).toBe('Access <mark>Control</mark> Policy')
    })

    it('should highlight multiple occurrences', () => {
      const result = highlightMatch('test test test', 'test')
      expect(result).toBe(
        '<mark>test</mark> <mark>test</mark> <mark>test</mark>'
      )
    })

    it('should escape special regex characters', () => {
      const result = highlightMatch('AC-2(1) Control', 'AC-2(1)')
      expect(result).toBe('<mark>AC-2(1)</mark> Control')
    })
  })

  describe('filterControlsByBaseline', () => {
    it('should return all controls for "all" baseline', () => {
      const results = filterControlsByBaseline(mockControls, 'all')
      expect(results).toEqual(mockControls)
    })

    it('should filter by NIST low baseline', () => {
      const results = filterControlsByBaseline(mockControls, 'low')
      expect(results.length).toBe(3) // AC-1, AC-2, AU-1
      expect(results.every((c) => isInBaseline(c, 'low'))).toBe(true)
    })

    it('should filter by NIST moderate baseline', () => {
      const results = filterControlsByBaseline(mockControls, 'moderate')
      expect(results.length).toBe(5) // All except PM-1
      expect(results.every((c) => isInBaseline(c, 'moderate'))).toBe(true)
    })

    it('should filter by NIST high baseline', () => {
      const results = filterControlsByBaseline(mockControls, 'high')
      expect(results.length).toBe(5)
      expect(results.every((c) => isInBaseline(c, 'high'))).toBe(true)
    })

    it('should filter by FedRAMP low baseline', () => {
      const fedRampBaselines = {
        low: new Set(['AC-1', 'AU-1']),
        moderate: new Set(['AC-1', 'AC-2', 'AU-1', 'SC-13']),
        high: new Set(['AC-1', 'AC-2', 'AC-2(1)', 'AU-1', 'SC-13']),
        liSaas: new Set(['AC-1']),
      }
      const results = filterControlsByBaseline(
        mockControls,
        'fedramp_low',
        fedRampBaselines
      )
      expect(results).toHaveLength(2)
      expect(results.map((c) => c.id)).toEqual(['AC-1', 'AU-1'])
    })

    it('should filter by FedRAMP moderate baseline', () => {
      const fedRampBaselines = {
        low: new Set(['AC-1']),
        moderate: new Set(['AC-1', 'AC-2', 'SC-13']),
        high: new Set(['AC-1', 'AC-2', 'SC-13']),
        liSaas: new Set(['AC-1']),
      }
      const results = filterControlsByBaseline(
        mockControls,
        'fedramp_moderate',
        fedRampBaselines
      )
      expect(results).toHaveLength(3)
    })

    it('should filter by FedRAMP high baseline', () => {
      const fedRampBaselines = {
        low: new Set(['AC-1']),
        moderate: new Set(['AC-1', 'AC-2']),
        high: new Set(['AC-1', 'AC-2', 'AC-2(1)', 'AU-1', 'SC-13']),
        liSaas: new Set(['AC-1']),
      }
      const results = filterControlsByBaseline(
        mockControls,
        'fedramp_high',
        fedRampBaselines
      )
      expect(results).toHaveLength(5)
    })

    it('should filter by FedRAMP LI-SaaS baseline', () => {
      const fedRampBaselines = {
        low: new Set(['AC-1']),
        moderate: new Set(['AC-1', 'AC-2']),
        high: new Set(['AC-1', 'AC-2', 'AC-2(1)']),
        liSaas: new Set(['AC-1', 'AU-1']),
      }
      const results = filterControlsByBaseline(
        mockControls,
        'fedramp_li_saas',
        fedRampBaselines
      )
      expect(results).toHaveLength(2)
    })

    it('should return all controls when FedRAMP data not provided', () => {
      const results = filterControlsByBaseline(mockControls, 'fedramp_low')
      expect(results).toEqual(mockControls)
    })

    it('should handle empty FedRAMP baseline sets', () => {
      const fedRampBaselines = {
        low: new Set<string>(),
        moderate: new Set<string>(),
        high: new Set<string>(),
        liSaas: new Set<string>(),
      }
      const results = filterControlsByBaseline(
        mockControls,
        'fedramp_low',
        fedRampBaselines
      )
      expect(results).toHaveLength(0)
    })
  })
})
