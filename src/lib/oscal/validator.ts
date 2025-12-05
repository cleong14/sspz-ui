/**
 * OSCAL SSP Validator
 * @module lib/oscal/validator
 *
 * Validates OSCAL SSP documents against schema and business rules.
 * Provides detailed error messages with fix suggestions.
 *
 * Story: 6.5 - Implement OSCAL Validation
 */

import Ajv, { type ErrorObject } from 'ajv'
import addFormats from 'ajv-formats'
import type { SspProject } from '@/types/ssp'
import type { OscalSspDocument } from './types'
import { generateOscalSsp } from './generator'

// ============================================================================
// Types
// ============================================================================

export interface ValidationError {
  /** Error code for programmatic handling */
  code: string
  /** Human-readable error message */
  message: string
  /** Path in the document where error occurred (JSON pointer) */
  path?: string
  /** Line number if applicable */
  line?: number
  /** Suggested fix for the error */
  suggestion?: string
  /** Severity level */
  severity: 'error' | 'warning'
}

export interface ValidationResult {
  /** Whether the document is valid (no errors) */
  isValid: boolean
  /** List of errors found */
  errors: ValidationError[]
  /** List of warnings (non-blocking issues) */
  warnings: ValidationError[]
  /** Total error count */
  errorCount: number
  /** Total warning count */
  warningCount: number
  /** Validation timestamp */
  validatedAt: string
}

export interface ValidationOptions {
  /** Include detailed schema validation */
  validateSchema?: boolean
  /** Include business rule validation */
  validateBusinessRules?: boolean
  /** Include FedRAMP-specific validation */
  fedramp?: boolean
  /** Strict mode - treat warnings as errors */
  strict?: boolean
}

// ============================================================================
// OSCAL SSP Schema (Simplified - key required fields)
// ============================================================================

/**
 * Simplified OSCAL SSP JSON Schema for validation.
 * Based on NIST OSCAL v1.1.3 specification.
 * Full schema available at: https://github.com/usnistgov/OSCAL/releases
 */
const OSCAL_SSP_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://pages.nist.gov/OSCAL/schemas/oscal_ssp_schema.json',
  type: 'object',
  required: ['system-security-plan'],
  properties: {
    'system-security-plan': {
      type: 'object',
      required: [
        'uuid',
        'metadata',
        'import-profile',
        'system-characteristics',
        'system-implementation',
        'control-implementation',
      ],
      properties: {
        uuid: {
          type: 'string',
          format: 'uuid',
        },
        metadata: {
          type: 'object',
          required: ['title', 'last-modified', 'version', 'oscal-version'],
          properties: {
            title: { type: 'string', minLength: 1 },
            'last-modified': { type: 'string', format: 'date-time' },
            version: { type: 'string' },
            'oscal-version': { type: 'string' },
            published: { type: 'string', format: 'date-time' },
            remarks: { type: 'string' },
            roles: {
              type: 'array',
              items: {
                type: 'object',
                required: ['id', 'title'],
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                },
              },
            },
            parties: {
              type: 'array',
              items: {
                type: 'object',
                required: ['uuid', 'type'],
                properties: {
                  uuid: { type: 'string', format: 'uuid' },
                  type: { type: 'string', enum: ['person', 'organization'] },
                  name: { type: 'string' },
                  'email-addresses': {
                    type: 'array',
                    items: { type: 'string', format: 'email' },
                  },
                },
              },
            },
            'responsible-parties': {
              type: 'array',
              items: {
                type: 'object',
                required: ['role-id', 'party-uuids'],
                properties: {
                  'role-id': { type: 'string' },
                  'party-uuids': {
                    type: 'array',
                    items: { type: 'string', format: 'uuid' },
                  },
                },
              },
            },
          },
        },
        'import-profile': {
          type: 'object',
          required: ['href'],
          properties: {
            href: { type: 'string', format: 'uri' },
            remarks: { type: 'string' },
          },
        },
        'system-characteristics': {
          type: 'object',
          required: [
            'system-name',
            'system-ids',
            'security-sensitivity-level',
            'system-information',
            'security-impact-level',
            'status',
            'authorization-boundary',
          ],
          properties: {
            'system-name': { type: 'string', minLength: 1 },
            'system-ids': {
              type: 'array',
              minItems: 1,
              items: {
                type: 'object',
                required: ['id'],
                properties: {
                  id: { type: 'string' },
                  'identifier-type': { type: 'string', format: 'uri' },
                },
              },
            },
            description: { type: 'string' },
            'security-sensitivity-level': { type: 'string' },
            'system-information': {
              type: 'object',
              properties: {
                'information-types': {
                  type: 'array',
                  items: { type: 'object' },
                },
              },
            },
            'security-impact-level': {
              type: 'object',
              required: [
                'security-objective-confidentiality',
                'security-objective-integrity',
                'security-objective-availability',
              ],
              properties: {
                'security-objective-confidentiality': { type: 'string' },
                'security-objective-integrity': { type: 'string' },
                'security-objective-availability': { type: 'string' },
              },
            },
            status: {
              type: 'object',
              required: ['state'],
              properties: {
                state: {
                  type: 'string',
                  enum: [
                    'operational',
                    'under-development',
                    'under-major-modification',
                    'disposition',
                    'other',
                  ],
                },
                remarks: { type: 'string' },
              },
            },
            'authorization-boundary': {
              type: 'object',
              required: ['description'],
              properties: {
                description: { type: 'string' },
                diagrams: {
                  type: 'array',
                  items: { type: 'object' },
                },
              },
            },
          },
        },
        'system-implementation': {
          type: 'object',
          required: ['users', 'components'],
          properties: {
            users: {
              type: 'array',
              items: {
                type: 'object',
                required: ['uuid'],
                properties: {
                  uuid: { type: 'string', format: 'uuid' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                },
              },
            },
            components: {
              type: 'array',
              items: {
                type: 'object',
                required: ['uuid', 'type', 'title', 'status'],
                properties: {
                  uuid: { type: 'string', format: 'uuid' },
                  type: { type: 'string' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  status: {
                    type: 'object',
                    required: ['state'],
                    properties: {
                      state: {
                        type: 'string',
                        enum: [
                          'under-development',
                          'operational',
                          'disposition',
                          'other',
                        ],
                      },
                    },
                  },
                },
              },
            },
          },
        },
        'control-implementation': {
          type: 'object',
          required: ['description', 'implemented-requirements'],
          properties: {
            description: { type: 'string' },
            'implemented-requirements': {
              type: 'array',
              items: {
                type: 'object',
                required: ['uuid', 'control-id'],
                properties: {
                  uuid: { type: 'string', format: 'uuid' },
                  'control-id': { type: 'string' },
                  statements: {
                    type: 'array',
                    items: { type: 'object' },
                  },
                },
              },
            },
          },
        },
        'back-matter': {
          type: 'object',
          properties: {
            resources: {
              type: 'array',
              items: { type: 'object' },
            },
          },
        },
      },
    },
  },
}

// ============================================================================
// Business Rule Validators
// ============================================================================

/**
 * Validate business rules for SSP data
 */
function validateBusinessRules(
  ssp: OscalSspDocument,
  options: ValidationOptions
): ValidationError[] {
  const errors: ValidationError[] = []
  const plan = ssp['system-security-plan']

  // Check metadata
  if (!plan.metadata.title || plan.metadata.title.trim().length === 0) {
    errors.push({
      code: 'MISSING_TITLE',
      message: 'System Security Plan must have a title',
      path: '/system-security-plan/metadata/title',
      suggestion: 'Add a descriptive title for your SSP',
      severity: 'error',
    })
  }

  // Check system name
  if (
    !plan['system-characteristics']['system-name'] ||
    plan['system-characteristics']['system-name'].trim().length === 0
  ) {
    errors.push({
      code: 'MISSING_SYSTEM_NAME',
      message: 'System name is required',
      path: '/system-security-plan/system-characteristics/system-name',
      suggestion: 'Enter the official name of your information system',
      severity: 'error',
    })
  }

  // Check system IDs
  const systemIds = plan['system-characteristics']['system-ids']
  if (!systemIds || systemIds.length === 0) {
    errors.push({
      code: 'MISSING_SYSTEM_ID',
      message: 'At least one system identifier is required',
      path: '/system-security-plan/system-characteristics/system-ids',
      suggestion: 'Add a unique identifier for your system',
      severity: 'error',
    })
  }

  // Check authorization boundary
  const boundary = plan['system-characteristics']['authorization-boundary']
  if (!boundary?.description || boundary.description.trim().length < 10) {
    errors.push({
      code: 'INSUFFICIENT_BOUNDARY_DESCRIPTION',
      message: 'Authorization boundary description is too short or missing',
      path: '/system-security-plan/system-characteristics/authorization-boundary/description',
      suggestion:
        'Provide a detailed description of the system authorization boundary',
      severity: 'warning',
    })
  }

  // Check control implementations
  const impls = plan['control-implementation']['implemented-requirements']
  if (!impls || impls.length === 0) {
    errors.push({
      code: 'NO_CONTROL_IMPLEMENTATIONS',
      message: 'No control implementations documented',
      path: '/system-security-plan/control-implementation/implemented-requirements',
      suggestion: 'Document implementation statements for applicable controls',
      severity: 'warning',
    })
  } else {
    // Check for controls without statements
    impls.forEach((impl, index) => {
      const hasStatements = impl.statements && impl.statements.length > 0
      const hasByComponent =
        impl['by-components'] && impl['by-components'].length > 0
      if (!hasStatements && !hasByComponent) {
        errors.push({
          code: 'EMPTY_CONTROL_IMPLEMENTATION',
          message: `Control ${impl['control-id']} has no implementation statement`,
          path: `/system-security-plan/control-implementation/implemented-requirements/${index}`,
          suggestion: `Add an implementation statement for control ${impl['control-id']}`,
          severity: 'warning',
        })
      }
    })
  }

  // Check roles and parties (contacts)
  const roles = plan.metadata.roles
  const parties = plan.metadata.parties
  if (!roles || roles.length === 0) {
    errors.push({
      code: 'NO_ROLES_DEFINED',
      message: 'No organizational roles defined',
      path: '/system-security-plan/metadata/roles',
      suggestion: 'Define roles such as System Owner, ISSO, and Technical POC',
      severity: 'warning',
    })
  }
  if (!parties || parties.length === 0) {
    errors.push({
      code: 'NO_PARTIES_DEFINED',
      message: 'No parties (organizations/people) defined',
      path: '/system-security-plan/metadata/parties',
      suggestion: 'Add contact information for key personnel',
      severity: 'warning',
    })
  }

  // FedRAMP-specific validations
  if (options.fedramp) {
    // Check for FedRAMP properties
    const props = plan.metadata.props || []
    const hasFedRampId = props.some(
      (p: { name: string }) =>
        p.name === 'fedramp-authorization-id' ||
        p.name === 'fedramp-ssp-version'
    )
    if (!hasFedRampId) {
      errors.push({
        code: 'MISSING_FEDRAMP_ID',
        message: 'FedRAMP authorization ID or version not specified',
        path: '/system-security-plan/metadata/props',
        suggestion: 'Add FedRAMP-specific metadata properties',
        severity: 'warning',
      })
    }

    // Check import profile is FedRAMP
    const href = plan['import-profile'].href || ''
    if (!href.includes('fedramp')) {
      errors.push({
        code: 'NON_FEDRAMP_PROFILE',
        message: 'Import profile does not reference a FedRAMP baseline',
        path: '/system-security-plan/import-profile/href',
        suggestion: 'Use a FedRAMP baseline profile (Low, Moderate, or High)',
        severity: 'warning',
      })
    }

    // Check system components
    const components = plan['system-implementation'].components
    if (!components || components.length === 0) {
      errors.push({
        code: 'NO_COMPONENTS_DEFINED',
        message: 'FedRAMP requires system components to be defined',
        path: '/system-security-plan/system-implementation/components',
        suggestion: 'Add system components to the implementation section',
        severity: 'error',
      })
    }
  }

  return errors
}

// ============================================================================
// Main Validator Class
// ============================================================================

/**
 * OSCAL SSP Validator
 *
 * Validates OSCAL SSP documents against JSON schema and business rules.
 */
export class OscalValidator {
  private ajv: Ajv
  private validateFn: ReturnType<Ajv['compile']>

  constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      verbose: true,
      strict: false,
    })
    addFormats(this.ajv)
    this.validateFn = this.ajv.compile(OSCAL_SSP_SCHEMA)
  }

  /**
   * Validate an OSCAL SSP document
   */
  validate(
    document: OscalSspDocument,
    options: ValidationOptions = {}
  ): ValidationResult {
    const {
      validateSchema = true,
      validateBusinessRules: checkBusinessRules = true,
      fedramp = false,
      strict = false,
    } = options

    const allErrors: ValidationError[] = []

    // Schema validation
    if (validateSchema) {
      const valid = this.validateFn(document)
      if (!valid && this.validateFn.errors) {
        this.validateFn.errors.forEach((err) => {
          allErrors.push({
            code: 'SCHEMA_VALIDATION_ERROR',
            message: err.message || 'Schema validation failed',
            path: err.instancePath,
            suggestion: this.getSuggestionForSchemaError(err),
            severity: 'error',
          })
        })
      }
    }

    // Business rule validation
    if (checkBusinessRules) {
      const businessErrors = validateBusinessRules(document, {
        fedramp,
        ...options,
      })
      allErrors.push(...businessErrors)
    }

    // Separate errors and warnings
    const errors = allErrors.filter(
      (e) => e.severity === 'error' || (strict && e.severity === 'warning')
    )
    const warnings = allErrors.filter(
      (e) => e.severity === 'warning' && !strict
    )

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      errorCount: errors.length,
      warningCount: warnings.length,
      validatedAt: new Date().toISOString(),
    }
  }

  /**
   * Validate an SSP project (generates OSCAL first)
   */
  validateProject(
    project: SspProject,
    options: ValidationOptions = {}
  ): ValidationResult {
    try {
      const oscalDoc = generateOscalSsp(project, { fedramp: options.fedramp })
      return this.validate(oscalDoc, options)
    } catch (error) {
      return {
        isValid: false,
        errors: [
          {
            code: 'GENERATION_ERROR',
            message:
              error instanceof Error
                ? error.message
                : 'Failed to generate OSCAL document',
            severity: 'error',
            suggestion: 'Ensure all required SSP fields are filled out',
          },
        ],
        warnings: [],
        errorCount: 1,
        warningCount: 0,
        validatedAt: new Date().toISOString(),
      }
    }
  }

  /**
   * Generate suggestions for common schema errors
   */
  private getSuggestionForSchemaError(error: ErrorObject): string {
    const { keyword, instancePath, params } = error

    switch (keyword) {
      case 'required':
        return `Add the required field: ${(params as { missingProperty?: string }).missingProperty}`
      case 'type':
        return `Value should be of type: ${(params as { type?: string }).type}`
      case 'format':
        return `Value should be in format: ${(params as { format?: string }).format}`
      case 'minLength':
        return `Value at ${instancePath} must not be empty`
      case 'minItems':
        return `Array at ${instancePath} must have at least one item`
      case 'enum':
        return `Value must be one of: ${((params as { allowedValues?: string[] }).allowedValues || []).join(', ')}`
      default:
        return `Check the value at ${instancePath}`
    }
  }
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Validate an OSCAL SSP document
 *
 * @param document - The OSCAL SSP document to validate
 * @param options - Validation options
 * @returns Validation result with errors and warnings
 */
export function validateOscalSsp(
  document: OscalSspDocument,
  options: ValidationOptions = {}
): ValidationResult {
  const validator = new OscalValidator()
  return validator.validate(document, options)
}

/**
 * Validate an SSP project before export
 *
 * @param project - The SSP project to validate
 * @param options - Validation options
 * @returns Validation result with errors and warnings
 */
export function validateSspProject(
  project: SspProject,
  options: ValidationOptions = {}
): ValidationResult {
  const validator = new OscalValidator()
  return validator.validateProject(project, options)
}

/**
 * Quick check if an SSP project is valid
 *
 * @param project - The SSP project to check
 * @param options - Validation options
 * @returns true if valid, false otherwise
 */
export function isValidSspProject(
  project: SspProject,
  options: ValidationOptions = {}
): boolean {
  const result = validateSspProject(project, options)
  return result.isValid
}

/**
 * Get a human-readable validation summary
 *
 * @param result - Validation result
 * @returns Formatted summary string
 */
export function formatValidationSummary(result: ValidationResult): string {
  if (result.isValid && result.warningCount === 0) {
    return 'SSP is OSCAL-compliant - no issues found.'
  }

  const parts: string[] = []

  if (!result.isValid) {
    parts.push(`${result.errorCount} error(s) found`)
  }

  if (result.warningCount > 0) {
    parts.push(`${result.warningCount} warning(s)`)
  }

  const issues = [...result.errors, ...result.warnings]
    .slice(0, 5)
    .map((e) => `  - ${e.message}`)
    .join('\n')

  const moreCount = result.errorCount + result.warningCount - 5
  const moreText = moreCount > 0 ? `\n  ... and ${moreCount} more issues` : ''

  return `${parts.join(', ')}:\n${issues}${moreText}`
}
