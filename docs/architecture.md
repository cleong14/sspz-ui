# SSPZ-UI Architecture

## Executive Summary

SSPZ-UI SSP Generator extends an existing React/TypeScript brownfield codebase to add System Security Plan creation, editing, and export capabilities for FedRAMP compliance. The architecture leverages the existing tech stack (React 18, MUI, Vite, AWS Cognito) while adding specialized components for SSP document management, NIST 800-53 control integration, and compliant document export.

**Key Architectural Decisions:**

- Extend existing Context + useReducer state pattern for SSP document state
- Static NIST 800-53 control catalog bundled as JSON
- Client-side DOCX generation for immediate export without server dependency
- Wizard pattern with URL-based step navigation
- Auth enhancements deferred to end of MVP for rapid feature iteration

---

## Decision Summary

| Category         | Decision               | Version   | Affects Features | Rationale                             |
| ---------------- | ---------------------- | --------- | ---------------- | ------------------------------------- |
| UI Framework     | React                  | 18.3      | All              | Existing stack                        |
| Language         | TypeScript             | 5.8       | All              | Existing stack                        |
| Build Tool       | Vite + SWC             | 5.4       | All              | Existing stack                        |
| Styling          | MUI + Emotion          | 5.x       | All              | Existing stack                        |
| Routing          | React Router DOM       | 6.30      | F2, F3           | Existing stack                        |
| State Management | Context + useReducer   | -         | F2, F3, F4       | Matches existing AuthProvider pattern |
| Forms            | React Hook Form + Yup  | 7.x + 1.x | F3               | Existing stack                        |
| Rich Text Editor | TipTap                 | 2.x       | F3               | Modern, React-native, extensible      |
| DOCX Export      | docx.js                | 8.x       | F5               | Client-side, no server needed         |
| Control Data     | Static JSON            | -         | F4               | NIST OSCAL catalog bundled            |
| Testing          | Jest + Testing Library | 29.x      | All              | Existing stack                        |
| Authentication   | AWS Cognito (Amplify)  | 5.3       | F1               | Existing stack, RBAC deferred         |
| Backend API      | Mock API (MVP)         | -         | F2-F6            | Enables rapid frontend dev            |
| File Storage     | Browser File API (MVP) | -         | F6               | S3 integration deferred               |

---

## Project Structure

```
src/
├── views/
│   ├── Dashboard/                 # Existing
│   ├── SignIn/                    # Existing
│   ├── SignOut/                   # Existing
│   └── SSPGenerator/              # NEW: F2-F5
│       ├── index.tsx              # Feature entry, route definitions
│       ├── Dashboard/             # F2: Project list, status overview
│       │   ├── Dashboard.tsx
│       │   ├── Dashboard.test.tsx
│       │   ├── ProjectCard.tsx
│       │   ├── ProjectCard.test.tsx
│       │   ├── ProjectList.tsx
│       │   └── ProjectList.test.tsx
│       ├── Wizard/                # F3: Step-by-step SSP creation
│       │   ├── WizardLayout.tsx
│       │   ├── WizardLayout.test.tsx
│       │   ├── WizardContext.tsx
│       │   ├── steps/
│       │   │   ├── SystemInfo.tsx
│       │   │   ├── SystemInfo.test.tsx
│       │   │   ├── ControlSelection.tsx
│       │   │   ├── ControlSelection.test.tsx
│       │   │   ├── ControlImplementation.tsx
│       │   │   ├── ControlImplementation.test.tsx
│       │   │   ├── Attachments.tsx
│       │   │   ├── Attachments.test.tsx
│       │   │   ├── Review.tsx
│       │   │   └── Review.test.tsx
│       │   └── components/
│       │       ├── StepNavigation.tsx
│       │       ├── StepNavigation.test.tsx
│       │       ├── ProgressIndicator.tsx
│       │       └── ProgressIndicator.test.tsx
│       ├── Editor/                # Section-by-section editing
│       │   ├── SSPEditor.tsx
│       │   ├── SSPEditor.test.tsx
│       │   ├── SectionEditor.tsx
│       │   ├── SectionEditor.test.tsx
│       │   ├── RichTextEditor.tsx
│       │   └── RichTextEditor.test.tsx
│       ├── Controls/              # F4: NIST 800-53 control library
│       │   ├── ControlLibrary.tsx
│       │   ├── ControlLibrary.test.tsx
│       │   ├── ControlSearch.tsx
│       │   ├── ControlSearch.test.tsx
│       │   ├── ControlDetail.tsx
│       │   ├── ControlDetail.test.tsx
│       │   ├── ControlSelector.tsx
│       │   └── ControlSelector.test.tsx
│       ├── Export/                # F5: Document export
│       │   ├── ExportDialog.tsx
│       │   ├── ExportDialog.test.tsx
│       │   └── exporters/
│       │       ├── docxExporter.ts
│       │       ├── docxExporter.test.ts
│       │       ├── pdfExporter.ts
│       │       └── pdfExporter.test.ts
│       └── types/
│           ├── ssp.ts             # SSP document types
│           ├── control.ts         # NIST control types
│           └── project.ts         # Project types
├── data/
│   └── nist-800-53-rev5.json      # Static control catalog (~2MB)
├── hooks/
│   ├── useAlert.tsx               # Existing
│   ├── useSSPProject.ts           # NEW: SSP project CRUD
│   ├── useSSPProject.test.ts
│   ├── useSSPDocument.ts          # NEW: SSP document state
│   ├── useSSPDocument.test.ts
│   ├── useControls.ts             # NEW: Control library access
│   ├── useControls.test.ts
│   ├── useExport.ts               # NEW: Export functionality
│   └── useExport.test.ts
├── store/
│   ├── auth/                      # Existing
│   └── ssp/                       # NEW: SSP state management
│       ├── SSPContext.tsx
│       ├── SSPReducer.ts
│       ├── SSPReducer.test.ts
│       └── sspActions.ts
├── services/
│   └── ssp/                       # NEW: API/storage abstraction
│       ├── sspApi.ts              # API client (mock initially)
│       ├── sspApi.test.ts
│       ├── sspStorage.ts          # Local storage for dev mode
│       ├── sspStorage.test.ts
│       ├── controlsService.ts     # Control data access
│       └── controlsService.test.ts
├── components/                    # Existing shared components
├── layouts/                       # Existing layouts
├── router/
│   ├── router.tsx                 # Add SSP routes
│   └── constants.ts               # Add SSP route constants
└── theme/                         # Existing theme
```

---

## Feature to Architecture Mapping

| Feature              | Primary Components                               | State                     | Routes                                      |
| -------------------- | ------------------------------------------------ | ------------------------- | ------------------------------------------- |
| F2: Dashboard        | `SSPGenerator/Dashboard/*`                       | SSPContext                | `/app/ssp`                                  |
| F3: Document Creator | `SSPGenerator/Wizard/*`, `SSPGenerator/Editor/*` | SSPContext, WizardContext | `/app/ssp/new`, `/app/ssp/:id/wizard/:step` |
| F4: Control Library  | `SSPGenerator/Controls/*`                        | SSPContext                | `/app/ssp/:id/controls`                     |
| F5: Document Export  | `SSPGenerator/Export/*`                          | SSPContext                | `/app/ssp/:id/export`                       |
| F6: File Attachments | `SSPGenerator/Wizard/steps/Attachments.tsx`      | SSPContext                | `/app/ssp/:id/wizard/attachments`           |
| F1: Auth (deferred)  | Existing `store/auth/*`                          | AuthContext               | Existing routes                             |

---

## Technology Stack Details

### Core Technologies (Existing - Do Not Change)

| Technology       | Version | Purpose                 |
| ---------------- | ------- | ----------------------- |
| React            | 18.3    | UI framework            |
| TypeScript       | 5.8     | Type safety             |
| Vite             | 5.4     | Build tool with SWC     |
| MUI              | 5.x     | Component library       |
| React Router DOM | 6.30    | Routing                 |
| React Hook Form  | 7.x     | Form management         |
| Yup              | 1.x     | Schema validation       |
| AWS Amplify      | 5.3     | Cognito authentication  |
| Jest             | 29.x    | Testing framework       |
| Testing Library  | 14.x    | React testing utilities |

### New Dependencies for SSP Generator

| Package             | Version | Purpose              | License |
| ------------------- | ------- | -------------------- | ------- |
| @tiptap/react       | ^2.1    | Rich text editor     | MIT     |
| @tiptap/starter-kit | ^2.1    | TipTap extensions    | MIT     |
| docx                | ^8.5    | DOCX generation      | MIT     |
| file-saver          | ^2.0    | File download helper | MIT     |
| uuid                | ^9.0    | UUID generation      | MIT     |

### Development Dependencies

| Package           | Purpose          |
| ----------------- | ---------------- |
| @types/uuid       | TypeScript types |
| @types/file-saver | TypeScript types |

---

## Implementation Patterns

### Naming Conventions

| Type                  | Convention                      | Example                               |
| --------------------- | ------------------------------- | ------------------------------------- |
| React Components      | PascalCase                      | `ControlSelector.tsx`                 |
| React Hooks           | camelCase, `use` prefix         | `useSSPProject.ts`                    |
| TypeScript Types      | PascalCase                      | `SSPProject`, `ControlFamily`         |
| TypeScript Interfaces | PascalCase, `I` prefix optional | `SSPDocument` or `ISSPDocument`       |
| Constants             | UPPER_SNAKE_CASE                | `MAX_FILE_SIZE`, `CONTROL_FAMILIES`   |
| Route paths           | kebab-case                      | `/app/ssp`, `/app/ssp/:id/controls`   |
| Route constants       | UPPER_SNAKE_CASE                | `SSP_DASHBOARD`, `SSP_WIZARD`         |
| Test files            | Same name + `.test.tsx`         | `Dashboard.test.tsx`                  |
| Story files           | Same name + `.stories.tsx`      | `Dashboard.stories.tsx`               |
| CSS/SCSS classes      | kebab-case                      | `ssp-wizard-step`                     |
| Event handlers        | `handle` prefix                 | `handleSubmit`, `handleControlSelect` |

### Component Structure

```typescript
// Standard component template
import { FC, useState, useCallback } from 'react';
import { Box, Typography } from '@mui/material';

interface ComponentNameProps {
  /** Description of prop */
  propName: string;
  /** Optional callback */
  onAction?: (value: string) => void;
}

/**
 * Component description
 */
export const ComponentName: FC<ComponentNameProps> = ({
  propName,
  onAction
}) => {
  // 1. Hooks (state, context, custom hooks)
  const [state, setState] = useState<string>('');

  // 2. Derived values
  const derivedValue = propName.toUpperCase();

  // 3. Event handlers
  const handleAction = useCallback(() => {
    onAction?.(state);
  }, [state, onAction]);

  // 4. Render
  return (
    <Box>
      <Typography>{derivedValue}</Typography>
    </Box>
  );
};
```

### State Management Pattern

```typescript
// SSPContext.tsx - Follows existing AuthContext pattern
import { createContext, useContext, useReducer, ReactNode } from 'react';

interface SSPState {
  projects: SSPProject[];
  currentProject: SSPProject | null;
  loading: boolean;
  error: string | null;
}

type SSPAction =
  | { type: 'SET_PROJECTS'; payload: SSPProject[] }
  | { type: 'SET_CURRENT_PROJECT'; payload: SSPProject | null }
  | { type: 'UPDATE_PROJECT'; payload: SSPProject }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: SSPState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
};

function sspReducer(state: SSPState, action: SSPAction): SSPState {
  switch (action.type) {
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload, loading: false };
    case 'SET_CURRENT_PROJECT':
      return { ...state, currentProject: action.payload };
    // ... other cases
    default:
      return state;
  }
}

const SSPContext = createContext<{
  state: SSPState;
  dispatch: React.Dispatch<SSPAction>;
} | null>(null);

export const SSPProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(sspReducer, initialState);
  return (
    <SSPContext.Provider value={{ state, dispatch }}>
      {children}
    </SSPContext.Provider>
  );
};

export const useSSPContext = () => {
  const context = useContext(SSPContext);
  if (!context) {
    throw new Error('useSSPContext must be used within SSPProvider');
  }
  return context;
};
```

### API Response Pattern

```typescript
// Standard API response wrapper
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
  meta?: {
    page?: number
    pageSize?: number
    total?: number
  }
}

// Service layer pattern
export const sspApi = {
  async getProjects(): Promise<ApiResponse<SSPProject[]>> {
    try {
      // For MVP: use local storage
      const projects = sspStorage.getProjects()
      return { success: true, data: projects }
    } catch (error) {
      return {
        success: false,
        error: { code: 'FETCH_ERROR', message: 'Failed to load projects' },
      }
    }
  },

  async createProject(
    data: CreateProjectDTO
  ): Promise<ApiResponse<SSPProject>> {
    try {
      const project = sspStorage.createProject(data)
      return { success: true, data: project }
    } catch (error) {
      return {
        success: false,
        error: { code: 'CREATE_ERROR', message: 'Failed to create project' },
      }
    }
  },
}
```

### Error Handling Pattern

```typescript
// Component-level error handling with useAlert
const handleSave = async () => {
  try {
    const result = await sspApi.updateProject(project.id, formData)
    if (!result.success) {
      showAlert({
        type: 'error',
        message: result.error?.message || 'Failed to save',
      })
      return
    }
    showAlert({ type: 'success', message: 'Project saved' })
    dispatch({ type: 'UPDATE_PROJECT', payload: result.data! })
  } catch (error) {
    showAlert({ type: 'error', message: 'An unexpected error occurred' })
    console.error('Save failed:', error)
  }
}
```

### Form Pattern

```typescript
// React Hook Form with Yup validation
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object({
  name: yup.string()
    .required('Project name is required')
    .min(3, 'Name must be at least 3 characters'),
  description: yup.string()
    .max(500, 'Description must be less than 500 characters'),
  baseline: yup.string()
    .oneOf(['low', 'moderate', 'high'], 'Invalid baseline')
    .required('FedRAMP baseline is required'),
});

type FormData = yup.InferType<typeof schema>;

const ProjectForm: FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    // Handle form submission
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
};
```

---

## Data Architecture

### Core Types

```typescript
// src/views/SSPGenerator/types/project.ts
export type UUID = string
export type ISODateString = string

export type SSPStatus = 'draft' | 'in-review' | 'approved' | 'archived'
export type FedRAMPBaseline = 'low' | 'moderate' | 'high'

export interface SSPProject {
  id: UUID
  name: string
  description: string
  baseline: FedRAMPBaseline
  status: SSPStatus
  createdAt: ISODateString
  updatedAt: ISODateString
  createdBy: UUID // User ID (for future RBAC)
}

// src/views/SSPGenerator/types/ssp.ts
export interface SSPDocument {
  id: UUID
  projectId: UUID
  version: number
  sections: SSPSection[]
  controls: SelectedControl[]
  attachments: SSPAttachment[]
  createdAt: ISODateString
  updatedAt: ISODateString
}

export interface SSPSection {
  id: string // e.g., '1', '1.1', '2'
  title: string
  content: string // Rich text HTML
  status: 'empty' | 'draft' | 'complete'
}

export interface SelectedControl {
  controlId: string // e.g., 'AC-1'
  status: ControlStatus
  implementation: string // Rich text
  responsibleRole: string
  implementationStatus: 'planned' | 'partial' | 'implemented'
}

export type ControlStatus =
  | 'not-started'
  | 'in-progress'
  | 'implemented'
  | 'not-applicable'

export interface SSPAttachment {
  id: UUID
  filename: string
  mimeType: string
  size: number
  controlId?: string // Optional link to control
  sectionId?: string // Optional link to section
  uploadedAt: ISODateString
  // For MVP: store as base64 or Blob URL
  // For production: S3 key
  data: string
}

// src/views/SSPGenerator/types/control.ts
export interface NISTControl {
  id: string // e.g., 'AC-1'
  family: ControlFamily
  title: string
  description: string
  supplementalGuidance?: string
  relatedControls?: string[]
  baselines: {
    low: boolean
    moderate: boolean
    high: boolean
  }
  parameters?: ControlParameter[]
}

export interface ControlFamily {
  id: string // e.g., 'AC'
  name: string // e.g., 'Access Control'
  description: string
}

export interface ControlParameter {
  id: string
  label: string
  description: string
  odp?: string // Organization-defined parameter
}
```

### Local Storage Schema (MVP)

```typescript
// Keys in localStorage
const STORAGE_KEYS = {
  PROJECTS: 'ssp_projects',
  DOCUMENTS: 'ssp_documents',
  ATTACHMENTS: 'ssp_attachments',
} as const

// Storage format
interface StorageSchema {
  ssp_projects: SSPProject[]
  ssp_documents: Record<UUID, SSPDocument>
  ssp_attachments: Record<UUID, SSPAttachment>
}
```

---

## Security Architecture

### Current (MVP - Auth Deferred)

- **Authentication:** Existing AWS Cognito login (basic)
- **Authorization:** None (single-user mode for MVP preview)
- **Data Storage:** Browser localStorage (no server)
- **Data Protection:** Client-side only, no PII transmitted

### Future (Post-MVP)

- **RBAC:** Role-based access control for Compliance Officer, Security Engineer, System Owner, Auditor
- **API Security:** JWT tokens, API Gateway authorization
- **Data Encryption:** S3 server-side encryption, TLS in transit
- **Audit Logging:** All actions logged with user ID, timestamp, action type
- **Session Management:** Token refresh, idle timeout
- **FedRAMP Controls:** Implement applicable NIST 800-53 controls for the application itself

---

## Performance Considerations

### Initial Load

- **Target:** <2s initial page load
- **Strategy:**
  - Vite code splitting by route
  - Lazy load SSPGenerator routes
  - Defer NIST control JSON load until needed

### NIST Control Data (~2MB)

- Load control catalog lazily on first access to Control Library
- Index controls client-side for fast search
- Consider WebWorker for search if performance issues

### Document Export

- **Target:** <30s for full SSP export
- Generate DOCX in WebWorker to avoid UI blocking
- Show progress indicator during generation

### Rich Text Editor

- Debounce content saves (300ms)
- Virtualize long documents if needed

---

## Development Environment

### Prerequisites

- Node.js 20.x
- Yarn 4.5.0
- Git

### Setup Commands

```bash
# Clone and install
git clone <repo>
cd sspz-ui
yarn install

# Start development server
yarn dev

# Run tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run linting
yarn lint

# Fix lint issues
yarn fix

# Start Storybook
yarn storybook

# Build for production
yarn build
```

### Environment Variables

```env
# Existing
VITE_AWS_REGION=us-east-1
VITE_USER_POOL_ID=xxx
VITE_USER_POOL_CLIENT_ID=xxx
VITE_COGNITO_DOMAIN=xxx
VITE_COGNITO_REDIRECT_SIGN_IN=http://localhost:3000/auth/login
VITE_COGNITO_REDIRECT_SIGN_OUT=http://localhost:3000/auth/logout
VITE_IDP_ENABLED=false

# New for SSP Generator (future)
# VITE_API_ENDPOINT=https://api.example.com
# VITE_S3_BUCKET=ssp-attachments
```

### Dev Mode (Auth Bypass)

For rapid iteration without auth blocking, the app can run in dev mode:

```typescript
// In development, bypass auth check
const isDev = import.meta.env.DEV
const isAuthenticated = isDev || authState.isAuthenticated
```

---

## Architecture Decision Records (ADRs)

### ADR-001: Extend Existing State Pattern

**Context:** Need state management for SSP documents.

**Decision:** Use React Context + useReducer, matching existing AuthProvider pattern.

**Rationale:**

- Consistency with existing codebase
- Sufficient for SSP document complexity
- No additional dependencies (Redux/Zustand)
- Team already familiar with pattern

**Consequences:**

- May need refactoring if state becomes very complex
- No devtools like Redux DevTools

---

### ADR-002: Client-Side DOCX Generation

**Context:** Need to export SSP documents to DOCX format.

**Decision:** Use docx.js library for client-side generation.

**Rationale:**

- No server dependency enables offline export
- Immediate feedback (no upload/download wait)
- Reduces infrastructure complexity for MVP
- FedRAMP templates can be implemented in JS

**Consequences:**

- Large documents may be slow on low-end devices
- Need WebWorker for non-blocking generation
- PDF generation will need separate solution (html2pdf or similar)

---

### ADR-003: Static NIST Control Catalog

**Context:** Need access to 800+ NIST 800-53 controls.

**Decision:** Bundle controls as static JSON from NIST OSCAL catalog.

**Rationale:**

- Controls rarely change (annual updates)
- No API dependency for core functionality
- Enables offline access
- Fast search with client-side indexing

**Consequences:**

- ~2MB added to bundle (lazy loaded)
- Need update process when NIST releases new revision
- May need WebWorker for search performance

---

### ADR-004: Defer Authentication Enhancements

**Context:** Auth infrastructure exists but RBAC is not implemented.

**Decision:** Defer RBAC and auth enhancements to end of MVP.

**Rationale:**

- Enables rapid feature iteration without auth blocking
- Core SSP functionality can be previewed immediately
- Existing Cognito login sufficient for demo
- Auth complexity shouldn't slow feature development

**Consequences:**

- Multi-user features delayed
- No role-based access in MVP
- Need dev mode bypass for testing

---

### ADR-005: TipTap for Rich Text Editing

**Context:** Need rich text editor for SSP content sections.

**Decision:** Use TipTap (ProseMirror-based) editor.

**Rationale:**

- Modern, well-maintained library
- First-class React support
- Extensible for custom features
- Supports collaborative editing (future)
- Good accessibility
- MIT licensed

**Consequences:**

- Learning curve for customization
- Additional bundle size
- Need to handle HTML sanitization

---

## Next Steps

1. **Create Epics and Stories** - Break down features into implementable stories
2. **Set up SSPGenerator feature folder** - Create directory structure
3. **Implement Dashboard (F2)** - First visible feature
4. **Add NIST control data** - Download and integrate catalog
5. **Implement Wizard (F3)** - Core SSP creation flow

---

_Generated by BMAD Decision Architecture Workflow v1.0_
_Date: 2025-11-25_
_For: USER_
