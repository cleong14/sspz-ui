import { SecurityTool } from '@/types/nist'

export interface SecurityToolInfo {
  id: SecurityTool
  name: string
  description: string
  icon?: string
}

export const SECURITY_TOOLS: Record<SecurityTool, SecurityToolInfo> = {
  semgrep: {
    id: 'semgrep',
    name: 'Semgrep',
    description: 'Static analysis tool for finding bugs and vulnerabilities',
  },
  gitleaks: {
    id: 'gitleaks',
    name: 'Gitleaks',
    description: 'Scan git repositories for secrets and credentials',
  },
  kics: {
    id: 'kics',
    name: 'KICS',
    description: 'Find security vulnerabilities in your infrastructure as code',
  },
  trivy: {
    id: 'trivy',
    name: 'Trivy',
    description: 'Vulnerability scanner for containers and other artifacts',
  },
  bandit: {
    id: 'bandit',
    name: 'Bandit',
    description: 'Security linter for Python code',
  },
  snyk: {
    id: 'snyk',
    name: 'Snyk',
    description: 'Find and fix vulnerabilities in your code and dependencies',
  },
  checkov: {
    id: 'checkov',
    name: 'Checkov',
    description: 'Static code analysis for infrastructure as code',
  },
  tfsec: {
    id: 'tfsec',
    name: 'TFSec',
    description: 'Security scanner for Terraform code',
  },
}

export const SECURITY_TOOL_OPTIONS = Object.values(SECURITY_TOOLS)

export function getToolDisplayName(toolId: SecurityTool): string {
  return SECURITY_TOOLS[toolId]?.name || toolId
}

export function getToolDescription(toolId: SecurityTool): string {
  return SECURITY_TOOLS[toolId]?.description || ''
}

/**
 * Get all tools that map to a given control
 */
export function getToolsForControl(control: {
  tools?: SecurityTool[]
}): SecurityToolInfo[] {
  if (!control.tools || !Array.isArray(control.tools)) return []
  return control.tools
    .map((toolId) => SECURITY_TOOLS[toolId])
    .filter((tool): tool is SecurityToolInfo => tool !== undefined)
}
