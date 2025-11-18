# SSP Generator - System Design

**Date:** 2025-11-17
**Status:** Approved
**Project:** SSPZ UI - System Security Plan Generator

## Overview

The SSP Generator is a client-side React web application that helps security/compliance officers, DevOps teams, and auditors create NIST 800-53 compliant System Security Plans. It leverages pre-mapped security tool control mappings, AI-assisted description generation, and OSCAL standard formats for interoperability.

## User Personas

**Primary Users:**

- **Security/Compliance Officers** - Create and maintain SSPs for organizational systems
- **DevOps/Engineering Teams** - Generate SSPs as part of system deployment
- **Auditors/Assessors** - Review and validate SSPs

## High-Level Architecture

### Core Architecture Layers

1. **Presentation Layer** - React + Material UI

   - Quick Start wizard (guided 5-step flow)
   - Advanced mode (dashboard with all configuration)
   - Project management (create, edit, import/export OSCAL)
   - Control browser (search and view NIST 800-53 catalog)

2. **Business Logic Layer** - TypeScript services

   - OSCAL file parsing/generation (SSP, catalog, profile)
   - Control mapping engine (match tools to control enhancements)
   - Baseline resolution (Low/Moderate/High control sets)
   - AI orchestration (abstract interface for description generation)

3. **Data Layer** - In-memory state management

   - React Context for active SSP project
   - IndexedDB for draft autosave (cleared on export)
   - Static bundled NIST 800-53 Rev 5 OSCAL catalog
   - Security tool mapping database (9 pre-mapped tools)

4. **Export Engine** - Multi-format document generation
   - OSCAL JSON/XML (primary format)
   - PDF via client-side rendering (jsPDF)
   - DOCX via template filling (docx.js)
   - Markdown for version control workflows

## Data Models

### SSP Project Structure (OSCAL-based)

```typescript
interface SSPProject {
  metadata: {
    title: string // System name
    lastModified: Date
    version: string
    oscalVersion: '1.0.4' // NIST OSCAL version
  }

  systemCharacteristics: {
    systemName: string
    systemId: string
    description: string
    securityImpactLevel: {
      // FIPS-199 categorization
      confidentiality: 'low' | 'moderate' | 'high'
      integrity: 'low' | 'moderate' | 'high'
      availability: 'low' | 'moderate' | 'high'
    }
    systemType: string // e.g., "SaaS", "PaaS", "On-Premise"
    authorizationBoundary: string
    networkArchitecture?: string
  }

  controlBaseline: 'low' | 'moderate' | 'high'

  selectedTools: Array<{
    toolId: string
    toolName: string
    version?: string
    configuration?: Record<string, any>
    customMapping?: boolean
  }>

  controlImplementations: Array<{
    controlId: string // Enhancement level (e.g., "ac-2.1")
    implementationStatus: 'implemented' | 'planned' | 'not-applicable'
    responsibleRole: string
    description: string // AI-generated or user-written
    providingTools: string[]
    customNotes?: string
  }>

  responsibleParties: Array<{
    roleId: string
    title: string
    contacts: Array<{ name: string; email: string }>
  }>

  customFields?: Record<string, any>
}
```

### Security Tool Mapping Schema

```typescript
interface ToolControlMapping {
  toolId: string
  toolName: string
  vendor: string
  category: 'SAST' | 'secrets' | 'SCA' | 'DAST' | 'IaC' | 'container'
  controlMappings: Array<{
    controlId: string // Enhancement level (e.g., "si-10.1")
    coverage: 'full' | 'partial'
    rationale: string
    evidence?: string
  }>
  defaultConfiguration?: Record<string, any>
}
```

### Custom Tool Upload Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["toolId", "toolName", "category", "controlMappings"],
  "properties": {
    "toolId": { "type": "string", "pattern": "^[a-z0-9-]+$" },
    "toolName": { "type": "string" },
    "vendor": { "type": "string" },
    "category": {
      "type": "string",
      "enum": ["SAST", "secrets", "SCA", "DAST", "IaC", "container", "other"]
    },
    "controlMappings": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["controlId", "coverage", "rationale"],
        "properties": {
          "controlId": {
            "type": "string",
            "pattern": "^[a-z]{2}-[0-9]+(\\.[0-9]+)?$"
          },
          "coverage": { "enum": ["full", "partial"] },
          "rationale": { "type": "string" },
          "evidence": { "type": "string" }
        }
      }
    }
  }
}
```

## User Workflows

### Quick Start Wizard (5 Steps)

**Step 1: Project Basics**

- System name, description
- System type selection
- FIPS-199 categorization (C/I/A dropdowns)

**Step 2: Baseline Selection**

- Choose Low/Moderate/High baseline
- Show control count preview
- Option to view control list

**Step 3: Security Tools**

- Pre-mapped tools as cards
- Checkboxes to select tools
- Upload custom tool mapping
- Coverage preview display

**Step 4: Control Review**

- Table view grouped by family
- Status indicators (Covered/Partial/Uncovered)
- Quick filters and bulk actions

**Step 5: Implementation Descriptions**

- List of controls needing descriptions
- Batch AI generation
- Individual generation with inline editing

### Advanced Mode (Dashboard)

Single-page interface with collapsible panels:

- System Info (inline editable)
- Baseline & Tools (with live coverage stats)
- Control Matrix (data grid with filtering)
- Responsible Parties
- Custom Fields
- Export Options

### Project Management

- Landing page: New Project | Import OSCAL | Recent Drafts
- Auto-save to IndexedDB every 30 seconds
- Export clears draft from IndexedDB
- Import validates OSCAL structure

## AI Integration

### Pluggable Provider Interface

```typescript
interface AIProvider {
  name: string;
  type: "cloud" | "local";
  authMethod: "api-key" | "oauth";

  generateControlDescription(request: {
    controlId: string;
    controlText: string;
    controlEnhancements: string[];
    tools: Array<{ name: string; capabilities: string; }>;
    systemContext: {...};
    userContext?: string;
    preferences: GenerationPreferences;
  }): Promise<string>;

  authenticate?(): Promise<void>;
  isConfigured(): boolean;
  validateConfig(): Promise<boolean>;
}

interface GenerationPreferences {
  length: "concise" | "standard" | "detailed";
  technicalLevel: "executive" | "standard" | "technical";
  tone: "formal" | "professional" | "conversational";
  includeEvidence: boolean;
  includeReferences: boolean;
}
```

### Supported Providers

1. **Anthropic Claude (OAuth)** - Claude Pro/Max subscriptions

   - Models: Claude 4.5 Sonnet, Claude 4.5 Haiku, Claude 4.1 Opus

2. **Anthropic Claude (API Key)** - Pay-per-use

3. **OpenAI (API Key)**

   - Models: GPT-5, GPT-5-codex

4. **Ollama (Local)** - Air-gapped environments, no auth

5. **Custom OpenAI-Compatible** - User-provided endpoint

### AI Generation Flow

```
User clicks "Generate Description"
  ↓
Check if AI provider configured
  ↓ (If No) Show provider setup modal
  ↓
Build prompt with full context
  ↓
Call AI provider API
  ↓
Stream response to UI (real-time)
  ↓
User reviews: Accept | Edit | Regenerate | Reject
```

### Prompt Template Structure

```
System: You are a cybersecurity compliance expert creating NIST 800-53
        control implementation descriptions.

User: Generate an implementation description for:

Control: {controlId} - {controlName}
Requirement: {controlText}
Enhancement: {enhancementText}

System Context:
- Name: {systemName}
- Type: {systemType}
- Description: {systemDescription}
- Baseline: {baseline}

This control is addressed by:
- {toolName}: {toolCapabilities}
  Addresses this control by: {mappingRationale}

Style Requirements:
- {lengthGuidance[preferences.length]}
- {technicalGuidance[preferences.technicalLevel]}
- [Include specific tool evidence if enabled]
- [Include NIST references if enabled]

Provide a professional implementation description.
```

## Pre-mapped Security Tools

**Initial tool set with NIST 800-53 mappings (enhancement level):**

1. **Semgrep** (SAST)

   - si-10.1, si-11.1, ac-3.1, sc-28.1, etc.

2. **Gitleaks** (Secrets Detection)

   - ia-5.1, ia-5.2, sc-12.1

3. **Grype** (SCA)

   - si-2.1, si-2.2, ra-5.1

4. **OWASP ZAP** (DAST)

   - sa-11.1, ra-5.1, si-11.1

5. **Snyk** (SCA/Container)

   - si-2.1, si-2.2, ra-5.1, cm-2.1

6. **KICS** (IaC Security)

   - cm-2.1, cm-6.1, sc-7.1

7. **SonarQube** (Code Quality/SAST)

   - sa-11.1, si-10.1, si-11.1

8. **Nessus** (Vulnerability Scanning)

   - ra-5.1, ra-5.2, si-2.1

9. **Trivy** (Container/IaC)
   - si-2.1, cm-2.1, ra-5.1

## Control Coverage Engine

```typescript
function calculateControlCoverage(
  baseline: Baseline,
  selectedTools: Tool[],
  catalog: OSCALCatalog
): ControlCoverageReport {
  const baselineControls = getBaselineControls(baseline, catalog)

  const coverage = baselineControls.map((control) => {
    const mappedTools = selectedTools.filter((tool) =>
      tool.controlMappings.some((m) => m.controlId === control.id)
    )

    const fullCoverage = mappedTools.some((t) =>
      t.controlMappings.find(
        (m) => m.controlId === control.id && m.coverage === 'full'
      )
    )

    return {
      controlId: control.id,
      status:
        mappedTools.length === 0
          ? 'uncovered'
          : fullCoverage
            ? 'covered'
            : 'partial',
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

## Document Export

### OSCAL Export (Primary)

- JSON format (default)
- XML format (optional)
- Full OSCAL SSP structure compliance
- References bundled NIST baselines

### PDF Export

- jsPDF library
- Templates: Standard | NIST Template | Custom
- Sections: Cover, TOC, System Overview, Tools, Control Implementations, Appendices
- Configurable: cover page, TOC, signatures, page size, font

### DOCX Export

- docx.js library
- Editable format for customization
- Same structure as PDF
- Optional custom template support

### Markdown Export

- Version-controllable format
- Developer-friendly
- Structured with headers, tables, lists
- Suitable for git workflows

## Technical Considerations

### Error Handling

- **OSCAL Parsing:** Validate on import, show specific errors, offer partial import
- **AI Generation:** Retry with exponential backoff (3 attempts), fallback to manual entry
- **Catalog Loading:** Bundle locally, attempt remote fetch as enhancement
- **Export Generation:** Validate completeness, warn on missing data

### Performance Optimizations

- Virtual scrolling for control lists (325+ controls)
- Web Workers for OSCAL parsing/generation
- Lazy loading control families
- Debounced autosave (30s)
- Streaming AI responses
- Memoized coverage calculations

### Data Persistence

```typescript
const DB_SCHEMA = {
  name: 'SSPGeneratorDB',
  version: 1,
  stores: {
    projects: { keyPath: 'id', indexes: ['lastModified', 'systemName'] },
    catalogs: { keyPath: 'version', indexes: ['downloadedAt'] },
    toolMappings: { keyPath: 'toolId', indexes: ['uploadedAt'] },
  },
}
```

### Security Considerations

- Client-side only (no backend)
- Encrypted API key storage (Web Crypto API)
- HTTPS required for OAuth
- Input validation on all user data
- XSS prevention (React + CSP)
- No SSP data sent to servers except AI APIs

### Testing Strategy

**Unit Tests:**

- OSCAL parsing/generation
- Coverage calculation engine
- Control mapping resolution
- Export formatters

**Integration Tests:**

- Full SSP lifecycle
- AI provider integrations (mocked)
- Tool selection → coverage updates
- Baseline switching

**E2E Tests (Playwright):**

- Wizard completion
- Advanced mode workflow
- OSCAL import/export
- All export formats
- Custom tool upload

### Deployment

**Static Site Deployment:**

- Netlify (recommended)
- Vercel
- AWS S3 + CloudFront (regulated environments)
- GitHub Pages
- Self-hosted (air-gapped)

**Build Configuration:**

- Bundle OSCAL catalog: ✓
- Bundle tool mappings: ✓
- Source maps: ✗
- Optimize bundle: ✓
- Target: ES2020

**Browser Compatibility:**

- Chrome 90+
- Firefox 88+
- Safari 14+ (IndexedDB polyfills may be needed)
- Edge 90+

## Key Features Summary

✓ **Client-side only** - No backend dependencies
✓ **OSCAL standard** - Full SSP format compliance
✓ **9 pre-mapped tools** - Semgrep, Gitleaks, Grype, OWASP ZAP, Snyk, KICS, SonarQube, Nessus, Trivy
✓ **Enhancement-level mapping** - Granular control coverage
✓ **Custom tool support** - JSON schema for user uploads
✓ **AI-assisted descriptions** - Claude OAuth, API providers, local models
✓ **Multi-format export** - OSCAL, PDF, DOCX, Markdown
✓ **Dual workflow** - Wizard for beginners, dashboard for experts
✓ **Project-based** - Save, edit, regenerate SSPs over time
✓ **Configurable AI** - Length, technical level, tone preferences
✓ **Coverage tracking** - Real-time control coverage statistics

## Next Steps

1. Create detailed implementation plan
2. Set up git worktree for isolated development
3. Begin implementation with TDD approach
4. Create component library and storybook stories
5. Implement core OSCAL parsing/generation
6. Build Quick Start wizard
7. Implement AI integration
8. Build export engines
9. Add comprehensive testing
10. Deploy to static hosting
