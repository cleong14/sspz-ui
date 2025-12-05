/**
 * OSCAL SSP Generator
 * @module lib/oscal/generator
 *
 * Transforms internal SspProject data to valid OSCAL SSP format.
 * Supports JSON, YAML, and XML output formats.
 *
 * Story: 6.1 - Implement OSCAL SSP Generator
 */

import { v4 as uuidv4 } from 'uuid'
import type {
  SspProject,
  Baseline,
  Contact,
  SystemComponent,
  ExternalConnection,
} from '../../types/ssp'
import type {
  ControlImplementation,
  ImplementationStatus,
} from '../../types/control'
import type {
  OscalSspDocument,
  OscalSystemSecurityPlan,
  OscalMetadata,
  OscalRole,
  OscalParty,
  OscalSystemCharacteristics,
  OscalSystemImplementation,
  OscalControlImplementation,
  OscalImplementedRequirement,
  OscalComponent,
  OscalUser,
  OscalByComponent,
  OscalImplementationStatus,
  OscalExportOptions,
  OscalFormat,
  OscalBackMatter,
  OscalResource,
  OscalSetParameter,
} from './types'

// ============================================================================
// Constants
// ============================================================================

const OSCAL_VERSION = '1.1.3'
const SSP_VERSION = '1.0'

/**
 * NIST baseline profile URLs
 */
const NIST_BASELINE_PROFILES: Record<string, string> = {
  LOW: 'https://raw.githubusercontent.com/usnistgov/oscal-content/main/nist.gov/SP800-53/rev5/json/NIST_SP-800-53_rev5_LOW-baseline_profile.json',
  MODERATE:
    'https://raw.githubusercontent.com/usnistgov/oscal-content/main/nist.gov/SP800-53/rev5/json/NIST_SP-800-53_rev5_MODERATE-baseline_profile.json',
  HIGH: 'https://raw.githubusercontent.com/usnistgov/oscal-content/main/nist.gov/SP800-53/rev5/json/NIST_SP-800-53_rev5_HIGH-baseline_profile.json',
}

/**
 * FedRAMP baseline profile URLs
 */
const FEDRAMP_BASELINE_PROFILES: Record<string, string> = {
  FEDRAMP_LOW:
    'https://raw.githubusercontent.com/GSA/fedramp-automation/master/dist/content/rev5/baselines/json/FedRAMP_rev5_LOW-baseline_profile.json',
  FEDRAMP_MODERATE:
    'https://raw.githubusercontent.com/GSA/fedramp-automation/master/dist/content/rev5/baselines/json/FedRAMP_rev5_MODERATE-baseline_profile.json',
  FEDRAMP_HIGH:
    'https://raw.githubusercontent.com/GSA/fedramp-automation/master/dist/content/rev5/baselines/json/FedRAMP_rev5_HIGH-baseline_profile.json',
  FEDRAMP_LI_SAAS:
    'https://raw.githubusercontent.com/GSA/fedramp-automation/master/dist/content/rev5/baselines/json/FedRAMP_rev5_LI-SaaS-baseline_profile.json',
}

/**
 * Map implementation status to OSCAL status
 */
const STATUS_MAP: Record<
  ImplementationStatus,
  OscalImplementationStatus['state']
> = {
  IMPLEMENTED: 'implemented',
  PARTIALLY_IMPLEMENTED: 'partial',
  PLANNED: 'planned',
  NOT_APPLICABLE: 'not-applicable',
  NOT_STARTED: 'planned', // Default to planned if not started
}

/**
 * Map impact level to OSCAL FIPS-199 value
 */
const IMPACT_MAP: Record<string, string> = {
  LOW: 'fips-199-low',
  MODERATE: 'fips-199-moderate',
  HIGH: 'fips-199-high',
}

// ============================================================================
// Generator Class
// ============================================================================

/**
 * OSCAL SSP Generator
 * Converts internal SSP project data to valid OSCAL format
 */
export class OscalGenerator {
  private project: SspProject
  private options: OscalExportOptions
  private partyUuids: Map<string, string> = new Map()
  private componentUuids: Map<string, string> = new Map()
  private thisSystemUuid: string = ''

  constructor(project: SspProject, options?: Partial<OscalExportOptions>) {
    this.project = project
    this.options = {
      format: 'json',
      fedramp: project.baseline.startsWith('FEDRAMP'),
      prettyPrint: true,
      ...options,
    }
  }

  /**
   * Generate the complete OSCAL SSP document
   */
  generate(): OscalSspDocument {
    // Pre-generate UUIDs for cross-referencing
    this.generatePartyUuids()
    this.generateComponentUuids()
    this.thisSystemUuid = uuidv4()

    const ssp: OscalSystemSecurityPlan = {
      uuid: this.project.id,
      metadata: this.generateMetadata(),
      'import-profile': this.generateImportProfile(),
      'system-characteristics': this.generateSystemCharacteristics(),
      'system-implementation': this.generateSystemImplementation(),
      'control-implementation': this.generateControlImplementation(),
    }

    // Add back matter if there are resources
    const backMatter = this.generateBackMatter()
    if (backMatter.resources && backMatter.resources.length > 0) {
      ssp['back-matter'] = backMatter
    }

    return { 'system-security-plan': ssp }
  }

  /**
   * Export to string in specified format
   */
  export(): string {
    const document = this.generate()
    return this.formatOutput(document)
  }

  /**
   * Format output based on options
   */
  private formatOutput(document: OscalSspDocument): string {
    switch (this.options.format) {
      case 'json':
        return this.options.prettyPrint
          ? JSON.stringify(document, null, 2)
          : JSON.stringify(document)
      case 'yaml':
        return this.toYaml(document)
      case 'xml':
        return this.toXml(document)
      default:
        return JSON.stringify(document, null, 2)
    }
  }

  /**
   * Convert to YAML format
   */
  private toYaml(document: OscalSspDocument): string {
    // Simple YAML serialization (for complex cases, use a library like js-yaml)
    return this.objectToYaml(document, 0)
  }

  /**
   * Recursively convert object to YAML string
   */
  private objectToYaml(obj: unknown, indent: number): string {
    const indentStr = '  '.repeat(indent)

    if (obj === null || obj === undefined) {
      return 'null'
    }

    if (typeof obj === 'string') {
      // Check if string needs quoting
      if (
        obj.includes('\n') ||
        obj.includes(':') ||
        obj.includes('#') ||
        obj.match(/^['"]/)
      ) {
        return `|\n${obj
          .split('\n')
          .map((line) => indentStr + '  ' + line)
          .join('\n')}`
      }
      return obj
    }

    if (typeof obj === 'number' || typeof obj === 'boolean') {
      return String(obj)
    }

    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]'
      return obj
        .map((item) => {
          const itemYaml = this.objectToYaml(item, indent + 1)
          if (typeof item === 'object' && item !== null) {
            return `\n${indentStr}- ${itemYaml.trim()}`
          }
          return `\n${indentStr}- ${itemYaml}`
        })
        .join('')
    }

    if (typeof obj === 'object') {
      const entries = Object.entries(obj as Record<string, unknown>)
      if (entries.length === 0) return '{}'
      return entries
        .map(([key, value]) => {
          const valueYaml = this.objectToYaml(value, indent + 1)
          if (
            typeof value === 'object' &&
            value !== null &&
            !Array.isArray(value)
          ) {
            return `${indentStr}${key}:\n${valueYaml}`
          }
          if (Array.isArray(value)) {
            return `${indentStr}${key}:${valueYaml}`
          }
          return `${indentStr}${key}: ${valueYaml}`
        })
        .join('\n')
    }

    return String(obj)
  }

  /**
   * Convert to XML format
   */
  private toXml(document: OscalSspDocument): string {
    const xmlParts: string[] = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<system-security-plan xmlns="http://csrc.nist.gov/ns/oscal/1.0"',
      `  uuid="${document['system-security-plan'].uuid}">`,
    ]

    xmlParts.push(
      this.objectToXml(document['system-security-plan'], 1, ['uuid'])
    )
    xmlParts.push('</system-security-plan>')

    return xmlParts.join('\n')
  }

  /**
   * Recursively convert object to XML string
   */
  private objectToXml(
    obj: unknown,
    indent: number,
    skipKeys: string[] = []
  ): string {
    const indentStr = '  '.repeat(indent)

    if (obj === null || obj === undefined) {
      return ''
    }

    if (typeof obj !== 'object') {
      return this.escapeXml(String(obj))
    }

    if (Array.isArray(obj)) {
      return obj
        .map((item) => this.objectToXml(item, indent, skipKeys))
        .join('\n')
    }

    const entries = Object.entries(obj as Record<string, unknown>)
    return entries
      .filter(([key]) => !skipKeys.includes(key))
      .map(([key, value]) => {
        const xmlKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()

        if (value === null || value === undefined) {
          return ''
        }

        if (typeof value === 'object') {
          if (Array.isArray(value)) {
            return value
              .map((item) => {
                const itemContent = this.objectToXml(item, indent + 1)
                return `${indentStr}<${xmlKey}>\n${itemContent}\n${indentStr}</${xmlKey}>`
              })
              .join('\n')
          }
          const content = this.objectToXml(value, indent + 1)
          return `${indentStr}<${xmlKey}>\n${content}\n${indentStr}</${xmlKey}>`
        }

        return `${indentStr}<${xmlKey}>${this.escapeXml(String(value))}</${xmlKey}>`
      })
      .filter((line) => line !== '')
      .join('\n')
  }

  /**
   * Escape special XML characters
   */
  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }

  // ============================================================================
  // UUID Generation
  // ============================================================================

  private generatePartyUuids(): void {
    const contacts = this.project.systemInfo?.contacts
    if (!contacts) return

    const roles = [
      'systemOwner',
      'authorizingOfficial',
      'securityPoc',
      'technicalPoc',
    ]
    roles.forEach((role) => {
      const contact = contacts[role as keyof typeof contacts]
      if (contact?.email) {
        this.partyUuids.set(contact.email, uuidv4())
      }
    })
  }

  private generateComponentUuids(): void {
    const components = this.project.systemInfo?.boundary?.components || []
    components.forEach((component) => {
      this.componentUuids.set(component.id, uuidv4())
    })
  }

  // ============================================================================
  // Section Generators
  // ============================================================================

  private generateMetadata(): OscalMetadata {
    const now = new Date().toISOString()

    const metadata: OscalMetadata = {
      title: `${this.project.systemInfo?.systemName || this.project.name} System Security Plan`,
      'last-modified': now,
      version: SSP_VERSION,
      'oscal-version': OSCAL_VERSION,
      roles: this.generateRoles(),
      parties: this.generateParties(),
    }

    // Add responsible parties if contacts exist
    const responsibleParties = this.generateResponsibleParties()
    if (responsibleParties.length > 0) {
      metadata['responsible-parties'] = responsibleParties
    }

    // Add FedRAMP-specific props if applicable
    if (this.options.fedramp) {
      metadata.props = [
        { name: 'marking', value: 'Controlled Unclassified Information' },
        { name: 'fedramp-version', value: 'rev5' },
      ]
    }

    return metadata
  }

  private generateRoles(): OscalRole[] {
    return [
      { id: 'system-owner', title: 'System Owner' },
      { id: 'authorizing-official', title: 'Authorizing Official' },
      {
        id: 'security-poc',
        title: 'Information System Security Officer (ISSO)',
      },
      { id: 'technical-poc', title: 'Technical Point of Contact' },
      { id: 'system-admin', title: 'System Administrator' },
      { id: 'component-owner', title: 'Component Owner' },
    ]
  }

  private generateParties(): OscalParty[] {
    const parties: OscalParty[] = []
    const contacts = this.project.systemInfo?.contacts
    if (!contacts) return parties

    const addParty = (contact: Contact | undefined, _roleId: string) => {
      if (!contact?.email) return
      const uuid = this.partyUuids.get(contact.email) || uuidv4()

      parties.push({
        uuid,
        type: 'person',
        name: contact.name,
        'email-addresses': [contact.email],
        ...(contact.phone && {
          'telephone-numbers': [{ number: contact.phone }],
        }),
        ...(contact.organization && {
          'short-name': contact.organization,
        }),
      })
    }

    addParty(contacts.systemOwner, 'system-owner')
    addParty(contacts.authorizingOfficial, 'authorizing-official')
    addParty(contacts.securityPoc, 'security-poc')
    addParty(contacts.technicalPoc, 'technical-poc')

    return parties
  }

  private generateResponsibleParties(): Array<{
    'role-id': string
    'party-uuids': string[]
  }> {
    const responsibleParties: Array<{
      'role-id': string
      'party-uuids': string[]
    }> = []
    const contacts = this.project.systemInfo?.contacts
    if (!contacts) return responsibleParties

    const roleMap: Array<{
      contactKey: keyof typeof contacts
      roleId: string
    }> = [
      { contactKey: 'systemOwner', roleId: 'system-owner' },
      { contactKey: 'authorizingOfficial', roleId: 'authorizing-official' },
      { contactKey: 'securityPoc', roleId: 'security-poc' },
      { contactKey: 'technicalPoc', roleId: 'technical-poc' },
    ]

    roleMap.forEach(({ contactKey, roleId }) => {
      const contact = contacts[contactKey]
      if (contact?.email) {
        const uuid = this.partyUuids.get(contact.email)
        if (uuid) {
          responsibleParties.push({
            'role-id': roleId,
            'party-uuids': [uuid],
          })
        }
      }
    })

    return responsibleParties
  }

  private generateImportProfile(): { href: string } {
    const baseline = this.project.baseline

    if (this.options.profileHref) {
      return { href: this.options.profileHref }
    }

    // Use FedRAMP profiles for FedRAMP baselines
    if (baseline.startsWith('FEDRAMP')) {
      return {
        href:
          FEDRAMP_BASELINE_PROFILES[baseline] ||
          FEDRAMP_BASELINE_PROFILES.FEDRAMP_MODERATE,
      }
    }

    // Use NIST profiles for standard baselines
    return {
      href: NIST_BASELINE_PROFILES[baseline] || NIST_BASELINE_PROFILES.MODERATE,
    }
  }

  private generateSystemCharacteristics(): OscalSystemCharacteristics {
    const systemInfo = this.project.systemInfo
    const categorization = systemInfo?.categorization

    const characteristics: OscalSystemCharacteristics = {
      'system-ids': [
        {
          'identifier-type': 'https://ietf.org/rfc/rfc4122',
          id: this.project.id,
        },
        ...(systemInfo?.systemId
          ? [
              {
                'identifier-type': 'https://example.org/system-id',
                id: systemInfo.systemId,
              },
            ]
          : []),
      ],
      'system-name': systemInfo?.systemName || this.project.name,
      description:
        systemInfo?.description ||
        this.project.description ||
        'System description not provided.',
      'security-sensitivity-level': this.getSecurityLevel(),
      'system-information': {
        'information-types': [
          {
            uuid: uuidv4(),
            title: 'System Information',
            description:
              'Information processed, stored, or transmitted by this system.',
            'confidentiality-impact': {
              base: IMPACT_MAP[categorization?.confidentiality || 'MODERATE'],
            },
            'integrity-impact': {
              base: IMPACT_MAP[categorization?.integrity || 'MODERATE'],
            },
            'availability-impact': {
              base: IMPACT_MAP[categorization?.availability || 'MODERATE'],
            },
          },
        ],
      },
      'security-impact-level': {
        'security-objective-confidentiality':
          IMPACT_MAP[categorization?.confidentiality || 'MODERATE'],
        'security-objective-integrity':
          IMPACT_MAP[categorization?.integrity || 'MODERATE'],
        'security-objective-availability':
          IMPACT_MAP[categorization?.availability || 'MODERATE'],
      },
      status: this.getSystemStatus(),
      'authorization-boundary': {
        description:
          systemInfo?.boundary?.description ||
          'Authorization boundary not defined.',
        ...(systemInfo?.boundary?.networkDiagramRef && {
          diagrams: [
            {
              uuid: uuidv4(),
              description: 'Network Architecture Diagram',
              links: [
                {
                  href: systemInfo.boundary.networkDiagramRef,
                  rel: 'diagram',
                },
              ],
            },
          ],
        }),
      },
    }

    // Add deployment model as props
    if (systemInfo?.environment) {
      characteristics.props = [
        {
          name: 'cloud-deployment-model',
          value: systemInfo.environment.deploymentModel,
        },
        ...(systemInfo.environment.cloudServiceModel
          ? [
              {
                name: 'cloud-service-model',
                value: systemInfo.environment.cloudServiceModel.toLowerCase(),
              },
            ]
          : []),
        ...(systemInfo.environment.cloudProvider
          ? [
              {
                name: 'cloud-provider',
                value: systemInfo.environment.cloudProvider,
              },
            ]
          : []),
      ]
    }

    return characteristics
  }

  private getSecurityLevel(): string {
    const baseline = this.project.baseline
    if (baseline.includes('HIGH')) return 'high'
    if (baseline.includes('MODERATE')) return 'moderate'
    return 'low'
  }

  private getSystemStatus(): {
    state:
      | 'operational'
      | 'under-development'
      | 'under-major-modification'
      | 'disposition'
      | 'other'
    remarks?: string
  } {
    const status = this.project.status
    switch (status) {
      case 'COMPLETE':
        return { state: 'operational' }
      case 'IN_PROGRESS':
      case 'REVIEW':
        return { state: 'under-development', remarks: `SSP Status: ${status}` }
      case 'DRAFT':
      default:
        return { state: 'other', remarks: 'System is in draft/planning phase' }
    }
  }

  private generateSystemImplementation(): OscalSystemImplementation {
    const systemInfo = this.project.systemInfo

    return {
      users: this.generateUsers(),
      components: this.generateComponents(),
      ...(systemInfo?.boundary?.externalConnections?.length && {
        'inventory-items': this.generateInventoryItems(),
      }),
    }
  }

  private generateUsers(): OscalUser[] {
    const users: OscalUser[] = []
    const contacts = this.project.systemInfo?.contacts

    // Add system roles as users
    const roleUsers: Array<{ id: string; title: string; roleId: string }> = [
      {
        id: 'system-owner-user',
        title: 'System Owner',
        roleId: 'system-owner',
      },
      {
        id: 'isso-user',
        title: 'Information System Security Officer',
        roleId: 'security-poc',
      },
      {
        id: 'technical-user',
        title: 'Technical Administrator',
        roleId: 'technical-poc',
      },
    ]

    roleUsers.forEach(({ title, roleId }) => {
      users.push({
        uuid: uuidv4(),
        title,
        props: [{ name: 'type', value: 'internal' }],
        'role-ids': [roleId],
      })
    })

    return users
  }

  private generateComponents(): OscalComponent[] {
    const components: OscalComponent[] = []
    const boundaryComponents =
      this.project.systemInfo?.boundary?.components || []

    // Add "this-system" component (required)
    components.push({
      uuid: this.thisSystemUuid,
      type: 'this-system',
      title: 'This System',
      description: 'The system described by this SSP.',
      status: { state: 'operational' },
    })

    // Add user-defined components
    boundaryComponents.forEach((component) => {
      const uuid = this.componentUuids.get(component.id) || uuidv4()
      components.push(this.mapComponent(component, uuid))
    })

    return components
  }

  private mapComponent(
    component: SystemComponent,
    uuid: string
  ): OscalComponent {
    const typeMap: Record<string, string> = {
      hardware: 'hardware',
      software: 'software',
      service: 'service',
      policy: 'policy',
      other: 'guidance',
    }

    return {
      uuid,
      type: typeMap[component.type] || 'software',
      title: component.name,
      description: component.description,
      props: [
        ...(component.vendor
          ? [{ name: 'vendor', value: component.vendor }]
          : []),
        ...(component.version
          ? [{ name: 'version', value: component.version }]
          : []),
      ],
      status: { state: 'operational' },
    }
  }

  private generateInventoryItems(): Array<{
    uuid: string
    description: string
    props?: Array<{ name: string; value: string }>
    'implemented-components'?: Array<{ 'component-uuid': string }>
  }> {
    const items: Array<{
      uuid: string
      description: string
      props?: Array<{ name: string; value: string }>
      'implemented-components'?: Array<{ 'component-uuid': string }>
    }> = []

    const components = this.project.systemInfo?.boundary?.components || []
    components.forEach((component) => {
      const componentUuid = this.componentUuids.get(component.id)
      if (componentUuid) {
        items.push({
          uuid: uuidv4(),
          description: component.description,
          props: [
            { name: 'asset-id', value: component.id },
            { name: 'asset-type', value: component.type },
          ],
          'implemented-components': [{ 'component-uuid': componentUuid }],
        })
      }
    })

    return items
  }

  private generateControlImplementation(): OscalControlImplementation {
    const implementations = this.project.implementations || []

    return {
      description:
        'This section describes how the organization implements the security controls for this system.',
      'implemented-requirements': implementations.map((impl) =>
        this.mapImplementation(impl)
      ),
    }
  }

  private mapImplementation(
    impl: ControlImplementation
  ): OscalImplementedRequirement {
    const requirement: OscalImplementedRequirement = {
      uuid: uuidv4(),
      'control-id': impl.controlId.toLowerCase(),
    }

    // Add parameters if present
    if (impl.parameters && Object.keys(impl.parameters).length > 0) {
      requirement['set-parameters'] = Object.entries(impl.parameters).map(
        ([paramId, value]) => ({
          'param-id': paramId,
          values: [value],
        })
      )
    }

    // Add responsible role if present
    if (impl.responsibleRole) {
      requirement['responsible-roles'] = [
        {
          'role-id': 'component-owner',
          props: [{ name: 'responsible-party', value: impl.responsibleRole }],
        },
      ]
    }

    // Add implementation by this system component
    if (impl.statement || impl.status !== 'NOT_STARTED') {
      requirement['by-components'] = [
        {
          'component-uuid': this.thisSystemUuid,
          uuid: uuidv4(),
          description:
            impl.statement || `Control ${impl.controlId} implementation.`,
          'implementation-status': {
            state: STATUS_MAP[impl.status],
            ...(impl.status === 'PARTIALLY_IMPLEMENTED' && {
              remarks: 'Control is partially implemented.',
            }),
          },
          ...(impl.aiGenerated && {
            props: [
              { name: 'ai-generated', value: 'true' },
              ...(impl.aiConfidence
                ? [
                    {
                      name: 'ai-confidence',
                      value: impl.aiConfidence.toLowerCase(),
                    },
                  ]
                : []),
            ],
          }),
        },
      ]
    }

    // Add inherited information if present
    if (impl.inherited) {
      requirement.props = [
        { name: 'inherited', value: 'true' },
        { name: 'inherited-from-system', value: impl.inherited.systemName },
      ]
      if (impl.inherited.description) {
        requirement.remarks = `Inherited: ${impl.inherited.description}`
      }
    }

    // Add notes as remarks
    if (impl.notes) {
      requirement.remarks = requirement.remarks
        ? `${requirement.remarks}\n\nNotes: ${impl.notes}`
        : `Notes: ${impl.notes}`
    }

    return requirement
  }

  private generateBackMatter(): OscalBackMatter {
    const resources: OscalResource[] = []

    // Add evidence as resources
    const implementations = this.project.implementations || []
    implementations.forEach((impl) => {
      if (impl.evidence && impl.evidence.length > 0) {
        impl.evidence.forEach((evidence) => {
          resources.push({
            uuid: uuidv4(),
            title: evidence.title,
            description: evidence.description,
            props: [
              { name: 'type', value: evidence.type },
              { name: 'control-id', value: impl.controlId },
            ],
            rlinks: [
              {
                href: evidence.reference,
              },
            ],
          })
        })
      }
    })

    // Add network diagram as resource if present
    const diagramRef = this.project.systemInfo?.boundary?.networkDiagramRef
    if (diagramRef) {
      resources.push({
        uuid: uuidv4(),
        title: 'Network Architecture Diagram',
        description:
          'System network architecture and authorization boundary diagram',
        rlinks: [{ href: diagramRef }],
      })
    }

    return { resources }
  }
}

// ============================================================================
// Export Functions
// ============================================================================

/**
 * Generate OSCAL SSP document from SSP project
 */
export function generateOscalSsp(
  project: SspProject,
  options?: Partial<OscalExportOptions>
): OscalSspDocument {
  const generator = new OscalGenerator(project, options)
  return generator.generate()
}

/**
 * Export OSCAL SSP to string in specified format
 */
export function exportOscalSsp(
  project: SspProject,
  format: OscalFormat = 'json',
  options?: Partial<Omit<OscalExportOptions, 'format'>>
): string {
  const generator = new OscalGenerator(project, { ...options, format })
  return generator.export()
}

/**
 * Get the file extension for an OSCAL format
 */
export function getOscalFileExtension(format: OscalFormat): string {
  switch (format) {
    case 'json':
      return '.json'
    case 'yaml':
      return '.yaml'
    case 'xml':
      return '.xml'
    default:
      return '.json'
  }
}

/**
 * Get the MIME type for an OSCAL format
 */
export function getOscalMimeType(format: OscalFormat): string {
  switch (format) {
    case 'json':
      return 'application/json'
    case 'yaml':
      return 'text/yaml'
    case 'xml':
      return 'application/xml'
    default:
      return 'application/json'
  }
}
