/**
 * Word Document Generator for SSP Export
 * @module lib/export/word-generator
 *
 * Generates formatted .docx documents from SSP project data.
 *
 * Story: 6.3 - Implement Word Document Export
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  HeadingLevel,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
  TableOfContents,
  StyleLevel,
  convertInchesToTwip,
  PageBreak,
  ShadingType,
} from 'docx'

import type { SspProject } from '../../types/ssp'
import type { ControlImplementation } from '../../types/control'

// ============================================================================
// Types
// ============================================================================

export interface WordExportOptions {
  /** Include table of contents */
  includeToc?: boolean
  /** Include header with system name */
  includeHeader?: boolean
  /** Include footer with page numbers */
  includeFooter?: boolean
  /** Include FedRAMP specific sections */
  fedramp?: boolean
}

/**
 * Union type for document section content
 */
type SectionContent = Paragraph | Table | TableOfContents

// ============================================================================
// Styles
// ============================================================================

const STYLES = {
  heading1: {
    bold: true,
    size: 32, // 16pt
    color: '1a365d',
  },
  heading2: {
    bold: true,
    size: 28, // 14pt
    color: '2d3748',
  },
  heading3: {
    bold: true,
    size: 24, // 12pt
    color: '4a5568',
  },
  body: {
    size: 22, // 11pt
    color: '1a202c',
  },
  tableHeader: {
    bold: true,
    size: 20, // 10pt
    color: 'ffffff',
  },
  tableCell: {
    size: 20, // 10pt
    color: '1a202c',
  },
  footer: {
    size: 18, // 9pt
    color: '718096',
  },
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a styled heading paragraph
 */
function createHeading(text: string, level: 1 | 2 | 3): Paragraph {
  const styleMap = {
    1: { heading: HeadingLevel.HEADING_1, style: STYLES.heading1 },
    2: { heading: HeadingLevel.HEADING_2, style: STYLES.heading2 },
    3: { heading: HeadingLevel.HEADING_3, style: STYLES.heading3 },
  }

  const { heading, style } = styleMap[level]

  return new Paragraph({
    heading,
    spacing: { before: 400, after: 200 },
    children: [
      new TextRun({
        text,
        ...style,
      }),
    ],
  })
}

/**
 * Create a body paragraph
 */
function createParagraph(
  text: string,
  options?: { bold?: boolean; italic?: boolean }
): Paragraph {
  return new Paragraph({
    spacing: { after: 120 },
    children: [
      new TextRun({
        text,
        ...STYLES.body,
        bold: options?.bold,
        italics: options?.italic,
      }),
    ],
  })
}

/**
 * Create a bullet point paragraph
 */
function createBullet(text: string): Paragraph {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 60 },
    children: [
      new TextRun({
        text,
        ...STYLES.body,
      }),
    ],
  })
}

/**
 * Create a table with header row
 */
function createTable(
  headers: string[],
  rows: string[][],
  columnWidths?: number[]
): Table {
  const defaultWidth = 100 / headers.length

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: 'e2e8f0' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: 'e2e8f0' },
      left: { style: BorderStyle.SINGLE, size: 1, color: 'e2e8f0' },
      right: { style: BorderStyle.SINGLE, size: 1, color: 'e2e8f0' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'e2e8f0' },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'e2e8f0' },
    },
    rows: [
      // Header row
      new TableRow({
        tableHeader: true,
        children: headers.map(
          (header, index) =>
            new TableCell({
              width: {
                size: columnWidths?.[index] ?? defaultWidth,
                type: WidthType.PERCENTAGE,
              },
              shading: { type: ShadingType.SOLID, color: '2d3748' },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: header,
                      ...STYLES.tableHeader,
                    }),
                  ],
                }),
              ],
            })
        ),
      }),
      // Data rows
      ...rows.map(
        (row, rowIndex) =>
          new TableRow({
            children: row.map(
              (cell, cellIndex) =>
                new TableCell({
                  width: {
                    size: columnWidths?.[cellIndex] ?? defaultWidth,
                    type: WidthType.PERCENTAGE,
                  },
                  shading:
                    rowIndex % 2 === 0
                      ? { type: ShadingType.SOLID, color: 'f7fafc' }
                      : undefined,
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: cell,
                          ...STYLES.tableCell,
                        }),
                      ],
                    }),
                  ],
                })
            ),
          })
      ),
    ],
  })
}

/**
 * Format date for display
 */
function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

/**
 * Format baseline for display
 */
function formatBaseline(baseline: string): string {
  return baseline.replace(/_/g, ' ').replace('FEDRAMP', 'FedRAMP')
}

/**
 * Format implementation status for display
 */
function formatStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

// ============================================================================
// Section Generators
// ============================================================================

/**
 * Generate title page content
 */
function generateTitlePage(project: SspProject): SectionContent[] {
  const systemName = project.systemInfo?.systemName || project.name

  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: convertInchesToTwip(3), after: 400 },
      children: [
        new TextRun({
          text: 'SYSTEM SECURITY PLAN',
          bold: true,
          size: 48, // 24pt
          color: '1a365d',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: systemName,
          bold: true,
          size: 40, // 20pt
          color: '2d3748',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [
        new TextRun({
          text: `Baseline: ${formatBaseline(project.baseline)}`,
          size: 28,
          color: '4a5568',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: convertInchesToTwip(2), after: 200 },
      children: [
        new TextRun({
          text: `Version: 1.0`,
          size: 24,
          color: '718096',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `Last Updated: ${formatDate(project.updatedAt)}`,
          size: 24,
          color: '718096',
        }),
      ],
    }),
    new Paragraph({
      children: [new PageBreak()],
    }),
  ]
}

/**
 * Generate system identification section
 */
function generateSystemIdentification(project: SspProject): SectionContent[] {
  const systemInfo = project.systemInfo
  const paragraphs: SectionContent[] = []

  paragraphs.push(createHeading('1. System Identification', 1))

  // System Name and Description
  paragraphs.push(createHeading('1.1 System Name', 2))
  paragraphs.push(createParagraph(systemInfo?.systemName || project.name))

  if (systemInfo?.systemId) {
    paragraphs.push(createHeading('1.2 System Identifier', 2))
    paragraphs.push(createParagraph(systemInfo.systemId))
  }

  paragraphs.push(createHeading('1.3 System Type', 2))
  paragraphs.push(
    createParagraph(formatStatus(systemInfo?.systemType || 'Not specified'))
  )

  paragraphs.push(createHeading('1.4 System Description', 2))
  paragraphs.push(
    createParagraph(
      systemInfo?.description ||
        project.description ||
        'No description provided.'
    )
  )

  return paragraphs
}

/**
 * Generate authorization boundary section
 */
function generateAuthorizationBoundary(project: SspProject): SectionContent[] {
  const boundary = project.systemInfo?.boundary
  const paragraphs: SectionContent[] = []

  paragraphs.push(createHeading('2. Authorization Boundary', 1))

  paragraphs.push(createHeading('2.1 Boundary Description', 2))
  paragraphs.push(
    createParagraph(
      boundary?.description || 'Authorization boundary not defined.'
    )
  )

  // System Components
  if (boundary?.components && boundary.components.length > 0) {
    paragraphs.push(createHeading('2.2 System Components', 2))
    paragraphs.push(
      createParagraph(
        'The following components are within the authorization boundary:'
      )
    )

    paragraphs.push(
      createTable(
        ['Component Name', 'Type', 'Description', 'Vendor/Version'],
        boundary.components.map((c) => [
          c.name,
          formatStatus(c.type),
          c.description,
          [c.vendor, c.version].filter(Boolean).join(' ') || 'N/A',
        ]),
        [20, 15, 45, 20]
      )
    )
  }

  // External Connections
  if (
    boundary?.externalConnections &&
    boundary.externalConnections.length > 0
  ) {
    paragraphs.push(createHeading('2.3 External Connections', 2))
    paragraphs.push(
      createParagraph(
        'The following external connections cross the authorization boundary:'
      )
    )

    paragraphs.push(
      createTable(
        [
          'External System',
          'Organization',
          'Connection Type',
          'Data Description',
        ],
        boundary.externalConnections.map((c) => [
          c.systemName,
          c.organization,
          c.connectionType,
          c.dataDescription,
        ]),
        [20, 20, 20, 40]
      )
    )
  }

  return paragraphs
}

/**
 * Generate security categorization section
 */
function generateSecurityCategorization(project: SspProject): SectionContent[] {
  const categorization = project.systemInfo?.categorization
  const paragraphs: SectionContent[] = []

  paragraphs.push(createHeading('3. Security Categorization', 1))

  paragraphs.push(createHeading('3.1 FIPS 199 Categorization', 2))
  paragraphs.push(
    createParagraph(
      'The system is categorized in accordance with FIPS 199, "Standards for Security Categorization of Federal Information and Information Systems."'
    )
  )

  paragraphs.push(
    createTable(
      ['Security Objective', 'Impact Level'],
      [
        ['Confidentiality', categorization?.confidentiality || 'Not specified'],
        ['Integrity', categorization?.integrity || 'Not specified'],
        ['Availability', categorization?.availability || 'Not specified'],
        ['Overall', categorization?.overall || 'Not specified'],
      ],
      [50, 50]
    )
  )

  paragraphs.push(createHeading('3.2 Selected Baseline', 2))
  paragraphs.push(
    createParagraph(
      `Based on the security categorization, the ${formatBaseline(project.baseline)} baseline has been selected.`
    )
  )

  return paragraphs
}

/**
 * Generate system environment section
 */
function generateSystemEnvironment(project: SspProject): SectionContent[] {
  const environment = project.systemInfo?.environment
  const paragraphs: SectionContent[] = []

  paragraphs.push(createHeading('4. System Environment', 1))

  paragraphs.push(createHeading('4.1 Deployment Model', 2))
  paragraphs.push(
    createParagraph(
      formatStatus(environment?.deploymentModel || 'Not specified')
    )
  )

  if (environment?.cloudProvider) {
    paragraphs.push(createHeading('4.2 Cloud Service Provider', 2))
    paragraphs.push(createParagraph(environment.cloudProvider))

    if (environment.cloudServiceModel) {
      paragraphs.push(
        createParagraph(`Service Model: ${environment.cloudServiceModel}`)
      )
    }
  }

  if (
    environment?.operatingSystems &&
    environment.operatingSystems.length > 0
  ) {
    paragraphs.push(createHeading('4.3 Operating Systems', 2))
    environment.operatingSystems.forEach((os) => {
      paragraphs.push(createBullet(os))
    })
  }

  if (environment?.technologies && environment.technologies.length > 0) {
    paragraphs.push(createHeading('4.4 Key Technologies', 2))
    environment.technologies.forEach((tech) => {
      paragraphs.push(createBullet(tech))
    })
  }

  if (environment?.dataTypes && environment.dataTypes.length > 0) {
    paragraphs.push(createHeading('4.5 Data Types', 2))
    environment.dataTypes.forEach((type) => {
      paragraphs.push(createBullet(type))
    })
  }

  return paragraphs
}

/**
 * Generate system contacts section
 */
function generateSystemContacts(project: SspProject): SectionContent[] {
  const contacts = project.systemInfo?.contacts
  const paragraphs: SectionContent[] = []

  paragraphs.push(createHeading('5. System Contacts', 1))

  const contactRoles = [
    { key: 'systemOwner', title: 'System Owner' },
    { key: 'authorizingOfficial', title: 'Authorizing Official' },
    { key: 'securityPoc', title: 'Information System Security Officer (ISSO)' },
    { key: 'technicalPoc', title: 'Technical Point of Contact' },
  ] as const

  contactRoles.forEach((role) => {
    const contact = contacts?.[role.key]
    if (contact?.name || contact?.email) {
      paragraphs.push(
        createHeading(`5.${contactRoles.indexOf(role) + 1} ${role.title}`, 2)
      )
      if (contact.name)
        paragraphs.push(createParagraph(`Name: ${contact.name}`))
      if (contact.title)
        paragraphs.push(createParagraph(`Title: ${contact.title}`))
      if (contact.email)
        paragraphs.push(createParagraph(`Email: ${contact.email}`))
      if (contact.phone)
        paragraphs.push(createParagraph(`Phone: ${contact.phone}`))
      if (contact.organization)
        paragraphs.push(
          createParagraph(`Organization: ${contact.organization}`)
        )
    }
  })

  return paragraphs
}

/**
 * Generate control implementation section
 */
function generateControlImplementations(project: SspProject): SectionContent[] {
  const implementations = project.implementations || []
  const paragraphs: SectionContent[] = []

  paragraphs.push(createHeading('6. Control Implementations', 1))

  if (implementations.length === 0) {
    paragraphs.push(
      createParagraph('No control implementations have been documented.')
    )
    return paragraphs
  }

  // Summary table
  const statusCounts = {
    IMPLEMENTED: 0,
    PARTIALLY_IMPLEMENTED: 0,
    PLANNED: 0,
    NOT_APPLICABLE: 0,
    NOT_STARTED: 0,
  }

  implementations.forEach((impl) => {
    statusCounts[impl.status]++
  })

  paragraphs.push(createHeading('6.1 Implementation Summary', 2))
  paragraphs.push(
    createTable(
      ['Status', 'Count'],
      Object.entries(statusCounts)
        .filter(([_, count]) => count > 0)
        .map(([status, count]) => [formatStatus(status), count.toString()]),
      [60, 40]
    )
  )

  // Group implementations by control family
  const byFamily = new Map<string, ControlImplementation[]>()
  implementations.forEach((impl) => {
    const family = impl.controlId.match(/^([A-Z]{2})/)?.[1] || 'Other'
    if (!byFamily.has(family)) {
      byFamily.set(family, [])
    }
    byFamily.get(family)!.push(impl)
  })

  paragraphs.push(createHeading('6.2 Control Implementation Details', 2))

  // Sort families and output
  const sortedFamilies = Array.from(byFamily.keys()).sort()
  sortedFamilies.forEach((family) => {
    const familyImpls = byFamily.get(family)!
    paragraphs.push(createHeading(`${family} Family Controls`, 3))

    familyImpls
      .sort((a, b) => a.controlId.localeCompare(b.controlId))
      .forEach((impl) => {
        paragraphs.push(
          createParagraph(`${impl.controlId} - ${formatStatus(impl.status)}`, {
            bold: true,
          })
        )

        if (impl.statement) {
          paragraphs.push(createParagraph(impl.statement))
        }

        if (impl.responsibleRole) {
          paragraphs.push(
            createParagraph(`Responsible: ${impl.responsibleRole}`, {
              italic: true,
            })
          )
        }

        if (impl.inherited) {
          paragraphs.push(
            createParagraph(`Inherited from: ${impl.inherited.systemName}`, {
              italic: true,
            })
          )
        }
      })
  })

  return paragraphs
}

// ============================================================================
// Main Generator
// ============================================================================

/**
 * Generate a Word document from SSP project data
 */
export async function generateWordDocument(
  project: SspProject,
  options: WordExportOptions = {}
): Promise<Blob> {
  const {
    includeToc = true,
    includeHeader = true,
    includeFooter = true,
    fedramp = project.baseline.startsWith('FEDRAMP'),
  } = options

  const systemName = project.systemInfo?.systemName || project.name

  // Build sections
  const sections: SectionContent[] = []

  // Title page
  sections.push(...generateTitlePage(project))

  // Table of contents
  if (includeToc) {
    sections.push(createHeading('Table of Contents', 1))
    sections.push(
      new TableOfContents('Table of Contents', {
        hyperlink: true,
        headingStyleRange: '1-3',
        stylesWithLevels: [
          new StyleLevel('Heading1', 1),
          new StyleLevel('Heading2', 2),
          new StyleLevel('Heading3', 3),
        ],
      })
    )
    sections.push(new Paragraph({ children: [new PageBreak()] }))
  }

  // Content sections
  sections.push(...generateSystemIdentification(project))
  sections.push(...generateAuthorizationBoundary(project))
  sections.push(...generateSecurityCategorization(project))
  sections.push(...generateSystemEnvironment(project))
  sections.push(...generateSystemContacts(project))
  sections.push(...generateControlImplementations(project))

  // Create document
  const doc = new Document({
    title: `${systemName} System Security Plan`,
    description: `System Security Plan for ${systemName}`,
    creator: 'SSP Generator',
    styles: {
      default: {
        document: {
          run: {
            font: 'Calibri',
            size: 22, // 11pt
          },
          paragraph: {
            spacing: {
              line: 276, // 1.15 line spacing
            },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
            },
          },
        },
        headers: includeHeader
          ? {
              default: new Header({
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [
                      new TextRun({
                        text: `${systemName} - System Security Plan`,
                        ...STYLES.footer,
                      }),
                    ],
                  }),
                ],
              }),
            }
          : undefined,
        footers: includeFooter
          ? {
              default: new Footer({
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({
                        text: 'Page ',
                        ...STYLES.footer,
                      }),
                      new TextRun({
                        children: [PageNumber.CURRENT],
                        ...STYLES.footer,
                      }),
                      new TextRun({
                        text: ' of ',
                        ...STYLES.footer,
                      }),
                      new TextRun({
                        children: [PageNumber.TOTAL_PAGES],
                        ...STYLES.footer,
                      }),
                    ],
                  }),
                ],
              }),
            }
          : undefined,
        children: sections,
      },
    ],
  })

  // Generate blob
  return await Packer.toBlob(doc)
}

/**
 * Get suggested filename for Word export
 */
export function getWordFilename(project: SspProject): string {
  const systemName = (project.systemInfo?.systemName || project.name)
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
  return `${systemName}-ssp.docx`
}
