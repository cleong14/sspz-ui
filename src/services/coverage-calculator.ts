import { OSCALCatalog } from '../types/oscal'
import { Baseline } from '../types/ssp'
import { ToolControlMapping } from '../types/tools'
import { getBaselineControls } from './oscal-catalog'

export type CoverageStatus = 'covered' | 'partial' | 'uncovered'

export interface ControlCoverage {
  controlId: string
  status: CoverageStatus
  tools: string[]
}

export interface ControlCoverageReport {
  coverage: ControlCoverage[]
  stats: {
    total: number
    covered: number
    partial: number
    uncovered: number
  }
}

export function calculateControlCoverage(
  baseline: Baseline,
  selectedTools: ToolControlMapping[],
  catalog: OSCALCatalog
): ControlCoverageReport {
  const baselineControls = getBaselineControls(catalog, baseline)

  const coverage = baselineControls.map((control) => {
    const mappedTools = selectedTools.filter((tool) =>
      tool.controlMappings.some((m) => m.controlId === control.id)
    )

    const fullCoverage = mappedTools.some((t) =>
      t.controlMappings.find(
        (m) => m.controlId === control.id && m.coverage === 'full'
      )
    )

    const status: CoverageStatus =
      mappedTools.length === 0
        ? 'uncovered'
        : fullCoverage
          ? 'covered'
          : 'partial'

    return {
      controlId: control.id,
      status,
      tools: mappedTools.map((t) => t.toolName),
    }
  })

  return {
    coverage,
    stats: {
      total: coverage.length,
      covered: coverage.filter((c) => c.status === 'covered').length,
      partial: coverage.filter((c) => c.status === 'partial').length,
      uncovered: coverage.filter((c) => c.status === 'uncovered').length,
    },
  }
}
