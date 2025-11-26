# SSP Generator - Architecture Decision Document

## Executive Summary

SSP Generator is a **dual-interface compliance tool** (Web UI + CLI) built on an **API-first architecture** using the T3 Stack. The system generates NIST 800-53 and FedRAMP-compliant System Security Plans (SSPs) with AI-assisted control implementation suggestions.

**Key Architectural Decisions:**
- **Monorepo** structure with shared types between web app and CLI
- **T3 Stack** (Next.js 15 + tRPC + Prisma + NextAuth) for full-stack type safety
- **PostgreSQL** for persistent storage of SSP data
- **shadcn/ui** for accessible, government-appropriate UI components
- **Commander.js** CLI consuming the same tRPC API layer

---

## Project Initialization

**First implementation story should execute:**

```bash
# 1. Create T3 App with all features
npm create t3-app@latest ssp-generator -- --typescript --tailwind --trpc --prisma --nextAuth --appRouter

# 2. Navigate to project
cd ssp-generator

# 3. Initialize shadcn/ui
npx shadcn@latest init

# 4. Add core shadcn components (per UX spec)
npx shadcn@latest add button card input form table tabs dialog sheet toast badge progress command accordion

# 5. Create CLI workspace (monorepo setup)
mkdir -p packages/cli
cd packages/cli && npm init -y
```

**Starter provides these decisions:**
- Next.js 15 with App Router
- TypeScript 5.x (strict mode)
- Tailwind CSS v4
- tRPC v11 (typesafe API)
- Prisma ORM (database)
- NextAuth.js v5 (authentication)
- ESLint + Prettier configuration

---

## Decision Summary

| Category | Decision | Version | Affects FRs | Rationale |
|----------|----------|---------|-------------|-----------|
| **Framework** | Next.js 15 | 15.x | All | SSR/SSG, App Router, API routes |
| **Language** | TypeScript | 5.x | All | Type safety, agent consistency |
| **API Layer** | tRPC | 11.x | FR32-38, All | End-to-end type safety |
| **Database** | PostgreSQL | 16.x | FR4-8, FR21-26 | ACID, JSON support, scalability |
| **ORM** | Prisma | 6.x | FR4-8, FR21-26 | Type-safe queries, migrations |
| **Auth** | NextAuth.js | 5.x | FR1-3 | Flexible providers, session management |
| **UI Components** | shadcn/ui | latest | All Web UI | Accessibility, customization |
| **Styling** | Tailwind CSS | 4.x | All Web UI | Utility-first, design system |
| **CLI Framework** | Commander.js | 12.x | FR32-38 | Industry standard, TypeScript support |
| **OSCAL Processing** | Custom + NIST libs | - | FR27-31, FR39-41 | OSCAL format compliance |
| **AI Service** | OpenAI API | GPT-4 | FR46-49 | Implementation suggestions |
| **Validation** | Zod | 3.x | All | Schema validation, type inference |
| **Testing** | Vitest + Playwright | latest | NFR requirements | Unit + E2E coverage |
| **Deployment** | Vercel + Railway | - | All | Edge functions, managed DB |

---

## Project Structure

```
ssp-generator/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Lint, test, type-check
│       └── deploy.yml                # Production deployment
├── packages/
│   └── cli/                          # CLI Tool Package
│       ├── src/
│       │   ├── commands/
│       │   │   ├── init.ts           # ssp init
│       │   │   ├── control.ts        # ssp control [implement|review]
│       │   │   ├── tool.ts           # ssp tool [add|remove]
│       │   │   ├── validate.ts       # ssp validate
│       │   │   └── export.ts         # ssp export
│       │   ├── lib/
│       │   │   ├── api-client.ts     # tRPC client for CLI
│       │   │   └── config.ts         # CLI configuration
│       │   └── index.ts              # CLI entry point
│       ├── package.json
│       └── tsconfig.json
├── prisma/
│   ├── schema.prisma                 # Database schema
│   └── seed.ts                       # Control catalog seed data
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx            # Dashboard layout with sidebar
│   │   │   ├── page.tsx              # Dashboard home
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx          # SSP list
│   │   │   │   ├── new/page.tsx      # Create SSP wizard
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx      # SSP detail
│   │   │   │       ├── controls/page.tsx
│   │   │   │       └── export/page.tsx
│   │   │   ├── controls/
│   │   │   │   └── page.tsx          # Control catalog browser
│   │   │   └── tools/
│   │   │       └── page.tsx          # Tool library
│   │   ├── api/
│   │   │   └── trpc/[trpc]/route.ts  # tRPC API handler
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Landing page
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   └── breadcrumbs.tsx
│   │   ├── ssp/
│   │   │   ├── ssp-wizard.tsx        # Multi-step creation wizard
│   │   │   ├── ssp-card.tsx          # SSP list item
│   │   │   └── ssp-progress-ring.tsx # Control completion indicator
│   │   ├── controls/
│   │   │   ├── control-card.tsx      # Control display card
│   │   │   ├── control-status-badge.tsx
│   │   │   └── implementation-statement-card.tsx
│   │   └── tools/
│   │       ├── tool-library-card.tsx
│   │       └── approval-action-bar.tsx
│   ├── lib/
│   │   ├── oscal/
│   │   │   ├── parser.ts             # OSCAL import/parsing
│   │   │   ├── generator.ts          # OSCAL export generation
│   │   │   ├── validator.ts          # Schema validation
│   │   │   └── types.ts              # OSCAL type definitions
│   │   ├── ai/
│   │   │   ├── suggestions.ts        # AI implementation suggestions
│   │   │   └── confidence.ts         # Confidence scoring
│   │   ├── utils/
│   │   │   ├── date.ts               # Date formatting (ISO 8601)
│   │   │   └── export.ts             # PDF/Word generation
│   │   └── constants/
│   │       ├── baselines.ts          # NIST/FedRAMP baseline definitions
│   │       └── control-families.ts   # Control family metadata
│   ├── server/
│   │   ├── api/
│   │   │   ├── routers/
│   │   │   │   ├── ssp.ts            # SSP CRUD operations
│   │   │   │   ├── control.ts        # Control operations
│   │   │   │   ├── tool.ts           # Tool library operations
│   │   │   │   ├── export.ts         # Export operations
│   │   │   │   └── ai.ts             # AI suggestion operations
│   │   │   ├── trpc.ts               # tRPC context
│   │   │   └── root.ts               # Root router
│   │   └── db.ts                     # Prisma client
│   ├── styles/
│   │   └── globals.css               # Tailwind + custom styles
│   └── env.js                        # Environment validation (t3-env)
├── public/
│   ├── icons/                        # Tool logos
│   └── favicon.ico
├── tests/
│   ├── unit/                         # Vitest unit tests
│   └── e2e/                          # Playwright E2E tests
├── data/
│   └── controls/
│       ├── nist-800-53-rev5.json     # NIST control catalog
│       └── fedramp-baselines.json    # FedRAMP baseline mappings
├── .env.example
├── .eslintrc.cjs
├── .prettierrc
├── next.config.js
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## FR Category to Architecture Mapping

| FR Category | Components | Database Tables | API Routes |
|-------------|------------|-----------------|------------|
| **User Account (FR1-3)** | `(auth)/*` pages | `User`, `Account`, `Session` | NextAuth handlers |
| **Project Management (FR4-8)** | `projects/*` pages, `ssp-card` | `Ssp`, `SspVersion` | `ssp.*` router |
| **Control Catalog (FR9-13)** | `controls/*` pages | `Control`, `ControlFamily`, `Baseline` | `control.*` router |
| **SSP System Info (FR14-18)** | `ssp-wizard` Step 1-2 | `SystemInfo` (embedded in Ssp) | `ssp.create`, `ssp.update` |
| **Control Implementation (FR19-26)** | `ssp-wizard` Step 3-4, implementation cards | `ControlImplementation`, `Evidence` | `control.implement`, `control.status` |
| **Export & Output (FR27-31)** | `export/page.tsx`, export utils | - | `export.*` router |
| **CLI Tool (FR32-38)** | `packages/cli/*` | Same as web | Same tRPC API |
| **Import (FR39-41)** | Import dialog, OSCAL parser | - | `ssp.import` |
| **FedRAMP Support (FR42-45)** | Baseline selector, FedRAMP data | `FedRampBaseline` | `control.fedramp` |
| **AI-Assisted (FR46-49)** | Implementation cards with confidence | `AiSuggestion` | `ai.*` router |

---

## Technology Stack Details

### Core Technologies

**Next.js 15 (App Router)**
- Server Components for initial page loads
- Client Components for interactive features
- API Routes via tRPC handlers
- Middleware for authentication checks

**tRPC v11**
- Full type inference from server to client
- React Query integration for caching
- CLI consumes same API via HTTP adapter

**Prisma 6.x**
- PostgreSQL as primary database
- JSON fields for flexible OSCAL data
- Type-safe queries with generated client

**NextAuth.js v5**
- Credential-based authentication (email/password)
- OAuth providers (optional: GitHub, Google)
- Session stored in database via Prisma adapter

### Integration Points

```
┌─────────────────┐     ┌─────────────────┐
│     Web UI      │     │      CLI        │
│  (Next.js 15)   │     │  (Commander)    │
└────────┬────────┘     └────────┬────────┘
         │                       │
         │    tRPC Protocol      │
         └───────────┬───────────┘
                     │
              ┌──────▼──────┐
              │  tRPC API   │
              │  (routers)  │
              └──────┬──────┘
                     │
     ┌───────────────┼───────────────┐
     │               │               │
┌────▼────┐   ┌──────▼──────┐   ┌────▼────┐
│ Prisma  │   │   OSCAL     │   │ OpenAI  │
│   DB    │   │  Engine     │   │   API   │
└─────────┘   └─────────────┘   └─────────┘
     │
┌────▼────┐
│PostgreSQL│
└─────────┘
```

---

## Novel Pattern Designs

### Tool-to-Control Auto-Mapping Pattern

**Purpose:** Enable rapid SSP completion by pre-filling control implementations based on selected security tools.

**Components:**
1. **ToolLibrary** - Curated list of security tools with metadata
2. **ToolControlMapping** - Pre-defined control mappings per tool
3. **ImplementationTemplate** - Pre-written implementation statements
4. **ConfidenceScorer** - Rates mapping confidence (High/Medium/Low)
5. **ApprovalQueue** - User review/approve/reject workflow

**Data Flow:**
```
1. User selects tool (e.g., "Trivy")
2. System queries ToolControlMapping for tool
3. Returns list of {controlId, implementationTemplate, confidence}
4. UI displays as Implementation Statement Cards
5. User clicks [Approve] → Creates ControlImplementation record
6. User clicks [Modify] → Opens editor, then saves as modified
7. User clicks [Reject] → Logs rejection, skips mapping
```

**Database Schema:**
```prisma
model Tool {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String
  logoUrl     String?
  category    String   // vulnerability-scanner, sast, secrets, etc.
  mappings    ToolControlMapping[]
}

model ToolControlMapping {
  id                      String  @id @default(cuid())
  toolId                  String
  tool                    Tool    @relation(fields: [toolId], references: [id])
  controlId               String
  control                 Control @relation(fields: [controlId], references: [id])
  implementationTemplate  String  @db.Text
  confidence              String  // HIGH, MEDIUM, LOW
  source                  String  // vendor-docs, community, generated
}
```

**Implementation Guide:**
- Pre-seed database with 20+ common security tools
- Each tool has 5-15 control mappings with templates
- AI service can generate new mappings on-demand
- Community contributions via PR process (future)

---

## Implementation Patterns

These patterns ensure consistent implementation across all AI agents:

### Naming Patterns

| Category | Convention | Example |
|----------|------------|---------|
| **Database tables** | PascalCase singular | `User`, `Ssp`, `Control` |
| **Database columns** | camelCase | `userId`, `createdAt`, `implementationStatus` |
| **tRPC routers** | camelCase | `ssp`, `control`, `ai` |
| **tRPC procedures** | verb.noun | `ssp.create`, `control.implement`, `ai.suggest` |
| **React components** | PascalCase | `SspCard`, `ControlStatusBadge` |
| **Component files** | kebab-case | `ssp-card.tsx`, `control-status-badge.tsx` |
| **Utility functions** | camelCase | `formatDate`, `generateOscal` |
| **Constants** | SCREAMING_SNAKE | `CONTROL_STATUS`, `BASELINE_LEVELS` |
| **CSS classes** | Tailwind utilities | `bg-primary text-white rounded-md` |
| **Environment vars** | SCREAMING_SNAKE | `DATABASE_URL`, `NEXTAUTH_SECRET` |

### API Response Format

All tRPC procedures return consistent structure:

```typescript
// Success response (handled by tRPC)
return {
  id: "ssp_123",
  name: "My System",
  baseline: "MODERATE",
  // ... data fields
};

// Error response (thrown as TRPCError)
throw new TRPCError({
  code: "NOT_FOUND",
  message: "SSP not found",
  cause: { sspId: input.id }
});
```

### Form Validation Pattern

All forms use Zod schemas shared between client and server:

```typescript
// src/lib/schemas/ssp.ts
export const createSspSchema = z.object({
  name: z.string().min(1, "System name is required").max(200),
  description: z.string().optional(),
  baseline: z.enum(["LOW", "MODERATE", "HIGH", "FEDRAMP_LOW", "FEDRAMP_MODERATE", "FEDRAMP_HIGH"]),
});

export type CreateSspInput = z.infer<typeof createSspSchema>;
```

### Error Handling Strategy

```typescript
// Wrap all async operations
try {
  const result = await db.ssp.create({ data });
  return result;
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      throw new TRPCError({ code: "CONFLICT", message: "SSP name already exists" });
    }
  }
  throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create SSP" });
}
```

### Logging Strategy

```typescript
// Use console for development, structured logging for production
const log = {
  info: (message: string, data?: object) => console.log(JSON.stringify({ level: "info", message, ...data, timestamp: new Date().toISOString() })),
  error: (message: string, error?: Error, data?: object) => console.error(JSON.stringify({ level: "error", message, error: error?.message, stack: error?.stack, ...data, timestamp: new Date().toISOString() })),
  warn: (message: string, data?: object) => console.warn(JSON.stringify({ level: "warn", message, ...data, timestamp: new Date().toISOString() })),
};
```

---

## Consistency Rules

### Code Organization

- **Feature folders** for complex features (`src/components/ssp/`, `src/components/controls/`)
- **Co-located tests** in same directory (`ssp-card.tsx`, `ssp-card.test.tsx`)
- **Barrel exports** via `index.ts` for public API
- **Server code** only in `src/server/` directory
- **Shared types** exported from `src/lib/types.ts`

### Date/Time Handling

- **Storage:** ISO 8601 UTC strings in database
- **Display:** Local timezone with user preference
- **Format:** `toLocaleDateString()` with explicit options
- **Library:** Native `Date` for simple, `date-fns` for complex

```typescript
// Consistent date formatting
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
```

### Loading States

- **Skeleton** loaders for content areas
- **Spinner** for button actions
- **Progress bar** for multi-step wizards
- **Optimistic updates** for quick actions

### Empty States

- **First use:** Illustration + "Create your first SSP" CTA
- **No results:** "No controls match your search" + clear filters
- **Error:** Retry button + support contact

---

## Data Architecture

### Core Data Model

```prisma
// prisma/schema.prisma

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  password      String    // hashed with bcrypt
  role          Role      @default(EDITOR)
  ssps          Ssp[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum Role {
  VIEWER
  EDITOR
  ADMIN
}

model Ssp {
  id                    String                @id @default(cuid())
  name                  String
  description           String?
  baseline              Baseline
  systemInfo            Json                  // Flexible system information
  status                SspStatus             @default(DRAFT)
  userId                String
  user                  User                  @relation(fields: [userId], references: [id])
  implementations       ControlImplementation[]
  createdAt             DateTime              @default(now())
  updatedAt             DateTime              @updatedAt

  @@index([userId])
}

enum Baseline {
  LOW
  MODERATE
  HIGH
  FEDRAMP_LOW
  FEDRAMP_MODERATE
  FEDRAMP_HIGH
  FEDRAMP_LI_SAAS
}

enum SspStatus {
  DRAFT
  IN_PROGRESS
  REVIEW
  COMPLETE
}

model Control {
  id              String                  @id @default(cuid())
  controlId       String                  @unique // e.g., "AC-1", "AC-2(1)"
  family          String                  // e.g., "AC", "AU"
  title           String
  description     String                  @db.Text
  guidance        String?                 @db.Text
  baselines       String[]                // ["LOW", "MODERATE", "HIGH"]
  implementations ControlImplementation[]
  toolMappings    ToolControlMapping[]
}

model ControlImplementation {
  id                    String              @id @default(cuid())
  sspId                 String
  ssp                   Ssp                 @relation(fields: [sspId], references: [id], onDelete: Cascade)
  controlId             String
  control               Control             @relation(fields: [controlId], references: [id])
  status                ImplementationStatus
  statement             String?             @db.Text
  aiGenerated           Boolean             @default(false)
  aiConfidence          String?             // HIGH, MEDIUM, LOW
  parameters            Json?               // Control-specific parameters
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt

  @@unique([sspId, controlId])
  @@index([sspId])
}

enum ImplementationStatus {
  NOT_STARTED
  IMPLEMENTED
  PARTIALLY_IMPLEMENTED
  PLANNED
  NOT_APPLICABLE
}
```

---

## API Contracts

### tRPC Router Structure

```typescript
// src/server/api/root.ts
export const appRouter = createTRPCRouter({
  ssp: sspRouter,
  control: controlRouter,
  tool: toolRouter,
  export: exportRouter,
  ai: aiRouter,
});

// Key procedures:
// ssp.list - List user's SSPs
// ssp.get - Get single SSP with implementations
// ssp.create - Create new SSP
// ssp.update - Update SSP metadata
// ssp.delete - Delete SSP

// control.list - List controls with filters
// control.implement - Set control implementation
// control.bulkImplement - Bulk update implementations

// tool.list - List available tools
// tool.getMappings - Get control mappings for tool
// tool.applyMappings - Apply tool mappings to SSP

// export.oscal - Generate OSCAL JSON/XML/YAML
// export.word - Generate Word document
// export.pdf - Generate PDF

// ai.suggest - Get AI implementation suggestion
// ai.feedback - Submit feedback on suggestion
```

### CLI API Client

```typescript
// packages/cli/src/lib/api-client.ts
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../../src/server/api/root";

export const api = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: process.env.API_URL || "http://localhost:3000/api/trpc",
      headers: () => ({
        Authorization: `Bearer ${getStoredToken()}`,
      }),
    }),
  ],
});
```

---

## Security Architecture

### Authentication

- **NextAuth.js v5** with Credentials provider
- **Password hashing:** bcrypt with cost factor 12
- **Session:** Database-stored sessions via Prisma adapter
- **Token:** JWT for CLI authentication (long-lived API keys)

### Authorization

- **Role-based:** VIEWER (read), EDITOR (read/write), ADMIN (all)
- **Resource-based:** Users can only access their own SSPs
- **tRPC middleware:** Auth check on all protected procedures

```typescript
// src/server/api/trpc.ts
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, user: ctx.session.user } });
});
```

### Data Protection

- **At rest:** Database encryption (managed PostgreSQL)
- **In transit:** TLS 1.3 for all connections
- **Secrets:** Environment variables, never in code
- **Audit logging:** Security-relevant actions logged

---

## Performance Considerations

### Frontend

- **Server Components** for initial page loads
- **Suspense boundaries** for loading states
- **React Query** caching via tRPC
- **Code splitting** per route
- **Image optimization** via Next.js Image

### Backend

- **Database indexes** on foreign keys and frequently queried columns
- **Connection pooling** via Prisma
- **Edge caching** for static control data
- **Batch operations** for bulk control updates

### NFR Targets

| Metric | Target | Strategy |
|--------|--------|----------|
| Page load | <2s | SSR, code splitting |
| Search | <500ms | PostgreSQL FTS, indexes |
| Export | <30s | Streaming, background jobs |
| CLI commands | <5s | Direct API calls |

---

## Deployment Architecture

### Production Environment

```
┌─────────────────────────────────────────────────────┐
│                     Vercel                          │
│  ┌─────────────────────────────────────────────┐   │
│  │           Next.js Application               │   │
│  │  - Server Components (Edge)                 │   │
│  │  - API Routes (Serverless Functions)        │   │
│  │  - Static Assets (CDN)                      │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│                    Railway                          │
│  ┌─────────────────────────────────────────────┐   │
│  │         PostgreSQL Database                 │   │
│  │  - Managed backups                          │   │
│  │  - Automatic scaling                        │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### CLI Distribution

- **npm registry** for installation (`npm install -g @ssp-gen/cli`)
- **Automated publishing** via GitHub Actions
- **Version pinning** for stability

---

## Development Environment

### Prerequisites

- Node.js 20.x LTS
- npm 10.x or pnpm 9.x
- PostgreSQL 16.x (local or Docker)
- Git 2.x

### Setup Commands

```bash
# Clone repository
git clone <repository-url>
cd ssp-generator

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your values

# Setup database
npm run db:push
npm run db:seed

# Start development server
npm run dev

# Run tests
npm run test

# Run E2E tests
npm run test:e2e
```

### Environment Variables

```bash
# .env.example
DATABASE_URL="postgresql://user:password@localhost:5432/ssp_generator"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
OPENAI_API_KEY="sk-..."
```

---

## Architecture Decision Records (ADRs)

### ADR-001: T3 Stack Selection

**Context:** Need full-stack framework with type safety for dual-interface app.

**Decision:** Use create-t3-app with Next.js, tRPC, Prisma, NextAuth.

**Rationale:**
- End-to-end type safety prevents agent conflicts
- tRPC provides single API layer for both web and CLI
- Prisma simplifies database operations with type inference
- NextAuth handles authentication complexity

**Consequences:** Lock-in to specific stack versions; learning curve for team.

### ADR-002: PostgreSQL over MongoDB

**Context:** Need persistent storage for SSP data with complex relationships.

**Decision:** Use PostgreSQL with Prisma ORM.

**Rationale:**
- ACID compliance critical for compliance data
- JSON columns support flexible OSCAL data
- Strong indexing for control search (FR10-11)
- Better tooling and ecosystem

**Consequences:** Schema migrations required; JSON queries less intuitive than MongoDB.

### ADR-003: Monorepo with Separate CLI Package

**Context:** CLI needs to share types and consume same API as web UI.

**Decision:** Monorepo structure with CLI in `packages/cli/`.

**Rationale:**
- Shared TypeScript types via tRPC
- Single source of truth for API contracts
- Independent versioning for CLI
- Simplified CI/CD

**Consequences:** More complex build setup; careful dependency management required.

### ADR-004: shadcn/ui for UI Components

**Context:** Need accessible, customizable UI components for GovTech.

**Decision:** Use shadcn/ui (Radix + Tailwind) per UX specification.

**Rationale:**
- WCAG 2.1 AA compliance built-in (NFR11-14)
- Source ownership enables compliance customization
- Professional aesthetic fits government expectations
- Tailwind integration matches existing stack

**Consequences:** More initial setup than pre-built library; ongoing maintenance of copied components.

---

_Generated by BMAD Decision Architecture Workflow v1.0_
_Date: 2025-11-26_
_For: USER_
