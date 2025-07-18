---
inclusion: always
---

# SSP Generation Application - Development Guidelines

## Application Overview

**sspz-ui** generates System Security Plans (SSPs) for government compliance with automated NIST control mapping and multi-format exports.

**Core User Flow**: System Details → Tool Selection → Control Mapping → SSP Generation → Export (HTML/PDF/CSV/JSON)

## Technology Stack & Requirements

### Core Technologies

- **React 18.3.1** + **TypeScript 5.8.3** (strict mode)
- **Vite 5.4.19** with SWC for fast compilation
- **Material-UI 5.17.1** with Emotion styling
- **React Hook Form 7.54.2** + **Yup** validation (MANDATORY for all forms)
- **AWS Amplify 5.3.27** for authentication (Cognito) and persistence
- **Context API** for state management (no Redux)

### Package Management

- **MANDATORY**: Use Yarn 4.5.0 only (never npm)
- **Node.js 20** required
- Path aliases: `@/` → `src/`, `npm:/` → `node_modules/`

## Code Standards

### Component Pattern (Required)

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

### Naming Conventions

- **Components**: `PascalCase.tsx` (e.g., `ControlMappingTable.tsx`)
- **Hooks**: `useCamelCase.ts` (e.g., `useSSPGeneration.ts`)
- **Types**: `PascalCase` interfaces (e.g., `SystemConfiguration`)
- **Constants**: `SCREAMING_SNAKE_CASE` in `src/constants.ts`
- **Utilities**: `camelCase.ts`, **Styles**: `kebab-case.scss`

### Import Order (Enforced)

```typescript
// 1. External libraries
import React from 'react'
import { Button } from '@mui/material'

// 2. Internal hooks/utils
import { useAuth } from '@/hooks/useAuth'

// 3. Types and constants
import type { SystemConfiguration } from '@/types/ssp'
import { API_ENDPOINTS } from '@/constants'
```

## Architecture Patterns

### Project Structure

```
src/
├── ssp/              # SSP business logic (core domain)
├── components/       # Reusable UI components
├── views/            # Page-level components
├── hooks/            # Custom React hooks
├── store/            # Context API providers
├── actions/          # API calls and mutations
├── types/            # TypeScript definitions
├── utils/            # Utility functions
├── errors/           # Custom error classes
└── constants.ts      # Application constants
```

### Required Patterns

#### Forms (Mandatory)

- **ALWAYS** use React Hook Form + Yup validation
- Material-UI components for form fields
- Validate ALL inputs before SSP generation

#### State Management

- Context providers in `src/store/` for global state
- Custom hooks in `src/hooks/` for business logic
- AWS Amplify calls in `src/actions/` for API operations

#### Authentication

- AWS Cognito required for all routes
- Use `useAuth` hook for auth state
- Handle auth failures with error boundaries

#### Error Handling

- Material-UI Snackbar for user notifications
- Custom error classes in `src/errors/`
- Error boundaries around SSP workflows
- Loading states for async operations

## Performance & Security

### Critical Optimizations

- `React.memo` for expensive SSP components
- Lazy load control catalog data (large JSON files)
- Vite code splitting for SSP modules
- Loading states for generation workflows

### Security (NIST Compliance)

- Validate file formats/sizes before download
- Sanitize data in SSP templates
- Proper MIME types for exports
- Follow government security standards

## Code Style (Prettier)

- No semicolons
- Single quotes
- 2-space indentation
- Trailing commas
- 100 character line length

## Testing Requirements

- > 80% coverage for `src/ssp/` directory
- Mock AWS Amplify in all tests
- Test complete SSP generation workflow
- React Testing Library for user interactions
- Test error scenarios and edge cases

## SSP-Specific Guidelines

- Control catalogs in `public/control-catalogs/` (static JSON)
- SSP types in `src/types/ssp.ts`
- Export formats: HTML, PDF, CSV, JSON
- NIST control mapping accuracy is critical

## Essential Commands

```bash
yarn dev          # Development server
yarn build        # Production build
yarn test         # All tests with coverage
yarn lint         # Lint all files
yarn fix          # Fix linting/formatting
```
