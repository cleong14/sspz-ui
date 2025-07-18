---
inclusion: always
---

---

## inclusion: always

# Project Structure & File Organization

## Core Architecture Rules

### Directory Structure (MANDATORY)

```
src/
├── ssp/              # SSP business logic (CORE DOMAIN - highest priority)
├── components/       # Reusable UI components
├── views/            # Page-level components (route handlers)
├── hooks/            # Custom React hooks (business logic)
├── store/            # Context API providers (global state)
├── actions/          # API calls and AWS Amplify operations
├── types/            # TypeScript definitions by domain
├── utils/            # Pure utility functions
├── errors/           # Custom error classes
└── constants.ts      # Application-wide constants
```

### File Placement Rules

**ALWAYS place files in correct directories:**

- SSP generation logic → `src/ssp/`
- Reusable UI components → `src/components/`
- Page components → `src/views/`
- Business logic hooks → `src/hooks/`
- API calls → `src/actions/`
- Type definitions → `src/types/`

**NEVER mix concerns:**

- No business logic in components
- No API calls in hooks (use actions/)
- No UI logic in utils/

## File Naming (ENFORCED)

### React Files

- Components: `PascalCase.tsx` (e.g., `ControlMappingTable.tsx`)
- Hooks: `useCamelCase.ts` (e.g., `useSSPGeneration.ts`)
- Tests: `ComponentName.test.tsx`
- Types: `PascalCase.ts` or match domain (e.g., `ssp.ts`)

### Non-React Files

- Utilities: `camelCase.ts` (e.g., `formatControlData.ts`)
- Constants: `SCREAMING_SNAKE_CASE` in `constants.ts`
- Styles: `kebab-case.scss`

## Import Organization (REQUIRED ORDER)

```typescript
// 1. External libraries
import React from 'react'
import { Button } from '@mui/material'

// 2. Internal modules (use path aliases)
import { useAuth } from '@/hooks/useAuth'
import { generateSSP } from '@/actions/sspActions'

// 3. Types and constants
import type { SystemConfiguration } from '@/types/ssp'
import { API_ENDPOINTS } from '@/constants'
```

### Path Aliases (MANDATORY)

- `@/` → `src/` directory
- Always use `@/` for internal imports
- Never use relative imports beyond parent directory

## Component Architecture

### Component Hierarchy (STRICT)

1. **Views** (`src/views/`) - Route-level pages, compose multiple components
2. **Components** (`src/components/`) - Reusable UI with props interfaces
3. **Layouts** (`src/layouts/`) - Page structure templates

### Props Interface Pattern (REQUIRED)

```typescript
// Always define props interface above component
interface ComponentProps {
  onSubmit: (data: FormData) => void
  initialData?: Partial<FormData>
}

// Use function declarations, not arrow functions
function Component({ onSubmit, initialData }: ComponentProps) {
  // Implementation
}

export default Component
```

## SSP-Specific Structure

### Critical Locations

- **Control Catalogs**: `public/control-catalogs/*.json` (NIST frameworks)
- **SSP Types**: `src/types/ssp.ts` (domain interfaces)
- **SSP Logic**: `src/ssp/` (generation, validation, export)
- **SSP Components**: `src/components/ssp/` (specialized UI)

### Data Flow Pattern

1. User input → Views (forms with validation)
2. Form submission → Actions (API calls)
3. Business logic → Hooks (state management)
4. SSP generation → `src/ssp/` (core domain)
5. Export → Actions (file generation)

## State Management Rules

### Context API Usage (MANDATORY)

- Global state → Context providers in `src/store/`
- Business logic → Custom hooks in `src/hooks/`
- API operations → Actions in `src/actions/`
- NO Redux - use Context API only

### Hook Responsibilities

- Data fetching and caching
- Form state management
- Business logic encapsulation
- Error handling and loading states

## Critical File Locations

### Configuration

- `vite.config.ts` - Build configuration
- `tsconfig.json` - TypeScript settings
- `package.json` - Dependencies (Yarn only)

### Entry Points

- `src/main.tsx` - Application entry
- `src/Root.tsx` - Provider setup
- `src/router/` - Route configuration

### Static Assets

- `public/control-catalogs/` - NIST control data (JSON)
- `public/` - Static files served directly
