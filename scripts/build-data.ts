#!/usr/bin/env tsx
/**
 * OSCAL Data Pipeline Orchestrator
 *
 * Single command to download, transform, and validate all control catalog data.
 * This script orchestrates the complete data pipeline for NIST 800-53 controls.
 *
 * Usage:
 *   npm run data:build              # Full build (download if needed, transform, validate)
 *   npm run data:build -- --force   # Force re-download and regenerate everything
 *   npm run data:build -- --validate-only  # Validate existing files without regeneration
 *   npm run data:build -- --verbose # Show detailed output
 *
 * Story: 9.4 - Create Build Script for Data Pipeline
 */

import { spawn } from 'child_process'
import { readFile, stat } from 'fs/promises'
import { existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import type { ControlCatalog } from '../src/types/control'

// Resolve paths
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PROJECT_ROOT = join(__dirname, '..')
const DATA_DIR = join(PROJECT_ROOT, 'public', 'data')
const RAW_DIR = join(PROJECT_ROOT, 'data', 'oscal-raw')

// Output files
const CATALOG_FILE = join(DATA_DIR, 'nist-800-53-rev5.json')
const FAMILIES_FILE = join(DATA_DIR, 'control-families.json')
const MANIFEST_FILE = join(RAW_DIR, 'manifest.json')

// Parse command line arguments
const args = process.argv.slice(2)
const forceMode = args.includes('--force')
const validateOnly = args.includes('--validate-only')
const verbose = args.includes('--verbose')

interface StepResult {
  success: boolean
  message: string
  duration: number
  skipped?: boolean
}

/**
 * Run a script as a subprocess
 */
async function runScript(
  scriptName: string,
  scriptArgs: string[] = []
): Promise<StepResult> {
  const startTime = Date.now()

  return new Promise((resolve) => {
    const tsx = join(PROJECT_ROOT, 'node_modules', '.bin', 'tsx')
    const scriptPath = join(PROJECT_ROOT, 'scripts', scriptName)

    const child = spawn(tsx, [scriptPath, ...scriptArgs], {
      cwd: PROJECT_ROOT,
      stdio: verbose ? 'inherit' : 'pipe',
    })

    let stdout = ''
    let stderr = ''

    if (!verbose && child.stdout) {
      child.stdout.on('data', (data) => {
        stdout += data.toString()
      })
    }

    if (!verbose && child.stderr) {
      child.stderr.on('data', (data) => {
        stderr += data.toString()
      })
    }

    child.on('close', (code) => {
      const duration = Date.now() - startTime

      if (code === 0) {
        resolve({
          success: true,
          message: verbose ? '' : extractSummary(stdout),
          duration,
        })
      } else {
        resolve({
          success: false,
          message: stderr || stdout || `Exit code: ${code}`,
          duration,
        })
      }
    })

    child.on('error', (error) => {
      resolve({
        success: false,
        message: error.message,
        duration: Date.now() - startTime,
      })
    })
  })
}

/**
 * Extract summary info from script output
 */
function extractSummary(output: string): string {
  // Look for success message or key stats
  const lines = output.split('\n')
  const summaryLines = lines.filter(
    (line) =>
      line.includes('✅') ||
      line.includes('✓') ||
      line.includes('Total') ||
      line.includes('Generated')
  )
  return summaryLines.slice(-3).join('; ').trim() || 'Completed'
}

/**
 * Check if download is needed
 */
function isDownloadNeeded(): boolean {
  if (forceMode) return true
  if (!existsSync(MANIFEST_FILE)) return true

  // Check if all raw files exist
  const rawFiles = [
    'NIST_SP-800-53_rev5_catalog.json',
    'NIST_SP-800-53_rev5_LOW-baseline_profile.json',
    'NIST_SP-800-53_rev5_MODERATE-baseline_profile.json',
    'NIST_SP-800-53_rev5_HIGH-baseline_profile.json',
  ]

  for (const file of rawFiles) {
    if (!existsSync(join(RAW_DIR, file))) return true
  }

  return false
}

/**
 * Validate output files exist and are valid JSON
 */
async function validateOutputFiles(): Promise<{
  valid: boolean
  errors: string[]
  stats: {
    catalogSize: number
    familiesSize: number
    totalControls: number
    familyCount: number
    byBaseline: { low: number; moderate: number; high: number }
  } | null
}> {
  const errors: string[] = []

  // Check catalog file
  if (!existsSync(CATALOG_FILE)) {
    errors.push(`Missing: ${CATALOG_FILE}`)
  }

  // Check families file
  if (!existsSync(FAMILIES_FILE)) {
    errors.push(`Missing: ${FAMILIES_FILE}`)
  }

  if (errors.length > 0) {
    return { valid: false, errors, stats: null }
  }

  // Validate JSON and extract stats
  try {
    const catalogContent = await readFile(CATALOG_FILE, 'utf-8')
    const catalog: ControlCatalog = JSON.parse(catalogContent)

    // Validate structure
    if (!catalog.controls || !Array.isArray(catalog.controls)) {
      errors.push('Catalog missing controls array')
    }

    if (!catalog.families || !Array.isArray(catalog.families)) {
      errors.push('Catalog missing families array')
    }

    if (!catalog.statistics) {
      errors.push('Catalog missing statistics')
    }

    // Check families file
    const familiesContent = await readFile(FAMILIES_FILE, 'utf-8')
    const families = JSON.parse(familiesContent)

    if (!families.families || families.families.length !== 20) {
      errors.push(
        `Expected 20 families, found ${families.families?.length || 0}`
      )
    }

    // Get file sizes
    const catalogStat = await stat(CATALOG_FILE)
    const familiesStat = await stat(FAMILIES_FILE)

    // Verify counts match
    if (catalog.statistics) {
      const expectedTotal = catalog.controls.length
      if (catalog.statistics.totalControls !== expectedTotal) {
        errors.push(
          `Statistics mismatch: totalControls is ${catalog.statistics.totalControls} but found ${expectedTotal} controls`
        )
      }
    }

    if (errors.length > 0) {
      return { valid: false, errors, stats: null }
    }

    return {
      valid: true,
      errors: [],
      stats: {
        catalogSize: catalogStat.size,
        familiesSize: familiesStat.size,
        totalControls:
          catalog.statistics?.totalControls || catalog.controls.length,
        familyCount: catalog.families.length,
        byBaseline: catalog.statistics?.byBaseline || {
          low: 0,
          moderate: 0,
          high: 0,
        },
      },
    }
  } catch (error) {
    errors.push(`JSON parse error: ${(error as Error).message}`)
    return { valid: false, errors, stats: null }
  }
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

/**
 * Format duration to human readable
 */
function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

/**
 * Main orchestration function
 */
async function main(): Promise<void> {
  const totalStartTime = Date.now()

  console.log('')
  console.log('🔄 OSCAL Data Pipeline')
  console.log('═'.repeat(60))
  console.log(
    `Mode: ${validateOnly ? 'Validate Only' : forceMode ? 'Force Rebuild' : 'Build'}`
  )
  console.log(`Verbose: ${verbose}`)
  console.log('')

  // Validate-only mode
  if (validateOnly) {
    console.log('Step 1/1: Validating output files...')
    const validation = await validateOutputFiles()

    if (!validation.valid) {
      console.log('  ✗ Validation failed:')
      for (const error of validation.errors) {
        console.log(`    - ${error}`)
      }
      process.exit(1)
    }

    console.log('  ✓ All validations passed')

    if (validation.stats) {
      console.log('')
      console.log('📊 Summary')
      console.log('─'.repeat(40))
      console.log(
        `  Catalog size: ${formatBytes(validation.stats.catalogSize)}`
      )
      console.log(
        `  Families size: ${formatBytes(validation.stats.familiesSize)}`
      )
      console.log(`  Controls: ${validation.stats.totalControls}`)
      console.log(`  Families: ${validation.stats.familyCount}`)
      console.log(`  LOW baseline: ${validation.stats.byBaseline.low}`)
      console.log(
        `  MODERATE baseline: ${validation.stats.byBaseline.moderate}`
      )
      console.log(`  HIGH baseline: ${validation.stats.byBaseline.high}`)
    }

    console.log('')
    console.log('✅ Validation completed successfully!')
    return
  }

  const steps: { name: string; result: StepResult }[] = []

  // Step 1: Download OSCAL data
  console.log('Step 1/4: Downloading OSCAL data...')
  if (isDownloadNeeded()) {
    const downloadArgs = forceMode ? ['--force'] : []
    const downloadResult = await runScript('download-oscal.ts', downloadArgs)
    steps.push({ name: 'Download', result: downloadResult })

    if (!downloadResult.success) {
      console.log(`  ✗ Download failed: ${downloadResult.message}`)
      process.exit(1)
    }
    console.log(`  ✓ Downloaded (${formatDuration(downloadResult.duration)})`)
  } else {
    console.log('  ✓ Using cached data (manifest valid)')
    steps.push({
      name: 'Download',
      result: { success: true, message: 'Cached', duration: 0, skipped: true },
    })
  }

  // Step 2: Transform to application schema
  console.log('Step 2/4: Transforming to application schema...')
  const transformResult = await runScript('transform-oscal.ts')
  steps.push({ name: 'Transform', result: transformResult })

  if (!transformResult.success) {
    console.log(`  ✗ Transform failed: ${transformResult.message}`)
    process.exit(1)
  }
  console.log(`  ✓ Transformed (${formatDuration(transformResult.duration)})`)

  // Step 3: Generate family index
  console.log('Step 3/4: Generating family index...')
  const familiesResult = await runScript('generate-family-index.ts')
  steps.push({ name: 'Families', result: familiesResult })

  if (!familiesResult.success) {
    console.log(`  ✗ Family index failed: ${familiesResult.message}`)
    process.exit(1)
  }
  console.log(`  ✓ Generated (${formatDuration(familiesResult.duration)})`)

  // Step 4: Validate outputs
  console.log('Step 4/4: Validating outputs...')
  const validation = await validateOutputFiles()

  if (!validation.valid) {
    console.log('  ✗ Validation failed:')
    for (const error of validation.errors) {
      console.log(`    - ${error}`)
    }
    process.exit(1)
  }
  console.log('  ✓ All validations passed')

  const totalDuration = Date.now() - totalStartTime

  // Summary
  console.log('')
  console.log('📊 Summary')
  console.log('─'.repeat(40))

  if (validation.stats) {
    console.log(`  Files generated:`)
    console.log(
      `    - nist-800-53-rev5.json (${formatBytes(validation.stats.catalogSize)})`
    )
    console.log(
      `    - control-families.json (${formatBytes(validation.stats.familiesSize)})`
    )
    console.log('')
    console.log(`  Controls: ${validation.stats.totalControls} total`)
    console.log(`    - LOW baseline: ${validation.stats.byBaseline.low}`)
    console.log(
      `    - MODERATE baseline: ${validation.stats.byBaseline.moderate}`
    )
    console.log(`    - HIGH baseline: ${validation.stats.byBaseline.high}`)
    console.log(`  Families: ${validation.stats.familyCount}`)
  }

  console.log('')
  console.log(`  Total time: ${formatDuration(totalDuration)}`)

  // Step breakdown
  if (verbose) {
    console.log('')
    console.log('  Step breakdown:')
    for (const step of steps) {
      const status = step.result.skipped
        ? 'skipped'
        : step.result.success
          ? 'success'
          : 'failed'
      console.log(
        `    - ${step.name}: ${status} (${formatDuration(step.result.duration)})`
      )
    }
  }

  console.log('')
  console.log('✅ Data pipeline completed successfully!')
}

// Run main function
main().catch((error) => {
  console.error('\n❌ Fatal error:', error.message)
  process.exit(1)
})
