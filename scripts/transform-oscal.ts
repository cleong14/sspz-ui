#!/usr/bin/env tsx
/**
 * OSCAL Data Transform Script
 *
 * Transforms raw NIST OSCAL catalog and baseline data into an optimized
 * application schema for efficient client-side querying.
 *
 * Usage: npm run data:transform
 *
 * Story: 9.2 - Transform OSCAL to Application Schema
 */

import { readFile, writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import type {
  Control,
  ControlCatalog,
  ControlFamily,
  ControlParameter,
  CatalogStatistics,
  BaselineApplicability,
} from '../src/types/control'

// Resolve paths
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PROJECT_ROOT = join(__dirname, '..')
const INPUT_DIR = join(PROJECT_ROOT, 'data', 'oscal-raw')
const OUTPUT_DIR = join(PROJECT_ROOT, 'public', 'data')
const OUTPUT_FILE = join(OUTPUT_DIR, 'nist-800-53-rev5.json')

// Input files
const CATALOG_FILE = join(INPUT_DIR, 'NIST_SP-800-53_rev5_catalog.json')
const BASELINE_LOW = join(
  INPUT_DIR,
  'NIST_SP-800-53_rev5_LOW-baseline_profile.json'
)
const BASELINE_MODERATE = join(
  INPUT_DIR,
  'NIST_SP-800-53_rev5_MODERATE-baseline_profile.json'
)
const BASELINE_HIGH = join(
  INPUT_DIR,
  'NIST_SP-800-53_rev5_HIGH-baseline_profile.json'
)

// Family metadata - full names and descriptions
const FAMILY_METADATA: Record<string, { name: string; description: string }> = {
  AC: {
    name: 'Access Control',
    description:
      'Controls for managing access to systems and information, including account management, access enforcement, and remote access.',
  },
  AT: {
    name: 'Awareness and Training',
    description:
      'Controls for security awareness and training programs to ensure personnel understand security responsibilities.',
  },
  AU: {
    name: 'Audit and Accountability',
    description:
      'Controls for audit logging, monitoring, and maintaining accountability for system activities.',
  },
  CA: {
    name: 'Assessment, Authorization, and Monitoring',
    description:
      'Controls for security assessments, authorization processes, and continuous monitoring.',
  },
  CM: {
    name: 'Configuration Management',
    description:
      'Controls for managing system configurations, baselines, and change control processes.',
  },
  CP: {
    name: 'Contingency Planning',
    description:
      'Controls for business continuity, disaster recovery, and system backup procedures.',
  },
  IA: {
    name: 'Identification and Authentication',
    description:
      'Controls for identifying and authenticating users, devices, and services.',
  },
  IR: {
    name: 'Incident Response',
    description:
      'Controls for incident handling, reporting, and response capabilities.',
  },
  MA: {
    name: 'Maintenance',
    description:
      'Controls for system maintenance, including local and remote maintenance procedures.',
  },
  MP: {
    name: 'Media Protection',
    description:
      'Controls for protecting digital and physical media containing sensitive information.',
  },
  PE: {
    name: 'Physical and Environmental Protection',
    description:
      'Controls for physical access, environmental hazards, and facility security.',
  },
  PL: {
    name: 'Planning',
    description:
      'Controls for security planning, system security plans, and rules of behavior.',
  },
  PM: {
    name: 'Program Management',
    description:
      'Controls for organization-wide information security program management.',
  },
  PS: {
    name: 'Personnel Security',
    description:
      'Controls for personnel screening, termination, and transfer procedures.',
  },
  PT: {
    name: 'Personally Identifiable Information Processing and Transparency',
    description:
      'Controls for handling PII, consent, privacy notices, and data minimization.',
  },
  RA: {
    name: 'Risk Assessment',
    description:
      'Controls for risk assessment, vulnerability scanning, and threat intelligence.',
  },
  SA: {
    name: 'System and Services Acquisition',
    description:
      'Controls for secure development, acquisition, and supply chain risk management.',
  },
  SC: {
    name: 'System and Communications Protection',
    description:
      'Controls for protecting communications, cryptography, and system boundaries.',
  },
  SI: {
    name: 'System and Information Integrity',
    description:
      'Controls for malware protection, security alerts, and software integrity.',
  },
  SR: {
    name: 'Supply Chain Risk Management',
    description:
      'Controls for managing supply chain risks, component authenticity, and provenance.',
  },
}

// OSCAL type definitions (partial, for what we need)
interface OscalCatalog {
  catalog: {
    uuid: string
    metadata: {
      title: string
      version: string
      'oscal-version': string
    }
    groups: OscalGroup[]
  }
}

interface OscalGroup {
  id: string
  title: string
  controls?: OscalControl[]
  groups?: OscalGroup[]
}

interface OscalControl {
  id: string
  class?: string
  title: string
  props?: OscalProp[]
  params?: OscalParam[]
  parts?: OscalPart[]
  controls?: OscalControl[] // Enhancements
  links?: OscalLink[]
}

interface OscalProp {
  name: string
  value: string
  class?: string
}

interface OscalParam {
  id: string
  label?: string
  guidelines?: OscalGuideline[]
  select?: {
    'how-many'?: string
    choice?: string[]
  }
  values?: string[]
}

interface OscalGuideline {
  prose: string
}

interface OscalPart {
  id?: string
  name: string
  prose?: string
  parts?: OscalPart[]
}

interface OscalLink {
  rel: string
  href: string
}

interface OscalProfile {
  profile: {
    imports: {
      href: string
      'include-controls'?: {
        'with-ids': string[]
      }[]
    }[]
  }
}

/**
 * Extract control IDs from a baseline profile
 */
async function extractBaselineControlIds(
  profilePath: string
): Promise<Set<string>> {
  const controlIds = new Set<string>()

  try {
    const content = await readFile(profilePath, 'utf-8')
    const profile: OscalProfile = JSON.parse(content)

    for (const imp of profile.profile.imports || []) {
      for (const include of imp['include-controls'] || []) {
        for (const id of include['with-ids'] || []) {
          // Normalize control ID to uppercase with proper format
          controlIds.add(normalizeControlId(id))
        }
      }
    }
  } catch (error) {
    console.error(
      `Error reading baseline ${profilePath}:`,
      (error as Error).message
    )
  }

  return controlIds
}

/**
 * Normalize control ID format
 */
function normalizeControlId(id: string): string {
  // Convert to uppercase and ensure consistent format
  return id.toUpperCase().replace(/_/g, '-')
}

/**
 * Extract family code from control ID
 */
function extractFamilyCode(controlId: string): string {
  const match = controlId.match(/^([A-Z]{2})/)
  return match ? match[1] : ''
}

/**
 * Check if control is an enhancement (has parenthetical notation)
 */
function isEnhancement(controlId: string): boolean {
  return /\(\d+\)$/.test(controlId)
}

/**
 * Get parent control ID for an enhancement
 */
function getParentControlId(controlId: string): string | undefined {
  if (!isEnhancement(controlId)) {
    return undefined
  }
  return controlId.replace(/\(\d+\)$/, '')
}

/**
 * Extract prose text from OSCAL parts
 */
function extractProse(
  parts: OscalPart[] | undefined,
  partName: string
): string {
  if (!parts) return ''

  for (const part of parts) {
    if (part.name === partName && part.prose) {
      return part.prose
    }
    // Check nested parts
    if (part.parts) {
      const nested = extractProse(part.parts, partName)
      if (nested) return nested
    }
  }
  return ''
}

/**
 * Extract full statement text from OSCAL parts
 */
function extractStatement(parts: OscalPart[] | undefined): string {
  if (!parts) return ''

  const statements: string[] = []

  for (const part of parts) {
    if (part.name === 'statement') {
      if (part.prose) {
        statements.push(part.prose)
      }
      // Handle multi-part statements (a, b, c, etc.)
      if (part.parts) {
        for (const subPart of part.parts) {
          if (subPart.prose) {
            const prefix = subPart.id ? `${subPart.id.split('_').pop()}: ` : ''
            statements.push(prefix + subPart.prose)
          }
        }
      }
    }
  }

  return statements.join('\n')
}

/**
 * Extract related control IDs from links
 */
function extractRelatedControls(links: OscalLink[] | undefined): string[] {
  if (!links) return []

  return links
    .filter((link) => link.rel === 'related')
    .map((link) => {
      // Extract control ID from href like "#ac-1"
      const match = link.href.match(/#(.+)/)
      return match ? normalizeControlId(match[1]) : ''
    })
    .filter((id) => id !== '')
}

/**
 * Transform OSCAL parameters to application schema
 */
function transformParameters(
  params: OscalParam[] | undefined
): ControlParameter[] | undefined {
  if (!params || params.length === 0) return undefined

  return params.map((param) => {
    const result: ControlParameter = {
      id: param.id,
      label: param.label,
    }

    if (param.guidelines && param.guidelines.length > 0) {
      result.guidelines = param.guidelines.map((g) => g.prose).join(' ')
    }

    if (param.values && param.values.length > 0) {
      result.values = param.values
    }

    if (param.select) {
      result.select = {
        howMany:
          param.select['how-many'] === 'one-or-more' ? 'one-or-more' : 'one',
        choices: param.select.choice || [],
      }
    }

    return result
  })
}

/**
 * Transform an OSCAL control to our application schema
 */
function transformControl(
  oscalControl: OscalControl,
  baselines: {
    low: Set<string>
    moderate: Set<string>
    high: Set<string>
  },
  parentId?: string
): Control {
  const id = normalizeControlId(oscalControl.id)
  const family = extractFamilyCode(id)

  // Determine baseline applicability
  const baselineApplicability: BaselineApplicability = {
    low: baselines.low.has(id),
    moderate: baselines.moderate.has(id),
    high: baselines.high.has(id),
  }

  // Extract statement and guidance
  const description = extractStatement(oscalControl.parts)
  const guidance = extractProse(oscalControl.parts, 'guidance')

  // Build the control object
  const control: Control = {
    id,
    family,
    title: oscalControl.title,
    description,
    baselines: baselineApplicability,
  }

  // Add optional fields
  if (guidance) {
    control.guidance = guidance
  }

  const params = transformParameters(oscalControl.params)
  if (params) {
    control.parameters = params
  }

  const related = extractRelatedControls(oscalControl.links)
  if (related.length > 0) {
    control.relatedControls = related
  }

  if (parentId) {
    control.parentControl = parentId
  }

  // Track enhancement IDs (will be populated after processing all controls)
  if (oscalControl.controls && oscalControl.controls.length > 0) {
    control.enhancements = oscalControl.controls.map((c) =>
      normalizeControlId(c.id)
    )
  }

  return control
}

/**
 * Recursively extract all controls from OSCAL groups
 */
function extractControlsFromGroup(
  group: OscalGroup,
  baselines: {
    low: Set<string>
    moderate: Set<string>
    high: Set<string>
  },
  allControls: Control[]
): void {
  // Process controls in this group
  if (group.controls) {
    for (const oscalControl of group.controls) {
      // Transform the base control
      const control = transformControl(oscalControl, baselines)
      allControls.push(control)

      // Process enhancements (nested controls)
      if (oscalControl.controls) {
        for (const enhancement of oscalControl.controls) {
          const enhancementControl = transformControl(
            enhancement,
            baselines,
            control.id
          )
          allControls.push(enhancementControl)
        }
      }
    }
  }

  // Process nested groups (if any)
  if (group.groups) {
    for (const subGroup of group.groups) {
      extractControlsFromGroup(subGroup, baselines, allControls)
    }
  }
}

/**
 * Calculate statistics for the catalog
 */
function calculateStatistics(
  controls: Control[],
  families: ControlFamily[]
): CatalogStatistics {
  const baseControls = controls.filter((c) => !c.parentControl).length
  const enhancements = controls.filter((c) => c.parentControl).length

  return {
    totalControls: controls.length,
    baseControls,
    enhancements,
    familyCount: families.length,
    byBaseline: {
      low: controls.filter((c) => c.baselines.low).length,
      moderate: controls.filter((c) => c.baselines.moderate).length,
      high: controls.filter((c) => c.baselines.high).length,
    },
  }
}

/**
 * Build family index from controls
 */
function buildFamilyIndex(controls: Control[]): ControlFamily[] {
  const familyMap = new Map<string, ControlFamily>()

  // Initialize families from metadata
  for (const [id, meta] of Object.entries(FAMILY_METADATA)) {
    familyMap.set(id, {
      id,
      name: meta.name,
      description: meta.description,
      totalControls: 0,
      baseControls: 0,
      byBaseline: { low: 0, moderate: 0, high: 0 },
    })
  }

  // Count controls per family
  for (const control of controls) {
    const family = familyMap.get(control.family)
    if (family) {
      family.totalControls++
      if (!control.parentControl) {
        family.baseControls++
      }
      if (control.baselines.low) family.byBaseline.low++
      if (control.baselines.moderate) family.byBaseline.moderate++
      if (control.baselines.high) family.byBaseline.high++
    }
  }

  // Return sorted families
  return Array.from(familyMap.values()).sort((a, b) => a.id.localeCompare(b.id))
}

/**
 * Sort controls by ID for deterministic output
 */
function sortControls(controls: Control[]): Control[] {
  return controls.sort((a, b) => {
    // Extract family code
    const familyA = extractFamilyCode(a.id)
    const familyB = extractFamilyCode(b.id)

    if (familyA !== familyB) {
      return familyA.localeCompare(familyB)
    }

    // Extract control number
    const numA = parseInt(a.id.match(/(\d+)/)?.[1] || '0', 10)
    const numB = parseInt(b.id.match(/(\d+)/)?.[1] || '0', 10)

    if (numA !== numB) {
      return numA - numB
    }

    // Sort enhancements after base control
    const enhA = a.id.match(/\((\d+)\)/)?.[1]
    const enhB = b.id.match(/\((\d+)\)/)?.[1]

    if (!enhA && enhB) return -1
    if (enhA && !enhB) return 1
    if (enhA && enhB) {
      return parseInt(enhA, 10) - parseInt(enhB, 10)
    }

    return 0
  })
}

/**
 * Main transform function
 */
async function main(): Promise<void> {
  console.log('═'.repeat(60))
  console.log('OSCAL Data Transform')
  console.log('═'.repeat(60))

  // Check for required input files
  const requiredFiles = [
    CATALOG_FILE,
    BASELINE_LOW,
    BASELINE_MODERATE,
    BASELINE_HIGH,
  ]
  const missingFiles = requiredFiles.filter((f) => !existsSync(f))

  if (missingFiles.length > 0) {
    console.error('\n❌ Missing required input files:')
    for (const file of missingFiles) {
      console.error(`   - ${file}`)
    }
    console.error('\nPlease run "npm run data:download" first.')
    process.exit(1)
  }

  console.log('Input files found.')

  // Load baseline profiles
  console.log('\nLoading baseline profiles...')
  const baselines = {
    low: await extractBaselineControlIds(BASELINE_LOW),
    moderate: await extractBaselineControlIds(BASELINE_MODERATE),
    high: await extractBaselineControlIds(BASELINE_HIGH),
  }
  console.log(`  LOW baseline: ${baselines.low.size} controls`)
  console.log(`  MODERATE baseline: ${baselines.moderate.size} controls`)
  console.log(`  HIGH baseline: ${baselines.high.size} controls`)

  // Load and parse catalog
  console.log('\nLoading OSCAL catalog...')
  const catalogContent = await readFile(CATALOG_FILE, 'utf-8')
  const oscalCatalog: OscalCatalog = JSON.parse(catalogContent)

  console.log(`  Title: ${oscalCatalog.catalog.metadata.title}`)
  console.log(`  Version: ${oscalCatalog.catalog.metadata.version}`)
  console.log(
    `  OSCAL Version: ${oscalCatalog.catalog.metadata['oscal-version']}`
  )

  // Extract and transform controls
  console.log('\nTransforming controls...')
  const allControls: Control[] = []

  for (const group of oscalCatalog.catalog.groups) {
    extractControlsFromGroup(group, baselines, allControls)
  }

  // Sort controls for deterministic output
  const sortedControls = sortControls(allControls)
  console.log(`  Extracted ${sortedControls.length} controls`)

  // Build family index
  console.log('\nBuilding family index...')
  const families = buildFamilyIndex(sortedControls)
  console.log(`  Found ${families.length} control families`)

  // Calculate statistics
  const statistics = calculateStatistics(sortedControls, families)

  // Build the catalog
  const catalog: ControlCatalog = {
    version: '1.0',
    generatedAt: new Date().toISOString(),
    source: 'NIST SP 800-53 Rev 5',
    sourceUrl: 'https://github.com/usnistgov/oscal-content',
    controls: sortedControls,
    families,
    statistics,
  }

  // Create output directory if needed
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true })
  }

  // Write output file with sorted keys for deterministic output
  console.log('\nWriting output file...')
  const outputJson = JSON.stringify(catalog, null, 2)
  await writeFile(OUTPUT_FILE, outputJson, 'utf-8')

  const fileSizeKB = (outputJson.length / 1024).toFixed(1)
  const fileSizeMB = (outputJson.length / 1024 / 1024).toFixed(2)
  console.log(`  Output: ${OUTPUT_FILE}`)
  console.log(`  Size: ${fileSizeKB} KB (${fileSizeMB} MB)`)

  // Summary
  console.log('\n' + '═'.repeat(60))
  console.log('Summary')
  console.log('═'.repeat(60))
  console.log(`  Total controls: ${statistics.totalControls}`)
  console.log(`  Base controls: ${statistics.baseControls}`)
  console.log(`  Enhancements: ${statistics.enhancements}`)
  console.log(`  Families: ${statistics.familyCount}`)
  console.log(`  LOW baseline: ${statistics.byBaseline.low} controls`)
  console.log(`  MODERATE baseline: ${statistics.byBaseline.moderate} controls`)
  console.log(`  HIGH baseline: ${statistics.byBaseline.high} controls`)

  // Verify file size constraint
  const fileSizeMBNum = parseFloat(fileSizeMB)
  if (fileSizeMBNum > 5) {
    console.warn(
      `\n⚠️  Warning: Output file exceeds 5MB target (${fileSizeMB} MB)`
    )
  }

  console.log('\n✅ Transform completed successfully!')
}

// Run main function
main().catch((error) => {
  console.error('\n❌ Fatal error:', error.message)
  process.exit(1)
})
