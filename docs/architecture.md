# SSP Generator - Architecture Decision Document

## Executive Summary

SSP Generator is a **dual-interface compliance tool** (Web UI + CLI) that generates NIST 800-53 and FedRAMP-compliant System Security Plans (SSPs) with AI-assisted control implementation suggestions.

**Key Architectural Decisions:**
- **Vite + React** SPA built on existing template infrastructure
- **AWS Cognito** for authentication (template already configured)
- **Material-UI (MUI)** for accessible, government-appropriate UI components
- **JSON files** for local data persistence (portable, Git-friendly)
- **Go CLI** (separate repository) with direct file access for automation

---

## Project Initialization

**The project builds upon the existing template-vite-react infrastructure.**

The template already provides:
- Vite + React + TypeScript configuration
- AWS Cognito authentication integration
- Material-UI with comprehensive theming
- Custom API request pattern with JWT
- React Context + useReducer state management
- React Router with protected routes
- Jest + React Testing Library setup
- Storybook for component documentation

**Additional setup required:**
```bash
# Install additional dependencies for SSP features
yarn add uuid date-fns file-saver jszip

# For OSCAL processing
yarn add ajv ajv-formats

# For document export
yarn add docx pdfmake

# Development dependencies
yarn add -D @types/file-saver @types/uuid
```

---

## Decision Summary

| Category | Decision | Version | Affects FRs | Rationale |
|----------|----------|---------|-------------|-----------|
| **Framework** | Vite + React | 5.x + 18.x | All | Template infrastructure, fast builds, SPA |
| **Language** | TypeScript | 5.x | All | Type safety, IDE support |
| **Authentication** | AWS Cognito | latest | FR1-3 | Template configured, enterprise-ready |
| **UI Components** | Material-UI | 5.x | All Web UI | Template configured, 40+ themed components |
| **Styling** | MUI + SCSS | - | All Web UI | Template configured, consistent theming |
| **State Management** | React Context | - | All | Template pattern, simple and effective |
| **Data Storage** | JSON Files | - | FR4-8, FR21-26 | Local-first, Git-friendly, portable |
| **API Pattern** | Custom apiRequest | - | All | Template configured, JWT-based |
| **CLI Framework** | Go | 1.21+ | FR32-38 | Separate repo, cross-platform binaries |
| **OSCAL Processing** | Custom + AJV | - | FR27-31, FR39-41 | JSON Schema validation |
| **AI Service** | OpenAI API | GPT-4 | FR46-49 | Implementation suggestions |
| **Validation** | Zod + AJV | 3.x | All | Form + OSCAL schema validation |
| **Testing** | Jest + RTL | latest | NFR requirements | Template configured |

---

## Project Structure

```
sspz-ui/                              # Web UI Repository
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Lint, test, type-check
│       └── deploy.yml                # Production deployment
├── public/
│   ├── icon.svg
│   └── data/                         # Static control catalogs
│       ├── nist-800-53-rev5.json     # NIST control catalog
│       └── fedramp-baselines.json    # FedRAMP baseline mappings
├── src/
│   ├── actions/                      # Auth actions (template)
│   ├── assets/                       # Icons and images
│   ├── components/
│   │   ├── mui/                      # MUI wrappers (template)
│   │   ├── forms/                    # Form components (template)
│   │   ├── crud/                     # CRUD components (template)
│   │   ├── ssp/                      # SSP-specific components
│   │   │   ├── SspWizard.tsx         # Multi-step creation wizard
│   │   │   ├── SspCard.tsx           # SSP list item card
│   │   │   └── SspProgressRing.tsx   # Control completion indicator
│   │   ├── controls/                 # Control catalog components
│   │   │   ├── ControlCard.tsx       # Control display card
│   │   │   ├── ControlStatusBadge.tsx
│   │   │   └── ImplementationStatementCard.tsx
│   │   └── tools/                    # Tool library components
│   │       ├── ToolLibraryCard.tsx
│   │       └── ApprovalActionBar.tsx
│   ├── contexts/                     # React Contexts
│   │   ├── SspContext.tsx            # SSP project state
│   │   └── ControlsContext.tsx       # Control catalog state
│   ├── hooks/                        # Custom hooks (template + new)
│   │   ├── useAlert.tsx              # (template)
│   │   ├── useDialog.tsx             # (template)
│   │   ├── useSsp.tsx                # SSP operations
│   │   ├── useControls.tsx           # Control catalog operations
│   │   └── useLocalStorage.tsx       # JSON file persistence
│   ├── layouts/
│   │   ├── AppLayout/                # Main dashboard layout (template)
│   │   └── BlankLayout.tsx           # Auth pages layout (template)
│   ├── lib/
│   │   ├── oscal/
│   │   │   ├── parser.ts             # OSCAL import/parsing
│   │   │   ├── generator.ts          # OSCAL export generation
│   │   │   ├── validator.ts          # Schema validation
│   │   │   └── types.ts              # OSCAL type definitions
│   │   ├── ai/
│   │   │   ├── suggestions.ts        # AI implementation suggestions
│   │   │   └── confidence.ts         # Confidence scoring
│   │   ├── export/
│   │   │   ├── word.ts               # Word document generation
│   │   │   └── pdf.ts                # PDF generation
│   │   └── storage/
│   │       ├── ssp-storage.ts        # SSP JSON file operations
│   │       └── types.ts              # Storage type definitions
│   ├── router/
│   │   ├── router.tsx                # Route configuration (extend template)
│   │   ├── constants.ts              # Route constants
│   │   └── authLoader.ts             # Auth loader (template)
│   ├── store/
│   │   └── auth/                     # Auth context (template)
│   ├── theme/
│   │   └── theme.ts                  # MUI theme (extend template)
│   ├── types/
│   │   ├── ssp.ts                    # SSP type definitions
│   │   ├── control.ts                # Control type definitions
│   │   ├── oscal.ts                  # OSCAL type definitions
│   │   └── tool.ts                   # Tool library types
│   ├── utils/                        # Utility functions (template + new)
│   ├── views/
│   │   ├── Dashboard/                # SSP dashboard
│   │   ├── Projects/
│   │   │   ├── ProjectList.tsx       # SSP list view
│   │   │   ├── ProjectNew.tsx        # Create new SSP
│   │   │   └── ProjectDetail.tsx     # SSP detail/wizard
│   │   ├── Controls/
│   │   │   └── ControlCatalog.tsx    # Control browser
│   │   ├── Tools/
│   │   │   └── ToolLibrary.tsx       # Tool selection
│   │   ├── Export/
│   │   │   └── ExportPage.tsx        # Export options
│   │   ├── SignIn/                   # (template)
│   │   └── SignOut/                  # (template)
│   ├── main.tsx                      # Entry point (template)
│   └── Root.tsx                      # Provider wrapper (template)
├── tests/
│   ├── unit/                         # Jest unit tests
│   └── e2e/                          # Playwright E2E tests
├── .env.example
├── .eslintrc.cjs                     # (template)
├── .prettierrc.cjs                   # (template)
├── jest.config.cjs                   # (template)
├── package.json
├── tsconfig.json                     # (template)
└── vite.config.ts                    # (template)
```

**Go CLI Repository (Separate):**
```
ssp-cli/                              # Go CLI Repository
├── cmd/
│   └── ssp/
│       └── main.go                   # CLI entry point
├── internal/
│   ├── commands/
│   │   ├── init.go                   # ssp init
│   │   ├── control.go                # ssp control [implement|review]
│   │   ├── tool.go                   # ssp tool [add|remove]
│   │   ├── validate.go               # ssp validate
│   │   ├── export.go                 # ssp export
│   │   └── import.go                 # ssp import
│   ├── storage/
│   │   ├── ssp.go                    # SSP file operations
│   │   └── config.go                 # CLI configuration
│   ├── oscal/
│   │   ├── parser.go                 # OSCAL parsing
│   │   ├── generator.go              # OSCAL generation
│   │   └── validator.go              # Schema validation
│   └── types/
│       └── types.go                  # Shared type definitions
├── pkg/
│   └── catalog/
│       └── nist.go                   # Embedded control catalog
├── go.mod
├── go.sum
├── Makefile                          # Build targets for all platforms
└── README.md
```

---

## FR Category to Architecture Mapping

| FR Category | Web Components | Data Storage | CLI Commands |
|-------------|---------------|--------------|--------------|
| **User Account (FR1-3)** | SignIn, SignOut views | AWS Cognito | N/A (separate auth) |
| **Project Management (FR4-8)** | Projects/* views, SspCard | `~/.ssp-gen/*.json` | `ssp init`, `ssp list` |
| **Control Catalog (FR9-13)** | Controls/* views | `public/data/*.json` | `ssp control list` |
| **SSP System Info (FR14-18)** | SspWizard Steps 1-3 | SSP JSON files | `ssp init --name` |
| **Control Implementation (FR19-26)** | SspWizard Step 4, ImplementationCards | SSP JSON files | `ssp control implement` |
| **Export & Output (FR27-31)** | Export/* views | Generated files | `ssp export` |
| **CLI Tool (FR32-38)** | N/A | Same JSON files | All `ssp` commands |
| **Import (FR39-41)** | Import dialog | SSP JSON files | `ssp import` |
| **FedRAMP Support (FR42-45)** | Baseline selector | FedRAMP data JSON | `ssp init --baseline` |
| **AI-Assisted (FR46-49)** | ImplementationCards with confidence | Feedback JSON | `ssp suggest` |

---

## Technology Stack Details

### Core Technologies

**Vite + React (Template Infrastructure)**
- Vite 5.x for fast development and optimized production builds
- React 18.x with functional components and hooks
- TypeScript 5.x in strict mode
- React Router 6.x for client-side routing

**AWS Cognito (Template Infrastructure)**
- User pool for authentication
- JWT tokens for session management
- Configured via AWS Amplify SDK
- Already integrated in template

**Material-UI (Template Infrastructure)**
- Comprehensive component library (40+ themed components)
- Custom theme with Federal Blue primary color
- Responsive design built-in
- WCAG 2.1 AA compliance

**JSON File Storage (New)**
- SSP data stored in local JSON files
- Default location: `~/.ssp-gen/projects/`
- Git-friendly format for version control
- Shared between Web UI and Go CLI

### Integration Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Machine                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐               ┌─────────────────┐         │
│  │     Web UI      │               │     Go CLI      │         │
│  │  (Vite+React)   │               │   (ssp binary)  │         │
│  └────────┬────────┘               └────────┬────────┘         │
│           │                                 │                   │
│           │  Read/Write                     │  Read/Write       │
│           │                                 │                   │
│           └─────────────┬───────────────────┘                   │
│                         │                                       │
│                  ┌──────▼──────┐                               │
│                  │  JSON Files │                               │
│                  │  (~/.ssp-gen)│                               │
│                  └──────┬──────┘                               │
│                         │                                       │
│    ┌────────────────────┼────────────────────┐                 │
│    │                    │                    │                 │
│ ┌──▼───┐          ┌─────▼─────┐        ┌────▼────┐            │
│ │ SSP  │          │  Control  │        │  Tools  │            │
│ │ Data │          │  Catalog  │        │  Data   │            │
│ └──────┘          └───────────┘        └─────────┘            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                         │
                         │ Optional (AI Suggestions)
                         ▼
              ┌─────────────────┐
              │   OpenAI API    │
              │  (cloud service)│
              └─────────────────┘
```

---

## Data Architecture

### JSON File Schema

**SSP Project File Structure (`~/.ssp-gen/projects/{project-id}.json`):**

```typescript
interface SspProject {
  id: string;                    // UUID
  name: string;                  // System name
  description?: string;
  baseline: Baseline;            // LOW | MODERATE | HIGH | FEDRAMP_*
  status: SspStatus;             // DRAFT | IN_PROGRESS | REVIEW | COMPLETE
  createdAt: string;             // ISO 8601
  updatedAt: string;             // ISO 8601

  systemInfo: {
    systemName: string;
    systemId?: string;
    systemType: string;
    description: string;
    boundary: {
      description: string;
      components: SystemComponent[];
      externalConnections: ExternalConnection[];
    };
    categorization: {
      confidentiality: ImpactLevel;
      integrity: ImpactLevel;
      availability: ImpactLevel;
    };
    environment: {
      deploymentModel: string;
      cloudProvider?: string;
      operatingSystems: string[];
      technologies: string[];
      dataTypes: string[];
    };
    contacts: {
      systemOwner: Contact;
      authorizingOfficial: Contact;
      securityPoc: Contact;
      technicalPoc: Contact;
    };
  };

  implementations: ControlImplementation[];
  selectedTools: string[];       // Tool IDs
  aiSuggestionFeedback: AiFeedback[];
}

interface ControlImplementation {
  controlId: string;             // e.g., "AC-1", "AC-2(1)"
  status: ImplementationStatus;  // IMPLEMENTED | PARTIAL | PLANNED | NOT_APPLICABLE | NOT_STARTED
  statement?: string;            // Implementation statement text
  aiGenerated: boolean;
  aiConfidence?: string;         // HIGH | MEDIUM | LOW
  parameters?: Record<string, string>;
  inherited?: {
    systemId: string;
    systemName: string;
  };
  evidence?: Evidence[];
  createdAt: string;
  updatedAt: string;
}

type Baseline =
  | 'LOW'
  | 'MODERATE'
  | 'HIGH'
  | 'FEDRAMP_LOW'
  | 'FEDRAMP_MODERATE'
  | 'FEDRAMP_HIGH'
  | 'FEDRAMP_LI_SAAS';

type SspStatus = 'DRAFT' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETE';

type ImplementationStatus =
  | 'NOT_STARTED'
  | 'IMPLEMENTED'
  | 'PARTIALLY_IMPLEMENTED'
  | 'PLANNED'
  | 'NOT_APPLICABLE';

type ImpactLevel = 'LOW' | 'MODERATE' | 'HIGH';
```

**Control Catalog (`public/data/nist-800-53-rev5.json`):**

```typescript
interface ControlCatalog {
  version: string;               // "5.1.1"
  lastUpdated: string;           // ISO 8601
  families: ControlFamily[];
}

interface ControlFamily {
  id: string;                    // "AC", "AU", etc.
  name: string;                  // "Access Control"
  controls: Control[];
}

interface Control {
  id: string;                    // "AC-1"
  title: string;
  description: string;
  guidance?: string;
  baselines: Baseline[];         // Which baselines include this control
  parameters?: ControlParameter[];
  enhancements?: Control[];      // Nested enhancements like AC-2(1)
}
```

**Tool Library (`public/data/tools.json`):**

```typescript
interface ToolLibrary {
  version: string;
  tools: Tool[];
}

interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string;
  logoUrl?: string;
  category: ToolCategory;
  mappings: ToolControlMapping[];
}

interface ToolControlMapping {
  controlId: string;
  implementationTemplate: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  source: 'vendor-docs' | 'community' | 'generated';
}

type ToolCategory =
  | 'vulnerability-scanner'
  | 'sast'
  | 'secrets-detection'
  | 'container-security'
  | 'iac-scanner'
  | 'siem'
  | 'identity'
  | 'endpoint';
```

### File Storage Locations

| Data Type | Web UI Location | CLI Location | Sync Method |
|-----------|-----------------|--------------|-------------|
| SSP Projects | `~/.ssp-gen/projects/*.json` | `~/.ssp-gen/projects/*.json` | Direct file access |
| Control Catalog | `public/data/nist-*.json` | Embedded in binary | Manual update |
| Tool Library | `public/data/tools.json` | Embedded in binary | Manual update |
| User Preferences | `localStorage` | `~/.ssp-gen/config.json` | Separate |
| Export Output | Download folder | Specified path | N/A |

---

## Novel Pattern Designs

### Tool-to-Control Auto-Mapping Pattern

**Purpose:** Enable rapid SSP completion by pre-filling control implementations based on selected security tools.

**Flow:**
```
1. User opens Tool Library in Web UI
2. User selects tools in use (e.g., Trivy, Semgrep, Gitleaks)
3. System loads ToolControlMapping data from tools.json
4. For each mapping:
   - Shows control ID and title
   - Shows pre-written implementation statement
   - Shows confidence level (High/Medium/Low)
   - Shows source (vendor-docs, community, generated)
5. User actions per mapping:
   - [Approve] → Adds to SSP JSON with aiGenerated=true
   - [Modify] → Opens editor to customize, then saves
   - [Reject] → Skips mapping, logs rejection for feedback
6. SSP JSON updated with new implementations
```

**CLI Equivalent:**
```bash
# Select tools and auto-apply high-confidence mappings
ssp tool add trivy semgrep gitleaks --auto-approve=high

# Interactive review of medium/low confidence mappings
ssp control review --pending
```

---

## Implementation Patterns

### Naming Patterns

| Category | Convention | Example |
|----------|------------|---------|
| **JSON file names** | kebab-case | `my-system-ssp.json` |
| **JSON fields** | camelCase | `systemInfo`, `createdAt` |
| **React components** | PascalCase | `SspCard`, `ControlStatusBadge` |
| **Component files** | PascalCase | `SspCard.tsx`, `ControlStatusBadge.tsx` |
| **Hooks** | camelCase with `use` | `useSsp`, `useControls` |
| **Utility functions** | camelCase | `formatDate`, `generateOscal` |
| **Constants** | SCREAMING_SNAKE | `CONTROL_FAMILIES`, `BASELINE_LEVELS` |
| **CSS classes** | MUI sx prop or SCSS | `sx={{ p: 2 }}` |
| **Go packages** | lowercase | `storage`, `oscal`, `commands` |
| **Go files** | snake_case | `ssp_storage.go` |

### State Management Pattern

Using React Context (template pattern):

```typescript
// contexts/SspContext.tsx
interface SspState {
  projects: SspProject[];
  currentProject: SspProject | null;
  isLoading: boolean;
  error: Error | null;
}

type SspAction =
  | { type: 'LOAD_PROJECTS'; payload: SspProject[] }
  | { type: 'SET_CURRENT'; payload: SspProject }
  | { type: 'CREATE_PROJECT'; payload: SspProject }
  | { type: 'UPDATE_PROJECT'; payload: SspProject }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'SET_ERROR'; payload: Error };

// Hook usage
const { projects, currentProject, createProject, updateProject } = useSsp();
```

### File Operations Pattern

```typescript
// lib/storage/ssp-storage.ts
import { SspProject } from '@/types/ssp';

const SSP_DIR = '~/.ssp-gen/projects';

export const sspStorage = {
  async list(): Promise<SspProject[]> {
    // Read all JSON files from projects directory
  },

  async get(id: string): Promise<SspProject | null> {
    // Read specific project file
  },

  async save(project: SspProject): Promise<void> {
    // Write project to JSON file
    project.updatedAt = new Date().toISOString();
  },

  async delete(id: string): Promise<void> {
    // Remove project file
  },

  async export(id: string, format: ExportFormat): Promise<Blob> {
    // Generate export file
  }
};
```

### Error Handling Strategy

```typescript
// Consistent error handling in hooks
function useSsp() {
  const { showAlert } = useAlert();

  const createProject = async (data: CreateSspInput) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const project = await sspStorage.create(data);
      dispatch({ type: 'CREATE_PROJECT', payload: project });
      showAlert('SSP created successfully', 'success');
      return project;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error });
      showAlert('Failed to create SSP', 'error');
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return { createProject, ... };
}
```

---

## Security Architecture

### Authentication (AWS Cognito - Template)

- **User Pool:** Configured in AWS Cognito
- **JWT Tokens:** Access tokens for API calls
- **Session:** Stored in localStorage via AWS Amplify
- **Configuration:** Via environment variables

```typescript
// Template already provides:
// - configureCognito() in utils/configureCognito.ts
// - getJWT() in utils/getJWT.ts
// - AuthProvider in store/auth/
// - Protected route loader in router/authLoader.ts
```

### Data Protection

- **At rest:** JSON files stored locally (user's machine)
- **In transit:** HTTPS for AI service calls only
- **Secrets:** Environment variables for API keys
- **No server storage:** All SSP data remains local

### Go CLI Authentication

The Go CLI operates independently of the web auth:
- **Local only:** No authentication required for local file access
- **Optional API key:** For AI suggestions feature
- **Config file:** `~/.ssp-gen/config.json` stores preferences

```json
{
  "openaiApiKey": "sk-...",
  "defaultBaseline": "MODERATE",
  "autoApproveConfidence": "HIGH"
}
```

---

## Performance Considerations

### Frontend (Template Optimizations)

- **Vite** for fast HMR and optimized builds
- **Code splitting** via React.lazy() and Suspense
- **MUI tree-shaking** for minimal bundle
- **Local storage** for instant data access

### JSON File Performance

- **Lazy loading:** Load project list metadata first, full data on demand
- **Caching:** In-memory cache for control catalog (static data)
- **Debounced saves:** Auto-save with 500ms debounce
- **Incremental updates:** Only write changed fields when possible

### NFR Targets

| Metric | Target | Strategy |
|--------|--------|----------|
| Page load | <2s | Vite optimization, code splitting |
| Control search | <500ms | In-memory filtering, memoization |
| SSP export | <30s | Streaming generation, web workers |
| CLI commands | <5s | Go binary, embedded data |
| File save | <100ms | JSON.stringify, async write |

---

## Deployment Architecture

### Web UI Deployment

```
┌─────────────────────────────────────────────────────┐
│              Static Hosting (Vercel/Netlify)        │
│  ┌─────────────────────────────────────────────┐   │
│  │           Vite Build Output                  │   │
│  │  - index.html                               │   │
│  │  - assets/*.js (code-split chunks)          │   │
│  │  - assets/*.css                             │   │
│  │  - data/*.json (control catalogs)           │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
                          │
                          │ User's Browser
                          ▼
┌─────────────────────────────────────────────────────┐
│                   User Machine                       │
│  ┌─────────────────────────────────────────────┐   │
│  │        Local File System                     │   │
│  │  ~/.ssp-gen/projects/*.json                 │   │
│  │  ~/.ssp-gen/config.json                     │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### Go CLI Distribution

- **GitHub Releases:** Pre-built binaries for all platforms
- **Homebrew:** `brew install ssp-gen/tap/ssp` (macOS/Linux)
- **Scoop:** Windows package manager
- **Direct download:** From GitHub releases page

**Build targets:**
```makefile
# Makefile in ssp-cli repo
build-all:
	GOOS=darwin GOARCH=amd64 go build -o dist/ssp-darwin-amd64 ./cmd/ssp
	GOOS=darwin GOARCH=arm64 go build -o dist/ssp-darwin-arm64 ./cmd/ssp
	GOOS=linux GOARCH=amd64 go build -o dist/ssp-linux-amd64 ./cmd/ssp
	GOOS=linux GOARCH=arm64 go build -o dist/ssp-linux-arm64 ./cmd/ssp
	GOOS=windows GOARCH=amd64 go build -o dist/ssp-windows-amd64.exe ./cmd/ssp
```

---

## Development Environment

### Prerequisites

- Node.js 20.x LTS
- Yarn 4.x (template configured)
- Go 1.21+ (for CLI development)
- Git 2.x

### Web UI Setup Commands

```bash
# Clone repository
git clone <repository-url>
cd sspz-ui

# Install dependencies
yarn install

# Setup environment
cp .env.example .env.development.local
# Edit .env with your AWS Cognito values

# Start development server
yarn dev

# Run tests
yarn test

# Build for production
yarn build
```

### Go CLI Setup Commands

```bash
# Clone CLI repository
git clone <cli-repository-url>
cd ssp-cli

# Install dependencies
go mod download

# Run locally
go run ./cmd/ssp --help

# Build binary
go build -o ssp ./cmd/ssp

# Run tests
go test ./...
```

### Environment Variables

```bash
# .env.example (Web UI)
VITE_AWS_REGION=us-east-1
VITE_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxx
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_OPENAI_API_KEY=sk-...  # Optional, for AI suggestions
```

---

## Architecture Decision Records (ADRs)

### ADR-001: Vite + React over Next.js

**Context:** Need to choose between migrating to Next.js or keeping existing Vite template.

**Decision:** Keep Vite + React (SPA) from existing template.

**Rationale:**
- Template infrastructure already configured and tested
- Simpler architecture (no server-side complexity)
- Faster development builds with Vite
- Local-first data model doesn't need SSR
- Easier deployment (static hosting)

**Consequences:** No SSR/SSG benefits; all routing is client-side.

### ADR-002: JSON Files over PostgreSQL

**Context:** Need persistent storage for SSP data.

**Decision:** Use local JSON files instead of database.

**Rationale:**
- Local-first architecture (data stays on user's machine)
- Git-friendly for version control of SSPs
- No server infrastructure to maintain
- Portable (users can share files directly)
- Go CLI can access same files directly

**Consequences:** No multi-user collaboration (future feature); no server-side search.

### ADR-003: Go CLI over Node.js CLI

**Context:** CLI needs to share data access with Web UI.

**Decision:** Build CLI in Go with direct file access.

**Rationale:**
- Single binary distribution (no runtime dependencies)
- Cross-platform builds from single codebase
- Fast startup time
- Direct JSON file access matches Web UI
- Strong typing with Go's type system

**Consequences:** Separate codebase; control catalog embedded in binary needs updates.

### ADR-004: AWS Cognito over NextAuth

**Context:** Need authentication for Web UI.

**Decision:** Keep AWS Cognito from existing template.

**Rationale:**
- Already configured in template
- Enterprise-ready authentication
- Supports MFA, federation, etc.
- Consistent with AWS-native deployments

**Consequences:** AWS account required; vendor lock-in to Cognito.

### ADR-005: Material-UI over shadcn/ui

**Context:** Need accessible UI component library.

**Decision:** Keep Material-UI from existing template.

**Rationale:**
- 40+ components already themed
- Comprehensive design system
- Template provides custom Federal Blue theme
- Strong accessibility support
- Well-documented, mature library

**Consequences:** Larger bundle size than shadcn/ui; different component API.

---

_Generated by BMAD Architecture Workflow v2.0_
_Date: 2025-11-26_
_Updated: Adapted for Vite + MUI + JSON + Go CLI architecture_
