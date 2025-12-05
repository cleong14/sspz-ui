/**
 * PDF Document Generator for SSP Export
 * @module lib/export/pdf-generator
 *
 * Generates formatted PDF documents from SSP project data using pdfmake.
 *
 * Story: 6.4 - Implement PDF Export
 */

import pdfMake from 'pdfmake/build/pdfmake'
import { vfs } from 'pdfmake/build/vfs_fonts'
import type {
  TDocumentDefinitions,
  Content,
  TableCell,
  StyleDictionary,
} from 'pdfmake/interfaces'

import type { SspProject } from '../../types/ssp'
import type { ControlImplementation } from '../../types/control'

// Initialize pdfmake with fonts
pdfMake.vfs = vfs

// ============================================================================
// Types
// ============================================================================

export interface PdfExportOptions {
  /** Include table of contents */
  includeToc?: boolean
  /** Include header with system name */
  includeHeader?: boolean
  /** Include footer with page numbers */
  includeFooter?: boolean
  /** Include FedRAMP specific sections */
  fedramp?: boolean
}

// ============================================================================
// Styles
// ============================================================================

const PDF_STYLES: StyleDictionary = {
  title: {
    fontSize: 24,
    bold: true,
    color: '#1a365d',
    alignment: 'center',
    margin: [0, 100, 0, 10],
  },
  subtitle: {
    fontSize: 18,
    bold: true,
    color: '#2d3748',
    alignment: 'center',
    margin: [0, 5, 0, 5],
  },
  heading1: {
    fontSize: 16,
    bold: true,
    color: '#1a365d',
    margin: [0, 20, 0, 10],
  },
  heading2: {
    fontSize: 14,
    bold: true,
    color: '#2d3748',
    margin: [0, 15, 0, 8],
  },
  heading3: {
    fontSize: 12,
    bold: true,
    color: '#4a5568',
    margin: [0, 10, 0, 5],
  },
  body: {
    fontSize: 10,
    color: '#1a202c',
    margin: [0, 0, 0, 5],
    lineHeight: 1.3,
  },
  tableHeader: {
    fontSize: 9,
    bold: true,
    color: '#ffffff',
    fillColor: '#2d3748',
    margin: [3, 5, 3, 5],
  },
  tableCell: {
    fontSize: 9,
    color: '#1a202c',
    margin: [3, 3, 3, 3],
  },
  footer: {
    fontSize: 8,
    color: '#718096',
    alignment: 'center',
  },
  tocItem: {
    fontSize: 10,
    color: '#2d3748',
    margin: [0, 3, 0, 3],
  },
  bullet: {
    fontSize: 10,
    color: '#1a202c',
    margin: [15, 0, 0, 3],
  },
}

// ============================================================================
// Helper Functions
// ============================================================================

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

/**
 * Create a table for the PDF
 */
function createTable(
  headers: string[],
  rows: string[][],
  columnWidths?: (string | number)[]
): Content {
  const defaultWidth = `${Math.floor(100 / headers.length)}%`

  return {
    style: 'tableWrapper',
    margin: [0, 5, 0, 10] as [number, number, number, number],
    table: {
      headerRows: 1,
      widths: columnWidths || headers.map(() => defaultWidth),
      body: [
        // Header row
        headers.map(
          (header): TableCell => ({
            text: header,
            style: 'tableHeader',
          })
        ),
        // Data rows
        ...rows.map((row, rowIndex) =>
          row.map(
            (cell): TableCell => ({
              text: cell,
              style: 'tableCell',
              fillColor: rowIndex % 2 === 0 ? '#f7fafc' : undefined,
            })
          )
        ),
      ],
    },
    layout: {
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => '#e2e8f0',
      vLineColor: () => '#e2e8f0',
    },
  }
}

// ============================================================================
// Section Generators
// ============================================================================

/**
 * Generate title page content
 */
function generateTitlePage(project: SspProject): Content[] {
  const systemName = project.systemInfo?.systemName || project.name

  return [
    {
      text: 'SYSTEM SECURITY PLAN',
      style: 'title',
    },
    {
      text: systemName,
      style: 'subtitle',
    },
    {
      text: `Baseline: ${formatBaseline(project.baseline)}`,
      style: 'body',
      alignment: 'center' as const,
      margin: [0, 30, 0, 5] as [number, number, number, number],
    },
    {
      text: `Version: 1.0`,
      style: 'body',
      alignment: 'center' as const,
      margin: [0, 100, 0, 5] as [number, number, number, number],
    },
    {
      text: `Last Updated: ${formatDate(project.updatedAt)}`,
      style: 'body',
      alignment: 'center' as const,
    },
    {
      text: '',
      pageBreak: 'after' as const,
    },
  ]
}

/**
 * Generate table of contents
 */
function generateTableOfContents(): Content[] {
  return [
    {
      text: 'Table of Contents',
      style: 'heading1',
    },
    {
      toc: {
        id: 'mainToc',
        title: { text: '', style: 'tocItem' },
      },
    },
    {
      text: '',
      pageBreak: 'after' as const,
    },
  ]
}

/**
 * Generate system identification section
 */
function generateSystemIdentification(project: SspProject): Content[] {
  const systemInfo = project.systemInfo
  const content: Content[] = []

  content.push({
    text: '1. System Identification',
    style: 'heading1',
    tocItem: 'mainToc',
  })

  content.push({ text: '1.1 System Name', style: 'heading2' })
  content.push({ text: systemInfo?.systemName || project.name, style: 'body' })

  if (systemInfo?.systemId) {
    content.push({ text: '1.2 System Identifier', style: 'heading2' })
    content.push({ text: systemInfo.systemId, style: 'body' })
  }

  content.push({ text: '1.3 System Type', style: 'heading2' })
  content.push({
    text: formatStatus(systemInfo?.systemType || 'Not specified'),
    style: 'body',
  })

  content.push({ text: '1.4 System Description', style: 'heading2' })
  content.push({
    text:
      systemInfo?.description ||
      project.description ||
      'No description provided.',
    style: 'body',
  })

  return content
}

/**
 * Generate authorization boundary section
 */
function generateAuthorizationBoundary(project: SspProject): Content[] {
  const boundary = project.systemInfo?.boundary
  const content: Content[] = []

  content.push({
    text: '2. Authorization Boundary',
    style: 'heading1',
    tocItem: 'mainToc',
  })

  content.push({ text: '2.1 Boundary Description', style: 'heading2' })
  content.push({
    text: boundary?.description || 'Authorization boundary not defined.',
    style: 'body',
  })

  // System Components
  if (boundary?.components && boundary.components.length > 0) {
    content.push({ text: '2.2 System Components', style: 'heading2' })
    content.push({
      text: 'The following components are within the authorization boundary:',
      style: 'body',
    })

    content.push(
      createTable(
        ['Component Name', 'Type', 'Description', 'Vendor/Version'],
        boundary.components.map((c) => [
          c.name,
          formatStatus(c.type),
          c.description,
          [c.vendor, c.version].filter(Boolean).join(' ') || 'N/A',
        ]),
        ['20%', '15%', '45%', '20%']
      )
    )
  }

  // External Connections
  if (
    boundary?.externalConnections &&
    boundary.externalConnections.length > 0
  ) {
    content.push({ text: '2.3 External Connections', style: 'heading2' })
    content.push({
      text: 'The following external connections cross the authorization boundary:',
      style: 'body',
    })

    content.push(
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
        ['20%', '20%', '20%', '40%']
      )
    )
  }

  return content
}

/**
 * Generate security categorization section
 */
function generateSecurityCategorization(project: SspProject): Content[] {
  const categorization = project.systemInfo?.categorization
  const content: Content[] = []

  content.push({
    text: '3. Security Categorization',
    style: 'heading1',
    tocItem: 'mainToc',
  })

  content.push({ text: '3.1 FIPS 199 Categorization', style: 'heading2' })
  content.push({
    text: 'The system is categorized in accordance with FIPS 199, "Standards for Security Categorization of Federal Information and Information Systems."',
    style: 'body',
  })

  content.push(
    createTable(
      ['Security Objective', 'Impact Level'],
      [
        ['Confidentiality', categorization?.confidentiality || 'Not specified'],
        ['Integrity', categorization?.integrity || 'Not specified'],
        ['Availability', categorization?.availability || 'Not specified'],
        ['Overall', categorization?.overall || 'Not specified'],
      ],
      ['50%', '50%']
    )
  )

  content.push({ text: '3.2 Selected Baseline', style: 'heading2' })
  content.push({
    text: `Based on the security categorization, the ${formatBaseline(project.baseline)} baseline has been selected.`,
    style: 'body',
  })

  return content
}

/**
 * Generate system environment section
 */
function generateSystemEnvironment(project: SspProject): Content[] {
  const environment = project.systemInfo?.environment
  const content: Content[] = []

  content.push({
    text: '4. System Environment',
    style: 'heading1',
    tocItem: 'mainToc',
  })

  content.push({ text: '4.1 Deployment Model', style: 'heading2' })
  content.push({
    text: formatStatus(environment?.deploymentModel || 'Not specified'),
    style: 'body',
  })

  if (environment?.cloudProvider) {
    content.push({ text: '4.2 Cloud Service Provider', style: 'heading2' })
    content.push({ text: environment.cloudProvider, style: 'body' })

    if (environment.cloudServiceModel) {
      content.push({
        text: `Service Model: ${environment.cloudServiceModel}`,
        style: 'body',
      })
    }
  }

  if (
    environment?.operatingSystems &&
    environment.operatingSystems.length > 0
  ) {
    content.push({ text: '4.3 Operating Systems', style: 'heading2' })
    content.push({
      ul: environment.operatingSystems,
      style: 'bullet',
    })
  }

  if (environment?.technologies && environment.technologies.length > 0) {
    content.push({ text: '4.4 Key Technologies', style: 'heading2' })
    content.push({
      ul: environment.technologies,
      style: 'bullet',
    })
  }

  if (environment?.dataTypes && environment.dataTypes.length > 0) {
    content.push({ text: '4.5 Data Types', style: 'heading2' })
    content.push({
      ul: environment.dataTypes,
      style: 'bullet',
    })
  }

  return content
}

/**
 * Generate system contacts section
 */
function generateSystemContacts(project: SspProject): Content[] {
  const contacts = project.systemInfo?.contacts
  const content: Content[] = []

  content.push({
    text: '5. System Contacts',
    style: 'heading1',
    tocItem: 'mainToc',
  })

  const contactRoles = [
    { key: 'systemOwner', title: 'System Owner' },
    { key: 'authorizingOfficial', title: 'Authorizing Official' },
    { key: 'securityPoc', title: 'Information System Security Officer (ISSO)' },
    { key: 'technicalPoc', title: 'Technical Point of Contact' },
  ] as const

  contactRoles.forEach((role, index) => {
    const contact = contacts?.[role.key]
    if (contact?.name || contact?.email) {
      content.push({ text: `5.${index + 1} ${role.title}`, style: 'heading2' })
      if (contact.name)
        content.push({ text: `Name: ${contact.name}`, style: 'body' })
      if (contact.title)
        content.push({ text: `Title: ${contact.title}`, style: 'body' })
      if (contact.email)
        content.push({ text: `Email: ${contact.email}`, style: 'body' })
      if (contact.phone)
        content.push({ text: `Phone: ${contact.phone}`, style: 'body' })
      if (contact.organization)
        content.push({
          text: `Organization: ${contact.organization}`,
          style: 'body',
        })
    }
  })

  return content
}

/**
 * Generate control implementation section
 */
function generateControlImplementations(project: SspProject): Content[] {
  const implementations = project.implementations || []
  const content: Content[] = []

  content.push({
    text: '6. Control Implementations',
    style: 'heading1',
    tocItem: 'mainToc',
  })

  if (implementations.length === 0) {
    content.push({
      text: 'No control implementations have been documented.',
      style: 'body',
    })
    return content
  }

  // Summary table
  const statusCounts: Record<string, number> = {
    IMPLEMENTED: 0,
    PARTIALLY_IMPLEMENTED: 0,
    PLANNED: 0,
    NOT_APPLICABLE: 0,
    NOT_STARTED: 0,
  }

  implementations.forEach((impl) => {
    statusCounts[impl.status]++
  })

  content.push({ text: '6.1 Implementation Summary', style: 'heading2' })
  content.push(
    createTable(
      ['Status', 'Count'],
      Object.entries(statusCounts)
        .filter(([_, count]) => count > 0)
        .map(([status, count]) => [formatStatus(status), count.toString()]),
      ['60%', '40%']
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

  content.push({
    text: '6.2 Control Implementation Details',
    style: 'heading2',
  })

  // Sort families and output
  const sortedFamilies = Array.from(byFamily.keys()).sort()
  sortedFamilies.forEach((family) => {
    const familyImpls = byFamily.get(family)!
    content.push({ text: `${family} Family Controls`, style: 'heading3' })

    familyImpls
      .sort((a, b) => a.controlId.localeCompare(b.controlId))
      .forEach((impl) => {
        content.push({
          text: `${impl.controlId} - ${formatStatus(impl.status)}`,
          style: 'body',
          bold: true,
          margin: [0, 5, 0, 2] as [number, number, number, number],
        })

        if (impl.statement) {
          content.push({ text: impl.statement, style: 'body' })
        }

        if (impl.responsibleRole) {
          content.push({
            text: `Responsible: ${impl.responsibleRole}`,
            style: 'body',
            italics: true,
          })
        }

        if (impl.inherited) {
          content.push({
            text: `Inherited from: ${impl.inherited.systemName}`,
            style: 'body',
            italics: true,
          })
        }
      })
  })

  return content
}

// ============================================================================
// Main Generator
// ============================================================================

/**
 * Generate a PDF document from SSP project data
 */
export async function generatePdfDocument(
  project: SspProject,
  options: PdfExportOptions = {}
): Promise<Blob> {
  const {
    includeToc = true,
    includeHeader = true,
    includeFooter = true,
  } = options

  const systemName = project.systemInfo?.systemName || project.name

  // Build content
  const content: Content[] = []

  // Title page
  content.push(...generateTitlePage(project))

  // Table of contents
  if (includeToc) {
    content.push(...generateTableOfContents())
  }

  // Content sections
  content.push(...generateSystemIdentification(project))
  content.push(...generateAuthorizationBoundary(project))
  content.push(...generateSecurityCategorization(project))
  content.push(...generateSystemEnvironment(project))
  content.push(...generateSystemContacts(project))
  content.push(...generateControlImplementations(project))

  // Build document definition
  const docDefinition: TDocumentDefinitions = {
    pageSize: 'LETTER',
    pageMargins: [72, 72, 72, 72], // 1 inch margins
    content,
    styles: PDF_STYLES,
    defaultStyle: {
      font: 'Helvetica',
      fontSize: 10,
    },
    header: includeHeader
      ? (currentPage: number, _pageCount: number) => {
          if (currentPage === 1) return null
          return {
            text: `${systemName} - System Security Plan`,
            style: 'footer',
            margin: [72, 40, 72, 0],
            alignment: 'right' as const,
          }
        }
      : undefined,
    footer: includeFooter
      ? (currentPage: number, pageCount: number) => {
          if (currentPage === 1) return null
          return {
            text: `Page ${currentPage} of ${pageCount}`,
            style: 'footer',
            margin: [72, 0, 72, 40],
            alignment: 'center' as const,
          }
        }
      : undefined,
    info: {
      title: `${systemName} System Security Plan`,
      author: 'SSP Generator',
      subject: 'System Security Plan',
      creator: 'SSP Generator',
    },
  }

  // Generate PDF
  return new Promise((resolve, reject) => {
    try {
      const pdfDocGenerator = pdfMake.createPdf(docDefinition)
      pdfDocGenerator.getBlob((blob: Blob) => {
        resolve(blob)
      })
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Get suggested filename for PDF export
 */
export function getPdfFilename(project: SspProject): string {
  const systemName = (project.systemInfo?.systemName || project.name)
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
  return `${systemName}-ssp.pdf`
}
