# Agent Guidelines for sspz-ui

This document outlines essential commands and code style guidelines for agents working on this repository.

## Commands

- **Build**: `yarn run build`
- **Lint**: `yarn run lint`
- **Fix Lint/Format**: `yarn run fix`
- **Run All Tests**: `yarn run test`
- **Run Single Test**: `NODE_ENV=test jest <path_to_test_file>` (e.g., `NODE_ENV=test jest src/actions/loginUser.test.tsx`)

## Code Style

- **Formatting**: Enforced by Prettier (`.prettierrc.cjs`). Key rules:
  - No semicolons (`semi: false`)
  - Single quotes for strings (`singleQuote: true`)
  - 2-space indentation (`tabWidth: 2`)
  - Trailing commas for ES5 (`trailingComma: 'es5'`)
  - Arrow function parentheses always (`arrowParens: 'always'`)
  - Print width: 80 characters
- **Linting**: Enforced by ESLint (`.eslintrc.cjs`). Key rules:
  - TypeScript: Warns on `any`, allows `ts-comment`, warns on unused vars (except `_` prefixed).
  - React: Specific JSX indentation and prop formatting rules.
  - Hooks: Enforces rules of hooks and warns on exhaustive deps.
  - General: No `debugger` statements.
- **Imports**: No specific ordering rules, but follow standard ES module imports.
- **Naming Conventions**: Follow standard JavaScript/TypeScript conventions (camelCase for variables/functions, PascalCase for components/types).
- **Error Handling**: No explicit rules, follow idiomatic TypeScript/React patterns.
