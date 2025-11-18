# SSP Generator Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a client-side React web application for generating NIST 800-53 compliant System Security Plans with OSCAL export, AI-assisted descriptions, and pre-mapped security tool control mappings.

**Architecture:** Multi-layer TypeScript application with React UI (Material-UI), service layer for OSCAL parsing/generation, IndexedDB persistence, pluggable AI providers, and client-side export engines (PDF, DOCX, Markdown).

**Tech Stack:** React 18, TypeScript, Material-UI v5, Vite, IndexedDB, jsPDF, docx.js, React Hook Form, Yup validation, Jest/Testing Library

---

## Phase 1: Foundation & Type Definitions

### Task 1: Core Type Definitions

**Files:**

- Create: `src/types/oscal.ts`
- Create: `src/types/ssp.ts`
- Create: `src/types/tools.ts`
- Create: `src/types/ai-provider.ts`

**Step 1: Write failing test for OSCAL types**

Create: `src/types/__tests__/oscal.test.ts`

```typescript
import { OSCALCatalog, OSCALControl, Baseline } from '../oscal'

describe('OSCAL Types', () => {
  it('should allow valid baseline values', () => {
    const baseline: Baseline = 'low'
    expect(['low', 'moderate', 'high']).toContain(baseline)
  })

  it('should define control structure with required fields', () => {
    const control: OSCALControl = {
      id: 'ac-1',
      title: 'Access Control Policy and Procedures',
      class: 'AC',
      parts: [],
    }
    expect(control.id).toBeDefined()
    expect(control.title).toBeDefined()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `yarn test src/types/__tests__/oscal.test.ts`
Expected: FAIL with "Cannot find module '../oscal'"

**Step 3: Write minimal OSCAL type definitions**

Create: `src/types/oscal.ts`

```typescript
/**
 * NIST OSCAL (Open Security Controls Assessment Language) Type Definitions
 * Based on OSCAL 1.0.4 specification
 */

export type Baseline = 'low' | 'moderate' | 'high'

export interface OSCALControl {
  id: string // e.g., "ac-1", "ac-2.1"
  class: string // Control family (AC, AU, etc.)
  title: string
  parts: OSCALPart[]
  controls?: OSCALControl[] // Nested control enhancements
  props?: OSCALProperty[]
  links?: OSCALLink[]
}

export interface OSCALPart {
  id?: string
  name: string
  prose?: string
  parts?: OSCALPart[]
  props?: OSCALProperty[]
}

export interface OSCALProperty {
  name: string
  value: string
  class?: string
  ns?: string
}

export interface OSCALLink {
  href: string
  rel?: string
  text?: string
}

export interface OSCALCatalog {
  uuid: string
  metadata: OSCALMetadata
  groups: OSCALGroup[]
  backMatter?: OSCALBackMatter
}

export interface OSCALGroup {
  id: string
  class: string
  title: string
  controls: OSCALControl[]
  groups?: OSCALGroup[]
}

export interface OSCALMetadata {
  title: string
  lastModified: string
  version: string
  oscalVersion: string
  props?: OSCALProperty[]
  parties?: OSCALParty[]
}

export interface OSCALParty {
  uuid: string
  type: 'organization' | 'person'
  name: string
  emailAddresses?: string[]
}

export interface OSCALBackMatter {
  resources?: OSCALResource[]
}

export interface OSCALResource {
  uuid: string
  title?: string
  description?: string
  props?: OSCALProperty[]
}
```

**Step 4: Run test to verify it passes**

Run: `yarn test src/types/__tests__/oscal.test.ts`
Expected: PASS

**Step 5: Write SSP type definitions with test**

Create: `src/types/__tests__/ssp.test.ts`

```typescript
import { SSPProject, SecurityImpactLevel } from '../ssp'

describe('SSP Types', () => {
  it('should create valid SSP project structure', () => {
    const project: SSPProject = {
      metadata: {
        title: 'Test System',
        lastModified: new Date(),
        version: '1.0.0',
        oscalVersion: '1.0.4',
      },
      systemCharacteristics: {
        systemName: 'Test System',
        systemId: 'test-001',
        description: 'Test description',
        securityImpactLevel: {
          confidentiality: 'moderate',
          integrity: 'moderate',
          availability: 'moderate',
        },
        systemType: 'SaaS',
        authorizationBoundary: 'Cloud environment',
      },
      controlBaseline: 'moderate',
      selectedTools: [],
      controlImplementations: [],
      responsibleParties: [],
    }

    expect(project.metadata.oscalVersion).toBe('1.0.4')
    expect(project.controlBaseline).toBe('moderate')
  })
})
```

Create: `src/types/ssp.ts`

```typescript
/**
 * System Security Plan (SSP) Type Definitions
 */

export type ImpactLevel = 'low' | 'moderate' | 'high'
export type ImplementationStatus = 'implemented' | 'planned' | 'not-applicable'
export type Baseline = 'low' | 'moderate' | 'high'

export interface SecurityImpactLevel {
  confidentiality: ImpactLevel
  integrity: ImpactLevel
  availability: ImpactLevel
}

export interface SSPMetadata {
  title: string
  lastModified: Date
  version: string
  oscalVersion: '1.0.4'
}

export interface SystemCharacteristics {
  systemName: string
  systemId: string
  description: string
  securityImpactLevel: SecurityImpactLevel
  systemType: string
  authorizationBoundary: string
  networkArchitecture?: string
}

export interface SelectedTool {
  toolId: string
  toolName: string
  version?: string
  configuration?: Record<string, any>
  customMapping?: boolean
}

export interface ControlImplementation {
  controlId: string
  implementationStatus: ImplementationStatus
  responsibleRole: string
  description: string
  providingTools: string[]
  customNotes?: string
}

export interface ResponsibleParty {
  roleId: string
  title: string
  contacts: Array<{ name: string; email: string }>
}

export interface SSPProject {
  id?: string
  metadata: SSPMetadata
  systemCharacteristics: SystemCharacteristics
  controlBaseline: Baseline
  selectedTools: SelectedTool[]
  controlImplementations: ControlImplementation[]
  responsibleParties: ResponsibleParty[]
  customFields?: Record<string, any>
}
```

Run: `yarn test src/types/__tests__/ssp.test.ts`

**Step 6: Write security tool type definitions with test**

Create: `src/types/__tests__/tools.test.ts`

```typescript
import { ToolControlMapping, ToolCategory } from '../tools'

describe('Tool Types', () => {
  it('should create valid tool control mapping', () => {
    const tool: ToolControlMapping = {
      toolId: 'semgrep',
      toolName: 'Semgrep',
      vendor: 'Semgrep, Inc.',
      category: 'SAST',
      controlMappings: [
        {
          controlId: 'si-10.1',
          coverage: 'full',
          rationale: 'Semgrep detects input validation flaws',
        },
      ],
    }

    expect(tool.category).toBe('SAST')
    expect(tool.controlMappings).toHaveLength(1)
  })
})
```

Create: `src/types/tools.ts`

```typescript
/**
 * Security Tool Control Mapping Type Definitions
 */

export type ToolCategory =
  | 'SAST'
  | 'secrets'
  | 'SCA'
  | 'DAST'
  | 'IaC'
  | 'container'
  | 'other'
export type Coverage = 'full' | 'partial'

export interface ControlMapping {
  controlId: string
  coverage: Coverage
  rationale: string
  evidence?: string
}

export interface ToolControlMapping {
  toolId: string
  toolName: string
  vendor: string
  category: ToolCategory
  controlMappings: ControlMapping[]
  defaultConfiguration?: Record<string, any>
}
```

Run: `yarn test src/types/__tests__/tools.test.ts`

**Step 7: Write AI provider type definitions with test**

Create: `src/types/__tests__/ai-provider.test.ts`

```typescript
import { GenerationPreferences, AIProviderConfig } from '../ai-provider'

describe('AI Provider Types', () => {
  it('should create valid generation preferences', () => {
    const prefs: GenerationPreferences = {
      length: 'standard',
      technicalLevel: 'professional',
      tone: 'formal',
      includeEvidence: true,
      includeReferences: true,
    }

    expect(prefs.length).toBe('standard')
  })

  it('should create valid AI provider config', () => {
    const config: AIProviderConfig = {
      name: 'anthropic-oauth',
      type: 'cloud',
      authMethod: 'oauth',
      enabled: true,
    }

    expect(config.type).toBe('cloud')
  })
})
```

Create: `src/types/ai-provider.ts`

```typescript
/**
 * AI Provider Interface Type Definitions
 */

export type AIProviderType = 'cloud' | 'local'
export type AuthMethod = 'api-key' | 'oauth' | 'none'
export type LengthPreference = 'concise' | 'standard' | 'detailed'
export type TechnicalLevel = 'executive' | 'professional' | 'technical'
export type TonePreference = 'formal' | 'professional' | 'conversational'

export interface GenerationPreferences {
  length: LengthPreference
  technicalLevel: TechnicalLevel
  tone: TonePreference
  includeEvidence: boolean
  includeReferences: boolean
}

export interface AIProviderConfig {
  name: string
  type: AIProviderType
  authMethod: AuthMethod
  enabled: boolean
  apiKey?: string
  endpoint?: string
  model?: string
}

export interface ControlDescriptionRequest {
  controlId: string
  controlText: string
  controlEnhancements: string[]
  tools: Array<{
    name: string
    capabilities: string
  }>
  systemContext: {
    systemName: string
    systemType: string
    systemDescription: string
    baseline: string
  }
  userContext?: string
  preferences: GenerationPreferences
}

export interface AIProvider {
  name: string
  type: AIProviderType
  authMethod: AuthMethod

  generateControlDescription(
    request: ControlDescriptionRequest
  ): Promise<string>
  authenticate?(): Promise<void>
  isConfigured(): boolean
  validateConfig(): Promise<boolean>
}
```

Run: `yarn test src/types/__tests__/ai-provider.test.ts`

**Step 8: Commit**

```bash
git add src/types/
git commit -m "feat: add core type definitions for OSCAL, SSP, tools, and AI providers"
```

---

### Task 2: OSCAL Catalog Data & Loading

**Files:**

- Create: `public/data/nist-800-53-rev5-catalog.json` (stub for now)
- Create: `src/services/oscal-catalog.ts`
- Create: `src/services/__tests__/oscal-catalog.test.ts`

**Step 1: Write failing test for catalog loading**

Create: `src/services/__tests__/oscal-catalog.test.ts`

```typescript
import {
  loadCatalog,
  getControlById,
  getBaselineControls,
} from '../oscal-catalog'
import { Baseline } from '../../types/ssp'

describe('OSCAL Catalog Service', () => {
  it('should load bundled NIST 800-53 catalog', async () => {
    const catalog = await loadCatalog()
    expect(catalog).toBeDefined()
    expect(catalog.metadata.title).toContain('NIST')
  })

  it('should retrieve control by ID', async () => {
    const catalog = await loadCatalog()
    const control = getControlById(catalog, 'ac-1')
    expect(control).toBeDefined()
    expect(control?.id).toBe('ac-1')
  })

  it('should get baseline controls for moderate baseline', async () => {
    const catalog = await loadCatalog()
    const baseline: Baseline = 'moderate'
    const controls = getBaselineControls(catalog, baseline)
    expect(controls.length).toBeGreaterThan(0)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `yarn test src/services/__tests__/oscal-catalog.test.ts`
Expected: FAIL with "Cannot find module '../oscal-catalog'"

**Step 3: Create stub catalog data**

Create: `public/data/nist-800-53-rev5-catalog.json`

```json
{
  "catalog": {
    "uuid": "8f08878d-7d5c-4d1b-b8ff-8c7d63e5c9a5",
    "metadata": {
      "title": "NIST Special Publication 800-53 Revision 5 MODERATE IMPACT BASELINE",
      "lastModified": "2024-01-01T00:00:00Z",
      "version": "5.0.0",
      "oscalVersion": "1.0.4"
    },
    "groups": [
      {
        "id": "ac",
        "class": "family",
        "title": "Access Control",
        "controls": [
          {
            "id": "ac-1",
            "class": "AC",
            "title": "Access Control Policy and Procedures",
            "parts": [
              {
                "id": "ac-1_smt",
                "name": "statement",
                "prose": "The organization develops, documents, and disseminates to [Assignment: organization-defined personnel or roles]: a. An access control policy..."
              }
            ],
            "props": [
              {
                "name": "baseline-impact",
                "value": "low"
              },
              {
                "name": "baseline-impact",
                "value": "moderate"
              },
              {
                "name": "baseline-impact",
                "value": "high"
              }
            ]
          },
          {
            "id": "ac-2",
            "class": "AC",
            "title": "Account Management",
            "parts": [
              {
                "id": "ac-2_smt",
                "name": "statement",
                "prose": "The organization manages information system accounts..."
              }
            ],
            "controls": [
              {
                "id": "ac-2.1",
                "class": "AC",
                "title": "Automated System Account Management",
                "parts": [
                  {
                    "id": "ac-2.1_smt",
                    "name": "statement",
                    "prose": "The organization employs automated mechanisms to support the management of information system accounts."
                  }
                ],
                "props": [
                  {
                    "name": "baseline-impact",
                    "value": "moderate"
                  },
                  {
                    "name": "baseline-impact",
                    "value": "high"
                  }
                ]
              }
            ],
            "props": [
              {
                "name": "baseline-impact",
                "value": "low"
              },
              {
                "name": "baseline-impact",
                "value": "moderate"
              },
              {
                "name": "baseline-impact",
                "value": "high"
              }
            ]
          }
        ]
      }
    ]
  }
}
```

**Step 4: Implement catalog loading service**

Create: `src/services/oscal-catalog.ts`

```typescript
import { OSCALCatalog, OSCALControl, OSCALGroup } from '../types/oscal'
import { Baseline } from '../types/ssp'

let cachedCatalog: OSCALCatalog | null = null

export async function loadCatalog(): Promise<OSCALCatalog> {
  if (cachedCatalog) {
    return cachedCatalog
  }

  const response = await fetch('/data/nist-800-53-rev5-catalog.json')
  const data = await response.json()
  cachedCatalog = data.catalog
  return cachedCatalog!
}

export function getControlById(
  catalog: OSCALCatalog,
  controlId: string
): OSCALControl | null {
  for (const group of catalog.groups) {
    const control = findControlInGroup(group, controlId)
    if (control) return control
  }
  return null
}

function findControlInGroup(
  group: OSCALGroup,
  controlId: string
): OSCALControl | null {
  for (const control of group.controls) {
    if (control.id === controlId) return control

    // Check nested controls (enhancements)
    if (control.controls) {
      for (const enhancement of control.controls) {
        if (enhancement.id === controlId) return enhancement
        const nested = findControlRecursive(enhancement, controlId)
        if (nested) return nested
      }
    }
  }

  // Check nested groups
  if (group.groups) {
    for (const subGroup of group.groups) {
      const found = findControlInGroup(subGroup, controlId)
      if (found) return found
    }
  }

  return null
}

function findControlRecursive(
  control: OSCALControl,
  controlId: string
): OSCALControl | null {
  if (control.controls) {
    for (const enhancement of control.controls) {
      if (enhancement.id === controlId) return enhancement
      const nested = findControlRecursive(enhancement, controlId)
      if (nested) return nested
    }
  }
  return null
}

export function getBaselineControls(
  catalog: OSCALCatalog,
  baseline: Baseline
): OSCALControl[] {
  const controls: OSCALControl[] = []

  for (const group of catalog.groups) {
    collectBaselineControls(group, baseline, controls)
  }

  return controls
}

function collectBaselineControls(
  group: OSCALGroup,
  baseline: Baseline,
  controls: OSCALControl[]
): void {
  for (const control of group.controls) {
    if (isInBaseline(control, baseline)) {
      controls.push(control)
    }

    // Check enhancements
    if (control.controls) {
      for (const enhancement of control.controls) {
        if (isInBaseline(enhancement, baseline)) {
          controls.push(enhancement)
        }
      }
    }
  }

  // Check nested groups
  if (group.groups) {
    for (const subGroup of group.groups) {
      collectBaselineControls(subGroup, baseline, controls)
    }
  }
}

function isInBaseline(control: OSCALControl, baseline: Baseline): boolean {
  if (!control.props) return false

  return control.props.some(
    (prop) => prop.name === 'baseline-impact' && prop.value === baseline
  )
}
```

**Step 5: Run test to verify it passes**

Run: `yarn test src/services/__tests__/oscal-catalog.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add src/services/oscal-catalog.ts public/data/
git commit -m "feat: add OSCAL catalog loading service with baseline filtering"
```

---

## Phase 2: Security Tool Mappings Database

### Task 3: Tool Mappings Data & Service

**Files:**

- Create: `public/data/tool-mappings/semgrep.json`
- Create: `public/data/tool-mappings/gitleaks.json`
- Create: `public/data/tool-mappings/grype.json`
- Create: `src/services/tool-mappings.ts`
- Create: `src/services/__tests__/tool-mappings.test.ts`

**Step 1: Write failing test for tool mappings service**

Create: `src/services/__tests__/tool-mappings.test.ts`

```typescript
import {
  loadToolMappings,
  getToolById,
  getToolsByCategory,
} from '../tool-mappings'

describe('Tool Mappings Service', () => {
  it('should load all bundled tool mappings', async () => {
    const tools = await loadToolMappings()
    expect(tools.length).toBeGreaterThan(0)
  })

  it('should get tool by ID', async () => {
    const tools = await loadToolMappings()
    const semgrep = getToolById(tools, 'semgrep')
    expect(semgrep).toBeDefined()
    expect(semgrep?.toolName).toBe('Semgrep')
  })

  it('should filter tools by category', async () => {
    const tools = await loadToolMappings()
    const sastTools = getToolsByCategory(tools, 'SAST')
    expect(sastTools.length).toBeGreaterThan(0)
    expect(sastTools.every((t) => t.category === 'SAST')).toBe(true)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `yarn test src/services/__tests__/tool-mappings.test.ts`
Expected: FAIL

**Step 3: Create tool mapping data files**

Create: `public/data/tool-mappings/semgrep.json`

```json
{
  "toolId": "semgrep",
  "toolName": "Semgrep",
  "vendor": "Semgrep, Inc.",
  "category": "SAST",
  "controlMappings": [
    {
      "controlId": "si-10.1",
      "coverage": "full",
      "rationale": "Semgrep detects input validation flaws through pattern matching and taint analysis",
      "evidence": "Detects SQL injection, XSS, command injection, path traversal vulnerabilities"
    },
    {
      "controlId": "si-11.1",
      "coverage": "full",
      "rationale": "Semgrep identifies error handling issues and information disclosure through code patterns",
      "evidence": "Rules for detecting verbose error messages, stack trace exposure"
    },
    {
      "controlId": "ac-3.1",
      "coverage": "partial",
      "rationale": "Semgrep can detect broken access control patterns in application code",
      "evidence": "Detects missing authorization checks, insecure direct object references"
    },
    {
      "controlId": "sc-28.1",
      "coverage": "partial",
      "rationale": "Semgrep identifies hardcoded credentials and weak cryptography usage",
      "evidence": "Detects weak encryption algorithms, hardcoded passwords"
    }
  ]
}
```

Create: `public/data/tool-mappings/gitleaks.json`

```json
{
  "toolId": "gitleaks",
  "toolName": "Gitleaks",
  "vendor": "Gitleaks",
  "category": "secrets",
  "controlMappings": [
    {
      "controlId": "ia-5.1",
      "coverage": "full",
      "rationale": "Gitleaks detects hardcoded passwords and credentials in code and git history",
      "evidence": "Scans for API keys, passwords, tokens across commits"
    },
    {
      "controlId": "ia-5.2",
      "coverage": "full",
      "rationale": "Gitleaks enforces public key infrastructure by detecting exposed private keys",
      "evidence": "Detects exposed RSA keys, SSH keys, TLS certificates"
    },
    {
      "controlId": "sc-12.1",
      "coverage": "partial",
      "rationale": "Gitleaks helps manage cryptographic keys by preventing exposure",
      "evidence": "Detects exposed encryption keys, database credentials"
    }
  ]
}
```

Create: `public/data/tool-mappings/grype.json`

```json
{
  "toolId": "grype",
  "toolName": "Grype",
  "vendor": "Anchore",
  "category": "SCA",
  "controlMappings": [
    {
      "controlId": "si-2.1",
      "coverage": "full",
      "rationale": "Grype identifies known vulnerabilities in software dependencies",
      "evidence": "Scans package manifests against CVE databases"
    },
    {
      "controlId": "si-2.2",
      "coverage": "full",
      "rationale": "Grype provides automated flaw remediation recommendations",
      "evidence": "Suggests version upgrades to patch vulnerabilities"
    },
    {
      "controlId": "ra-5.1",
      "coverage": "partial",
      "rationale": "Grype performs continuous vulnerability scanning of software composition",
      "evidence": "CI/CD integration for ongoing dependency scanning"
    }
  ]
}
```

**Step 4: Implement tool mappings service**

Create: `src/services/tool-mappings.ts`

```typescript
import { ToolControlMapping, ToolCategory } from '../types/tools'

const TOOL_IDS = ['semgrep', 'gitleaks', 'grype']

let cachedTools: ToolControlMapping[] | null = null

export async function loadToolMappings(): Promise<ToolControlMapping[]> {
  if (cachedTools) {
    return cachedTools
  }

  const tools = await Promise.all(
    TOOL_IDS.map(async (toolId) => {
      const response = await fetch(`/data/tool-mappings/${toolId}.json`)
      return response.json()
    })
  )

  cachedTools = tools
  return tools
}

export function getToolById(
  tools: ToolControlMapping[],
  toolId: string
): ToolControlMapping | undefined {
  return tools.find((tool) => tool.toolId === toolId)
}

export function getToolsByCategory(
  tools: ToolControlMapping[],
  category: ToolCategory
): ToolControlMapping[] {
  return tools.filter((tool) => tool.category === category)
}

export async function loadCustomToolMapping(
  file: File
): Promise<ToolControlMapping> {
  const text = await file.text()
  const mapping = JSON.parse(text)

  // Validate against schema (basic validation)
  if (
    !mapping.toolId ||
    !mapping.toolName ||
    !mapping.category ||
    !mapping.controlMappings
  ) {
    throw new Error('Invalid tool mapping format')
  }

  return mapping as ToolControlMapping
}
```

**Step 5: Run test to verify it passes**

Run: `yarn test src/services/__tests__/tool-mappings.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add src/services/tool-mappings.ts public/data/tool-mappings/
git commit -m "feat: add tool mappings service with Semgrep, Gitleaks, Grype data"
```

---

## Phase 3: Control Coverage Engine

### Task 4: Coverage Calculation Service

**Files:**

- Create: `src/services/coverage-calculator.ts`
- Create: `src/services/__tests__/coverage-calculator.test.ts`

**Step 1: Write failing test for coverage calculation**

Create: `src/services/__tests__/coverage-calculator.test.ts`

```typescript
import { calculateControlCoverage } from '../coverage-calculator'
import { loadCatalog } from '../oscal-catalog'
import { loadToolMappings } from '../tool-mappings'
import { Baseline } from '../../types/ssp'

describe('Coverage Calculator', () => {
  it('should calculate coverage for selected tools', async () => {
    const catalog = await loadCatalog()
    const allTools = await loadToolMappings()
    const selectedTools = allTools.filter((t) =>
      ['semgrep', 'gitleaks'].includes(t.toolId)
    )
    const baseline: Baseline = 'moderate'

    const coverage = calculateControlCoverage(baseline, selectedTools, catalog)

    expect(coverage.stats.total).toBeGreaterThan(0)
    expect(
      coverage.stats.covered + coverage.stats.partial + coverage.stats.uncovered
    ).toBe(coverage.stats.total)
  })

  it('should mark control as covered when tool has full coverage', async () => {
    const catalog = await loadCatalog()
    const allTools = await loadToolMappings()
    const selectedTools = allTools.filter((t) => t.toolId === 'semgrep')
    const baseline: Baseline = 'moderate'

    const coverage = calculateControlCoverage(baseline, selectedTools, catalog)

    const si10Coverage = coverage.coverage.find(
      (c) => c.controlId === 'si-10.1'
    )
    expect(si10Coverage?.status).toBe('covered')
  })

  it('should mark control as partial when tool has partial coverage', async () => {
    const catalog = await loadCatalog()
    const allTools = await loadToolMappings()
    const selectedTools = allTools.filter((t) => t.toolId === 'semgrep')
    const baseline: Baseline = 'moderate'

    const coverage = calculateControlCoverage(baseline, selectedTools, catalog)

    const ac3Coverage = coverage.coverage.find((c) => c.controlId === 'ac-3.1')
    if (ac3Coverage) {
      expect(ac3Coverage.status).toBe('partial')
    }
  })
})
```

**Step 2: Run test to verify it fails**

Run: `yarn test src/services/__tests__/coverage-calculator.test.ts`
Expected: FAIL

**Step 3: Implement coverage calculator service**

Create: `src/services/coverage-calculator.ts`

```typescript
import { OSCALCatalog } from '../types/oscal'
import { Baseline } from '../types/ssp'
import { ToolControlMapping } from '../types/tools'
import { getBaselineControls } from './oscal-catalog'

export type CoverageStatus = 'covered' | 'partial' | 'uncovered'

export interface ControlCoverage {
  controlId: string
  status: CoverageStatus
  tools: string[]
}

export interface ControlCoverageReport {
  coverage: ControlCoverage[]
  stats: {
    total: number
    covered: number
    partial: number
    uncovered: number
  }
}

export function calculateControlCoverage(
  baseline: Baseline,
  selectedTools: ToolControlMapping[],
  catalog: OSCALCatalog
): ControlCoverageReport {
  const baselineControls = getBaselineControls(catalog, baseline)

  const coverage = baselineControls.map((control) => {
    const mappedTools = selectedTools.filter((tool) =>
      tool.controlMappings.some((m) => m.controlId === control.id)
    )

    const fullCoverage = mappedTools.some((t) =>
      t.controlMappings.find(
        (m) => m.controlId === control.id && m.coverage === 'full'
      )
    )

    const status: CoverageStatus =
      mappedTools.length === 0
        ? 'uncovered'
        : fullCoverage
          ? 'covered'
          : 'partial'

    return {
      controlId: control.id,
      status,
      tools: mappedTools.map((t) => t.toolName),
    }
  })

  return {
    coverage,
    stats: {
      total: coverage.length,
      covered: coverage.filter((c) => c.status === 'covered').length,
      partial: coverage.filter((c) => c.status === 'partial').length,
      uncovered: coverage.filter((c) => c.status === 'uncovered').length,
    },
  }
}
```

**Step 4: Run test to verify it passes**

Run: `yarn test src/services/__tests__/coverage-calculator.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/services/coverage-calculator.ts
git commit -m "feat: add control coverage calculation engine"
```

---

## Phase 4: State Management & Context

### Task 5: SSP Project Context

**Files:**

- Create: `src/contexts/SSPProjectContext.tsx`
- Create: `src/contexts/__tests__/SSPProjectContext.test.tsx`

**Step 1: Write failing test for SSP context**

Create: `src/contexts/__tests__/SSPProjectContext.test.tsx`

```typescript
import { renderHook, act } from '@testing-library/react'
import { SSPProjectProvider, useSSPProject } from '../SSPProjectContext'
import { Baseline } from '../../types/ssp'

describe('SSPProjectContext', () => {
  it('should provide default SSP project state', () => {
    const { result } = renderHook(() => useSSPProject(), {
      wrapper: SSPProjectProvider,
    })

    expect(result.current.project).toBeDefined()
    expect(result.current.project.selectedTools).toEqual([])
  })

  it('should update system characteristics', () => {
    const { result } = renderHook(() => useSSPProject(), {
      wrapper: SSPProjectProvider,
    })

    act(() => {
      result.current.updateSystemCharacteristics({
        systemName: 'Test System',
        systemId: 'test-001',
        description: 'Test description',
        securityImpactLevel: {
          confidentiality: 'moderate',
          integrity: 'moderate',
          availability: 'moderate',
        },
        systemType: 'SaaS',
        authorizationBoundary: 'Cloud',
      })
    })

    expect(result.current.project.systemCharacteristics.systemName).toBe(
      'Test System'
    )
  })

  it('should set control baseline', () => {
    const { result } = renderHook(() => useSSPProject(), {
      wrapper: SSPProjectProvider,
    })

    act(() => {
      result.current.setControlBaseline('high')
    })

    expect(result.current.project.controlBaseline).toBe('high')
  })

  it('should add selected tool', () => {
    const { result } = renderHook(() => useSSPProject(), {
      wrapper: SSPProjectProvider,
    })

    act(() => {
      result.current.addSelectedTool({
        toolId: 'semgrep',
        toolName: 'Semgrep',
      })
    })

    expect(result.current.project.selectedTools).toHaveLength(1)
    expect(result.current.project.selectedTools[0].toolId).toBe('semgrep')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `yarn test src/contexts/__tests__/SSPProjectContext.test.tsx`
Expected: FAIL

**Step 3: Implement SSP project context**

Create: `src/contexts/SSPProjectContext.tsx`

```typescript
import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  SSPProject,
  SystemCharacteristics,
  Baseline,
  SelectedTool,
  ControlImplementation,
  ResponsibleParty,
} from '../types/ssp';

interface SSPProjectContextType {
  project: SSPProject;
  updateSystemCharacteristics: (characteristics: SystemCharacteristics) => void;
  setControlBaseline: (baseline: Baseline) => void;
  addSelectedTool: (tool: SelectedTool) => void;
  removeSelectedTool: (toolId: string) => void;
  updateControlImplementation: (implementation: ControlImplementation) => void;
  addResponsibleParty: (party: ResponsibleParty) => void;
  resetProject: () => void;
  loadProject: (project: SSPProject) => void;
}

const SSPProjectContext = createContext<SSPProjectContextType | undefined>(undefined);

function createDefaultProject(): SSPProject {
  return {
    metadata: {
      title: 'Untitled System Security Plan',
      lastModified: new Date(),
      version: '1.0.0',
      oscalVersion: '1.0.4',
    },
    systemCharacteristics: {
      systemName: '',
      systemId: '',
      description: '',
      securityImpactLevel: {
        confidentiality: 'moderate',
        integrity: 'moderate',
        availability: 'moderate',
      },
      systemType: '',
      authorizationBoundary: '',
    },
    controlBaseline: 'moderate',
    selectedTools: [],
    controlImplementations: [],
    responsibleParties: [],
  };
}

export function SSPProjectProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<SSPProject>(createDefaultProject());

  const updateSystemCharacteristics = (characteristics: SystemCharacteristics) => {
    setProject((prev) => ({
      ...prev,
      systemCharacteristics: characteristics,
      metadata: {
        ...prev.metadata,
        lastModified: new Date(),
        title: characteristics.systemName || prev.metadata.title,
      },
    }));
  };

  const setControlBaseline = (baseline: Baseline) => {
    setProject((prev) => ({
      ...prev,
      controlBaseline: baseline,
      metadata: { ...prev.metadata, lastModified: new Date() },
    }));
  };

  const addSelectedTool = (tool: SelectedTool) => {
    setProject((prev) => ({
      ...prev,
      selectedTools: [...prev.selectedTools, tool],
      metadata: { ...prev.metadata, lastModified: new Date() },
    }));
  };

  const removeSelectedTool = (toolId: string) => {
    setProject((prev) => ({
      ...prev,
      selectedTools: prev.selectedTools.filter((t) => t.toolId !== toolId),
      metadata: { ...prev.metadata, lastModified: new Date() },
    }));
  };

  const updateControlImplementation = (implementation: ControlImplementation) => {
    setProject((prev) => {
      const existing = prev.controlImplementations.findIndex(
        (ci) => ci.controlId === implementation.controlId
      );

      const updated =
        existing >= 0
          ? prev.controlImplementations.map((ci, i) =>
              i === existing ? implementation : ci
            )
          : [...prev.controlImplementations, implementation];

      return {
        ...prev,
        controlImplementations: updated,
        metadata: { ...prev.metadata, lastModified: new Date() },
      };
    });
  };

  const addResponsibleParty = (party: ResponsibleParty) => {
    setProject((prev) => ({
      ...prev,
      responsibleParties: [...prev.responsibleParties, party],
      metadata: { ...prev.metadata, lastModified: new Date() },
    }));
  };

  const resetProject = () => {
    setProject(createDefaultProject());
  };

  const loadProject = (newProject: SSPProject) => {
    setProject(newProject);
  };

  return (
    <SSPProjectContext.Provider
      value={{
        project,
        updateSystemCharacteristics,
        setControlBaseline,
        addSelectedTool,
        removeSelectedTool,
        updateControlImplementation,
        addResponsibleParty,
        resetProject,
        loadProject,
      }}
    >
      {children}
    </SSPProjectContext.Provider>
  );
}

export function useSSPProject() {
  const context = useContext(SSPProjectContext);
  if (!context) {
    throw new Error('useSSPProject must be used within SSPProjectProvider');
  }
  return context;
}
```

**Step 4: Run test to verify it passes**

Run: `yarn test src/contexts/__tests__/SSPProjectContext.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/contexts/
git commit -m "feat: add SSP project context for state management"
```

---

## Phase 5: IndexedDB Persistence

### Task 6: IndexedDB Service for Draft Persistence

**Files:**

- Create: `src/services/indexeddb.ts`
- Create: `src/services/__tests__/indexeddb.test.ts`

**Step 1: Write failing test for IndexedDB service**

Create: `src/services/__tests__/indexeddb.test.ts`

```typescript
import {
  initDB,
  saveProject,
  loadProject,
  listProjects,
  deleteProject,
} from '../indexeddb'
import { SSPProject } from '../../types/ssp'

describe('IndexedDB Service', () => {
  beforeEach(async () => {
    await initDB()
  })

  it('should initialize database', async () => {
    const db = await initDB()
    expect(db).toBeDefined()
  })

  it('should save and load project', async () => {
    const project: SSPProject = {
      id: 'test-1',
      metadata: {
        title: 'Test Project',
        lastModified: new Date(),
        version: '1.0.0',
        oscalVersion: '1.0.4',
      },
      systemCharacteristics: {
        systemName: 'Test',
        systemId: 'test',
        description: 'Test',
        securityImpactLevel: {
          confidentiality: 'low',
          integrity: 'low',
          availability: 'low',
        },
        systemType: 'Test',
        authorizationBoundary: 'Test',
      },
      controlBaseline: 'low',
      selectedTools: [],
      controlImplementations: [],
      responsibleParties: [],
    }

    await saveProject(project)
    const loaded = await loadProject('test-1')

    expect(loaded).toBeDefined()
    expect(loaded?.id).toBe('test-1')
    expect(loaded?.metadata.title).toBe('Test Project')
  })

  it('should list all projects', async () => {
    const project1: SSPProject = {
      id: 'test-2',
      metadata: {
        title: 'Project 1',
        lastModified: new Date(),
        version: '1.0.0',
        oscalVersion: '1.0.4',
      },
      systemCharacteristics: {
        systemName: 'Test',
        systemId: 'test',
        description: 'Test',
        securityImpactLevel: {
          confidentiality: 'low',
          integrity: 'low',
          availability: 'low',
        },
        systemType: 'Test',
        authorizationBoundary: 'Test',
      },
      controlBaseline: 'low',
      selectedTools: [],
      controlImplementations: [],
      responsibleParties: [],
    }

    await saveProject(project1)
    const projects = await listProjects()

    expect(projects.length).toBeGreaterThan(0)
  })

  it('should delete project', async () => {
    const project: SSPProject = {
      id: 'test-3',
      metadata: {
        title: 'To Delete',
        lastModified: new Date(),
        version: '1.0.0',
        oscalVersion: '1.0.4',
      },
      systemCharacteristics: {
        systemName: 'Test',
        systemId: 'test',
        description: 'Test',
        securityImpactLevel: {
          confidentiality: 'low',
          integrity: 'low',
          availability: 'low',
        },
        systemType: 'Test',
        authorizationBoundary: 'Test',
      },
      controlBaseline: 'low',
      selectedTools: [],
      controlImplementations: [],
      responsibleParties: [],
    }

    await saveProject(project)
    await deleteProject('test-3')
    const loaded = await loadProject('test-3')

    expect(loaded).toBeNull()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `yarn test src/services/__tests__/indexeddb.test.ts`
Expected: FAIL

**Step 3: Implement IndexedDB service**

Create: `src/services/indexeddb.ts`

```typescript
import { SSPProject } from '../types/ssp'

const DB_NAME = 'SSPGeneratorDB'
const DB_VERSION = 1
const PROJECTS_STORE = 'projects'

let dbInstance: IDBDatabase | null = null

export async function initDB(): Promise<IDBDatabase> {
  if (dbInstance) {
    return dbInstance
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      dbInstance = request.result
      resolve(request.result)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      if (!db.objectStoreNames.contains(PROJECTS_STORE)) {
        const store = db.createObjectStore(PROJECTS_STORE, { keyPath: 'id' })
        store.createIndex('lastModified', 'metadata.lastModified', {
          unique: false,
        })
        store.createIndex('systemName', 'systemCharacteristics.systemName', {
          unique: false,
        })
      }
    }
  })
}

export async function saveProject(project: SSPProject): Promise<void> {
  const db = await initDB()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(PROJECTS_STORE, 'readwrite')
    const store = tx.objectStore(PROJECTS_STORE)

    // Ensure project has an ID
    if (!project.id) {
      project.id = `ssp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    }

    const request = store.put(project)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function loadProject(id: string): Promise<SSPProject | null> {
  const db = await initDB()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(PROJECTS_STORE, 'readonly')
    const store = tx.objectStore(PROJECTS_STORE)
    const request = store.get(id)

    request.onsuccess = () => resolve(request.result || null)
    request.onerror = () => reject(request.error)
  })
}

export async function listProjects(): Promise<SSPProject[]> {
  const db = await initDB()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(PROJECTS_STORE, 'readonly')
    const store = tx.objectStore(PROJECTS_STORE)
    const request = store.getAll()

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function deleteProject(id: string): Promise<void> {
  const db = await initDB()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(PROJECTS_STORE, 'readwrite')
    const store = tx.objectStore(PROJECTS_STORE)
    const request = store.delete(id)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}
```

**Step 4: Run test to verify it passes**

Run: `yarn test src/services/__tests__/indexeddb.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/services/indexeddb.ts
git commit -m "feat: add IndexedDB service for SSP project persistence"
```

---

## Phase 6: Quick Start Wizard Components

### Task 7: Wizard Step 1 - Project Basics Component

**Files:**

- Create: `src/components/wizard/ProjectBasicsStep.tsx`
- Create: `src/components/wizard/__tests__/ProjectBasicsStep.test.tsx`

**Step 1: Write failing test for ProjectBasicsStep**

Create: `src/components/wizard/__tests__/ProjectBasicsStep.test.tsx`

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectBasicsStep } from '../ProjectBasicsStep';

describe('ProjectBasicsStep', () => {
  it('should render all input fields', () => {
    const onNext = jest.fn();

    render(<ProjectBasicsStep onNext={onNext} />);

    expect(screen.getByLabelText(/system name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/system id/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/system type/i)).toBeInTheDocument();
  });

  it('should show validation errors for required fields', async () => {
    const onNext = jest.fn();

    render(<ProjectBasicsStep onNext={onNext} />);

    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    expect(await screen.findByText(/system name is required/i)).toBeInTheDocument();
  });

  it('should call onNext with form data when valid', async () => {
    const onNext = jest.fn();

    render(<ProjectBasicsStep onNext={onNext} />);

    fireEvent.change(screen.getByLabelText(/system name/i), {
      target: { value: 'Test System' },
    });
    fireEvent.change(screen.getByLabelText(/system id/i), {
      target: { value: 'test-001' },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Test description' },
    });

    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    expect(onNext).toHaveBeenCalled();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `yarn test src/components/wizard/__tests__/ProjectBasicsStep.test.tsx`
Expected: FAIL

**Step 3: Implement ProjectBasicsStep component**

Create: `src/components/wizard/ProjectBasicsStep.tsx`

```typescript
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Typography,
} from '@mui/material';
import { SystemCharacteristics, ImpactLevel } from '../../types/ssp';

const schema = yup.object({
  systemName: yup.string().required('System name is required'),
  systemId: yup.string().required('System ID is required'),
  description: yup.string().required('Description is required'),
  systemType: yup.string().required('System type is required'),
  authorizationBoundary: yup.string().required('Authorization boundary is required'),
  confidentiality: yup.string().oneOf(['low', 'moderate', 'high']).required(),
  integrity: yup.string().oneOf(['low', 'moderate', 'high']).required(),
  availability: yup.string().oneOf(['low', 'moderate', 'high']).required(),
});

interface FormData {
  systemName: string;
  systemId: string;
  description: string;
  systemType: string;
  authorizationBoundary: string;
  confidentiality: ImpactLevel;
  integrity: ImpactLevel;
  availability: ImpactLevel;
}

interface ProjectBasicsStepProps {
  onNext: (data: SystemCharacteristics) => void;
  initialData?: SystemCharacteristics;
}

export function ProjectBasicsStep({ onNext, initialData }: ProjectBasicsStepProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      systemName: initialData?.systemName || '',
      systemId: initialData?.systemId || '',
      description: initialData?.description || '',
      systemType: initialData?.systemType || '',
      authorizationBoundary: initialData?.authorizationBoundary || '',
      confidentiality: initialData?.securityImpactLevel.confidentiality || 'moderate',
      integrity: initialData?.securityImpactLevel.integrity || 'moderate',
      availability: initialData?.securityImpactLevel.availability || 'moderate',
    },
  });

  const onSubmit = (data: FormData) => {
    const systemCharacteristics: SystemCharacteristics = {
      systemName: data.systemName,
      systemId: data.systemId,
      description: data.description,
      systemType: data.systemType,
      authorizationBoundary: data.authorizationBoundary,
      securityImpactLevel: {
        confidentiality: data.confidentiality,
        integrity: data.integrity,
        availability: data.availability,
      },
    };
    onNext(systemCharacteristics);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Step 1: Project Basics
      </Typography>

      <Controller
        name="systemName"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="System Name"
            fullWidth
            margin="normal"
            error={!!errors.systemName}
            helperText={errors.systemName?.message}
          />
        )}
      />

      <Controller
        name="systemId"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="System ID"
            fullWidth
            margin="normal"
            error={!!errors.systemId}
            helperText={errors.systemId?.message}
          />
        )}
      />

      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Description"
            fullWidth
            multiline
            rows={4}
            margin="normal"
            error={!!errors.description}
            helperText={errors.description?.message}
          />
        )}
      />

      <Controller
        name="systemType"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth margin="normal" error={!!errors.systemType}>
            <InputLabel>System Type</InputLabel>
            <Select {...field} label="System Type">
              <MenuItem value="SaaS">SaaS</MenuItem>
              <MenuItem value="PaaS">PaaS</MenuItem>
              <MenuItem value="IaaS">IaaS</MenuItem>
              <MenuItem value="On-Premise">On-Premise</MenuItem>
              <MenuItem value="Hybrid">Hybrid</MenuItem>
            </Select>
          </FormControl>
        )}
      />

      <Controller
        name="authorizationBoundary"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Authorization Boundary"
            fullWidth
            margin="normal"
            error={!!errors.authorizationBoundary}
            helperText={errors.authorizationBoundary?.message}
          />
        )}
      />

      <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
        FIPS-199 Security Categorization
      </Typography>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Controller
          name="confidentiality"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel>Confidentiality</InputLabel>
              <Select {...field} label="Confidentiality">
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="moderate">Moderate</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          )}
        />

        <Controller
          name="integrity"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel>Integrity</InputLabel>
              <Select {...field} label="Integrity">
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="moderate">Moderate</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          )}
        />

        <Controller
          name="availability"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel>Availability</InputLabel>
              <Select {...field} label="Availability">
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="moderate">Moderate</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          )}
        />
      </Box>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="submit" variant="contained" color="primary">
          Next
        </Button>
      </Box>
    </Box>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `yarn test src/components/wizard/__tests__/ProjectBasicsStep.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/wizard/
git commit -m "feat: add wizard step 1 - project basics component"
```

---

## RESUME INSTRUCTIONS

This plan contains 7 initial tasks out of approximately 30 total tasks needed to complete the SSP Generator. The remaining tasks include:

- **Task 8-11:** Remaining wizard steps (Baseline Selection, Tool Selection, Control Review, AI Descriptions)
- **Task 12-15:** Advanced mode dashboard components
- **Task 16-18:** AI provider implementations (Anthropic, OpenAI, Ollama)
- **Task 19-22:** Export engines (OSCAL, PDF, DOCX, Markdown)
- **Task 23-25:** Project management (landing page, import/export)
- **Task 26-28:** Integration testing and E2E tests
- **Task 29-30:** Documentation and deployment configuration

**To continue implementation:** Load this plan and use superpowers:subagent-driven-development to execute tasks sequentially with code review between tasks.
