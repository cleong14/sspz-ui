#!/usr/bin/env tsx
/**
 * OSCAL Data Download Script
 *
 * Downloads NIST 800-53 Rev 5 catalog and baseline data from the official
 * NIST OSCAL content repository.
 *
 * Usage: npm run data:download [-- --force]
 *
 * Options:
 *   --force  Re-download files even if they already exist
 *
 * Story: 9.1 - Download NIST OSCAL Catalog
 */

import { createHash } from 'crypto'
import { mkdir, readFile, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

// Resolve paths
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PROJECT_ROOT = join(__dirname, '..')
const OUTPUT_DIR = join(PROJECT_ROOT, 'data', 'oscal-raw')

// NIST OSCAL Content Repository URLs
// Source: https://github.com/usnistgov/oscal-content
const BASE_URL =
  'https://raw.githubusercontent.com/usnistgov/oscal-content/main/nist.gov/SP800-53/rev5/json'

interface OscalFile {
  name: string
  filename: string
  url: string
  description: string
}

const OSCAL_FILES: OscalFile[] = [
  {
    name: 'catalog',
    filename: 'NIST_SP-800-53_rev5_catalog.json',
    url: `${BASE_URL}/NIST_SP-800-53_rev5_catalog.json`,
    description: 'NIST 800-53 Rev 5 Control Catalog',
  },
  {
    name: 'baseline-low',
    filename: 'NIST_SP-800-53_rev5_LOW-baseline_profile.json',
    url: `${BASE_URL}/NIST_SP-800-53_rev5_LOW-baseline_profile.json`,
    description: 'NIST 800-53 Rev 5 LOW Baseline Profile',
  },
  {
    name: 'baseline-moderate',
    filename: 'NIST_SP-800-53_rev5_MODERATE-baseline_profile.json',
    url: `${BASE_URL}/NIST_SP-800-53_rev5_MODERATE-baseline_profile.json`,
    description: 'NIST 800-53 Rev 5 MODERATE Baseline Profile',
  },
  {
    name: 'baseline-high',
    filename: 'NIST_SP-800-53_rev5_HIGH-baseline_profile.json',
    url: `${BASE_URL}/NIST_SP-800-53_rev5_HIGH-baseline_profile.json`,
    description: 'NIST 800-53 Rev 5 HIGH Baseline Profile',
  },
]

interface ManifestEntry {
  name: string
  filename: string
  url: string
  checksum: string
  size: number
  downloadedAt: string
}

interface Manifest {
  version: string
  generatedAt: string
  source: string
  files: ManifestEntry[]
}

/**
 * Calculate SHA256 checksum of content
 */
function calculateChecksum(content: string): string {
  return createHash('sha256').update(content).digest('hex')
}

/**
 * Load existing manifest if it exists
 */
async function loadManifest(): Promise<Manifest | null> {
  const manifestPath = join(OUTPUT_DIR, 'manifest.json')
  if (!existsSync(manifestPath)) {
    return null
  }
  try {
    const content = await readFile(manifestPath, 'utf-8')
    return JSON.parse(content) as Manifest
  } catch {
    return null
  }
}

/**
 * Save manifest file
 */
async function saveManifest(manifest: Manifest): Promise<void> {
  const manifestPath = join(OUTPUT_DIR, 'manifest.json')
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8')
}

/**
 * Download a file with retry logic
 */
async function downloadFile(
  url: string,
  retries = 3
): Promise<{ content: string; size: number }> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`  Downloading from ${url}...`)
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'sspz-ui/1.0 (NIST OSCAL Data Download)',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const content = await response.text()
      return { content, size: content.length }
    } catch (error) {
      if (attempt === retries) {
        throw error
      }
      console.log(`  Attempt ${attempt} failed, retrying...`)
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
    }
  }
  throw new Error('Download failed after all retries')
}

/**
 * Validate that content is valid JSON with expected OSCAL structure
 */
function validateOscalJson(content: string, filename: string): boolean {
  try {
    const data = JSON.parse(content)

    // Check for OSCAL root properties
    if (filename.includes('catalog')) {
      if (!data.catalog) {
        console.log(`  Warning: Missing 'catalog' root property`)
        return false
      }
    } else if (filename.includes('profile')) {
      if (!data.profile) {
        console.log(`  Warning: Missing 'profile' root property`)
        return false
      }
    }

    return true
  } catch (e) {
    console.log(`  Error: Invalid JSON - ${(e as Error).message}`)
    return false
  }
}

/**
 * Check if file needs to be downloaded
 */
function needsDownload(
  file: OscalFile,
  manifest: Manifest | null,
  force: boolean
): boolean {
  if (force) {
    return true
  }

  const filePath = join(OUTPUT_DIR, file.filename)
  if (!existsSync(filePath)) {
    return true
  }

  // Check if file is in manifest with valid checksum
  if (manifest) {
    const entry = manifest.files.find((f) => f.filename === file.filename)
    if (!entry) {
      return true
    }
    // We could verify checksum here, but that would require reading the file
    // For now, trust the manifest
    return false
  }

  return true
}

/**
 * Main download function
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const force = args.includes('--force')

  console.log('═'.repeat(60))
  console.log('OSCAL Data Download')
  console.log('═'.repeat(60))
  console.log(`Output directory: ${OUTPUT_DIR}`)
  console.log(`Force re-download: ${force}`)
  console.log('')

  // Create output directory if needed
  if (!existsSync(OUTPUT_DIR)) {
    console.log('Creating output directory...')
    await mkdir(OUTPUT_DIR, { recursive: true })
  }

  // Load existing manifest
  const existingManifest = await loadManifest()
  if (existingManifest && !force) {
    console.log(
      `Existing manifest found (generated: ${existingManifest.generatedAt})`
    )
  }

  // Download each file
  const manifestEntries: ManifestEntry[] = []
  let downloadCount = 0
  let skipCount = 0
  let errorCount = 0

  for (const file of OSCAL_FILES) {
    console.log(`\n[${file.name}] ${file.description}`)

    if (!needsDownload(file, existingManifest, force)) {
      console.log('  ✓ Using cached file')
      // Copy existing manifest entry
      const existingEntry = existingManifest?.files.find(
        (f) => f.filename === file.filename
      )
      if (existingEntry) {
        manifestEntries.push(existingEntry)
      }
      skipCount++
      continue
    }

    try {
      const { content, size } = await downloadFile(file.url)

      // Validate JSON structure
      if (!validateOscalJson(content, file.filename)) {
        console.log('  ✗ Validation failed - file may be corrupted')
        errorCount++
        continue
      }

      // Calculate checksum
      const checksum = calculateChecksum(content)

      // Save file
      const filePath = join(OUTPUT_DIR, file.filename)
      await writeFile(filePath, content, 'utf-8')

      // Create manifest entry
      manifestEntries.push({
        name: file.name,
        filename: file.filename,
        url: file.url,
        checksum,
        size,
        downloadedAt: new Date().toISOString(),
      })

      console.log(`  ✓ Downloaded (${(size / 1024).toFixed(1)} KB)`)
      downloadCount++
    } catch (error) {
      console.log(`  ✗ Error: ${(error as Error).message}`)
      errorCount++
    }
  }

  // Save manifest
  const manifest: Manifest = {
    version: '1.0',
    generatedAt: new Date().toISOString(),
    source: 'https://github.com/usnistgov/oscal-content',
    files: manifestEntries,
  }
  await saveManifest(manifest)

  // Summary
  console.log('\n' + '═'.repeat(60))
  console.log('Summary')
  console.log('═'.repeat(60))
  console.log(`  Downloaded: ${downloadCount} files`)
  console.log(`  Cached:     ${skipCount} files`)
  console.log(`  Errors:     ${errorCount} files`)
  console.log(`  Manifest:   ${join(OUTPUT_DIR, 'manifest.json')}`)

  if (errorCount > 0) {
    console.log(
      '\n⚠️  Some downloads failed. Run with --force to retry all downloads.'
    )
    process.exit(1)
  } else {
    console.log('\n✅ OSCAL data download completed successfully!')
  }
}

// Run main function
main().catch((error) => {
  console.error('\n❌ Fatal error:', error.message)
  process.exit(1)
})
