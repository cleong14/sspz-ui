# Story 1.1: Extend Template with SSP Dependencies

Status: drafted

## Story

As a **developer**,
I want **the template extended with SSP-specific dependencies**,
so that **I have all libraries needed for SSP features**.

## Acceptance Criteria

1. **Given** existing template-vite-react infrastructure **When** installing additional dependencies **Then** the following are added:
   - `uuid`, `date-fns` for data utilities
   - `file-saver`, `jszip` for export features
   - `ajv`, `ajv-formats` for OSCAL schema validation
   - `docx`, `pdfmake` for document generation
   - `react-hook-form`, `zod` for form handling (if not present)

2. TypeScript type definitions are properly installed for all new dependencies (`@types/file-saver`, `@types/uuid`, etc.)

3. All existing template tests still pass after dependency installation

4. The development server starts without errors after dependency installation

5. A basic smoke test confirms each library can be imported without error

## Tasks / Subtasks

- [ ] Task 1: Install data utility dependencies (AC: 1)
  - [ ] Run `yarn add uuid date-fns`
  - [ ] Verify TypeScript types (`@types/uuid` - date-fns includes types)

- [ ] Task 2: Install export feature dependencies (AC: 1)
  - [ ] Run `yarn add file-saver jszip`
  - [ ] Install TypeScript types `yarn add -D @types/file-saver`

- [ ] Task 3: Install OSCAL validation dependencies (AC: 1)
  - [ ] Run `yarn add ajv ajv-formats`
  - [ ] Verify types are included

- [ ] Task 4: Install document generation dependencies (AC: 1)
  - [ ] Run `yarn add docx pdfmake`
  - [ ] Install TypeScript types if needed `yarn add -D @types/pdfmake`

- [ ] Task 5: Install form handling dependencies (AC: 1)
  - [ ] Check if react-hook-form and zod are already present
  - [ ] If not present, run `yarn add react-hook-form zod @hookform/resolvers`

- [ ] Task 6: Verify TypeScript configuration (AC: 2)
  - [ ] Ensure all type definitions resolve correctly
  - [ ] Run `yarn tsc --noEmit` to verify no type errors

- [ ] Task 7: Run existing tests (AC: 3)
  - [ ] Run `yarn test` to verify all existing tests pass
  - [ ] Document any test failures and fixes

- [ ] Task 8: Verify development server (AC: 4)
  - [ ] Run `yarn dev` and verify no console errors
  - [ ] Check browser devtools for any import warnings

- [ ] Task 9: Create import smoke test (AC: 5)
  - [ ] Create `src/lib/__tests__/dependencies.test.ts`
  - [ ] Add basic import tests for each new dependency
  - [ ] Run test suite to verify all imports work

## Dev Notes

### Relevant Architecture Patterns and Constraints

- **Package Manager:** The template uses Yarn 4.x (modern Yarn with PnP or node_modules)
- **TypeScript:** Template is configured in strict mode - all dependencies must have proper type definitions
- **Module System:** ESM modules, Vite handles bundling
- **Template Stack:** Vite + React 18 + TypeScript 5.x + Material-UI 5.x

### Source Tree Components to Touch

- `package.json` - Add new dependencies
- `yarn.lock` - Updated by yarn
- `src/lib/__tests__/dependencies.test.ts` - New smoke test file (optional verification)

### Testing Standards Summary

- Jest + React Testing Library (template configured)
- Run existing tests with `yarn test`
- TypeScript compilation check with `yarn tsc --noEmit`

### Project Structure Notes

- Dependencies are managed at root level in `package.json`
- Type definitions should auto-resolve from `node_modules/@types/`
- No changes needed to `tsconfig.json` for standard npm packages

### References

- [Source: docs/architecture.md#Project-Initialization] - Lists exact dependencies to install
- [Source: docs/prd.md#Technical-Context] - Confirms OSCAL validation requirements
- [Source: docs/epics.md#Story-1.1] - Original story definition

## Changelog

| Change | Date | Version | Author |
|--------|------|---------|--------|
| Story drafted from epics.md | 2025-11-26 | 1.0 | SM Agent |

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

<!-- Will be filled by dev agent -->

### Debug Log References

<!-- Will be filled by dev agent during implementation -->

### Completion Notes List

<!-- Will be filled by dev agent after completion -->

### File List

<!-- Will be filled by dev agent: NEW, MODIFIED, DELETED files -->
