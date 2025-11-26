# Story 1.1: Initialize T3 Stack Project

Status: drafted

## Story

As a **developer**,
I want **the project initialized with T3 Stack**,
so that **I have a type-safe full-stack foundation**.

## Acceptance Criteria

1. **Given** no existing project **When** running the T3 initialization commands **Then** a new Next.js 15 project is created with:
   - TypeScript strict mode enabled
   - tRPC v11 configured with React Query
   - Prisma ORM initialized
   - NextAuth.js v5 scaffolded
   - Tailwind CSS v4 configured
   - ESLint + Prettier configured

2. **Given** the project is initialized **When** reviewing the project structure **Then** the directory layout matches the Architecture spec section "Project Structure" (lines 72-186)

3. **Given** the T3 app is created **When** checking configuration **Then** the project uses:
   - Next.js App Router (not Pages Router)
   - Environment validation with t3-env
   - TypeScript 5.x in strict mode

4. **Given** all dependencies are installed **When** running `npm run dev` **Then** the development server starts without errors and is accessible at `http://localhost:3000`

5. **Given** the project is initialized **When** running `npm run lint` and `npm run typecheck` **Then** both commands pass with zero errors

## Tasks / Subtasks

- [ ] Task 1: Create T3 App (AC: #1)
  - [ ] 1.1: Run `npm create t3-app@latest ssp-generator -- --typescript --tailwind --trpc --prisma --nextAuth --appRouter`
  - [ ] 1.2: Navigate to project directory
  - [ ] 1.3: Verify all selected features are enabled in generated config

- [ ] Task 2: Verify Project Structure (AC: #2)
  - [ ] 2.1: Confirm `src/app/` directory structure exists (App Router)
  - [ ] 2.2: Confirm `src/server/api/` directory contains tRPC routers
  - [ ] 2.3: Confirm `prisma/schema.prisma` file exists
  - [ ] 2.4: Confirm `src/env.js` for t3-env validation exists

- [ ] Task 3: Validate TypeScript Configuration (AC: #3)
  - [ ] 3.1: Verify `tsconfig.json` has `strict: true`
  - [ ] 3.2: Verify TypeScript version is 5.x
  - [ ] 3.3: Run `npx tsc --noEmit` to ensure no type errors

- [ ] Task 4: Test Development Server (AC: #4)
  - [ ] 4.1: Run `npm install` to install all dependencies
  - [ ] 4.2: Run `npm run dev`
  - [ ] 4.3: Access `http://localhost:3000` and verify default page loads
  - [ ] 4.4: Verify no console errors in terminal or browser

- [ ] Task 5: Run Code Quality Checks (AC: #5)
  - [ ] 5.1: Run `npm run lint` - verify passes
  - [ ] 5.2: Run `npm run typecheck` (or equivalent) - verify passes
  - [ ] 5.3: Fix any linting or type errors if present

- [ ] Task 6: Commit Initial Project (AC: #1-5)
  - [ ] 6.1: Initialize git repository if not already done
  - [ ] 6.2: Create `.env.example` with placeholder values
  - [ ] 6.3: Stage and commit with message "feat: initialize T3 Stack project foundation"

## Dev Notes

### Architecture Context

This is the **foundation story** for SSP Generator. The T3 Stack provides:

- **Next.js 15**: Server-side rendering, API routes, App Router for modern React patterns
- **tRPC v11**: End-to-end type safety between client and server - critical for CLI integration later
- **Prisma ORM**: Type-safe database queries, migrations, and schema management
- **NextAuth.js v5**: Authentication with database session storage
- **Tailwind CSS v4**: Utility-first styling for shadcn/ui components

The architecture specifies an **API-first design** where both Web UI and CLI consume the same tRPC API layer. This story establishes that foundation.

### Key Technology Versions (from Architecture ADR)

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.x | Framework with App Router |
| TypeScript | 5.x | Type safety |
| tRPC | 11.x | API layer |
| Prisma | 6.x | Database ORM |
| NextAuth.js | 5.x | Authentication |
| Tailwind CSS | 4.x | Styling |

### Project Structure Notes

This story creates the base project structure. Key directories established:
- `src/app/` - Next.js App Router pages
- `src/server/api/` - tRPC routers
- `src/components/` - React components (empty initially)
- `prisma/` - Database schema and migrations
- `public/` - Static assets

Subsequent stories will add:
- `packages/cli/` - CLI tool (Story 1.4)
- `src/components/ui/` - shadcn components (Story 1.2)
- `data/controls/` - NIST control data (Story 3.1)

### Environment Variables Required

From Architecture doc (lines 736-744):
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/ssp_generator"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

Note: `OPENAI_API_KEY` is needed for AI features (Epic 8) but not required for this story.

### References

- [Architecture: Project Initialization](docs/architecture.md#project-initialization) - Lines 18-45
- [Architecture: Project Structure](docs/architecture.md#project-structure) - Lines 72-186
- [Architecture: ADR-001 T3 Stack Selection](docs/architecture.md#adr-001-t3-stack-selection) - Lines 750-762
- [PRD: Proposed Architecture](docs/prd.md#proposed-architecture) - Lines 364-391

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2025-11-26 | SM Agent | Story drafted from epics.md and architecture context |
