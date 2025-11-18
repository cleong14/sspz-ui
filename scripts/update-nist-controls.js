import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Get the current directory path in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Paths
const sourcePath = join(
  __dirname,
  '../public/control-catalogs/sp800-53r5-control-catalog.json'
)
const baselinesPath = join(
  __dirname,
  '../public/control-catalogs/sp800-53r5-control-catalog-baselines-outer-joined.json'
)
const targetPath = join(__dirname, '../src/data/nist/nist-800-53-rev5.json')

try {
  // Read the source files
  const sourceData = JSON.parse(readFileSync(sourcePath, 'utf8'))
  const baselinesData = JSON.parse(readFileSync(baselinesPath, 'utf8'))

  // Create a map of control IDs to their baseline information
  const baselineMap = new Map()

  baselinesData.forEach((item) => {
    if (item['Control Identifier']) {
      baselineMap.set(item['Control Identifier'], {
        privacyBaseline: item['Privacy Baseline'] || null,
        securityControlBaselineLow:
          item['Security Control Baseline - Low'] || null,
        securityControlBaselineModerate:
          item['Security Control Baseline - Moderate'] || null,
        securityControlBaselineHigh:
          item['Security Control Baseline - High'] || null,
      })
    }
  })

  // Transform the data
  const transformedData = {
    version: sourceData.version || '5.0.1',
    publicationDate: '2020-09-23',
    controls: sourceData.controls.map((control) => {
      const baselineInfo = baselineMap.get(control.id) || {}

      return {
        id: control.id,
        family: control.family || 'Uncategorized',
        title: control.name || 'Untitled',
        priority: 'P1', // Default priority, adjust as needed
        description: control.text || 'No description available',
        guidance: control.discussion || 'No guidance available',
        relatedControls: control.related_controls || [],
        baselines: {
          privacy: baselineInfo.privacyBaseline,
          security: {
            low: baselineInfo.securityControlBaselineLow,
            moderate: baselineInfo.securityControlBaselineModerate,
            high: baselineInfo.securityControlBaselineHigh,
          },
        },
      }
    }),
  }

  // Write the transformed data to the target file
  writeFileSync(targetPath, JSON.stringify(transformedData, null, 2))

  console.log(`✅ Successfully updated ${targetPath}`)
  console.log(
    `ℹ️  Total controls processed: ${transformedData.controls.length}`
  )
} catch (error) {
  console.error('❌ Error updating NIST controls:', error.message)
  process.exit(1)
}
