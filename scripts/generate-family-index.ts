#!/usr/bin/env tsx
/**
 * Control Family Index Generator
 *
 * Extracts the family index from the transformed control catalog
 * and writes it as a separate file for efficient client-side lookup.
 *
 * Usage: npm run data:families
 *
 * Story: 9.3 - Generate Control Family Index
 */

import { readFile, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import type { ControlCatalog, ControlFamily } from '../src/types/control'

// Resolve paths
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PROJECT_ROOT = join(__dirname, '..')
const DATA_DIR = join(PROJECT_ROOT, 'public', 'data')
const CATALOG_FILE = join(DATA_DIR, 'nist-800-53-rev5.json')
const OUTPUT_FILE = join(DATA_DIR, 'control-families.json')

/**
 * Family index output structure
 */
interface FamilyIndex {
  /** Schema version */
  version: string
  /** ISO 8601 timestamp when generated */
  generatedAt: string
  /** Source catalog version */
  catalogVersion: string
  /** All control families */
  families: ControlFamily[]
  /** Quick lookup map of family id to index */
  familyIds: string[]
}

/**
 * Main function to generate the family index
 */
async function main(): Promise<void> {
  console.log('═'.repeat(60))
  console.log('Control Family Index Generator')
  console.log('═'.repeat(60))

  // Check for required input file
  if (!existsSync(CATALOG_FILE)) {
    console.error(`\n❌ Missing catalog file: ${CATALOG_FILE}`)
    console.error('\nPlease run "npm run data:transform" first.')
    process.exit(1)
  }

  console.log(`Input: ${CATALOG_FILE}`)

  // Load the transformed catalog
  console.log('\nLoading control catalog...')
  const catalogContent = await readFile(CATALOG_FILE, 'utf-8')
  const catalog: ControlCatalog = JSON.parse(catalogContent)

  console.log(`  Catalog version: ${catalog.version}`)
  console.log(`  Generated at: ${catalog.generatedAt}`)
  console.log(`  Total families: ${catalog.families.length}`)

  // Validate we have all 20 families
  const expectedFamilies = [
    'AC',
    'AT',
    'AU',
    'CA',
    'CM',
    'CP',
    'IA',
    'IR',
    'MA',
    'MP',
    'PE',
    'PL',
    'PM',
    'PS',
    'PT',
    'RA',
    'SA',
    'SC',
    'SI',
    'SR',
  ]

  const foundFamilies = catalog.families.map((f) => f.id)
  const missingFamilies = expectedFamilies.filter(
    (f) => !foundFamilies.includes(f)
  )

  if (missingFamilies.length > 0) {
    console.warn(
      `\n⚠️  Warning: Missing families: ${missingFamilies.join(', ')}`
    )
  }

  // Build the family index
  const familyIndex: FamilyIndex = {
    version: '1.0',
    generatedAt: new Date().toISOString(),
    catalogVersion: catalog.version,
    families: catalog.families,
    familyIds: catalog.families.map((f) => f.id),
  }

  // Write output file
  console.log('\nWriting family index...')
  const outputJson = JSON.stringify(familyIndex, null, 2)
  await writeFile(OUTPUT_FILE, outputJson, 'utf-8')

  const fileSizeKB = (outputJson.length / 1024).toFixed(1)
  console.log(`  Output: ${OUTPUT_FILE}`)
  console.log(`  Size: ${fileSizeKB} KB`)

  // Summary
  console.log('\n' + '═'.repeat(60))
  console.log('Summary')
  console.log('═'.repeat(60))
  console.log(`  Families: ${familyIndex.families.length}`)

  // Print family breakdown
  console.log('\n  Family Control Counts:')
  console.log('  ' + '-'.repeat(56))
  console.log(
    '  ' +
      'Family'.padEnd(10) +
      'Total'.padStart(8) +
      'Base'.padStart(8) +
      'Low'.padStart(8) +
      'Mod'.padStart(8) +
      'High'.padStart(8)
  )
  console.log('  ' + '-'.repeat(56))

  for (const family of familyIndex.families) {
    console.log(
      '  ' +
        family.id.padEnd(10) +
        family.totalControls.toString().padStart(8) +
        family.baseControls.toString().padStart(8) +
        family.byBaseline.low.toString().padStart(8) +
        family.byBaseline.moderate.toString().padStart(8) +
        family.byBaseline.high.toString().padStart(8)
    )
  }

  console.log('  ' + '-'.repeat(56))

  // Calculate totals
  const totalControls = familyIndex.families.reduce(
    (sum, f) => sum + f.totalControls,
    0
  )
  const totalBase = familyIndex.families.reduce(
    (sum, f) => sum + f.baseControls,
    0
  )
  const totalLow = familyIndex.families.reduce(
    (sum, f) => sum + f.byBaseline.low,
    0
  )
  const totalMod = familyIndex.families.reduce(
    (sum, f) => sum + f.byBaseline.moderate,
    0
  )
  const totalHigh = familyIndex.families.reduce(
    (sum, f) => sum + f.byBaseline.high,
    0
  )

  console.log(
    '  ' +
      'TOTAL'.padEnd(10) +
      totalControls.toString().padStart(8) +
      totalBase.toString().padStart(8) +
      totalLow.toString().padStart(8) +
      totalMod.toString().padStart(8) +
      totalHigh.toString().padStart(8)
  )

  console.log('\n✅ Family index generated successfully!')
}

// Run main function
main().catch((error) => {
  console.error('\n❌ Fatal error:', error.message)
  process.exit(1)
})
