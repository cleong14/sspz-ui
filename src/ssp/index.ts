/**
 * SSP Module Exports
 * Central export point for all SSP-related components and utilities
 * @module ssp
 */

export { default as SSPTemplate } from './SSPTemplate'
export {
  default as SSPPDFGenerator,
  SSPPDFGenerator as SSPPDFGeneratorClass,
} from './SSPPDFGenerator'
export { default as SSPExample } from './SSPExample'

// Re-export types for convenience
export type {
  SSPData,
  SecurityControl,
  SecurityTool,
  SystemComponent,
  ControlStatus,
  ControlFamily,
  ControlCatalog,
  SSPGenerationOptions,
  SSPExportData,
} from '@/types/ssp'
