/**
 * SSP Generator Type Definitions
 * @module types
 *
 * Barrel export for all SSP-related type definitions.
 * Import from '@/types' for clean access to all types.
 *
 * @example
 * import { SspProject, Control, Tool } from '@/types'
 */

// SSP Project Types
export type {
  Baseline,
  SspStatus,
  ImpactLevel,
  Contact,
  SystemComponent,
  ExternalConnection,
  SystemBoundary,
  SecurityCategorization,
  SystemEnvironment,
  SystemContacts,
  SystemInfo,
  AiFeedback,
  SspProject,
  CreateSspInput,
  UpdateSspInput,
} from './ssp'

// Control Types (Implementation + Catalog)
export type {
  ImplementationStatus,
  AiConfidence,
  Evidence,
  InheritedControl,
  ControlImplementation,
  ImplementationProgress,
  ControlParameter,
  BaselineApplicability,
  Control,
  ControlFamily,
  CatalogStatistics,
  ControlCatalog,
  FedRampBaseline,
  FedRampBaselines,
} from './control'

// Tool Types
export type {
  ToolCategory,
  MappingConfidence,
  MappingSource,
  ToolControlMapping,
  Tool,
  ToolLibrary,
  ToolSelection,
  MappingApproval,
  PendingApprovalsSummary,
} from './tool'
