# SSP Generator - Epic Breakdown

**Author:** USER
**Date:** 2025-11-26
**Project Level:** High Complexity
**Target Scale:** Web Application + CLI Tool

---

## Overview

This document provides the complete epic and story breakdown for SSP Generator, decomposing the requirements from the [PRD](./prd.md) into implementable stories.

**Living Document Notice:** This version incorporates context from PRD, UX Design, and Architecture documents.

### Epic Summary

| Epic | Name                         | Stories | FRs Covered                |
| ---- | ---------------------------- | ------- | -------------------------- |
| 1    | Foundation & Infrastructure  | 6       | Infrastructure             |
| 2    | User Authentication & Access | 5       | FR1-FR3                    |
| 3    | Control Catalog & Browsing   | 6       | FR9-FR13, FR42-FR44        |
| 4    | SSP Project Management       | 5       | FR4-FR8                    |
| 5    | SSP Creation Workflow        | 8       | FR14-FR26                  |
| 6    | Export & Import Engine       | 7       | FR27-FR31, FR39-FR41, FR45 |
| 7    | CLI Tool                     | 6       | FR32-FR38                  |
| 8    | AI-Assisted Generation       | 5       | FR46-FR49                  |

**Total: 48 Stories across 8 Epics**

---

## Functional Requirements Inventory

| FR ID | Description                                                          | Epic   |
| ----- | -------------------------------------------------------------------- | ------ |
| FR1   | Users can create accounts and authenticate securely                  | Epic 2 |
| FR2   | Users can manage their profile and preferences                       | Epic 2 |
| FR3   | System supports role-based access (viewer, editor, admin)            | Epic 2 |
| FR4   | Users can create new SSP projects                                    | Epic 4 |
| FR5   | Users can list and search their SSP projects                         | Epic 4 |
| FR6   | Users can duplicate existing SSP projects as templates               | Epic 4 |
| FR7   | Users can archive or delete SSP projects                             | Epic 4 |
| FR8   | Users can save work-in-progress and resume later                     | Epic 4 |
| FR9   | System displays complete NIST 800-53 Rev 5 control catalog           | Epic 3 |
| FR10  | Users can browse controls by family (AC, AU, CA, etc.)               | Epic 3 |
| FR11  | Users can search controls by ID, title, or keyword                   | Epic 3 |
| FR12  | Users can view control details including guidance and enhancements   | Epic 3 |
| FR13  | System displays baseline applicability (Low/Moderate/High)           | Epic 3 |
| FR14  | Users can input system identification information                    | Epic 5 |
| FR15  | Users can define system boundary and components                      | Epic 5 |
| FR16  | Users can specify system categorization (C/I/A)                      | Epic 5 |
| FR17  | Users can document system environment and architecture               | Epic 5 |
| FR18  | Users can identify system owners and contacts                        | Epic 5 |
| FR19  | Users can select appropriate baseline (Low, Moderate, High)          | Epic 5 |
| FR20  | System automatically loads applicable controls for selected baseline | Epic 5 |
| FR21  | Users can set implementation status per control                      | Epic 5 |
| FR22  | Users can write control implementation statements                    | Epic 5 |
| FR23  | Users can customize control parameters where applicable              | Epic 5 |
| FR24  | Users can mark controls as inherited from other systems              | Epic 5 |
| FR25  | Users can attach evidence or references to controls                  | Epic 5 |
| FR26  | Users can track implementation progress by control family            | Epic 5 |
| FR27  | Users can export SSP to OSCAL format (JSON, YAML, XML)               | Epic 6 |
| FR28  | Users can export SSP to Word document format                         | Epic 6 |
| FR29  | Users can export SSP to PDF format                                   | Epic 6 |
| FR30  | Users can validate SSP against OSCAL schema before export            | Epic 6 |
| FR31  | System reports validation errors with actionable guidance            | Epic 6 |
| FR32  | CLI can initialize new SSP projects                                  | Epic 7 |
| FR33  | CLI can import existing OSCAL SSP files                              | Epic 7 |
| FR34  | CLI can update control implementation status                         | Epic 7 |
| FR35  | CLI can export to all supported formats                              | Epic 7 |
| FR36  | CLI can validate SSP against schema                                  | Epic 7 |
| FR37  | CLI supports configuration via file and environment variables        | Epic 7 |
| FR38  | CLI provides machine-readable output (JSON) for scripting            | Epic 7 |
| FR39  | Users can import existing OSCAL SSP files                            | Epic 6 |
| FR40  | System validates imported files and reports issues                   | Epic 6 |
| FR41  | Users can update imported SSPs and re-export                         | Epic 6 |
| FR42  | System displays FedRAMP control baselines                            | Epic 3 |
| FR43  | Users can select FedRAMP baseline and inherit NIST 800-53 controls   | Epic 3 |
| FR44  | System includes FedRAMP-specific parameters and extensions           | Epic 3 |
| FR45  | Users can export FedRAMP-formatted OSCAL SSP                         | Epic 6 |
| FR46  | System suggests control implementation statements                    | Epic 8 |
| FR47  | Users can accept, modify, or reject AI-generated suggestions         | Epic 8 |
| FR48  | System displays confidence levels and reasoning                      | Epic 8 |
| FR49  | System improves suggestions based on user modifications              | Epic 8 |

---

## FR Coverage Map

```
Epic 1 (Foundation):     Infrastructure foundation for all FRs
Epic 2 (Authentication): FR1, FR2, FR3
Epic 3 (Control Catalog): FR9, FR10, FR11, FR12, FR13, FR42, FR43, FR44
Epic 4 (Project Mgmt):   FR4, FR5, FR6, FR7, FR8
Epic 5 (SSP Creation):   FR14, FR15, FR16, FR17, FR18, FR19, FR20, FR21, FR22, FR23, FR24, FR25, FR26
Epic 6 (Export/Import):  FR27, FR28, FR29, FR30, FR31, FR39, FR40, FR41, FR45
Epic 7 (CLI):            FR32, FR33, FR34, FR35, FR36, FR37, FR38
Epic 8 (AI):             FR46, FR47, FR48, FR49

✅ ALL 49 FRs COVERED
```

---

## Epic 1: Foundation & Infrastructure

**Goal:** Extend the existing template infrastructure (Vite + React + MUI + AWS Cognito) with SSP-specific features and set up the separate Go CLI repository.

**User Value:** Enables all subsequent development - users get a fast, accessible, well-architected application built on proven template infrastructure.

**FRs Covered:** Infrastructure foundation for all FRs

---

### Story 1.1: Extend Template with SSP Dependencies

As a **developer**,
I want **the template extended with SSP-specific dependencies**,
So that **I have all libraries needed for SSP features**.

**Acceptance Criteria:**

**Given** existing template-vite-react infrastructure
**When** installing additional dependencies
**Then** the following are added:

- uuid, date-fns for data utilities
- file-saver, jszip for export features
- ajv, ajv-formats for OSCAL schema validation
- docx, pdfmake for document generation
- react-hook-form, zod for form handling (if not present)

**And** TypeScript types are properly configured
**And** all existing template tests still pass

**Prerequisites:** None (first story)

**Technical Notes:**

- Run `yarn add uuid date-fns file-saver jszip ajv ajv-formats docx pdfmake`
- Template already provides: Vite, React, MUI, AWS Cognito, React Router
- Reference: Architecture doc "Project Initialization" section

---

### Story 1.2: Create SSP Type Definitions

As a **developer**,
I want **TypeScript type definitions for SSP data structures**,
So that **I have type safety across the application**.

**Acceptance Criteria:**

**Given** template TypeScript configuration
**When** creating type definitions
**Then** types are defined for:

- SspProject (id, name, baseline, status, systemInfo, implementations)
- ControlImplementation (controlId, status, statement, aiGenerated)
- Control, ControlFamily, ControlCatalog
- Tool, ToolControlMapping
- All enums (Baseline, SspStatus, ImplementationStatus, ImpactLevel)

**And** types match Architecture doc "JSON File Schema" section
**And** types are exported from src/types/ directory

**Prerequisites:** Story 1.1

**Technical Notes:**

- Create src/types/ssp.ts, src/types/control.ts, src/types/tool.ts
- Use TypeScript strict mode
- Reference: Architecture doc "Data Architecture" section

---

### Story 1.3: Implement JSON File Storage Service

As a **developer**,
I want **a service for reading/writing SSP JSON files**,
So that **data persists locally and is portable**.

**Acceptance Criteria:**

**Given** type definitions are created
**When** implementing storage service
**Then** sspStorage service provides:

- list(): Load all SSP projects from ~/.ssp-gen/projects/
- get(id): Load specific project
- save(project): Write project to JSON file
- delete(id): Remove project file
- Automatic updatedAt timestamp on save

**And** service handles file system errors gracefully
**And** works in browser using File System Access API or download/upload fallback

**Prerequisites:** Story 1.2

**Technical Notes:**

- Create src/lib/storage/ssp-storage.ts
- Use browser File System Access API where supported
- Fallback to download/upload for unsupported browsers
- Reference: Architecture doc "File Operations Pattern"

---

### Story 1.4: Initialize Go CLI Repository

As a **developer**,
I want **a separate Go CLI repository initialized**,
So that **CLI development can proceed independently**.

**Acceptance Criteria:**

**Given** decision to use Go for CLI
**When** initializing CLI repository
**Then** ssp-cli repository is created with:

- Go module initialized (go.mod)
- cmd/ssp/main.go entry point with cobra or flag package
- internal/commands/ directory structure
- internal/storage/ for JSON file operations
- internal/types/ matching Web UI types
- Makefile for cross-platform builds

**And** `go build ./cmd/ssp` produces working binary
**And** `ssp --help` displays usage information

**Prerequisites:** None (can be parallel with Story 1.1)

**Technical Notes:**

- Separate repository from Web UI
- Use cobra or standard flag package for CLI framework
- Match JSON file format with Web UI exactly
- Reference: Architecture doc "Go CLI Repository" structure

---

### Story 1.5: Extend Dashboard Layout for SSP Navigation

As a **developer**,
I want **the template dashboard layout extended with SSP navigation**,
So that **users can navigate to all SSP features**.

**Acceptance Criteria:**

**Given** template AppLayout exists
**When** extending navigation
**Then** sidebar includes:

- Dashboard (home)
- Projects (SSP list)
- Control Catalog
- Tool Library
- Settings

**And** AppDrawerButtonList is updated with new routes
**And** breadcrumbs work for nested routes
**And** mobile navigation works correctly

**Prerequisites:** Story 1.1

**Technical Notes:**

- Extend existing src/layouts/AppLayout/
- Update src/router/router.tsx with new routes
- Use template's existing MUI Drawer component
- Reference: UX Design spec section 4.1

---

### Story 1.6: Set Up CI/CD Pipeline

As a **developer**,
I want **GitHub Actions CI/CD configured**,
So that **code quality is enforced and deployments are automated**.

**Acceptance Criteria:**

**Given** project repository exists
**When** configuring CI/CD
**Then** GitHub Actions workflows include:

- ci.yml: Lint, type-check, unit tests on PR
- deploy.yml: Deploy to static hosting (Vercel/Netlify) on main branch
- Environment secrets for AWS Cognito configured

**And** PR checks block merge on failure
**And** Preview deployments work for PRs

**Prerequisites:** Story 1.1

**Technical Notes:**

- Template may already have CI/CD partially configured
- Static hosting deployment (no database)
- Configure VITE*COGNITO*\* secrets
- Reference: Architecture doc "Deployment Architecture"

---

## Epic 2: User Authentication & Access

**Goal:** Leverage existing AWS Cognito authentication from template and extend for SSP-specific needs.

**User Value:** Users can securely access their SSP projects using enterprise-grade authentication.

**FRs Covered:** FR1, FR2, FR3

---

### Story 2.1: Verify AWS Cognito Integration

As a **developer**,
I want **to verify AWS Cognito authentication works**,
So that **users can register and login securely**.

**Acceptance Criteria:**

**Given** template AWS Cognito configuration
**When** testing authentication flow
**Then** the following work correctly:

- User registration (sign up with email/password)
- Email verification
- User login (sign in)
- Password reset flow
- JWT token retrieval

**And** environment variables are documented
**And** Cognito User Pool requirements are specified

**Prerequisites:** Story 1.1

**Technical Notes:**

- Template already provides: configureCognito(), getJWT(), AuthProvider
- Verify existing SignIn and SignOut views work
- Document required Cognito User Pool settings
- Reference: Architecture doc "Security Architecture"

---

### Story 2.2: Extend Login Page with SSP Branding

As a **compliance officer**,
I want **a branded login experience**,
So that **I know I'm using the SSP Generator**.

**Acceptance Criteria:**

**Given** template SignIn view exists
**When** extending with SSP branding
**Then** login page includes:

- SSP Generator logo/title
- Welcome message for compliance users
- Clear sign-up link for new users
- Password visibility toggle (template component)

**And** error messages are user-friendly
**And** loading states show during authentication

**Prerequisites:** Story 2.1

**Technical Notes:**

- Extend existing src/views/SignIn/
- Use template's MUI components
- Add SSP-specific welcome messaging
- Reference: UX Design spec for branding

---

### Story 2.3: Implement User Profile Management

As a **user**,
I want **to view my profile information**,
So that **I can see my account details**.

**Acceptance Criteria:**

**Given** I am logged in
**When** I navigate to Settings > Profile
**Then** I can view:

- Display name (from Cognito attributes)
- Email address
- Account creation date

**And** I can change password via Cognito flow
**And** changes show success toast notification

**Prerequisites:** Story 2.1

**Technical Notes:**

- Use AWS Amplify Auth.currentUserInfo()
- Password change via Auth.changePassword()
- Store user preferences in localStorage
- Reference: FR2

---

### Story 2.4: Implement Local Role-Based Access

As a **developer**,
I want **role-based UI controls**,
So that **different users see appropriate options**.

**Acceptance Criteria:**

**Given** user is authenticated
**When** determining access level
**Then** role is determined from:

- Cognito user groups (if configured)
- Local preference setting (for single-user/demo mode)

**Given** user has VIEWER role
**When** accessing SSP features
**Then** edit buttons are disabled with tooltip "Read-only access"

**Given** user has EDITOR role
**When** accessing SSP features
**Then** full CRUD operations are available

**Prerequisites:** Story 2.2

**Technical Notes:**

- Role stored in Cognito groups or local setting
- UI-level enforcement (data is local anyway)
- Consider single-user vs multi-user scenarios
- Reference: FR3

---

### Story 2.5: Implement Session Management

As a **user**,
I want **my session to persist securely**,
So that **I don't have to log in repeatedly**.

**Acceptance Criteria:**

**Given** I log in successfully
**When** I close and reopen the browser
**Then** I remain logged in (Cognito session management)

**Given** my session expires
**When** I try to access a protected page
**Then** I am redirected to login with message "Session expired"

**Given** I click "Log out"
**When** the action completes
**Then** my Cognito session is invalidated
**And** I am redirected to the landing/login page

**Prerequisites:** Story 2.1

**Technical Notes:**

- Template already handles session via AWS Amplify
- authLoader in router checks JWT validity
- Use existing SignOut view for logout
- Reference: Template router/authLoader.ts

---

## Epic 3: Control Catalog & Browsing

**Goal:** Display NIST 800-53 Rev 5 and FedRAMP control catalogs with search and filtering.

**User Value:** Users can explore and understand compliance controls before implementing them.

**FRs Covered:** FR9, FR10, FR11, FR12, FR13, FR42, FR43, FR44

---

### Story 3.1: Create NIST 800-53 Rev 5 Control Data File

As a **developer**,
I want **NIST 800-53 Rev 5 controls as a static JSON file**,
So that **users can browse the complete control catalog**.

**Acceptance Criteria:**

**Given** project structure is set up
**When** creating control catalog data
**Then** public/data/nist-800-53-rev5.json contains:

- All 20 control families (AC, AT, AU, CA, CM, CP, IA, IR, MA, MP, PE, PL, PM, PS, PT, RA, SA, SC, SI, SR)
- All 1000+ controls with enhancements (e.g., AC-2(1), AC-2(2))
- Baseline applicability (Low: 150, Moderate: 304, High: 392)
- Guidance text and supplemental info

**And** JSON structure matches ControlCatalog TypeScript interface
**And** data sourced from official NIST OSCAL catalog

**Prerequisites:** Story 1.2

**Technical Notes:**

- Download from https://github.com/usnistgov/oscal-content
- Transform OSCAL to simplified JSON format
- Store in public/data/ for static serving
- Reference: Architecture doc "Control Catalog" schema

---

### Story 3.2: Create FedRAMP Baseline Data File

As a **developer**,
I want **FedRAMP baselines as static JSON data**,
So that **users can select FedRAMP-specific controls**.

**Acceptance Criteria:**

**Given** NIST control data exists
**When** creating FedRAMP data
**Then** public/data/fedramp-baselines.json contains:

- FedRAMP Low (125 controls)
- FedRAMP Moderate (325 controls)
- FedRAMP High (421 controls)
- FedRAMP LI-SaaS (Low Impact SaaS)
- FedRAMP-specific parameters per control
- Mapping to NIST base controls

**And** JSON structure matches FedRAMP interfaces

**Prerequisites:** Story 3.1

**Technical Notes:**

- Source from FedRAMP automation repository
- Include parameter substitutions
- Reference: FR42, FR43, FR44

---

### Story 3.3: Build Control Catalog Browse Page

As a **compliance officer**,
I want **to browse controls by family**,
So that **I can understand requirements systematically**.

**Acceptance Criteria:**

**Given** I navigate to Control Catalog
**When** the page loads
**Then** I see:

- Tabs for each control family (AC, AT, AU, etc.)
- Control cards in a filterable grid (3 columns desktop, 2 tablet, 1 mobile)
- Each card shows: Control ID, Title, baseline badges (Low/Mod/High)
- Total control count per family

**And** page loads within 2 seconds (NFR1)
**And** keyboard navigation works (Tab through cards)

**Prerequisites:** Story 3.1, Story 1.5

**Technical Notes:**

- Use shadcn Tabs for family navigation
- Implement card gallery layout per UX spec section 4.1
- Reference: FR9, FR10, FR13

---

### Story 3.4: Implement Control Search

As a **user**,
I want **to search controls by ID, title, or keyword**,
So that **I can quickly find specific controls**.

**Acceptance Criteria:**

**Given** I am on the Control Catalog page
**When** I type in the search box
**Then** results filter in real-time (debounced 300ms)
**And** matches highlight in control cards
**And** search works across: control ID (AC-1), title, description text

**Given** I search for "access"
**When** results display
**Then** I see all controls mentioning "access" with relevance ranking
**And** results return within 500ms (NFR2)

**Prerequisites:** Story 3.3

**Technical Notes:**

- Implement PostgreSQL full-text search
- Use shadcn Command component for search UI
- Reference: FR11

---

### Story 3.5: Build Control Detail View

As a **compliance officer**,
I want **to view complete control details**,
So that **I understand implementation requirements**.

**Acceptance Criteria:**

**Given** I click on a control card
**When** the detail view opens (slide-out sheet)
**Then** I see:

- Control ID and Title
- Full description text
- Implementation guidance
- Related controls and enhancements
- Baseline applicability with visual badges
- FedRAMP parameters if applicable

**And** I can copy control ID with one click
**And** sheet is keyboard-dismissible (Escape)

**Prerequisites:** Story 3.3

**Technical Notes:**

- Use shadcn Sheet component for slide-out
- Display enhancements as collapsible accordion
- Reference: FR12

---

### Story 3.6: Implement Baseline Filter

As a **user**,
I want **to filter controls by baseline level**,
So that **I see only applicable controls for my system**.

**Acceptance Criteria:**

**Given** I am browsing the control catalog
**When** I select a baseline filter (Low, Moderate, High, FedRAMP variants)
**Then** only controls applicable to that baseline are shown
**And** filter persists across family tab navigation
**And** "X controls" count updates dynamically

**Given** I select "FedRAMP Moderate"
**When** filter applies
**Then** I see 325 controls with FedRAMP-specific parameters highlighted

**Prerequisites:** Story 3.2, Story 3.3

**Technical Notes:**

- Multi-select filter for comparing baselines
- Store filter preference in URL params for sharing
- Reference: FR13, FR43

---

## Epic 4: SSP Project Management

**Goal:** Enable users to create, organize, and manage their SSP projects.

**User Value:** Users can organize their compliance work across multiple systems.

**FRs Covered:** FR4, FR5, FR6, FR7, FR8

---

### Story 4.1: Build SSP Dashboard

As a **compliance officer**,
I want **to see all my SSP projects on a dashboard**,
So that **I can track compliance progress across systems**.

**Acceptance Criteria:**

**Given** I am logged in
**When** I navigate to the Dashboard
**Then** I see:

- Summary stats (Total SSPs, In Progress, Complete)
- SSP project cards in a grid layout
- Each card shows: System name, baseline, progress ring, last updated
- Quick actions: Open, Duplicate, Archive

**And** empty state shows "Create your first SSP" CTA if no projects

**Prerequisites:** Story 2.2, Story 1.5

**Technical Notes:**

- Dense dashboard layout per UX spec section 4.1
- Progress ring shows control completion percentage
- Reference: FR5

---

### Story 4.2: Implement Create New SSP

As a **compliance officer**,
I want **to create a new SSP project**,
So that **I can start documenting my system's security**.

**Acceptance Criteria:**

**Given** I click "Create New SSP" on dashboard
**When** the creation modal opens
**Then** I can enter:

- System name (required, max 200 chars)
- Description (optional)
- Baseline selection (Low/Moderate/High/FedRAMP variants)

**And** clicking "Create" creates the SSP and redirects to SSP wizard
**And** SSP is created with DRAFT status
**And** success toast "SSP created successfully" appears

**Prerequisites:** Story 4.1, Story 3.2

**Technical Notes:**

- Use tRPC mutation `ssp.create`
- Validate with Zod schema
- Reference: FR4, FR19

---

### Story 4.3: Implement SSP List and Search

As a **user**,
I want **to search and filter my SSP projects**,
So that **I can find specific systems quickly**.

**Acceptance Criteria:**

**Given** I have multiple SSP projects
**When** I use the search/filter on dashboard
**Then** I can:

- Search by system name
- Filter by status (Draft, In Progress, Complete)
- Filter by baseline
- Sort by name, date created, last updated

**And** filters persist in URL for bookmarking
**And** results update in real-time

**Prerequisites:** Story 4.1

**Technical Notes:**

- Combine search and filters in toolbar
- Use shadcn Command for search
- Reference: FR5

---

### Story 4.4: Implement Duplicate SSP as Template

As a **compliance officer**,
I want **to duplicate an existing SSP as a template**,
So that **I can reuse work for similar systems**.

**Acceptance Criteria:**

**Given** I have an existing SSP
**When** I click "Duplicate" from the SSP card menu
**Then** a modal asks for new system name
**And** clicking "Duplicate" creates a copy with:

- All system info copied
- All control implementations copied
- Status reset to DRAFT
- Name set to provided name

**And** I am redirected to the new SSP

**Prerequisites:** Story 4.2

**Technical Notes:**

- Deep copy all related records
- Reset timestamps and status
- Reference: FR6

---

### Story 4.5: Implement Archive and Delete SSP

As a **user**,
I want **to archive or delete SSP projects**,
So that **I can manage my project list**.

**Acceptance Criteria:**

**Given** I have an SSP project
**When** I click "Archive" from the card menu
**Then** SSP is moved to archived status
**And** it's hidden from main dashboard (viewable in "Archived" filter)
**And** it can be restored later

**Given** I click "Delete" from the card menu
**When** confirmation modal appears and I confirm
**Then** SSP and all related data are permanently deleted
**And** success toast "SSP deleted" appears

**Prerequisites:** Story 4.1

**Technical Notes:**

- Soft delete for archive (add archivedAt timestamp)
- Hard delete with cascade for permanent deletion
- Reference: FR7

---

## Epic 5: SSP Creation Workflow

**Goal:** Guide users through creating complete SSPs with system info and control implementations.

**User Value:** Users can build comprehensive SSPs through an intuitive wizard.

**FRs Covered:** FR14, FR15, FR16, FR17, FR18, FR19, FR20, FR21, FR22, FR23, FR24, FR25, FR26

---

### Story 5.1: Build SSP Wizard Framework

As a **developer**,
I want **a multi-step wizard component**,
So that **users can complete SSPs step-by-step**.

**Acceptance Criteria:**

**Given** user opens an SSP in DRAFT or IN_PROGRESS status
**When** the wizard loads
**Then** wizard displays:

- Horizontal step indicator (desktop) / vertical accordion (mobile)
- Steps: 1. System Info, 2. Baseline, 3. System Details, 4. Controls, 5. Review
- Current step highlighted
- Back/Next navigation buttons
- Progress saves automatically on step change

**And** wizard follows spacious layout per UX spec section 4.1

**Prerequisites:** Story 4.2, Story 1.5

**Technical Notes:**

- Use shadcn Tabs or custom stepper
- Auto-save with debounce on input change
- Reference: UX Design spec section 5.1

---

### Story 5.2: Implement System Identification Form (Step 1)

As a **compliance officer**,
I want **to enter system identification information**,
So that **my SSP identifies the system properly**.

**Acceptance Criteria:**

**Given** I am on Step 1 of the SSP wizard
**When** I fill out the form
**Then** I can enter:

- System Name (required)
- System Identifier/Acronym
- System Description (rich text)
- System Type (Major Application, General Support System, etc.)

**And** inline validation shows errors on blur
**And** data auto-saves to systemInfo JSON field
**And** contextual help tooltips explain each field

**Prerequisites:** Story 5.1

**Technical Notes:**

- Store in Ssp.systemInfo JSON field
- Use shadcn Form with react-hook-form
- Reference: FR14

---

### Story 5.3: Implement System Boundary Form (Step 1 continued)

As a **compliance officer**,
I want **to define my system boundary and components**,
So that **the authorization scope is clear**.

**Acceptance Criteria:**

**Given** I am on Step 1
**When** I scroll to boundary section
**Then** I can document:

- Authorization boundary description
- Network diagram reference (file upload or link)
- System components list (add/remove items)
- External connections and interfaces

**And** components can be categorized (hardware, software, service)

**Prerequisites:** Story 5.2

**Technical Notes:**

- Dynamic list component for components
- File upload stores reference path
- Reference: FR15

---

### Story 5.4: Implement Security Categorization (Step 2)

As a **compliance officer**,
I want **to specify my system's security categorization**,
So that **the appropriate baseline is selected**.

**Acceptance Criteria:**

**Given** I am on Step 2
**When** I set categorization
**Then** I can select for each of Confidentiality, Integrity, Availability:

- Low, Moderate, or High impact level
- System calculates overall categorization (highest of the three)
- Recommended baseline is suggested based on categorization

**And** I can override the suggested baseline with justification
**And** FedRAMP baselines shown if system is cloud-based

**Prerequisites:** Story 5.1, Story 3.2

**Technical Notes:**

- FIPS 199 categorization methodology
- Auto-suggest baseline but allow override
- Reference: FR16, FR19

---

### Story 5.5: Implement System Environment Form (Step 3)

As a **compliance officer**,
I want **to document system environment and architecture**,
So that **implementation context is captured**.

**Acceptance Criteria:**

**Given** I am on Step 3
**When** I fill out environment details
**Then** I can document:

- Deployment model (on-premise, cloud, hybrid)
- Cloud service provider (if applicable)
- Operating systems and platforms
- Key technologies and frameworks
- Data types processed

**And** system owners and contacts section includes:

- System Owner name, title, email
- Authorizing Official
- Security POC
- Technical POC

**Prerequisites:** Story 5.1

**Technical Notes:**

- Contact fields with email validation
- Multi-select for technologies
- Reference: FR17, FR18

---

### Story 5.6: Build Control Implementation Interface (Step 4)

As a **compliance officer**,
I want **to document control implementations**,
So that **I can demonstrate compliance**.

**Acceptance Criteria:**

**Given** I am on Step 4 (Controls)
**When** the interface loads
**Then** I see:

- Control families as tabs or accordion sections
- Progress ring per family showing X/Y completed
- List of controls with status badges
- Filter by status (Not Started, Implemented, Partial, Planned, N/A)

**And** clicking a control opens implementation editor
**And** overall progress bar shows total completion

**Prerequisites:** Story 5.1, Story 3.3

**Technical Notes:**

- Load controls based on selected baseline (FR20)
- Use split-panel layout per UX spec
- Reference: FR21, FR26

---

### Story 5.7: Build Implementation Statement Editor

As a **compliance officer**,
I want **to write control implementation statements**,
So that **I can document how controls are met**.

**Acceptance Criteria:**

**Given** I click on a control in Step 4
**When** the editor opens (slide-out sheet)
**Then** I can:

- Set implementation status (Implemented, Partial, Planned, N/A)
- Write implementation statement (rich text, 5000 char max)
- Customize control parameters if applicable
- Mark as inherited (with source system reference)
- Attach evidence/references (links or file uploads)

**And** changes auto-save with "Saved" indicator
**And** character count shown for statement

**Prerequisites:** Story 5.6

**Technical Notes:**

- Use shadcn Sheet for editor
- Store in ControlImplementation table
- Reference: FR21, FR22, FR23, FR24, FR25

---

### Story 5.8: Implement SSP Review Summary (Step 5)

As a **compliance officer**,
I want **to review my complete SSP before export**,
So that **I can verify everything is correct**.

**Acceptance Criteria:**

**Given** I reach Step 5 (Review)
**When** the summary loads
**Then** I see:

- System info summary (collapsible)
- Categorization and baseline
- Control implementation summary by family
- Completion percentage with warnings for incomplete sections
- List of controls still "Not Started"

**And** I can click any section to jump back and edit
**And** "Export" button enabled when minimum requirements met
**And** status updates to COMPLETE when all controls addressed

**Prerequisites:** Story 5.7

**Technical Notes:**

- Validation rules for minimum completeness
- Navigation links to previous steps
- Reference: FR8

---

## Epic 6: Export & Import Engine

**Goal:** Generate OSCAL-compliant SSP exports and import existing SSPs.

**User Value:** Users can export SSPs for submission and import existing work.

**FRs Covered:** FR27, FR28, FR29, FR30, FR31, FR39, FR40, FR41, FR45

---

### Story 6.1: Implement OSCAL SSP Generator

As a **developer**,
I want **to generate valid OSCAL SSP documents**,
So that **exports meet federal standards**.

**Acceptance Criteria:**

**Given** an SSP with complete data
**When** OSCAL generation is triggered
**Then** output document includes:

- OSCAL SSP structure per NIST schema
- All system info mapped to OSCAL fields
- All control implementations with statements
- Metadata (title, version, dates)

**And** generated OSCAL passes NIST validation tools
**And** supports JSON, YAML, and XML formats

**Prerequisites:** Story 5.8

**Technical Notes:**

- Build src/lib/oscal/generator.ts
- Use official OSCAL schemas for validation
- Reference: FR27

---

### Story 6.2: Build Export Page UI

As a **compliance officer**,
I want **to export my SSP in various formats**,
So that **I can submit for authorization**.

**Acceptance Criteria:**

**Given** I click "Export" from SSP review
**When** export page loads
**Then** I see:

- Format options: OSCAL (JSON/YAML/XML), Word, PDF
- Preview panel showing document structure
- Download button per format
- FedRAMP option for FedRAMP-formatted OSCAL

**And** export completes within 30 seconds (NFR3)
**And** download triggers browser file save

**Prerequisites:** Story 6.1

**Technical Notes:**

- Use streaming for large documents
- Show progress indicator during generation
- Reference: FR27, FR45

---

### Story 6.3: Implement Word Document Export

As a **compliance officer**,
I want **to export my SSP to Word format**,
So that **I can share with stakeholders who prefer Word**.

**Acceptance Criteria:**

**Given** I select Word format on export page
**When** I click Download
**Then** a .docx file is generated with:

- Title page with system info
- Table of contents
- Formatted sections for each control family
- Control implementation tables
- Professional styling

**And** file opens correctly in Microsoft Word
**And** formatting matches government document standards

**Prerequisites:** Story 6.2

**Technical Notes:**

- Use docx library for Node.js
- Template-based generation
- Reference: FR28

---

### Story 6.4: Implement PDF Export

As a **compliance officer**,
I want **to export my SSP to PDF**,
So that **I have a read-only version for distribution**.

**Acceptance Criteria:**

**Given** I select PDF format on export page
**When** I click Download
**Then** a .pdf file is generated with:

- Same content as Word export
- Proper page breaks
- Embedded fonts
- Bookmarks for navigation

**And** PDF is accessible (tagged PDF for screen readers)

**Prerequisites:** Story 6.3

**Technical Notes:**

- Use puppeteer or react-pdf for generation
- Ensure WCAG compliance for PDF/UA
- Reference: FR29

---

### Story 6.5: Implement OSCAL Validation

As a **user**,
I want **to validate my SSP against OSCAL schema**,
So that **I know it will be accepted**.

**Acceptance Criteria:**

**Given** I have an SSP ready for export
**When** I click "Validate" button
**Then** system checks against OSCAL schema and reports:

- Valid: Green checkmark "SSP is OSCAL-compliant"
- Invalid: List of errors with line references and fix suggestions

**And** validation completes within 5 seconds
**And** I can fix errors and re-validate

**Prerequisites:** Story 6.1

**Technical Notes:**

- Build src/lib/oscal/validator.ts
- Use NIST OSCAL validation libraries
- Reference: FR30, FR31

---

### Story 6.6: Implement OSCAL Import

As a **user**,
I want **to import an existing OSCAL SSP file**,
So that **I can continue work started elsewhere**.

**Acceptance Criteria:**

**Given** I click "Import SSP" on dashboard
**When** I upload an OSCAL file (JSON, YAML, or XML)
**Then** system:

- Validates the file format
- Parses all SSP data
- Creates new SSP record with imported data
- Maps controls to existing catalog
- Reports any parsing warnings

**And** imported SSP appears in dashboard
**And** I can edit and re-export

**Prerequisites:** Story 6.5

**Technical Notes:**

- Build src/lib/oscal/parser.ts
- Handle format detection automatically
- Reference: FR39, FR40

---

### Story 6.7: Implement Import Validation and Error Handling

As a **user**,
I want **clear feedback when importing fails**,
So that **I can fix issues with my file**.

**Acceptance Criteria:**

**Given** I upload an invalid OSCAL file
**When** import validation runs
**Then** I see:

- Specific error messages (e.g., "Missing required field: system-name")
- Line numbers for XML/JSON errors
- Suggestions for fixes
- Option to download error report

**Given** file is valid but has warnings
**When** import completes
**Then** I see warnings list but SSP is created
**And** warnings stored for later review

**Prerequisites:** Story 6.6

**Technical Notes:**

- Distinguish errors (blocking) from warnings (non-blocking)
- Provide actionable guidance per error type
- Reference: FR40, FR41

---

## Epic 7: Go CLI Tool

**Goal:** Provide Go-based command-line interface for DevSecOps automation with direct file access.

**User Value:** Developers can automate SSP operations in CI/CD pipelines using a single binary with no runtime dependencies.

**FRs Covered:** FR32, FR33, FR34, FR35, FR36, FR37, FR38

---

### Story 7.1: Build Go CLI Entry Point and Configuration

As a **developer**,
I want **Go CLI with configuration support**,
So that **CLI can be customized per user**.

**Acceptance Criteria:**

**Given** Go CLI binary is built
**When** I run `ssp config init`
**Then** ~/.ssp-gen/config.json is created with defaults
**And** config includes: defaultBaseline, projectsDir, openaiApiKey (optional)

**Given** config exists
**When** I run any command
**Then** config values are loaded and applied

**And** `ssp config get <key>` shows current value
**And** `ssp config set <key> <value>` updates config

**Prerequisites:** Story 1.4

**Technical Notes:**

- No authentication needed for local file access
- Config file at ~/.ssp-gen/config.json
- Optional OpenAI API key for AI suggestions
- Reference: FR37

---

### Story 7.2: Implement `ssp init` Command

As a **developer**,
I want **to initialize SSP projects from CLI**,
So that **I can script SSP creation**.

**Acceptance Criteria:**

**Given** Go CLI is installed
**When** I run `ssp init --name "My System" --baseline moderate`
**Then** new SSP JSON file is created in ~/.ssp-gen/projects/
**And** SSP ID (UUID) is output
**And** file path is displayed

**And** command supports flags: --name, --baseline, --description
**And** interactive mode prompts for missing required fields
**And** `ssp init --help` shows usage

**Prerequisites:** Story 7.1

**Technical Notes:**

- Create JSON file matching Web UI format exactly
- Generate UUID for project ID
- Use cobra package for CLI framework
- Reference: FR32

---

### Story 7.3: Implement `ssp control` Commands

As a **developer**,
I want **to manage control implementations from CLI**,
So that **I can automate compliance documentation**.

**Acceptance Criteria:**

**Given** I have an SSP project (by ID or in current directory)
**When** I run `ssp control implement AC-1 --status implemented --statement "..."`
**Then** control implementation is added/updated in SSP JSON
**And** confirmation message shows updated status

**And** `ssp control list [--project <id>]` shows all controls with status
**And** `ssp control get AC-1` shows implementation details
**And** bulk: `ssp control implement AC-1 AC-2 --status planned`

**Prerequisites:** Story 7.2

**Technical Notes:**

- Direct JSON file manipulation
- Support --statement-file ./ac-1.md for long statements
- Validate control ID against embedded catalog
- Reference: FR34

---

### Story 7.4: Implement `ssp export` Command

As a **developer**,
I want **to export SSPs from CLI**,
So that **I can generate documents in CI/CD**.

**Acceptance Criteria:**

**Given** I have an SSP project
**When** I run `ssp export --format oscal-json --output ./ssp.json`
**Then** SSP is exported to specified file
**And** supports formats: oscal-json, oscal-yaml, oscal-xml

**And** `--stdout` flag outputs to stdout for piping
**And** exit code 0 on success, 1 on error
**And** progress indicator for large exports

**Prerequisites:** Story 7.2

**Technical Notes:**

- Implement OSCAL generation in Go
- Word/PDF export may require external tools or be Web UI only
- Reference: FR35

---

### Story 7.5: Implement `ssp validate` Command

As a **developer**,
I want **to validate SSPs from CLI**,
So that **I can check compliance in CI/CD**.

**Acceptance Criteria:**

**Given** I have an SSP project or OSCAL file
**When** I run `ssp validate [--project <id>]` or `ssp validate ./ssp.json`
**Then** validation runs and outputs:

- "Valid" with exit code 0, or
- Error list with exit code 1

**And** `--json` flag outputs machine-readable results
**And** `--strict` flag treats warnings as errors

**Prerequisites:** Story 7.2

**Technical Notes:**

- Embed OSCAL JSON Schema in binary
- Use gojsonschema for validation
- Reference: FR36

---

### Story 7.6: Implement `ssp import` Command

As a **developer**,
I want **to import OSCAL files from CLI**,
So that **I can migrate existing SSPs**.

**Acceptance Criteria:**

**Given** I have an OSCAL SSP file
**When** I run `ssp import ./existing-ssp.json --name "Imported System"`
**Then** SSP JSON is created from imported data
**And** new project ID output
**And** warnings displayed if any mapping issues

**And** `--dry-run` flag validates without creating
**And** `--json` flag outputs import results as JSON

**Prerequisites:** Story 7.1

**Technical Notes:**

- Parse OSCAL JSON/YAML formats
- Map to internal SSP structure
- Reference: FR33, FR38

---

## Epic 8: AI-Assisted Generation

**Goal:** Provide intelligent control implementation suggestions with transparency.

**User Value:** Users get faster, smarter SSP documentation with AI assistance.

**FRs Covered:** FR46, FR47, FR48, FR49

---

### Story 8.1: Build Tool Library with Pre-Mapped Controls

As a **compliance officer**,
I want **to select security tools from a library**,
So that **control implementations are pre-filled**.

**Acceptance Criteria:**

**Given** I am in the SSP wizard Step 4
**When** I open the Tool Library
**Then** I see a grid of security tools:

- Logo, name, description
- Badge showing "X controls mapped"
- Categories: vulnerability scanner, SAST, secrets detection, etc.

**And** I can select multiple tools
**And** selected tools show checkmark

**Prerequisites:** Story 5.6

**Technical Notes:**

- Seed 20+ common tools (Trivy, Semgrep, Gitleaks, etc.)
- Store in Tool and ToolControlMapping tables
- Reference: UX Design spec section 2.5

---

### Story 8.2: Implement Auto-Mapping from Tool Selection

As a **compliance officer**,
I want **controls auto-mapped when I select tools**,
So that **I don't have to write from scratch**.

**Acceptance Criteria:**

**Given** I select a tool (e.g., Trivy)
**When** mappings load
**Then** I see Implementation Statement Cards for each mapped control:

- Control ID and title
- Pre-written implementation statement
- Confidence indicator (High/Medium/Low)
- Source (vendor docs, community, generated)

**And** cards have actions: [Approve] [Modify] [Reject]
**And** approved mappings auto-populate control implementations

**Prerequisites:** Story 8.1

**Technical Notes:**

- Query ToolControlMapping table
- Show in split-panel view per UX spec
- Reference: Architecture doc lines 269-315

---

### Story 8.3: Build Approval Workflow UI

As a **compliance officer**,
I want **to approve, modify, or reject AI suggestions**,
So that **I control what goes into my SSP**.

**Acceptance Criteria:**

**Given** I see suggested implementation statements
**When** I click [Approve]
**Then** statement is added to SSP as-is with "AI-assisted" badge

**When** I click [Modify]
**Then** editor opens with pre-filled text I can customize
**And** saving creates implementation with "Modified from AI" badge

**When** I click [Reject]
**Then** mapping is hidden (can be restored)
**And** rejection logged for improving suggestions

**And** bulk actions available: [Approve All] [Reject All]

**Prerequisites:** Story 8.2

**Technical Notes:**

- Use shadcn Dialog for approve confirmation
- Use shadcn Sheet for modify editor
- Reference: FR47, UX Design spec section 2.5

---

### Story 8.4: Implement AI Suggestion Service

As a **user**,
I want **AI-generated implementation suggestions**,
So that **I get help even for tools not in the library**.

**Acceptance Criteria:**

**Given** I am writing a control implementation
**When** I click "Get AI Suggestion"
**Then** system generates suggestion based on:

- System description from SSP
- Control requirements
- Selected tools and technologies

**And** suggestion displays with:

- Confidence level (High/Medium/Low)
- Reasoning ("Based on your use of AWS and Trivy...")
- Edit controls before accepting

**Prerequisites:** Story 8.2, Story 5.7

**Technical Notes:**

- Build src/lib/ai/suggestions.ts
- Use OpenAI GPT-4 API
- Include confidence scoring logic
- Reference: FR46, FR48

---

### Story 8.5: Implement Feedback Learning Loop

As a **system**,
I want **to learn from user modifications**,
So that **suggestions improve over time**.

**Acceptance Criteria:**

**Given** user modifies an AI suggestion
**When** they save the modification
**Then** system logs:

- Original suggestion
- User's modification
- Control context
- Acceptance/rejection rate

**And** this data is used to:

- Improve ToolControlMapping templates
- Train future suggestion prompts
- Flag low-confidence mappings for review

**Prerequisites:** Story 8.3

**Technical Notes:**

- Create AiSuggestionFeedback table
- Aggregate feedback for mapping improvements
- Reference: FR49

---

## FR Coverage Matrix

| FR   | Description                      | Epic   | Story         |
| ---- | -------------------------------- | ------ | ------------- |
| FR1  | Create accounts and authenticate | Epic 2 | 2.1, 2.2      |
| FR2  | Manage profile and preferences   | Epic 2 | 2.3           |
| FR3  | Role-based access control        | Epic 2 | 2.4           |
| FR4  | Create new SSP projects          | Epic 4 | 4.2           |
| FR5  | List and search SSP projects     | Epic 4 | 4.1, 4.3      |
| FR6  | Duplicate SSP as template        | Epic 4 | 4.4           |
| FR7  | Archive or delete SSP            | Epic 4 | 4.5           |
| FR8  | Save and resume work             | Epic 5 | 5.1, 5.8      |
| FR9  | Display NIST 800-53 catalog      | Epic 3 | 3.1, 3.3      |
| FR10 | Browse controls by family        | Epic 3 | 3.3           |
| FR11 | Search controls                  | Epic 3 | 3.4           |
| FR12 | View control details             | Epic 3 | 3.5           |
| FR13 | Display baseline applicability   | Epic 3 | 3.3, 3.6      |
| FR14 | Input system identification      | Epic 5 | 5.2           |
| FR15 | Define system boundary           | Epic 5 | 5.3           |
| FR16 | Specify security categorization  | Epic 5 | 5.4           |
| FR17 | Document system environment      | Epic 5 | 5.5           |
| FR18 | Identify system owners           | Epic 5 | 5.5           |
| FR19 | Select baseline                  | Epic 5 | 5.4           |
| FR20 | Auto-load baseline controls      | Epic 5 | 5.6           |
| FR21 | Set implementation status        | Epic 5 | 5.7           |
| FR22 | Write implementation statements  | Epic 5 | 5.7           |
| FR23 | Customize control parameters     | Epic 5 | 5.7           |
| FR24 | Mark controls as inherited       | Epic 5 | 5.7           |
| FR25 | Attach evidence/references       | Epic 5 | 5.7           |
| FR26 | Track progress by family         | Epic 5 | 5.6           |
| FR27 | Export to OSCAL format           | Epic 6 | 6.1, 6.2      |
| FR28 | Export to Word format            | Epic 6 | 6.3           |
| FR29 | Export to PDF format             | Epic 6 | 6.4           |
| FR30 | Validate against OSCAL schema    | Epic 6 | 6.5           |
| FR31 | Report validation errors         | Epic 6 | 6.5           |
| FR32 | CLI init projects                | Epic 7 | 7.2           |
| FR33 | CLI import OSCAL files           | Epic 7 | 7.6           |
| FR34 | CLI update control status        | Epic 7 | 7.3           |
| FR35 | CLI export all formats           | Epic 7 | 7.4           |
| FR36 | CLI validate SSP                 | Epic 7 | 7.5           |
| FR37 | CLI config via file/env          | Epic 7 | 7.1           |
| FR38 | CLI machine-readable output      | Epic 7 | 7.4, 7.5, 7.6 |
| FR39 | Import OSCAL SSP files           | Epic 6 | 6.6           |
| FR40 | Validate imported files          | Epic 6 | 6.7           |
| FR41 | Update imported SSPs             | Epic 6 | 6.7           |
| FR42 | Display FedRAMP baselines        | Epic 3 | 3.2           |
| FR43 | Select FedRAMP baseline          | Epic 3 | 3.6           |
| FR44 | FedRAMP parameters/extensions    | Epic 3 | 3.2           |
| FR45 | Export FedRAMP OSCAL             | Epic 6 | 6.2           |
| FR46 | AI implementation suggestions    | Epic 8 | 8.4           |
| FR47 | Accept/modify/reject suggestions | Epic 8 | 8.3           |
| FR48 | Display confidence and reasoning | Epic 8 | 8.4           |
| FR49 | Learn from user modifications    | Epic 8 | 8.5           |

---

## Summary

**Epic Breakdown Complete**

- **8 Epics** delivering incremental user value
- **48 Stories** with BDD acceptance criteria
- **49 FRs** fully covered with traceability
- **Context Integrated:** PRD + UX Design + Architecture

**Architecture Summary:**

- **Web UI:** Vite + React + MUI + AWS Cognito (template infrastructure)
- **Data Storage:** Local JSON files (~/.ssp-gen/projects/)
- **CLI:** Go binary (separate repository) with direct file access
- **No Backend Server:** Local-first architecture

**Recommended Implementation Sequence:**

1. **Epic 1** (Foundation) - Extend template, create types, set up Go CLI repo
2. **Epic 2** (Auth) + **Epic 3** (Catalog) - Can parallelize, verify Cognito, create JSON data
3. **Epic 4** (Projects) - Depends on Epic 1.3 (storage service)
4. **Epic 5** (SSP Creation) - Core workflow, depends on 3, 4
5. **Epic 6** (Export/Import) - Depends on Epic 5
6. **Epic 7** (Go CLI) - Can develop in parallel in separate repo
7. **Epic 8** (AI) - Enhancement, depends on Epic 5

**Key Technical Notes:**

- Story 1.4 (Go CLI repo) can be developed independently in parallel
- Stories reference MUI components instead of shadcn/ui
- Stories reference JSON file storage instead of PostgreSQL/Prisma
- Stories reference AWS Cognito instead of NextAuth

**Next Steps:**

- Run `sprint-planning` workflow to generate sprint status file
- Run `create-story` workflow to generate detailed story files
- Begin implementation with Epic 1, Story 1.1

---

_For implementation: Use the `create-story` workflow to generate individual story implementation plans from this epic breakdown._

_This document incorporates context from PRD, UX Design Specification, and Architecture Decision Document._

_Updated: 2025-11-26 - Adapted for Vite + MUI + JSON + Go CLI architecture_
