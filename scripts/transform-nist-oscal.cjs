#!/usr/bin/env node
/**
 * Transform NIST SP 800-53 Rev 5 OSCAL JSON to application format
 * Preserves existing tool mappings from current data
 */

const fs = require('fs')
const path = require('path')

const OSCAL_FILE = '/tmp/nist-oscal-raw.json'
const CURRENT_FILE = path.join(
  __dirname,
  '../src/data/nist/nist-800-53-rev5.json'
)
const OUTPUT_FILE = path.join(
  __dirname,
  '../src/data/nist/nist-800-53-rev5.json'
)

// Load data
const oscalData = JSON.parse(fs.readFileSync(OSCAL_FILE, 'utf8'))
const currentData = JSON.parse(fs.readFileSync(CURRENT_FILE, 'utf8'))

// Create map of existing tool mappings
const toolMappings = new Map()
for (const control of currentData.controls) {
  if (control.tools && control.tools.length > 0) {
    toolMappings.set(control.id, control.tools)
  }
}

console.log(`Loaded ${toolMappings.size} existing tool mappings`)

// Helper: Extract text from OSCAL parts
function extractText(parts, partName) {
  if (!parts) return ''
  const part = parts.find((p) => p.name === partName)
  if (!part) return ''
  if (part.prose) return part.prose
  if (part.parts) {
    return part.parts.map((p) => p.prose || '').join('\n')
  }
  return ''
}

// Helper: Get control family from ID
function getFamily(id) {
  return id.split('-')[0].toUpperCase()
}

// Helper: Get priority from props
function getPriority(props) {
  if (!props) return ''
  const priorityProp = props.find((p) => p.name === 'priority')
  return priorityProp ? priorityProp.value : ''
}

// Helper: Get baseline from props
function getBaselines(props) {
  if (!props) {
    return {
      privacy: null,
      security: { low: null, moderate: null, high: null },
    }
  }

  const baselines = {
    privacy: null,
    security: { low: null, moderate: null, high: null },
  }

  for (const prop of props) {
    if (prop.name === 'baseline' && prop.value) {
      if (prop.value.includes('low')) baselines.security.low = 'x'
      if (prop.value.includes('moderate')) baselines.security.moderate = 'x'
      if (prop.value.includes('high')) baselines.security.high = 'x'
      if (prop.value.includes('privacy')) baselines.privacy = 'x'
    }
  }

  return baselines
}

// Helper: Recursively flatten controls
function flattenControls(controls, allControls = []) {
  if (!controls) return allControls

  for (const control of controls) {
    const controlId = control.id.toUpperCase()
    const parts = control.parts || []

    const transformedControl = {
      id: controlId,
      family: getFamily(controlId),
      title: control.title || '',
      priority: getPriority(control.props),
      description: extractText(parts, 'statement'),
      guidance: extractText(parts, 'guidance'),
      parameters: control.params ? control.params.map((p) => p.id) : [],
      relatedControls: [], // Could extract from links if needed
      baselines: getBaselines(control.props),
      tools: toolMappings.get(controlId) || [],
    }

    allControls.push(transformedControl)

    // Recursively process control enhancements
    if (control.controls) {
      flattenControls(control.controls, allControls)
    }
  }

  return allControls
}

// Transform all controls
const transformedControls = []
for (const group of oscalData.catalog.groups) {
  flattenControls(group.controls, transformedControls)
}

// Create output structure
const output = {
  version: '5.1.1',
  publicationDate: '2024-02-04',
  controls: transformedControls,
}

// Write output
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2))

console.log(`✅ Transformed ${transformedControls.length} controls`)
console.log(`✅ Preserved ${toolMappings.size} tool mappings`)
console.log(`✅ Updated to version ${output.version}`)
console.log(`✅ Output written to ${OUTPUT_FILE}`)
