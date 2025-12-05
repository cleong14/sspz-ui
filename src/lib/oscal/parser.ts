/**
 * OSCAL SSP Parser
 * @module lib/oscal/parser
 *
 * Parses OSCAL SSP documents from JSON, YAML, or XML formats
 * and converts them to internal SspProject structure.
 *
 * Story: 6.6 - Implement OSCAL Import
 */

import * as yaml from 'js-yaml'
import { v4 as uuidv4 } from 'uuid'
import type {
  SspProject,
  SystemInfo,
  Contact,
  SystemContacts,
  SystemComponent,
  Baseline,
} from '@/types/ssp'
import type {
  ControlImplementation,
  ImplementationStatus,
} from '@/types/control'
import type { OscalSspDocument, OscalFormat } from './types'

// ============================================================================
// Types
// ============================================================================

export interface ParseResult {
  /** Whether parsing was successful */
  success: boolean
  /** The parsed SSP project (if successful) */
  project?: SspProject
  /** List of errors that prevented parsing */
  errors: ParseError[]
  /** List of warnings about potentially incorrect data */
  warnings: ParseWarning[]
  /** Detected format of the input */
  detectedFormat?: OscalFormat
}

export interface ParseError {
  /** Error code for programmatic handling */
  code: string
  /** Human-readable error message */
  message: string
  /** Line number if applicable */
  line?: number
  /** Column number if applicable */
  column?: number
  /** Path in the document (JSON pointer or XPath) */
  path?: string
  /** Suggested fix for the error */
  suggestion?: string
}

export interface ParseWarning {
  /** Warning code */
  code: string
  /** Warning message */
  message: string
  /** Field that triggered the warning */
  field?: string
  /** Path in the document */
  path?: string
  /** Suggested fix */
  suggestion?: string
}

export interface ParseOptions {
  /** Override automatic format detection */
  format?: OscalFormat
  /** Project name (if not in file) */
  projectName?: string
  /** Use strict parsing (fail on warnings) */
  strict?: boolean
}

// ============================================================================
// Error Handling Helpers
// ============================================================================

/**
 * Extract line number from JSON parse error
 */
function extractJsonErrorLocation(
  error: Error,
  content: string
): { line?: number; column?: number } {
  // JSON parse errors often contain position info like "at position 123"
  const posMatch = error.message.match(/position\s+(\d+)/i)
  if (posMatch) {
    const position = parseInt(posMatch[1], 10)
    const lines = content.substring(0, position).split('\n')
    return {
      line: lines.length,
      column: lines[lines.length - 1].length + 1,
    }
  }

  // Some parsers report "line X column Y"
  const lineColMatch = error.message.match(/line\s+(\d+).*column\s+(\d+)/i)
  if (lineColMatch) {
    return {
      line: parseInt(lineColMatch[1], 10),
      column: parseInt(lineColMatch[2], 10),
    }
  }

  return {}
}

/**
 * Get suggestion for common parse errors
 */
function getSuggestionForParseError(code: string, message: string): string {
  switch (code) {
    case 'UNKNOWN_FORMAT':
      return 'Ensure your file is a valid JSON, YAML, or XML document. Check for syntax errors.'
    case 'PARSE_ERROR':
      if (message.includes('Unexpected token')) {
        return 'Check for missing commas, brackets, or quotes in your JSON.'
      }
      if (message.includes('duplicate key')) {
        return 'Remove duplicate keys from your document.'
      }
      return 'Check the file for syntax errors such as missing commas, quotes, or brackets.'
    case 'XML_PARSE_ERROR':
      return 'Ensure XML is well-formed with proper opening/closing tags and valid characters.'
    case 'INVALID_STRUCTURE':
      return 'The document must contain a "system-security-plan" root element. Verify the OSCAL structure.'
    case 'CONVERSION_ERROR':
      return 'Check that all required OSCAL fields are present and properly formatted.'
    case 'FILE_READ_ERROR':
      return 'Ensure the file exists and you have permission to read it.'
    case 'MISSING_SYSTEM_NAME':
      return 'Add a "system-name" field under "system-characteristics".'
    default:
      return 'Review the OSCAL SSP specification and ensure your document follows the required format.'
  }
}

/**
 * Get suggestion for warnings
 */
function getSuggestionForWarning(code: string): string {
  switch (code) {
    case 'MISSING_SYSTEM_NAME':
      return 'Add a system name to properly identify this SSP.'
    case 'MISSING_DESCRIPTION':
      return 'Add a system description for better documentation.'
    case 'MISSING_CONTACTS':
      return 'Add contact information for system owners and security personnel.'
    case 'INCOMPLETE_CATEGORIZATION':
      return 'Specify security impact levels for confidentiality, integrity, and availability.'
    case 'EMPTY_CONTROL_IMPLEMENTATION':
      return 'Add implementation statements to document how controls are met.'
    default:
      return 'Review and complete this field for a comprehensive SSP.'
  }
}

// ============================================================================
// Format Detection
// ============================================================================

/**
 * Detect the format of an OSCAL file based on content
 */
export function detectFormat(content: string): OscalFormat | null {
  const trimmed = content.trim()

  // Check for JSON
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      JSON.parse(trimmed)
      return 'json'
    } catch {
      // Not valid JSON
    }
  }

  // Check for XML
  if (trimmed.startsWith('<?xml') || trimmed.startsWith('<')) {
    return 'xml'
  }

  // Try YAML
  try {
    const parsed = yaml.load(trimmed)
    if (parsed && typeof parsed === 'object') {
      return 'yaml'
    }
  } catch {
    // Not valid YAML
  }

  return null
}

/**
 * Detect format from file extension
 */
export function detectFormatFromFilename(filename: string): OscalFormat | null {
  const ext = filename.toLowerCase().split('.').pop()
  switch (ext) {
    case 'json':
      return 'json'
    case 'yaml':
    case 'yml':
      return 'yaml'
    case 'xml':
      return 'xml'
    default:
      return null
  }
}

// ============================================================================
// XML Parser (Simple)
// ============================================================================

/**
 * Simple XML to Object parser for OSCAL documents
 */
function parseXmlToObject(xmlString: string): OscalSspDocument | null {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(xmlString, 'text/xml')

    const errorNode = doc.querySelector('parsererror')
    if (errorNode) {
      return null
    }

    const sspElement = doc.querySelector('system-security-plan')
    if (!sspElement) {
      return null
    }

    const getText = (parent: Element, selector: string): string => {
      const el = parent.querySelector(selector)
      return el?.textContent?.trim() || ''
    }

    const getAttr = (parent: Element, attr: string): string => {
      return parent.getAttribute(attr) || ''
    }

    const metadataEl = sspElement.querySelector('metadata')
    const metadata = metadataEl
      ? {
          title: getText(metadataEl, 'title'),
          'last-modified': getText(metadataEl, 'last-modified'),
          version: getText(metadataEl, 'version'),
          'oscal-version': getText(metadataEl, 'oscal-version'),
          roles: Array.from(metadataEl.querySelectorAll('role')).map((r) => ({
            id: getAttr(r, 'id'),
            title: getText(r, 'title'),
          })),
          parties: Array.from(metadataEl.querySelectorAll('party')).map(
            (p) => ({
              uuid: getAttr(p, 'uuid'),
              type: getAttr(p, 'type') as 'person' | 'organization',
              name: getText(p, 'name'),
              'email-addresses': Array.from(
                p.querySelectorAll('email-address')
              ).map((e) => e.textContent || ''),
            })
          ),
        }
      : {
          title: '',
          'last-modified': new Date().toISOString(),
          version: '1.0',
          'oscal-version': '1.1.3',
        }

    const importProfileEl = sspElement.querySelector('import-profile')
    const importProfile = importProfileEl
      ? { href: getAttr(importProfileEl, 'href') }
      : { href: '' }

    const sysCharEl = sspElement.querySelector('system-characteristics')
    const systemCharacteristics = sysCharEl
      ? {
          'system-name': getText(sysCharEl, 'system-name'),
          'system-ids': Array.from(sysCharEl.querySelectorAll('system-id')).map(
            (s) => ({
              id: s.textContent || '',
              'identifier-type': getAttr(s, 'identifier-type'),
            })
          ),
          description: getText(sysCharEl, 'description'),
          'security-sensitivity-level': getText(
            sysCharEl,
            'security-sensitivity-level'
          ),
          'system-information': { 'information-types': [] },
          'security-impact-level': {
            'security-objective-confidentiality': getText(
              sysCharEl,
              'security-impact-level > security-objective-confidentiality'
            ),
            'security-objective-integrity': getText(
              sysCharEl,
              'security-impact-level > security-objective-integrity'
            ),
            'security-objective-availability': getText(
              sysCharEl,
              'security-impact-level > security-objective-availability'
            ),
          },
          status: {
            state: getText(sysCharEl, 'status > state') as
              | 'operational'
              | 'under-development',
          },
          'authorization-boundary': {
            description: getText(
              sysCharEl,
              'authorization-boundary > description'
            ),
          },
        }
      : null

    const sysImplEl = sspElement.querySelector('system-implementation')
    const systemImplementation = sysImplEl
      ? {
          users: Array.from(sysImplEl.querySelectorAll('user')).map((u) => ({
            uuid: getAttr(u, 'uuid'),
            title: getText(u, 'title'),
          })),
          components: Array.from(sysImplEl.querySelectorAll('component')).map(
            (c) => ({
              uuid: getAttr(c, 'uuid'),
              type: getAttr(c, 'type'),
              title: getText(c, 'title'),
              description: getText(c, 'description'),
              status: { state: 'operational' as const },
            })
          ),
        }
      : { users: [], components: [] }

    const ctrlImplEl = sspElement.querySelector('control-implementation')
    const controlImplementation = ctrlImplEl
      ? {
          description: getText(ctrlImplEl, 'description'),
          'implemented-requirements': Array.from(
            ctrlImplEl.querySelectorAll('implemented-requirement')
          ).map((ir) => ({
            uuid: getAttr(ir, 'uuid'),
            'control-id': getAttr(ir, 'control-id'),
          })),
        }
      : { description: '', 'implemented-requirements': [] }

    return {
      'system-security-plan': {
        uuid: getAttr(sspElement, 'uuid'),
        metadata:
          metadata as OscalSspDocument['system-security-plan']['metadata'],
        'import-profile': importProfile,
        'system-characteristics':
          systemCharacteristics as OscalSspDocument['system-security-plan']['system-characteristics'],
        'system-implementation':
          systemImplementation as OscalSspDocument['system-security-plan']['system-implementation'],
        'control-implementation':
          controlImplementation as OscalSspDocument['system-security-plan']['control-implementation'],
      },
    }
  } catch {
    return null
  }
}

// ============================================================================
// OSCAL to SspProject Converter
// ============================================================================

/**
 * Map OSCAL implementation status to internal status
 */
function mapOscalStatus(oscalStatus?: string): ImplementationStatus {
  switch (oscalStatus?.toLowerCase()) {
    case 'implemented':
      return 'IMPLEMENTED'
    case 'partial':
    case 'partially-implemented':
      return 'PARTIALLY_IMPLEMENTED'
    case 'planned':
      return 'PLANNED'
    case 'not-applicable':
      return 'NOT_APPLICABLE'
    default:
      return 'NOT_STARTED'
  }
}

/**
 * Extract baseline from import-profile href
 */
function extractBaseline(href: string): Baseline {
  const lowerHref = href.toLowerCase()

  if (lowerHref.includes('fedramp')) {
    if (lowerHref.includes('high')) return 'FEDRAMP_HIGH'
    if (lowerHref.includes('moderate')) return 'FEDRAMP_MODERATE'
    if (lowerHref.includes('low')) return 'FEDRAMP_LOW'
    return 'FEDRAMP_MODERATE'
  }

  if (lowerHref.includes('high')) return 'HIGH'
  if (lowerHref.includes('moderate')) return 'MODERATE'
  if (lowerHref.includes('low')) return 'LOW'

  return 'MODERATE'
}

/**
 * Create default contact
 */
function createDefaultContact(name: string = '', email: string = ''): Contact {
  return {
    name,
    title: 'Imported Contact',
    email,
    phone: undefined,
    organization: undefined,
  }
}

/**
 * Extract contacts from OSCAL parties
 */
function extractContacts(oscal: OscalSspDocument): SystemContacts {
  const parties = oscal['system-security-plan'].metadata.parties || []
  const responsibleParties =
    oscal['system-security-plan'].metadata['responsible-parties'] || []

  const rolePartyMap = new Map<string, string[]>()
  responsibleParties.forEach((rp) => {
    rolePartyMap.set(rp['role-id'], rp['party-uuids'])
  })

  const findParty = (uuid: string) => parties.find((p) => p.uuid === uuid)

  const getContactForRole = (roleId: string): Contact => {
    const partyUuids = rolePartyMap.get(roleId)
    if (partyUuids && partyUuids.length > 0) {
      const party = findParty(partyUuids[0])
      if (party) {
        return {
          name: party.name || '',
          title: 'Imported Contact',
          email: party['email-addresses']?.[0] || '',
          phone: party['telephone-numbers']?.[0]?.number || undefined,
          organization: party.type === 'organization' ? party.name : undefined,
        }
      }
    }
    return createDefaultContact()
  }

  return {
    systemOwner: getContactForRole('system-owner'),
    authorizingOfficial: getContactForRole('authorizing-official'),
    securityPoc:
      getContactForRole('information-system-security-officer') ||
      getContactForRole('isso'),
    technicalPoc:
      getContactForRole('technical-contact') ||
      getContactForRole('technical-poc'),
  }
}

/**
 * Convert OSCAL implemented requirements to ControlImplementation array
 */
function convertImplementations(
  oscal: OscalSspDocument
): ControlImplementation[] {
  const impls =
    oscal['system-security-plan']['control-implementation'][
      'implemented-requirements'
    ] || []
  const now = new Date().toISOString()

  return impls.map((impl) => {
    let statement = ''
    if (impl['by-components'] && impl['by-components'].length > 0) {
      statement = impl['by-components']
        .map((bc) => bc.description || '')
        .filter(Boolean)
        .join('\n\n')
    }

    return {
      controlId: impl['control-id'],
      status: mapOscalStatus(undefined),
      statement,
      aiGenerated: false,
      createdAt: now,
      updatedAt: now,
    }
  })
}

/**
 * Convert OSCAL SSP document to internal SspProject format
 */
function convertToSspProject(
  oscal: OscalSspDocument,
  options: ParseOptions = {}
): { project: SspProject; warnings: ParseWarning[] } {
  const warnings: ParseWarning[] = []
  const ssp = oscal['system-security-plan']
  const now = new Date().toISOString()

  const sysChar = ssp['system-characteristics']

  // Convert components with proper IDs
  const components: SystemComponent[] =
    ssp['system-implementation'].components?.map((c) => ({
      id: c.uuid || uuidv4(),
      name: c.title,
      type: (c.type === 'software' ||
      c.type === 'hardware' ||
      c.type === 'service'
        ? c.type
        : 'other') as SystemComponent['type'],
      description: c.description || '',
      version: undefined,
      vendor: undefined,
    })) || []

  const systemInfo: SystemInfo = {
    systemName: sysChar['system-name'] || options.projectName || 'Imported SSP',
    systemId: sysChar['system-ids']?.[0]?.id || '',
    systemType: 'major-application',
    description: sysChar.description || '',
    contacts: extractContacts(oscal),
    boundary: {
      description: sysChar['authorization-boundary']?.description || '',
      components,
      externalConnections: [],
    },
    categorization: {
      confidentiality:
        (sysChar['security-impact-level']?.[
          'security-objective-confidentiality'
        ] as 'LOW' | 'MODERATE' | 'HIGH') || 'MODERATE',
      integrity:
        (sysChar['security-impact-level']?.['security-objective-integrity'] as
          | 'LOW'
          | 'MODERATE'
          | 'HIGH') || 'MODERATE',
      availability:
        (sysChar['security-impact-level']?.[
          'security-objective-availability'
        ] as 'LOW' | 'MODERATE' | 'HIGH') || 'MODERATE',
    },
    environment: {
      deploymentModel: 'on-premise',
      cloudProvider: undefined,
      cloudServiceModel: undefined,
      operatingSystems: [],
      technologies: [],
      dataTypes: [],
    },
  }

  if (!systemInfo.systemName) {
    warnings.push({
      code: 'MISSING_SYSTEM_NAME',
      message: 'System name not found, using default',
      field: 'system-name',
      path: '/system-security-plan/system-characteristics/system-name',
      suggestion: getSuggestionForWarning('MISSING_SYSTEM_NAME'),
    })
    systemInfo.systemName = options.projectName || 'Imported SSP'
  }

  // Additional warnings for incomplete data
  if (!systemInfo.description) {
    warnings.push({
      code: 'MISSING_DESCRIPTION',
      message: 'System description is empty',
      field: 'description',
      path: '/system-security-plan/system-characteristics/description',
      suggestion: getSuggestionForWarning('MISSING_DESCRIPTION'),
    })
  }

  if (
    !systemInfo.contacts.systemOwner.name &&
    !systemInfo.contacts.securityPoc.name
  ) {
    warnings.push({
      code: 'MISSING_CONTACTS',
      message: 'No contact information found for system owner or security POC',
      field: 'contacts',
      path: '/system-security-plan/metadata/parties',
      suggestion: getSuggestionForWarning('MISSING_CONTACTS'),
    })
  }

  const baseline = extractBaseline(ssp['import-profile'].href || '')
  const implementations = convertImplementations(oscal)

  const implementedCount = implementations.filter(
    (i) => i.status === 'IMPLEMENTED'
  ).length
  const totalCount = implementations.length
  let status: SspProject['status'] = 'DRAFT'
  if (totalCount > 0) {
    if (implementedCount === totalCount) {
      status = 'COMPLETE'
    } else if (implementedCount > 0) {
      status = 'IN_PROGRESS'
    }
  }

  const project: SspProject = {
    id: uuidv4(),
    name: systemInfo.systemName,
    description: systemInfo.description,
    baseline,
    status,
    systemInfo,
    implementations,
    selectedTools: [],
    aiSuggestionFeedback: [],
    createdAt: now,
    updatedAt: now,
  }

  return { project, warnings }
}

// ============================================================================
// Main Parser
// ============================================================================

/**
 * Parse an OSCAL SSP document from a string
 */
export function parseOscalSsp(
  content: string,
  options: ParseOptions = {}
): ParseResult {
  let format = options.format || detectFormat(content)
  if (!format) {
    return {
      success: false,
      errors: [
        {
          code: 'UNKNOWN_FORMAT',
          message: 'Could not detect file format. Expected JSON, YAML, or XML.',
        },
      ],
      warnings: [],
    }
  }

  let oscalDoc: OscalSspDocument | null = null

  try {
    switch (format) {
      case 'json':
        oscalDoc = JSON.parse(content) as OscalSspDocument
        break
      case 'yaml':
        oscalDoc = yaml.load(content) as OscalSspDocument
        break
      case 'xml':
        oscalDoc = parseXmlToObject(content)
        if (!oscalDoc) {
          const xmlErrorCode = 'XML_PARSE_ERROR'
          return {
            success: false,
            errors: [
              {
                code: xmlErrorCode,
                message: 'Failed to parse XML document',
                suggestion: getSuggestionForParseError(xmlErrorCode, ''),
              },
            ],
            warnings: [],
            detectedFormat: format,
          }
        }
        break
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : `Failed to parse ${format.toUpperCase()} document`

    const location =
      error instanceof Error && format === 'json'
        ? extractJsonErrorLocation(error, content)
        : {}

    // YAML errors from js-yaml include line/column info
    let yamlLocation: { line?: number; column?: number } = {}
    if (format === 'yaml' && error instanceof Error) {
      const yamlMatch = error.message.match(/at line (\d+), column (\d+)/i)
      if (yamlMatch) {
        yamlLocation = {
          line: parseInt(yamlMatch[1], 10),
          column: parseInt(yamlMatch[2], 10),
        }
      }
    }

    const parseErrorCode = 'PARSE_ERROR'
    return {
      success: false,
      errors: [
        {
          code: parseErrorCode,
          message: errorMessage,
          line: location.line || yamlLocation.line,
          column: location.column || yamlLocation.column,
          suggestion: getSuggestionForParseError(parseErrorCode, errorMessage),
        },
      ],
      warnings: [],
      detectedFormat: format,
    }
  }

  if (!oscalDoc || !oscalDoc['system-security-plan']) {
    const structureCode = 'INVALID_STRUCTURE'
    return {
      success: false,
      errors: [
        {
          code: structureCode,
          message:
            'Document does not contain a valid system-security-plan element',
          path: '/system-security-plan',
          suggestion: getSuggestionForParseError(structureCode, ''),
        },
      ],
      warnings: [],
      detectedFormat: format,
    }
  }

  try {
    const result = convertToSspProject(oscalDoc, options)

    if (options.strict && result.warnings.length > 0) {
      return {
        success: false,
        errors: result.warnings.map((w) => ({
          code: w.code,
          message: w.message,
        })),
        warnings: [],
        detectedFormat: format,
      }
    }

    return {
      success: true,
      project: result.project,
      errors: [],
      warnings: result.warnings,
      detectedFormat: format,
    }
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          code: 'CONVERSION_ERROR',
          message:
            error instanceof Error
              ? error.message
              : 'Failed to convert OSCAL document to SSP project',
        },
      ],
      warnings: [],
      detectedFormat: format,
    }
  }
}

/**
 * Parse an OSCAL SSP document from a File object
 */
export async function parseOscalFile(
  file: File,
  options: ParseOptions = {}
): Promise<ParseResult> {
  try {
    const content = await file.text()

    if (!options.format) {
      const formatFromName = detectFormatFromFilename(file.name)
      if (formatFromName) {
        options = { ...options, format: formatFromName }
      }
    }

    if (!options.projectName) {
      options = {
        ...options,
        projectName: file.name.replace(/\.(json|yaml|yml|xml)$/i, ''),
      }
    }

    return parseOscalSsp(content, options)
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          code: 'FILE_READ_ERROR',
          message:
            error instanceof Error ? error.message : 'Failed to read file',
        },
      ],
      warnings: [],
    }
  }
}

/**
 * Validate an OSCAL file without importing
 */
export function isValidOscalSsp(
  content: string,
  options: ParseOptions = {}
): boolean {
  const result = parseOscalSsp(content, options)
  return result.success
}

/**
 * Generate an error report for download
 */
export function generateErrorReport(
  result: ParseResult,
  filename?: string
): string {
  const lines: string[] = [
    '================================',
    'OSCAL SSP Import Error Report',
    '================================',
    '',
    `Generated: ${new Date().toISOString()}`,
    `File: ${filename || 'Unknown'}`,
    `Format: ${result.detectedFormat || 'Unknown'}`,
    '',
  ]

  if (result.errors.length > 0) {
    lines.push('ERRORS', '------', '')
    result.errors.forEach((error, idx) => {
      lines.push(`${idx + 1}. [${error.code}] ${error.message}`)
      if (error.line !== undefined) {
        lines.push(
          `   Location: Line ${error.line}${error.column ? `, Column ${error.column}` : ''}`
        )
      }
      if (error.path) {
        lines.push(`   Path: ${error.path}`)
      }
      if (error.suggestion) {
        lines.push(`   Suggestion: ${error.suggestion}`)
      }
      lines.push('')
    })
  }

  if (result.warnings.length > 0) {
    lines.push('WARNINGS', '--------', '')
    result.warnings.forEach((warning, idx) => {
      lines.push(`${idx + 1}. [${warning.code}] ${warning.message}`)
      if (warning.field) {
        lines.push(`   Field: ${warning.field}`)
      }
      if (warning.path) {
        lines.push(`   Path: ${warning.path}`)
      }
      if (warning.suggestion) {
        lines.push(`   Suggestion: ${warning.suggestion}`)
      }
      lines.push('')
    })
  }

  lines.push(
    '================================',
    'End of Report',
    '================================',
    '',
    'For more information about OSCAL SSP format, visit:',
    'https://pages.nist.gov/OSCAL/reference/latest/system-security-plan/',
    ''
  )

  return lines.join('\n')
}
