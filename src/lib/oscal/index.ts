/**
 * OSCAL Library Exports
 * @module lib/oscal
 *
 * Provides OSCAL SSP generation, validation, and parsing capabilities.
 *
 * Story: 6.1 - Implement OSCAL SSP Generator
 */

// Types
export type {
  // Common types
  OscalProperty,
  OscalLink,
  OscalRole,
  OscalParty,
  OscalAddress,
  OscalResponsibleParty,
  OscalResponsibleRole,
  // Metadata
  OscalMetadata,
  OscalRevision,
  // Import Profile
  OscalImportProfile,
  // System Characteristics
  OscalSystemId,
  OscalSecurityImpactLevel,
  OscalCategorization,
  OscalImpact,
  OscalInformationType,
  OscalSystemInformation,
  OscalAuthorizationBoundary,
  OscalDiagram,
  OscalStatus,
  OscalSystemCharacteristics,
  // System Implementation
  OscalUser,
  OscalPrivilege,
  OscalComponent,
  OscalProtocol,
  OscalPortRange,
  OscalInventoryItem,
  OscalImplementedComponent,
  OscalSystemImplementation,
  OscalLeveragedAuthorization,
  // Control Implementation
  OscalSetParameter,
  OscalStatement,
  OscalByComponent,
  OscalImplementationStatus,
  OscalImplementedRequirement,
  OscalControlImplementation,
  // Back Matter
  OscalResource,
  OscalBackMatter,
  // Complete SSP
  OscalSystemSecurityPlan,
  OscalSspDocument,
  // Options
  OscalFormat,
  OscalExportOptions,
} from './types'

// Generator
export {
  OscalGenerator,
  generateOscalSsp,
  exportOscalSsp,
  getOscalFileExtension,
  getOscalMimeType,
} from './generator'

// Validator (Story 6.5)
export {
  OscalValidator,
  validateOscalSsp,
  validateSspProject,
  isValidSspProject,
  formatValidationSummary,
  type ValidationResult,
  type ValidationError,
  type ValidationOptions,
} from './validator'

// Parser (Story 6.6, 6.7)
export {
  parseOscalSsp,
  parseOscalFile,
  isValidOscalSsp,
  detectFormat,
  detectFormatFromFilename,
  generateErrorReport,
  type ParseResult,
  type ParseError,
  type ParseWarning,
  type ParseOptions,
} from './parser'
