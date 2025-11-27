#!/usr/bin/env tsx
/**
 * FedRAMP Baselines Generation Script
 *
 * Generates FedRAMP baseline data from the NIST 800-53 Rev 5 catalog.
 * FedRAMP baselines are based on NIST baselines with additional requirements
 * and FedRAMP-specific parameter values.
 *
 * Usage: npx tsx scripts/generate-fedramp-baselines.ts
 *
 * Story: 3.2 - Create FedRAMP Baseline Data File
 */

import { readFile, writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import type { ControlCatalog, Control } from '../src/types/control'

// Resolve paths
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PROJECT_ROOT = join(__dirname, '..')
const DATA_DIR = join(PROJECT_ROOT, 'public', 'data')
const CATALOG_FILE = join(DATA_DIR, 'nist-800-53-rev5.json')
const OUTPUT_FILE = join(DATA_DIR, 'fedramp-baselines.json')

/**
 * FedRAMP-specific parameter defaults
 * These are common organizational parameters that FedRAMP defines
 */
const FEDRAMP_PARAMETER_DEFAULTS: Record<string, Record<string, string>> = {
  // Access Control parameters
  'ac-01_odp.05': { value: 'at least every 3 years' },
  'ac-01_odp.06': { value: 'significant changes to the system or environment' },
  'ac-01_odp.07': { value: 'at least annually' },
  'ac-02_odp.10': { value: 'at least annually' },
  'ac-02_odp.11': { value: 'at least annually for privileged accounts' },
  'ac-11_odp.01': { value: '15 minutes' },
  'ac-12_odp.01': { value: '30 minutes for privileged sessions' },
  'ac-17_odp.01': { value: 'annually' },

  // Audit and Accountability parameters
  'au-01_odp.05': { value: 'at least every 3 years' },
  'au-01_odp.07': { value: 'at least annually' },
  'au-04_odp.01': { value: '90 days online, 1 year total' },
  'au-05_odp.01': { value: 'within 5 minutes' },
  'au-06_odp.01': { value: 'at least weekly' },
  'au-11_odp.01': { value: 'at least 90 days online, 1 year offline' },

  // Assessment parameters
  'ca-01_odp.05': { value: 'at least every 3 years' },
  'ca-01_odp.07': { value: 'at least annually' },
  'ca-02_odp.01': { value: 'at least annually' },
  'ca-07_odp.01': { value: 'continuous or at least monthly' },

  // Configuration Management parameters
  'cm-01_odp.05': { value: 'at least every 3 years' },
  'cm-01_odp.07': { value: 'at least annually' },
  'cm-02_odp.01': { value: 'at least annually' },
  'cm-06_odp.01': {
    value: 'United States Government Configuration Baseline (USGCB)',
  },
  'cm-08_odp.01': { value: 'at least quarterly' },

  // Contingency Planning parameters
  'cp-01_odp.05': { value: 'at least every 3 years' },
  'cp-01_odp.07': { value: 'at least annually' },
  'cp-02_odp.01': { value: 'at least annually' },
  'cp-04_odp.01': { value: 'at least annually' },

  // Identification and Authentication parameters
  'ia-01_odp.05': { value: 'at least every 3 years' },
  'ia-01_odp.07': { value: 'at least annually' },
  'ia-04_odp.01': { value: '90 days of inactivity' },
  'ia-05_odp.01': { value: 'at least annually' },

  // Incident Response parameters
  'ir-01_odp.05': { value: 'at least every 3 years' },
  'ir-01_odp.07': { value: 'at least annually' },
  'ir-06_odp.01': { value: 'within 1 hour of discovery' },

  // Maintenance parameters
  'ma-01_odp.05': { value: 'at least every 3 years' },
  'ma-01_odp.07': { value: 'at least annually' },

  // Media Protection parameters
  'mp-01_odp.05': { value: 'at least every 3 years' },
  'mp-01_odp.07': { value: 'at least annually' },

  // Physical and Environmental parameters
  'pe-01_odp.05': { value: 'at least every 3 years' },
  'pe-01_odp.07': { value: 'at least annually' },

  // Planning parameters
  'pl-01_odp.05': { value: 'at least every 3 years' },
  'pl-01_odp.07': { value: 'at least annually' },
  'pl-02_odp.01': { value: 'at least annually' },

  // Personnel Security parameters
  'ps-01_odp.05': { value: 'at least every 3 years' },
  'ps-01_odp.07': { value: 'at least annually' },

  // Risk Assessment parameters
  'ra-01_odp.05': { value: 'at least every 3 years' },
  'ra-01_odp.07': { value: 'at least annually' },
  'ra-03_odp.01': {
    value: 'at least annually or when significant changes occur',
  },
  'ra-05_odp.01': {
    value: 'monthly for operating systems, weekly for web applications',
  },
  'ra-05_odp.02': {
    value: 'within 30 days for high, 90 days for moderate, 180 days for low',
  },

  // System and Services Acquisition parameters
  'sa-01_odp.05': { value: 'at least every 3 years' },
  'sa-01_odp.07': { value: 'at least annually' },

  // System and Communications Protection parameters
  'sc-01_odp.05': { value: 'at least every 3 years' },
  'sc-01_odp.07': { value: 'at least annually' },
  'sc-07_odp.01': { value: 'all external network traffic' },
  'sc-13_odp.01': { value: 'FIPS 140-2 validated cryptography' },

  // System and Information Integrity parameters
  'si-01_odp.05': { value: 'at least every 3 years' },
  'si-01_odp.07': { value: 'at least annually' },
  'si-02_odp.01': { value: 'within 30 days for critical, 90 days for high' },
  'si-03_odp.01': { value: 'at least weekly' },
  'si-04_odp.01': { value: 'continuously' },

  // Supply Chain parameters
  'sr-01_odp.05': { value: 'at least every 3 years' },
  'sr-01_odp.07': { value: 'at least annually' },
}

/**
 * Additional controls required by FedRAMP beyond NIST baselines
 * These are controls that FedRAMP requires even if not in the NIST baseline
 */
const FEDRAMP_ADDITIONAL_CONTROLS: Record<string, string[]> = {
  LOW: [
    // FedRAMP Low has some additional requirements
    'AC-2(1)', // Automated Account Management
    'CA-2(1)', // Independent Assessors
    'IA-2(1)', // Multi-factor to Privileged Accounts
    'IA-2(2)', // Multi-factor to Non-Privileged Accounts
    'IA-2(12)', // PIV Credential Acceptance
    'SC-13', // Cryptographic Protection
  ],
  MODERATE: [
    // FedRAMP Moderate additional
    'CA-2(1)', // Independent Assessors
    'CA-2(2)', // Specialized Assessments
    'IA-2(12)', // PIV Credential Acceptance
    'PE-17', // Alternate Work Site
    'SA-9(2)', // Identification of Functions
    'SC-28(1)', // Cryptographic Protection
    'SI-4(5)', // System-Generated Alerts
  ],
  HIGH: [
    // FedRAMP High additional
    'AU-9(2)', // Audit Backup on Separate System
    'CA-2(2)', // Specialized Assessments
    'CP-6(3)', // Accessibility
    'IA-5(2)', // PKI-Based Authentication
    'PE-18', // Location of Components
    'SC-3', // Security Function Isolation
    'SI-4(12)', // Automated Organization-Generated Alerts
  ],
}

/**
 * FedRAMP LI-SaaS specific controls
 * Low Impact SaaS uses a tailored set of controls
 */
const FEDRAMP_LI_SAAS_CONTROLS = [
  'AC-1',
  'AC-2',
  'AC-3',
  'AC-7',
  'AC-8',
  'AC-14',
  'AC-17',
  'AC-18',
  'AC-19',
  'AC-20',
  'AC-22',
  'AT-1',
  'AT-2',
  'AT-3',
  'AT-4',
  'AU-1',
  'AU-2',
  'AU-3',
  'AU-4',
  'AU-5',
  'AU-6',
  'AU-8',
  'AU-9',
  'AU-11',
  'AU-12',
  'CA-1',
  'CA-2',
  'CA-3',
  'CA-5',
  'CA-6',
  'CA-7',
  'CA-9',
  'CM-1',
  'CM-2',
  'CM-4',
  'CM-6',
  'CM-7',
  'CM-8',
  'CM-10',
  'CM-11',
  'CP-1',
  'CP-2',
  'CP-3',
  'CP-4',
  'CP-9',
  'CP-10',
  'IA-1',
  'IA-2',
  'IA-2(1)',
  'IA-2(2)',
  'IA-2(12)',
  'IA-4',
  'IA-5',
  'IA-5(1)',
  'IA-6',
  'IA-7',
  'IA-8',
  'IA-11',
  'IR-1',
  'IR-2',
  'IR-4',
  'IR-5',
  'IR-6',
  'IR-7',
  'IR-8',
  'MA-1',
  'MA-2',
  'MA-4',
  'MA-5',
  'MP-1',
  'MP-2',
  'MP-6',
  'MP-7',
  'PE-1',
  'PE-2',
  'PE-3',
  'PE-6',
  'PE-8',
  'PE-12',
  'PE-13',
  'PE-14',
  'PE-15',
  'PE-16',
  'PL-1',
  'PL-2',
  'PL-4',
  'PL-10',
  'PL-11',
  'PS-1',
  'PS-2',
  'PS-3',
  'PS-4',
  'PS-5',
  'PS-6',
  'PS-7',
  'PS-8',
  'PS-9',
  'RA-1',
  'RA-2',
  'RA-3',
  'RA-5',
  'RA-7',
  'SA-1',
  'SA-2',
  'SA-3',
  'SA-4',
  'SA-5',
  'SA-9',
  'SC-1',
  'SC-5',
  'SC-7',
  'SC-12',
  'SC-13',
  'SC-15',
  'SC-20',
  'SC-21',
  'SC-22',
  'SC-39',
  'SI-1',
  'SI-2',
  'SI-3',
  'SI-4',
  'SI-5',
  'SI-10',
  'SI-11',
  'SI-12',
  'SI-16',
  'SR-1',
  'SR-2',
  'SR-3',
  'SR-5',
  'SR-8',
  'SR-10',
  'SR-11',
  'SR-12',
]

interface FedRampBaselineData {
  id: 'FEDRAMP_LOW' | 'FEDRAMP_MODERATE' | 'FEDRAMP_HIGH' | 'FEDRAMP_LI_SAAS'
  name: string
  description: string
  controlCount: number
  controlIds: string[]
  parameterDefaults: Record<string, string>
}

interface FedRampBaselinesOutput {
  version: string
  generatedAt: string
  source: string
  sourceUrl: string
  baselines: FedRampBaselineData[]
}

/**
 * Extract controls for a specific baseline from the catalog
 */
function extractBaselineControls(
  controls: Control[],
  baseline: 'low' | 'moderate' | 'high',
  additionalControls: string[]
): string[] {
  const controlIds = new Set<string>()

  // Add controls from the NIST baseline
  for (const control of controls) {
    if (typeof control.baselines === 'object' && 'low' in control.baselines) {
      if (control.baselines[baseline]) {
        controlIds.add(control.id)
      }
    }
  }

  // Add FedRAMP-specific additional controls
  for (const id of additionalControls) {
    controlIds.add(id)
  }

  // Sort control IDs
  return Array.from(controlIds).sort((a, b) => {
    const familyA = a.match(/^([A-Z]{2})/)?.[1] || ''
    const familyB = b.match(/^([A-Z]{2})/)?.[1] || ''

    if (familyA !== familyB) {
      return familyA.localeCompare(familyB)
    }

    const numA = parseInt(a.match(/(\d+)/)?.[1] || '0', 10)
    const numB = parseInt(b.match(/(\d+)/)?.[1] || '0', 10)

    if (numA !== numB) {
      return numA - numB
    }

    const enhA = a.match(/\((\d+)\)/)?.[1]
    const enhB = b.match(/\((\d+)\)/)?.[1]

    if (!enhA && enhB) return -1
    if (enhA && !enhB) return 1
    if (enhA && enhB) {
      return parseInt(enhA, 10) - parseInt(enhB, 10)
    }

    return 0
  })
}

/**
 * Get parameter defaults relevant to a baseline
 */
function getParameterDefaultsForBaseline(
  controlIds: string[]
): Record<string, string> {
  const defaults: Record<string, string> = {}

  // Get all parameter IDs that start with control family prefixes
  const families = new Set(
    controlIds.map((id) => id.match(/^([A-Z]{2})/)?.[1]?.toLowerCase() || '')
  )

  for (const [paramId, paramData] of Object.entries(
    FEDRAMP_PARAMETER_DEFAULTS
  )) {
    const paramFamily = paramId.match(/^([a-z]{2})/)?.[1] || ''
    if (families.has(paramFamily)) {
      defaults[paramId] = paramData.value
    }
  }

  return defaults
}

/**
 * Main generation function
 */
async function main(): Promise<void> {
  console.log('═'.repeat(60))
  console.log('FedRAMP Baselines Generation')
  console.log('═'.repeat(60))

  // Check for catalog file
  if (!existsSync(CATALOG_FILE)) {
    console.error(`\n❌ Missing catalog file: ${CATALOG_FILE}`)
    console.error('Please run "npm run data:build" first.')
    process.exit(1)
  }

  // Load the catalog
  console.log('\nLoading NIST 800-53 catalog...')
  const catalogContent = await readFile(CATALOG_FILE, 'utf-8')
  const catalog: ControlCatalog = JSON.parse(catalogContent)

  if (!catalog.controls) {
    console.error('❌ Catalog has no controls array')
    process.exit(1)
  }

  console.log(`  Loaded ${catalog.controls.length} controls`)

  // Generate baselines
  console.log('\nGenerating FedRAMP baselines...')

  const lowControls = extractBaselineControls(
    catalog.controls,
    'low',
    FEDRAMP_ADDITIONAL_CONTROLS.LOW
  )
  console.log(`  FedRAMP Low: ${lowControls.length} controls`)

  const moderateControls = extractBaselineControls(
    catalog.controls,
    'moderate',
    FEDRAMP_ADDITIONAL_CONTROLS.MODERATE
  )
  console.log(`  FedRAMP Moderate: ${moderateControls.length} controls`)

  const highControls = extractBaselineControls(
    catalog.controls,
    'high',
    FEDRAMP_ADDITIONAL_CONTROLS.HIGH
  )
  console.log(`  FedRAMP High: ${highControls.length} controls`)

  const liSaasControls = FEDRAMP_LI_SAAS_CONTROLS.sort()
  console.log(`  FedRAMP LI-SaaS: ${liSaasControls.length} controls`)

  // Build output structure
  const output: FedRampBaselinesOutput = {
    version: '1.0',
    generatedAt: new Date().toISOString(),
    source: 'FedRAMP Security Assessment Framework',
    sourceUrl: 'https://www.fedramp.gov/documents/',
    baselines: [
      {
        id: 'FEDRAMP_LOW',
        name: 'FedRAMP Low',
        description:
          'For cloud systems with low impact levels. Appropriate for systems where the loss of confidentiality, integrity, or availability would have limited adverse effect.',
        controlCount: lowControls.length,
        controlIds: lowControls,
        parameterDefaults: getParameterDefaultsForBaseline(lowControls),
      },
      {
        id: 'FEDRAMP_MODERATE',
        name: 'FedRAMP Moderate',
        description:
          'For cloud systems with moderate impact levels. Most common FedRAMP authorization level. Appropriate for systems where the loss of confidentiality, integrity, or availability would have serious adverse effect.',
        controlCount: moderateControls.length,
        controlIds: moderateControls,
        parameterDefaults: getParameterDefaultsForBaseline(moderateControls),
      },
      {
        id: 'FEDRAMP_HIGH',
        name: 'FedRAMP High',
        description:
          'For cloud systems with high impact levels. Required for systems containing highly sensitive data such as law enforcement, healthcare, and financial data where the loss would have severe or catastrophic adverse effect.',
        controlCount: highControls.length,
        controlIds: highControls,
        parameterDefaults: getParameterDefaultsForBaseline(highControls),
      },
      {
        id: 'FEDRAMP_LI_SAAS',
        name: 'FedRAMP Tailored LI-SaaS',
        description:
          'Tailored baseline for Low-Impact Software as a Service (LI-SaaS) applications. A streamlined process for low-risk cloud applications that do not store personally identifiable information beyond basic user credentials.',
        controlCount: liSaasControls.length,
        controlIds: liSaasControls,
        parameterDefaults: getParameterDefaultsForBaseline(liSaasControls),
      },
    ],
  }

  // Ensure output directory exists
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true })
  }

  // Write output file
  console.log('\nWriting output file...')
  const outputJson = JSON.stringify(output, null, 2)
  await writeFile(OUTPUT_FILE, outputJson, 'utf-8')

  const fileSizeKB = (outputJson.length / 1024).toFixed(1)
  console.log(`  Output: ${OUTPUT_FILE}`)
  console.log(`  Size: ${fileSizeKB} KB`)

  // Summary
  console.log('\n' + '═'.repeat(60))
  console.log('Summary')
  console.log('═'.repeat(60))
  console.log(`  FedRAMP Low:      ${lowControls.length} controls`)
  console.log(`  FedRAMP Moderate: ${moderateControls.length} controls`)
  console.log(`  FedRAMP High:     ${highControls.length} controls`)
  console.log(`  FedRAMP LI-SaaS:  ${liSaasControls.length} controls`)

  console.log('\n✅ FedRAMP baselines generated successfully!')
}

// Run main function
main().catch((error) => {
  console.error('\n❌ Fatal error:', error.message)
  process.exit(1)
})
