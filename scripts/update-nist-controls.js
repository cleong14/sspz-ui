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
const targetPath = join(__dirname, '../src/data/nist/nist-800-53-rev5.json')

try {
  // Read the source file
  const sourceData = JSON.parse(readFileSync(sourcePath, 'utf8'))

  // Transform the data
  const transformedData = {
    version: sourceData.version || '5.0.1',
    publicationDate: '2020-09-23',
    controls: sourceData.controls.map((control) => ({
      id: control.id,
      family: control.family || 'Uncategorized',
      title: control.name || 'Untitled',
      priority: 'P1', // Default priority, adjust as needed
      description: control.text || 'No description available',
      guidance: control.discussion || 'No guidance available',
      relatedControls: control.related_controls || [],
    })),
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
