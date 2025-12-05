import { renderHook, waitFor } from '@testing-library/react'
import fetchMock from 'jest-fetch-mock'
import useControlCatalog from '@/hooks/useControlCatalog'

// Mock catalog data
const mockCatalogData = {
  version: '1.0',
  generatedAt: '2025-01-01T00:00:00.000Z',
  source: 'NIST SP 800-53 Rev 5',
  sourceUrl: 'https://example.com',
  controls: [
    {
      id: 'AC-1',
      family: 'AC',
      title: 'Policy and Procedures',
      description: 'Test description for AC-1',
      baselines: { low: true, moderate: true, high: true },
      guidance: 'Test guidance',
    },
    {
      id: 'AC-2',
      family: 'AC',
      title: 'Account Management',
      description: 'Test description for AC-2',
      baselines: { low: true, moderate: true, high: true },
    },
    {
      id: 'AT-1',
      family: 'AT',
      title: 'Policy and Procedures',
      description: 'Test description for AT-1',
      baselines: { low: true, moderate: true, high: true },
    },
  ],
}

const mockFamiliesData = {
  version: '1.0',
  generatedAt: '2025-01-01T00:00:00.000Z',
  catalogVersion: '1.0',
  families: [
    {
      id: 'AC',
      name: 'Access Control',
      description: 'Access control description',
      totalControls: 147,
      baseControls: 25,
      byBaseline: { low: 11, moderate: 39, high: 46 },
    },
    {
      id: 'AT',
      name: 'Awareness and Training',
      description: 'Training description',
      totalControls: 17,
      baseControls: 6,
      byBaseline: { low: 5, moderate: 6, high: 6 },
    },
  ],
  familyIds: ['AC', 'AT'],
}

const mockBaselinesData = {
  version: '1.0',
  generatedAt: '2025-01-01T00:00:00.000Z',
  source: 'FedRAMP',
  sourceUrl: 'https://fedramp.gov',
  baselines: [
    {
      id: 'FEDRAMP_LOW',
      name: 'FedRAMP Low',
      description: 'Low impact baseline',
      controlCount: 154,
      controlIds: ['AC-1', 'AC-2', 'AT-1'],
      parameterDefaults: {},
    },
    {
      id: 'FEDRAMP_MODERATE',
      name: 'FedRAMP Moderate',
      description: 'Moderate impact baseline',
      controlCount: 293,
      controlIds: ['AC-1', 'AC-2', 'AT-1'],
      parameterDefaults: {},
    },
    {
      id: 'FEDRAMP_HIGH',
      name: 'FedRAMP High',
      description: 'High impact baseline',
      controlCount: 375,
      controlIds: ['AC-1', 'AC-2', 'AT-1'],
      parameterDefaults: {},
    },
  ],
}

describe('useControlCatalog', () => {
  beforeEach(() => {
    fetchMock.resetMocks()
  })

  test('loads catalog data successfully', async () => {
    fetchMock.mockResponses(
      [JSON.stringify(mockCatalogData), { status: 200 }],
      [JSON.stringify(mockFamiliesData), { status: 200 }],
      [JSON.stringify(mockBaselinesData), { status: 200 }]
    )

    const { result } = renderHook(() => useControlCatalog('FEDRAMP_LOW'))

    // Initially loading
    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Data loaded
    expect(result.current.error).toBeNull()
    expect(result.current.families).toHaveLength(2)
    expect(result.current.allControls).toHaveLength(3)
  })

  test('provides families with correct structure', async () => {
    fetchMock.mockResponses(
      [JSON.stringify(mockCatalogData), { status: 200 }],
      [JSON.stringify(mockFamiliesData), { status: 200 }],
      [JSON.stringify(mockBaselinesData), { status: 200 }]
    )

    const { result } = renderHook(() => useControlCatalog('FEDRAMP_LOW'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const acFamily = result.current.families.find((f) => f.id === 'AC')
    expect(acFamily).toBeDefined()
    expect(acFamily?.name).toBe('Access Control')
    expect(acFamily?.description).toBe('Access control description')
  })

  test('getControlsForFamily returns controls for specific family', async () => {
    fetchMock.mockResponses(
      [JSON.stringify(mockCatalogData), { status: 200 }],
      [JSON.stringify(mockFamiliesData), { status: 200 }],
      [JSON.stringify(mockBaselinesData), { status: 200 }]
    )

    const { result } = renderHook(() => useControlCatalog('FEDRAMP_LOW'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const acControls = result.current.getControlsForFamily('AC')
    expect(acControls).toHaveLength(2)
    expect(acControls.every((c) => c.family === 'AC')).toBe(true)
  })

  test('getControlById returns specific control', async () => {
    fetchMock.mockResponses(
      [JSON.stringify(mockCatalogData), { status: 200 }],
      [JSON.stringify(mockFamiliesData), { status: 200 }],
      [JSON.stringify(mockBaselinesData), { status: 200 }]
    )

    const { result } = renderHook(() => useControlCatalog('FEDRAMP_LOW'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const control = result.current.getControlById('AC-1')
    expect(control).toBeDefined()
    expect(control?.id).toBe('AC-1')
    expect(control?.title).toBe('Policy and Procedures')
  })

  test('getBaselineControlCount returns correct count', async () => {
    fetchMock.mockResponses(
      [JSON.stringify(mockCatalogData), { status: 200 }],
      [JSON.stringify(mockFamiliesData), { status: 200 }],
      [JSON.stringify(mockBaselinesData), { status: 200 }]
    )

    const { result } = renderHook(() => useControlCatalog('FEDRAMP_LOW'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const lowCount = result.current.getBaselineControlCount('FEDRAMP_LOW')
    expect(lowCount).toBe(154)

    const moderateCount =
      result.current.getBaselineControlCount('FEDRAMP_MODERATE')
    expect(moderateCount).toBe(293)
  })

  test('isControlInBaseline correctly identifies controls in baseline', async () => {
    fetchMock.mockResponses(
      [JSON.stringify(mockCatalogData), { status: 200 }],
      [JSON.stringify(mockFamiliesData), { status: 200 }],
      [JSON.stringify(mockBaselinesData), { status: 200 }]
    )

    const { result } = renderHook(() => useControlCatalog('FEDRAMP_LOW'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.isControlInBaseline('AC-1', 'FEDRAMP_LOW')).toBe(true)
    expect(result.current.isControlInBaseline('XX-99', 'FEDRAMP_LOW')).toBe(
      false
    )
  })

  test('handles fetch error gracefully', async () => {
    fetchMock.mockRejectOnce(new Error('Network error'))

    const { result } = renderHook(() => useControlCatalog('FEDRAMP_LOW'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Network error')
    expect(result.current.families).toHaveLength(0)
    expect(result.current.allControls).toHaveLength(0)
  })

  test('handles HTTP error responses', async () => {
    fetchMock.mockResponseOnce('', { status: 500, statusText: 'Server Error' })

    const { result } = renderHook(() => useControlCatalog('FEDRAMP_LOW'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toContain('Failed to load control catalog')
  })

  test('maps NIST baselines to FedRAMP baselines', async () => {
    fetchMock.mockResponses(
      [JSON.stringify(mockCatalogData), { status: 200 }],
      [JSON.stringify(mockFamiliesData), { status: 200 }],
      [JSON.stringify(mockBaselinesData), { status: 200 }]
    )

    // Using NIST LOW should map to FedRAMP LOW
    const { result } = renderHook(() => useControlCatalog('LOW'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Should still be able to get baseline control count using NIST LOW
    const count = result.current.getBaselineControlCount('LOW')
    expect(count).toBe(154) // Same as FEDRAMP_LOW
  })
})
