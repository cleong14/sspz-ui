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

  // Sample tool mappings for demonstration
  const toolMappings = {
    // AC family
    'AC-2': ['semgrep', 'checkov'],
    'AC-3': ['semgrep', 'tfsec'],
    'AC-4': ['checkov', 'tfsec'],
    'AC-6': ['semgrep', 'checkov'],
    // AU family
    'AU-2': ['semgrep', 'checkov'],
    'AU-3': ['semgrep', 'trivy'],
    'AU-6': ['semgrep', 'checkov', 'trivy'],
    // IA family
    'IA-2': ['semgrep', 'bandit'],
    'IA-5': ['gitleaks', 'bandit'],
    // RA family
    'RA-5': ['trivy', 'snyk'],
    'RA-7': ['trivy', 'snyk', 'kics'],
    // SA family
    'SA-11': ['checkov', 'kics'],
    'SA-15': ['checkov', 'kics', 'tfsec'],
    // SC family
    'SC-7': ['checkov', 'tfsec'],
    'SC-12': ['gitleaks', 'bandit'],
    'SC-28': ['checkov', 'kics'],
    // SI family
    'SI-2': ['trivy', 'snyk'],
    'SI-3': ['semgrep', 'trivy'],
    'SI-4': ['semgrep', 'checkov'],
    'SI-7': ['gitleaks', 'bandit'],
  }

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
        tools: toolMappings[item['Control Identifier']] || [],
      })
    }
  })

  // Helper function to extract priority from control ID
  const getPriority = (controlId) => {
    // Handle base controls (e.g., AC-1) and enhancements (e.g., AC-2(1))
    const match = controlId.match(/^[A-Z]+-(\d+)(?:\(\d+\))?$/)
    if (match) {
      return parseInt(match[1], 10)
    }
    return null
  }

  // Transform the data
  const transformedData = {
    version: sourceData.version || '5.0.1',
    publicationDate: '2020-09-23',
    controls: sourceData.controls.map((control) => {
      const baselineInfo = baselineMap.get(control.id) || {}
      const priority = getPriority(control.id)

      return {
        id: control.id,
        family: control.family || 'Uncategorized',
        title: control.name || `Control ${control.id}`,
        priority: priority !== null ? `P${priority}` : '',
        description: control.text || 'No description available',
        guidance: control.discussion || 'No guidance available',
        parameters: control.parameters || [],
        relatedControls: control.related_controls || [],
        tools: baselineInfo.tools || [],
        baselines: {
          privacy: baselineInfo.privacyBaseline || null,
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
