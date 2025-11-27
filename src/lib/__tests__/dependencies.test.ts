/**
 * SSP Dependencies Smoke Test
 *
 * Verifies that all SSP-specific dependencies can be imported without error.
 * These dependencies were added in Story 1.1.
 */

describe('SSP Dependencies Import Smoke Test', () => {
  describe('Data Utilities', () => {
    it('should import uuid', async () => {
      const uuid = await import('uuid')
      expect(uuid.v4).toBeDefined()
    })

    it('should import date-fns', async () => {
      const dateFns = await import('date-fns')
      expect(dateFns.format).toBeDefined()
      expect(dateFns.parseISO).toBeDefined()
    })
  })

  describe('Export Features', () => {
    it('should import file-saver', async () => {
      const fileSaver = await import('file-saver')
      expect(fileSaver.saveAs).toBeDefined()
    })

    it('should import jszip', async () => {
      const JSZip = (await import('jszip')).default
      expect(JSZip).toBeDefined()
      const zip = new JSZip()
      expect(zip.file).toBeDefined()
    })
  })

  describe('OSCAL Validation', () => {
    it('should import ajv', async () => {
      const Ajv = (await import('ajv')).default
      expect(Ajv).toBeDefined()
      const ajv = new Ajv()
      expect(ajv.compile).toBeDefined()
    })

    it('should import ajv-formats', async () => {
      const addFormats = (await import('ajv-formats')).default
      expect(addFormats).toBeDefined()
    })
  })

  describe('Document Generation', () => {
    it('should import docx', async () => {
      const docx = await import('docx')
      expect(docx.Document).toBeDefined()
      expect(docx.Paragraph).toBeDefined()
      expect(docx.Packer).toBeDefined()
    })

    it('should import pdfmake', async () => {
      const pdfMake = await import('pdfmake/build/pdfmake')
      expect(pdfMake).toBeDefined()
    })
  })

  describe('Form Handling', () => {
    it('should import react-hook-form', async () => {
      const rhf = await import('react-hook-form')
      expect(rhf.useForm).toBeDefined()
      expect(rhf.Controller).toBeDefined()
    })

    it('should import zod', async () => {
      const { z } = await import('zod')
      expect(z.string).toBeDefined()
      expect(z.object).toBeDefined()
    })

    it('should import @hookform/resolvers', async () => {
      const resolvers = await import('@hookform/resolvers/zod')
      expect(resolvers.zodResolver).toBeDefined()
    })
  })
})
