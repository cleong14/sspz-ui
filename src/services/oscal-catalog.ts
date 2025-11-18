import { OSCALCatalog, OSCALControl, OSCALGroup } from '../types/oscal'
import { Baseline } from '../types/ssp'

let cachedCatalog: OSCALCatalog | null = null

export async function loadCatalog(): Promise<OSCALCatalog> {
  if (cachedCatalog) {
    return cachedCatalog
  }

  const response = await fetch('/data/nist-800-53-rev5-catalog.json')
  const data = await response.json()
  cachedCatalog = data.catalog
  return cachedCatalog!
}

// For testing purposes
export function resetCatalogCache(): void {
  cachedCatalog = null
}

export function getControlById(
  catalog: OSCALCatalog,
  controlId: string
): OSCALControl | null {
  for (const group of catalog.groups) {
    const control = findControlInGroup(group, controlId)
    if (control) return control
  }
  return null
}

function findControlInGroup(
  group: OSCALGroup,
  controlId: string
): OSCALControl | null {
  for (const control of group.controls) {
    if (control.id === controlId) return control

    // Check nested controls (enhancements)
    if (control.controls) {
      for (const enhancement of control.controls) {
        if (enhancement.id === controlId) return enhancement
        const nested = findControlRecursive(enhancement, controlId)
        if (nested) return nested
      }
    }
  }

  // Check nested groups
  if (group.groups) {
    for (const subGroup of group.groups) {
      const found = findControlInGroup(subGroup, controlId)
      if (found) return found
    }
  }

  return null
}

function findControlRecursive(
  control: OSCALControl,
  controlId: string
): OSCALControl | null {
  if (control.controls) {
    for (const enhancement of control.controls) {
      if (enhancement.id === controlId) return enhancement
      const nested = findControlRecursive(enhancement, controlId)
      if (nested) return nested
    }
  }
  return null
}

export function getBaselineControls(
  catalog: OSCALCatalog,
  baseline: Baseline
): OSCALControl[] {
  const controls: OSCALControl[] = []

  for (const group of catalog.groups) {
    collectBaselineControls(group, baseline, controls)
  }

  return controls
}

function collectBaselineControls(
  group: OSCALGroup,
  baseline: Baseline,
  controls: OSCALControl[]
): void {
  for (const control of group.controls) {
    if (isInBaseline(control, baseline)) {
      controls.push(control)
    }

    // Check enhancements
    if (control.controls) {
      for (const enhancement of control.controls) {
        if (isInBaseline(enhancement, baseline)) {
          controls.push(enhancement)
        }
      }
    }
  }

  // Check nested groups
  if (group.groups) {
    for (const subGroup of group.groups) {
      collectBaselineControls(subGroup, baseline, controls)
    }
  }
}

function isInBaseline(control: OSCALControl, baseline: Baseline): boolean {
  if (!control.props) return false

  return control.props.some(
    (prop) => prop.name === 'baseline-impact' && prop.value === baseline
  )
}
