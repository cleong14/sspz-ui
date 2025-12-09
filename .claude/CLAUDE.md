# SSPZ-UI Project Context

React component library and UI toolkit built with Vite, TypeScript, and Material UI.

## Quick Commands

```bash
yarn dev          # Start dev server (Vite)
yarn build        # Production build (TypeScript check + Vite)
yarn test         # Run tests with coverage
yarn lint         # Check formatting (Prettier)
yarn fix          # Auto-fix formatting
yarn storybook    # Component development (port 6006)
```

## Tech Stack

- **Framework**: React 18 + Vite 5
- **Language**: TypeScript 5
- **UI Library**: MUI (Material UI) 5 + Emotion
- **Design System**: USWDS (US Web Design System)
- **Testing**: Jest + React Testing Library
- **Component Dev**: Storybook 7
- **Auth**: AWS Amplify
- **Forms**: React Hook Form + Yup validation

## Project Structure

```
src/              # Source code
├── components/   # React components
├── hooks/        # Custom React hooks
├── utils/        # Utility functions
scripts/          # Build/automation scripts
docs/             # Documentation
```

## Development Workflow

### Package Manager
Use **yarn 4.5.0** exclusively (npm is blocked via engines).

### Testing
```bash
yarn test              # Run with coverage (50% workers)
yarn test:ci           # CI mode (100% workers)
```
Tests use Jest with jsdom environment and React Testing Library.

### Linting & Formatting
- Prettier for all formatting (no ESLint for style)
- Pre-commit hooks via Husky + lint-staged
- Run `yarn fix` to auto-format all files

### Commits
Follow [Conventional Commits](https://conventionalcommits.org):
- `feat:` new features
- `fix:` bug fixes
- `docs:` documentation
- `chore:` maintenance

Commits are validated by commitlint.

## CI/CD

- GitHub Actions for CI
- semantic-release for automated versioning
- Releases publish to GitHub (no npm publish)

## Key Conventions

1. **Components**: Use functional components with TypeScript
2. **Styling**: Emotion (CSS-in-JS) via MUI's sx prop or styled()
3. **State**: React hooks, React Hook Form for forms
4. **Testing**: Co-locate tests with components (`*.test.tsx`)

## Common Tasks

| Task | Command |
|------|---------|
| Start development | `yarn dev` |
| Run single test file | `yarn test -- path/to/file` |
| Update snapshots | `yarn test -- -u` |
| Build for production | `yarn build` |
| Preview production build | `yarn preview` |
| Clean dist folder | `yarn clean` |
