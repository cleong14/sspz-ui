import { renderHook, act } from '@testing-library/react'
import { SSPProjectProvider, useSSPProject } from '../SSPProjectContext'
import { Baseline } from '../../types/ssp'

describe('SSPProjectContext', () => {
  it('should provide default SSP project state', () => {
    const { result } = renderHook(() => useSSPProject(), {
      wrapper: SSPProjectProvider,
    })

    expect(result.current.project).toBeDefined()
    expect(result.current.project.selectedTools).toEqual([])
  })

  it('should update system characteristics', () => {
    const { result } = renderHook(() => useSSPProject(), {
      wrapper: SSPProjectProvider,
    })

    act(() => {
      result.current.updateSystemCharacteristics({
        systemName: 'Test System',
        systemId: 'test-001',
        description: 'Test description',
        securityImpactLevel: {
          confidentiality: 'moderate',
          integrity: 'moderate',
          availability: 'moderate',
        },
        systemType: 'SaaS',
        authorizationBoundary: 'Cloud',
      })
    })

    expect(result.current.project.systemCharacteristics.systemName).toBe(
      'Test System'
    )
  })

  it('should set control baseline', () => {
    const { result } = renderHook(() => useSSPProject(), {
      wrapper: SSPProjectProvider,
    })

    act(() => {
      result.current.setControlBaseline('high')
    })

    expect(result.current.project.controlBaseline).toBe('high')
  })

  it('should add selected tool', () => {
    const { result } = renderHook(() => useSSPProject(), {
      wrapper: SSPProjectProvider,
    })

    act(() => {
      result.current.addSelectedTool({
        toolId: 'semgrep',
        toolName: 'Semgrep',
      })
    })

    expect(result.current.project.selectedTools).toHaveLength(1)
    expect(result.current.project.selectedTools[0].toolId).toBe('semgrep')
  })
})
