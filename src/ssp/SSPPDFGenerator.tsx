/**
 * SSP PDF Generation Utility
 * Handles the conversion of SSP template to PDF format
 * @module SSPPDFGenerator
 */
import { createRoot } from 'react-dom/client'
import SSPTemplate from './SSPTemplate'
import type { SSPData, SSPGenerationOptions } from '@/types/ssp'

interface SSPPDFGeneratorProps {
  data: SSPData
  options?: Partial<SSPGenerationOptions>
  onGenerated?: (blob: Blob) => void
  onError?: (error: Error) => void
}

class SSPPDFGenerator {
  private static instance: SSPPDFGenerator

  public static getInstance(): SSPPDFGenerator {
    if (!SSPPDFGenerator.instance) {
      SSPPDFGenerator.instance = new SSPPDFGenerator()
    }
    return SSPPDFGenerator.instance
  }

  /**
   * Generate PDF from SSP data using browser's print functionality
   */
  public async generatePDF(props: SSPPDFGeneratorProps): Promise<void> {
    const { data, onGenerated, onError } = props

    try {
      // Create a new window for PDF generation
      const printWindow = window.open('', '_blank', 'width=800,height=600')

      if (!printWindow) {
        throw new Error(
          'Unable to open print window. Please check popup blocker settings.'
        )
      }

      // Set up the print window document
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${data.systemName} - System Security Plan</title>
            <meta charset="utf-8">
            <style>
              ${this.getInlineStyles()}
            </style>
          </head>
          <body>
            <div id="ssp-root"></div>
          </body>
        </html>
      `)

      printWindow.document.close()

      // Wait for the document to be ready
      await new Promise<void>((resolve) => {
        if (printWindow.document.readyState === 'complete') {
          resolve()
        } else {
          printWindow.addEventListener('load', () => resolve())
        }
      })

      // Render the SSP template in the print window
      const rootElement = printWindow.document.getElementById('ssp-root')
      if (!rootElement) {
        throw new Error('Failed to find root element in print window')
      }

      const root = createRoot(rootElement)
      root.render(<SSPTemplate data={data} isPrintMode={true} />)

      // Wait a moment for rendering to complete
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Note: Browser print API doesn't support programmatic configuration
      // Users will need to configure print settings in the browser dialog

      // Trigger print dialog
      printWindow.focus()
      printWindow.print()

      // Clean up
      setTimeout(() => {
        printWindow.close()
      }, 1000)

      if (onGenerated) {
        // Note: Browser print doesn't return a blob, so we pass null
        onGenerated(new Blob())
      }
    } catch (error) {
      console.error('PDF generation failed:', error)
      if (onError) {
        onError(error as Error)
      }
    }
  }

  /**
   * Generate HTML string from SSP data
   * Note: This is a simplified implementation. In production, consider using
   * server-side rendering or a proper HTML generation library.
   */
  public generateHTML(data: SSPData): string {
    // For now, return a basic HTML structure
    // In a real implementation, you'd want to use a proper template engine
    return `
      <div class="ssp-template">
        <h1>${data.systemName} - System Security Plan</h1>
        <p>Version: ${data.systemVersion}</p>
        <p>Organization: ${data.organization?.name || 'Not specified'}</p>
        <!-- Additional content would be generated here -->
      </div>
    `
  }

  /**
   * Download SSP as HTML file
   */
  public downloadHTML(data: SSPData, filename?: string): void {
    const html = this.generateHTML(data)
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${data.systemName} - System Security Plan</title>
          <meta charset="utf-8">
          <style>${this.getInlineStyles()}</style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `

    const blob = new Blob([fullHtml], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download =
      filename ||
      `${data.systemName}_SSP_${new Date().toISOString().split('T')[0]}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * Get inline CSS styles for the template
   */
  private getInlineStyles(): string {
    // This would ideally import the actual SCSS compiled to CSS
    // For now, we'll include critical styles inline
    return `
      .ssp-template {
        font-family: 'Times New Roman', serif;
        font-size: 12pt;
        line-height: 1.4;
        color: #000;
        background: #fff;
      }
      
      .ssp-page {
        min-height: 11in;
        width: 8.5in;
        margin: 0 auto 1in;
        padding: 1in;
        background: #fff;
        page-break-after: always;
      }
      
      @media print {
        .ssp-page {
          margin: 0;
          padding: 0.75in;
          min-height: auto;
          width: auto;
        }
      }
      
      h1 {
        font-size: 16pt;
        font-weight: bold;
        margin: 0 0 0.5in;
        color: #2c5aa0;
        text-transform: uppercase;
        border-bottom: 2px solid #2c5aa0;
        padding-bottom: 4px;
      }
      
      h2 {
        font-size: 14pt;
        font-weight: bold;
        margin: 0.5in 0 0.25in;
        color: #2c5aa0;
      }
      
      .ssp-data-table {
        width: 100%;
        border-collapse: collapse;
        margin: 0.25in 0 0.5in;
        font-size: 10pt;
      }
      
      .ssp-data-table th {
        background-color: #2c5aa0;
        color: #fff;
        font-weight: bold;
        padding: 8px;
        text-align: left;
        border: 1px solid #2c5aa0;
      }
      
      .ssp-data-table td {
        padding: 6px 8px;
        border: 1px solid #ccc;
        vertical-align: top;
      }
      
      .status-badge {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 8pt;
        font-weight: bold;
        text-transform: uppercase;
      }
      
      .status-implemented {
        background-color: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
      }
      
      .status-partial {
        background-color: #fff3cd;
        color: #856404;
        border: 1px solid #ffeaa7;
      }
      
      .status-planned {
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
      }
    `
  }
}

// Export singleton instance
export default SSPPDFGenerator.getInstance()

// Export the class for testing
export { SSPPDFGenerator }
