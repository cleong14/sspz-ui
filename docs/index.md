# SSPZ-UI Project Documentation

> Generated: 2025-11-25 | BMad Method - Brownfield Documentation

## Project Overview

**Name:** sspz-ui
**Type:** Single Page Application (SPA)
**Framework:** React 18 with TypeScript
**Build Tool:** Vite 5
**Package Manager:** Yarn 4.5.0
**Node Version:** 20

### Description

A React-based web application boilerplate with AWS Cognito authentication, Material UI components, and comprehensive testing infrastructure. Originally created by Aquia, Inc.

---

## Architecture Summary

### Tech Stack

| Layer          | Technology                |
| -------------- | ------------------------- |
| UI Framework   | React 18.3                |
| Language       | TypeScript 5.8            |
| Build          | Vite 5.4 with SWC         |
| Styling        | MUI 5 + Emotion + SCSS    |
| Routing        | React Router DOM 6.30     |
| Authentication | AWS Amplify 5.3 (Cognito) |
| Forms          | React Hook Form + Yup     |
| Testing        | Jest 29 + Testing Library |
| Component Dev  | Storybook 7.6             |

### Application Architecture

```
src/
├── main.tsx              # Entry point - IIFE initialization
├── Root.tsx              # Provider composition root
├── router/               # React Router configuration
│   ├── router.tsx        # Route definitions
│   ├── authLoader.ts     # Auth route loader
│   └── constants.ts      # Route constants
├── store/                # State management
│   └── auth/             # Auth context (useReducer pattern)
├── views/                # Page components
│   ├── Dashboard/        # Protected dashboard
│   ├── SignIn/           # Authentication
│   └── SignOut/          # Logout handling
├── components/           # Reusable UI components
│   ├── crud/             # CRUD operations
│   ├── forms/            # Form components
│   ├── mui/              # MUI wrappers
│   └── MultiDropzone/    # File upload
├── hooks/                # Custom React hooks
├── layouts/              # Page layouts
├── actions/              # Auth actions
├── utils/                # Utilities
├── theme/                # MUI theme config
├── locales/              # i18n strings
└── sass/                 # Global styles
```

---

## Key Patterns

### 1. Authentication Pattern

- **Provider:** `AuthProvider` wraps app with auth context
- **State:** `useReducer` pattern with `AuthReducer`
- **Integration:** AWS Cognito via `aws-amplify`
- **Protection:** Route-level auth via `authLoader`

```typescript
// Provider hierarchy (Root.tsx)
ThemeProvider → AuthProvider → AlertProvider → DialogProvider → Outlet
```

### 2. Routing Pattern

- **Type:** Browser Router (createBrowserRouter)
- **Structure:** Nested routes with layouts
- **Auth Routes:** `/auth/login`, `/auth/logout`
- **Protected Routes:** `/app/*` (requires auth)
- **Loaders:** Data fetching via route loaders

### 3. Component Pattern

- **Structure:** Component + Test + Stories (where applicable)
- **Naming:** PascalCase for components
- **Exports:** Default exports for components
- **Testing:** Co-located test files (\*.test.tsx)

### 4. State Management

- **Auth:** Context + useReducer (not Redux)
- **Alerts:** Custom `useAlert` hook with context
- **Dialogs:** Custom `useDialog` hook with context
- **Data:** React Router loaders + local state

---

## Configuration

### Environment Variables (Vite)

```
VITE_AWS_REGION          # AWS region
VITE_CF_DOMAIN           # CloudFront domain
VITE_COGNITO_DOMAIN      # Cognito auth domain
VITE_COGNITO_REDIRECT_SIGN_IN
VITE_COGNITO_REDIRECT_SIGN_OUT
VITE_USER_POOL_CLIENT_ID
VITE_USER_POOL_ID
VITE_IDP_ENABLED         # Feature flag
```

### Path Aliases

- `@/` → `/src/`
- `npm:/` → `/node_modules/`

---

## Development Commands

| Command           | Description             |
| ----------------- | ----------------------- |
| `yarn dev`        | Start dev server        |
| `yarn build`      | Production build        |
| `yarn test`       | Run tests with coverage |
| `yarn test:watch` | Watch mode tests        |
| `yarn lint`       | Run linters             |
| `yarn fix`        | Auto-fix lint issues    |
| `yarn storybook`  | Start Storybook         |

---

## Component Inventory

### Core Components

| Component       | Location    | Purpose             |
| --------------- | ----------- | ------------------- |
| `AlertMessage`  | components/ | Alert notifications |
| `AppBar`        | components/ | Top navigation bar  |
| `AppDrawer`     | components/ | Side navigation     |
| `ErrorBoundary` | components/ | Error handling      |
| `Header`        | components/ | Page header         |
| `Footer`        | components/ | Page footer         |
| `UserAvatar`    | components/ | User profile avatar |

### Form Components

| Component          | Location          | Purpose            |
| ------------------ | ----------------- | ------------------ |
| `InputFormControl` | components/forms/ | Form input wrapper |
| `SubmitButton`     | components/forms/ | Form submit button |

### MUI Wrappers

| Component                 | Location        | Purpose              |
| ------------------------- | --------------- | -------------------- |
| `Avatar`                  | components/mui/ | Custom avatar        |
| `BackdropLoadingCircular` | components/mui/ | Loading overlay      |
| `CardContent`             | components/mui/ | Card content wrapper |
| `Chip`                    | components/mui/ | Custom chip          |
| `LinearLoadingBar`        | components/mui/ | Linear progress      |

### Feature Components

| Component       | Location                  | Purpose                    |
| --------------- | ------------------------- | -------------------------- |
| `MultiDropzone` | components/MultiDropzone/ | File upload with drag-drop |
| `CreateForm`    | components/crud/          | Generic create form        |
| `List`          | components/crud/          | Generic list display       |

---

## Custom Hooks

| Hook                 | Location | Purpose                  |
| -------------------- | -------- | ------------------------ |
| `useAlert`           | hooks/   | Alert state management   |
| `useBgColor`         | hooks/   | Background color utility |
| `useCopyToClipboard` | hooks/   | Clipboard operations     |
| `useData`            | hooks/   | Data fetching            |
| `useDialog`          | hooks/   | Dialog state management  |
| `useFetch`           | hooks/   | Fetch wrapper            |

---

## Testing Infrastructure

- **Framework:** Jest 29 with jsdom
- **Libraries:** Testing Library (React, DOM, User Event)
- **Coverage:** Enabled by default
- **Mocks:** Located in `config/__mocks__/`
- **Setup:** `config/jest/setupTests.ts`

### Test File Pattern

```
ComponentName.tsx      # Component
ComponentName.test.tsx # Tests (co-located)
```

---

## Quality Tools

| Tool        | Purpose            | Config       |
| ----------- | ------------------ | ------------ |
| ESLint      | JS/TS linting      | .eslintrc    |
| Prettier    | Code formatting    | .prettierrc  |
| Husky       | Git hooks          | .husky/      |
| Commitlint  | Commit messages    | package.json |
| lint-staged | Pre-commit linting | package.json |

---

## Dependencies of Note

### Production

- `aws-amplify` - AWS Cognito authentication
- `@mui/material` - UI component library
- `react-hook-form` - Form management
- `yup` - Schema validation
- `react-dropzone` - File uploads
- `lodash` - Utilities

### Development

- `@swc/core` - Fast TypeScript compilation
- `storybook` - Component development
- `semantic-release` - Automated releases

---

## Known TODOs in Codebase

1. **Session Refresh** (`AuthProvider.tsx:57-65`)
   - Implement refresh session logic (currently commented out)

---

## File Statistics

- **Source Files:** ~100+ TypeScript/TSX files
- **Test Files:** Co-located with components
- **Storybook Stories:** Multiple components documented

---

## Related Documentation

- [Worklog](./worklog.md) - Session activity log
- [BMM Workflow Status](./bmm-workflow-status.yaml) - Planning progress

---

_Documentation generated by BMad Method document-project workflow_
