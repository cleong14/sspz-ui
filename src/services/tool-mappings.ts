import { ToolControlMapping, ToolCategory } from '../types/tools'

const TOOL_IDS = [
  'semgrep',
  'gitleaks',
  'grype',
  'owasp-zap',
  'snyk',
  'kics',
  'sonarqube',
  'nessus',
  'trivy',
]

let cachedTools: ToolControlMapping[] | null = null

export async function loadToolMappings(): Promise<ToolControlMapping[]> {
  if (cachedTools) {
    return cachedTools
  }

  const tools = await Promise.all(
    TOOL_IDS.map(async (toolId) => {
      const response = await fetch(`/data/tool-mappings/${toolId}.json`)
      return response.json()
    })
  )

  cachedTools = tools
  return tools
}

// For testing purposes
export function resetToolMappingsCache(): void {
  cachedTools = null
}

export function getToolById(
  tools: ToolControlMapping[],
  toolId: string
): ToolControlMapping | undefined {
  return tools.find((tool) => tool.toolId === toolId)
}

export function getToolsByCategory(
  tools: ToolControlMapping[],
  category: ToolCategory
): ToolControlMapping[] {
  return tools.filter((tool) => tool.category === category)
}

export async function loadCustomToolMapping(
  file: File
): Promise<ToolControlMapping> {
  const text = await file.text()
  const mapping = JSON.parse(text)

  // Validate against schema (basic validation)
  if (
    !mapping.toolId ||
    !mapping.toolName ||
    !mapping.category ||
    !mapping.controlMappings
  ) {
    throw new Error('Invalid tool mapping format')
  }

  return mapping as ToolControlMapping
}
