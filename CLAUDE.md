# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

SSPZ-UI is a System Security Plan (SSP) generator built with React, Vite, TypeScript, and Material-UI. The application helps users create security documentation by mapping security controls (NIST SP 800-53) to security tools and baselines.

## System Requirements

- Node.js v20
- Yarn v4.5.0 (enforced via packageManager field)
- GitLeaks (for pre-commit hooks)

Use `nvm` or `n` to manage Node versions. Enable corepack for Yarn: `corepack enable yarn`

## Common Commands

### Development

```bash
yarn dev              # Start dev server (alias: yarn start)
sh ./scripts/post-install.sh  # Create .env.local from .env.example (run once)
```

### Testing

```bash
yarn test             # Run all tests with coverage
yarn test:watch       # Run tests in watch mode (only changed files)
yarn test:precommit   # Run tests for only changed files (used in pre-commit)
yarn test:ci          # Run all tests (used in CI)
```

### Building

```bash
yarn build            # TypeScript compile + Vite production build
yarn preview          # Preview production build
yarn clean            # Remove dist directory
```

### Linting

```bash
yarn lint             # Run prettier checks on JS and other files
yarn lint:js          # Check TypeScript/JavaScript files
yarn lint:other       # Check JSON, MD, YAML files
yarn fix              # Auto-fix all files
yarn fix:js           # Auto-fix TypeScript/JavaScript files
yarn fix:other        # Auto-fix JSON, MD, YAML files
```

### Storybook

```bash
yarn storybook        # Start Storybook dev server (alias: yarn sb)
yarn build-storybook  # Build Storybook static files
```

## Architecture

### Routing & Layout

- **React Router v6** with data loaders for route-level data fetching
- `src/router/router.tsx` defines all routes with nested layouts
- Two main layouts:
  - `AppLayout`: Authenticated app with drawer navigation (`/app/*`)
  - `BlankLayout`: Public pages (sign in/out)
- Route loaders (`authLoader`, `dashboardLoader`, `sspGeneratorLoader`) fetch data before rendering
- `authLoader` at `/app` route protects all child routes

### State Management

- **Context + Reducer pattern** for authentication state
- `AuthProvider` (`src/store/auth/AuthProvider.tsx`) wraps the app via `RootProvider`
- `AuthStateContext` and `AuthDispatchContext` separate state from dispatch
- `useAuthState()` and `useAuthDispatch()` hooks access context
- Authentication uses AWS Amplify Cognito

### Authentication Flow

1. `configureCognito` loader initializes AWS Amplify on root route
2. `AuthProvider` checks session on mount and pathname changes
3. Protected routes use `authLoader` which verifies auth and redirects to `/auth/login` if unauthenticated
4. Login actions dispatch to `AuthReducer` with `LOGIN_SUCCESS`/`LOGIN_FAILURE`
5. JWT token stored in auth state for API requests

### Key Features

#### SSP Generator (`/app/ssp-generator`)

- Loads NIST 800-53 Rev. 5 controls from `/src/data/nist/nist-800-53-rev5.json`
- Filters controls by:
  - Security baseline (Low, Moderate, High)
  - Security tools (Semgrep, Gitleaks, KICS, Trivy, Bandit, Snyk, Checkov, TFSec)
- Each control (`NistControl`) includes:
  - ID, family, title, priority, description
  - Baselines mapping (privacy, security.low/moderate/high)
  - Tools array (security tools that map to this control)
- Security tools defined in `src/utils/securityTools.ts`

### Testing

- **Jest** with **SWC** for fast TypeScript compilation
- **Testing Library** for React component tests
- Test files colocated with source: `*.test.ts(x)`
- Path alias `@/` maps to `src/`
- Setup file: `config/jest/setupTests.ts`
- CSS/file mocks configured in `jest.config.cjs`

### Path Aliases

- `@/` → `src/` (configured in `vite.config.ts`, `tsconfig.json`, `jest.config.cjs`)
- Use absolute imports: `import Foo from '@/components/Foo'`

### Styling

- **Material-UI v5** with Emotion for styling
- Custom theme in `src/theme/theme.ts`
- SCSS support via Sass preprocessor
- USWDS (US Web Design System) included

### Environment Variables

- All environment variables prefixed with `VITE_` (Vite requirement)
- `.env.example` contains template for AWS/Cognito config
- Run `sh ./scripts/post-install.sh` to create `.env.local`

### Git Workflow

- Uses **Conventional Commits** (enforced by commitlint)
- **Husky** for pre-commit hooks
- **lint-staged** runs formatters on staged files
- Main branch: `main`
- Development branch: `dev`
- Semantic release configured for automated versioning

## Data Files

- NIST controls: `/src/data/nist/nist-800-53-rev5.json`
- Security tools mapping: `src/utils/securityTools.ts`
- Update script: `scripts/update-nist-controls.js`

## Important Notes

- Do NOT commit `.env.local` (contains secrets)
- Always use `yarn` not `npm` (enforced in package.json engines)
- JS files in `src/` are treated as JSX (configured in Vite)
- Strict TypeScript mode enabled
- Pre-commit hooks run tests only on changed files for speed
