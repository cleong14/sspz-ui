# SSPZ-UI - Epic Breakdown

**Author:** USER
**Date:** 2025-11-26
**Project Type:** Brownfield Web Application
**Track:** BMad Method

---

## Overview

This document provides the complete epic and story breakdown for SSPZ-UI SSP Generator, decomposing the requirements from the [PRD](./prd.md) into implementable stories.

**Context Incorporated:**
- PRD requirements
- Architecture technical decisions

**Epic Summary:**
| Epic | Title | Stories | FRs Covered |
|------|-------|---------|-------------|
| 1 | Foundation & Project Infrastructure | 5 | All (infrastructure) |
| 2 | SSP Dashboard & Project Management | 6 | FR2 |
| 3 | SSP Wizard - System Information | 5 | FR3 (partial) |
| 4 | Control Library & Selection | 6 | FR4 |
| 5 | Control Implementation & Documentation | 5 | FR3 (partial) |
| 6 | Document Export | 5 | FR5 |
| 7 | File Attachments | 4 | FR6 |
| 8 | Authentication Enhancements | 5 | FR1 |

**Total Stories:** 41

---

## Functional Requirements Inventory

| FR | Feature | Priority | Description |
|----|---------|----------|-------------|
| FR1 | Authentication & Authorization | P0 | User login/logout via Cognito, RBAC, session management, audit logging |
| FR2 | SSP Generator Dashboard | P0 | Project overview, progress tracking, quick actions, status indicators |
| FR3 | SSP Document Creator | P0 | Step-by-step wizard, section editing, NIST control mapping, templates, rich text, auto-save |
| FR4 | Control Library | P1 | NIST 800-53 Rev 5 catalog, FedRAMP baselines (Low/Moderate/High), search/filter, inheritance mapping |
| FR5 | Document Export | P0 | Export to DOCX (FedRAMP format), PDF, version history, change tracking |
| FR6 | File Attachments | P1 | Upload evidence documents, attach diagrams, file organization by control, secure storage |
| FR7 | Collaboration | P2 | Multi-user editing, comments, review workflows, approval chains (OUT OF MVP SCOPE) |

---

## FR Coverage Map

| FR | Description | Epic(s) | Stories |
|----|-------------|---------|---------|
| FR1 | Auth & Authorization | Epic 1 (basic), Epic 8 (RBAC) | 1.1, 8.1-8.5 |
| FR2 | SSP Dashboard | Epic 2 | 2.1-2.6 |
| FR3 | SSP Document Creator | Epic 3, Epic 5 | 3.1-3.5, 5.1-5.5 |
| FR4 | Control Library | Epic 4 | 4.1-4.6 |
| FR5 | Document Export | Epic 6 | 6.1-6.5 |
| FR6 | File Attachments | Epic 7 | 7.1-7.4 |
| FR7 | Collaboration | OUT OF MVP | - |

---

## Epic 1: Foundation & Project Infrastructure

**Goal:** Establish the SSP Generator feature foundation with routing, state management, types, and feature shell that enables all subsequent development.

**User Value:** Developers have a working foundation; users see the SSP Generator entry point in the application navigation.

**FRs Covered:** Infrastructure supporting all FRs

---

### Story 1.1: SSP Generator Route Configuration

As a **developer**,
I want **SSP Generator routes configured in the application router**,
So that **users can navigate to SSP features and the feature is properly code-split**.

**Acceptance Criteria:**

**Given** the application is running
**When** a user navigates to `/app/ssp`
**Then** the SSP Generator Dashboard component loads

**And** the route is lazy-loaded for code splitting
**And** the following routes are configured:
- `/app/ssp` - Dashboard
- `/app/ssp/new` - Create new project
- `/app/ssp/:id` - Project detail
- `/app/ssp/:id/wizard/:step` - Wizard steps
- `/app/ssp/:id/controls` - Control library
- `/app/ssp/:id/export` - Export dialog

**And** route constants are added to `src/router/constants.ts`

**Prerequisites:** None (first story)

**Technical Notes:**
- Add routes to `src/router/router.tsx`
- Use React.lazy() for SSPGenerator components
- Follow existing route patterns in codebase
- Add `SSP_DASHBOARD`, `SSP_NEW`, `SSP_DETAIL`, `SSP_WIZARD`, `SSP_CONTROLS`, `SSP_EXPORT` constants

---

### Story 1.2: SSP Type Definitions

As a **developer**,
I want **TypeScript type definitions for SSP entities**,
So that **all SSP components have type safety and IDE support**.

**Acceptance Criteria:**

**Given** I am developing SSP Generator features
**When** I import types from `src/views/SSPGenerator/types/`
**Then** I have access to all SSP-related types

**And** the following type files exist:
- `project.ts` - SSPProject, SSPStatus, FedRAMPBaseline
- `ssp.ts` - SSPDocument, SSPSection, SelectedControl, SSPAttachment
- `control.ts` - NISTControl, ControlFamily, ControlParameter

**And** types match the data architecture in Architecture doc section "Data Architecture"

**Prerequisites:** Story 1.1

**Technical Notes:**
- Create `src/views/SSPGenerator/types/` directory
- Export types from index.ts barrel file
- Use strict TypeScript (no `any` types)
- Reference Architecture doc for exact type definitions

---

### Story 1.3: SSP Context & State Management

As a **developer**,
I want **SSP state management using Context + useReducer**,
So that **SSP data is accessible throughout the feature and follows existing patterns**.

**Acceptance Criteria:**

**Given** I wrap components in SSPProvider
**When** I call useSSPContext() hook
**Then** I have access to SSP state and dispatch

**And** the following state is managed:
- `projects: SSPProject[]`
- `currentProject: SSPProject | null`
- `loading: boolean`
- `error: string | null`

**And** the following actions are supported:
- SET_PROJECTS, SET_CURRENT_PROJECT, UPDATE_PROJECT, DELETE_PROJECT
- SET_LOADING, SET_ERROR

**And** the pattern matches existing AuthContext implementation

**Prerequisites:** Story 1.2

**Technical Notes:**
- Create `src/store/ssp/SSPContext.tsx`
- Create `src/store/ssp/SSPReducer.ts`
- Create `src/store/ssp/sspActions.ts`
- Export `SSPProvider` and `useSSPContext`
- Add SSPProvider to app root (wrap with existing providers)

---

### Story 1.4: SSP Storage Service (MVP)

As a **developer**,
I want **a storage abstraction layer for SSP data**,
So that **SSP data persists in localStorage for MVP and can migrate to API later**.

**Acceptance Criteria:**

**Given** I call sspStorage.getProjects()
**When** projects exist in localStorage
**Then** I receive an array of SSPProject objects

**And** the following methods are implemented:
- `getProjects(): SSPProject[]`
- `getProject(id: string): SSPProject | null`
- `createProject(data: CreateProjectDTO): SSPProject`
- `updateProject(id: string, data: UpdateProjectDTO): SSPProject`
- `deleteProject(id: string): void`
- `getDocument(projectId: string): SSPDocument | null`
- `saveDocument(projectId: string, doc: SSPDocument): void`

**And** data is stored under keys: `ssp_projects`, `ssp_documents`
**And** UUID is generated for new entities using `uuid` package

**Prerequisites:** Story 1.2

**Technical Notes:**
- Create `src/services/ssp/sspStorage.ts`
- Use localStorage for MVP (Architecture ADR-004)
- Add uuid package if not installed: `yarn add uuid @types/uuid`
- Handle JSON serialization/deserialization
- Add error handling for storage quota exceeded

---

### Story 1.5: SSP API Service Abstraction

As a **developer**,
I want **an API service layer that wraps storage operations**,
So that **components use consistent async patterns regardless of backend**.

**Acceptance Criteria:**

**Given** I call sspApi.getProjects()
**When** the operation succeeds
**Then** I receive `{ success: true, data: SSPProject[] }`

**And** when the operation fails
**Then** I receive `{ success: false, error: { code: string, message: string } }`

**And** all methods return `Promise<ApiResponse<T>>` type
**And** the following methods are implemented:
- `getProjects()`
- `getProject(id)`
- `createProject(data)`
- `updateProject(id, data)`
- `deleteProject(id)`
- `getDocument(projectId)`
- `saveDocument(projectId, doc)`

**Prerequisites:** Story 1.4

**Technical Notes:**
- Create `src/services/ssp/sspApi.ts`
- Wrap sspStorage calls with try/catch
- Return ApiResponse wrapper (see Architecture doc pattern)
- This abstraction enables future migration to real API

---

## Epic 2: SSP Dashboard & Project Management

**Goal:** Users can create, view, manage, and delete SSP projects from a central dashboard.

**User Value:** Users have a single place to see all their SSP projects, their status, and can start new ones.

**FRs Covered:** FR2 (SSP Generator Dashboard)

---

### Story 2.1: Dashboard Layout & Empty State

As a **Compliance Officer**,
I want **to see the SSP Generator Dashboard when I navigate to the feature**,
So that **I can understand what the feature does and start creating SSPs**.

**Acceptance Criteria:**

**Given** I am logged in and navigate to `/app/ssp`
**When** I have no SSP projects
**Then** I see an empty state with:
- Heading: "System Security Plans"
- Subheading explaining the feature purpose
- Prominent "Create New SSP" button (primary color, centered)
- Optional: illustration or icon representing SSP documents

**And** when I have projects, the empty state is replaced by the project list
**And** the layout uses MUI components (Box, Typography, Button)
**And** the page title is set appropriately

**Prerequisites:** Story 1.3, Story 1.5

**Technical Notes:**
- Create `src/views/SSPGenerator/Dashboard/Dashboard.tsx`
- Create `src/views/SSPGenerator/Dashboard/EmptyState.tsx`
- Use SSPContext to check for projects
- Follow existing dashboard patterns in codebase

---

### Story 2.2: Create New SSP Project Dialog

As a **Compliance Officer**,
I want **to create a new SSP project with basic information**,
So that **I can begin documenting my system's security controls**.

**Acceptance Criteria:**

**Given** I click "Create New SSP" button
**When** the dialog opens
**Then** I see a form with:
- Project Name (required, text input, 3-100 chars)
- Description (optional, text area, max 500 chars)
- FedRAMP Baseline (required, select: Low/Moderate/High)

**And** when I submit valid data
**Then** the project is created with status "draft"
**And** I am redirected to `/app/ssp/:id/wizard/system-info`
**And** a success toast notification appears

**And** when validation fails
**Then** inline error messages appear below invalid fields
**And** the submit button remains disabled until errors are fixed

**Prerequisites:** Story 2.1

**Technical Notes:**
- Create `src/views/SSPGenerator/Dashboard/CreateProjectDialog.tsx`
- Use React Hook Form + Yup for validation (existing pattern)
- Use MUI Dialog, TextField, Select components
- Call sspApi.createProject() on submit
- Use useAlert hook for notifications

---

### Story 2.3: Project Card Component

As a **Compliance Officer**,
I want **to see each SSP project displayed as a card with key information**,
So that **I can quickly assess project status and take action**.

**Acceptance Criteria:**

**Given** I am on the Dashboard with existing projects
**When** I view a project card
**Then** I see:
- Project name (clickable, navigates to project)
- FedRAMP baseline badge (Low=green, Moderate=yellow, High=red)
- Status chip (Draft=gray, In Review=blue, Approved=green, Archived=gray)
- Last updated date (relative: "2 hours ago", "Yesterday", etc.)
- Progress indicator (percentage of sections complete)

**And** the card has hover state (elevation change)
**And** clicking the card navigates to `/app/ssp/:id`

**Prerequisites:** Story 2.1

**Technical Notes:**
- Create `src/views/SSPGenerator/Dashboard/ProjectCard.tsx`
- Use MUI Card, Chip, LinearProgress components
- Use date-fns or similar for relative dates
- Calculate progress from SSPDocument sections

---

### Story 2.4: Project List with Sorting & Filtering

As a **Compliance Officer**,
I want **to view all my SSP projects in a sortable, filterable list**,
So that **I can find specific projects quickly**.

**Acceptance Criteria:**

**Given** I am on the Dashboard with multiple projects
**When** I view the project list
**Then** I see projects displayed as cards in a responsive grid (1-3 columns)

**And** I can sort by:
- Name (A-Z, Z-A)
- Last Updated (newest first, oldest first)
- Status

**And** I can filter by:
- Status (All, Draft, In Review, Approved, Archived)
- Baseline (All, Low, Moderate, High)

**And** filter/sort selections persist in URL query params
**And** "X projects found" count is displayed

**Prerequisites:** Story 2.3

**Technical Notes:**
- Create `src/views/SSPGenerator/Dashboard/ProjectList.tsx`
- Create `src/views/SSPGenerator/Dashboard/ProjectFilters.tsx`
- Use MUI Grid for responsive layout
- Use useSearchParams for URL state
- Implement client-side filtering (no API needed for MVP)

---

### Story 2.5: Project Quick Actions Menu

As a **Compliance Officer**,
I want **quick actions available on each project card**,
So that **I can perform common operations without navigating away**.

**Acceptance Criteria:**

**Given** I am viewing a project card
**When** I click the three-dot menu icon
**Then** I see a dropdown menu with:
- "Open" - navigates to project detail
- "Edit Details" - opens edit dialog
- "Export" - navigates to export page
- "Duplicate" - creates a copy of the project
- Divider
- "Archive" (if not archived) / "Restore" (if archived)
- "Delete" - shows confirmation dialog

**And** when I click "Delete" and confirm
**Then** the project is removed from the list
**And** a success toast appears: "Project deleted"

**Prerequisites:** Story 2.3

**Technical Notes:**
- Add IconButton with Menu to ProjectCard
- Use MUI Menu, MenuItem, Divider components
- Create DeleteConfirmDialog component
- Call appropriate sspApi methods for each action

---

### Story 2.6: Project Detail Page

As a **Compliance Officer**,
I want **a project detail page showing SSP overview and navigation**,
So that **I can see project details and access wizard, controls, and export**.

**Acceptance Criteria:**

**Given** I navigate to `/app/ssp/:id`
**When** the project exists
**Then** I see:
- Breadcrumb: Dashboard > [Project Name]
- Project header with name, baseline, status
- Edit button to modify project details
- Section progress overview (cards showing each wizard section status)
- Quick action buttons: "Continue Wizard", "View Controls", "Export"

**And** when the project doesn't exist
**Then** I see a 404 page with "Return to Dashboard" link

**Prerequisites:** Story 2.4

**Technical Notes:**
- Create `src/views/SSPGenerator/Detail/ProjectDetail.tsx`
- Create `src/views/SSPGenerator/Detail/SectionProgress.tsx`
- Use useParams to get project ID
- Load project and document from sspApi

---

## Epic 3: SSP Wizard - System Information

**Goal:** Users complete the first wizard steps capturing basic system information for their SSP.

**User Value:** Users begin SSP creation with a guided, step-by-step experience that captures essential system details.

**FRs Covered:** FR3 (SSP Document Creator - System Info sections)

---

### Story 3.1: Wizard Layout & Navigation

As a **Compliance Officer**,
I want **a consistent wizard layout with step navigation**,
So that **I can see my progress and navigate between SSP sections**.

**Acceptance Criteria:**

**Given** I am in the SSP wizard at `/app/ssp/:id/wizard/:step`
**When** I view the page
**Then** I see:
- Stepper component showing all wizard steps with current step highlighted
- Step title and description
- Main content area for the current step
- Navigation buttons: "Back" (if not first), "Save & Continue" (primary)
- Auto-save indicator ("Saved" / "Saving..." / "Unsaved changes")

**And** clicking a completed step in the stepper navigates to that step
**And** clicking an incomplete future step shows tooltip "Complete previous steps first"
**And** the URL updates to reflect current step: `/app/ssp/:id/wizard/system-info`

**Prerequisites:** Story 2.6

**Technical Notes:**
- Create `src/views/SSPGenerator/Wizard/WizardLayout.tsx`
- Create `src/views/SSPGenerator/Wizard/WizardContext.tsx` for step state
- Create `src/views/SSPGenerator/Wizard/components/StepNavigation.tsx`
- Create `src/views/SSPGenerator/Wizard/components/ProgressIndicator.tsx`
- Use MUI Stepper, Step, StepLabel components
- Steps: system-info, boundaries, controls, implementation, attachments, review

---

### Story 3.2: System Information Step

As a **Compliance Officer**,
I want **to enter basic system information**,
So that **my SSP contains accurate system identification details**.

**Acceptance Criteria:**

**Given** I am on the System Information wizard step
**When** I view the form
**Then** I see fields for:
- System Name (required, text, 3-200 chars)
- System Abbreviation (optional, text, max 20 chars)
- System Version (optional, text)
- System Description (required, rich text editor, min 50 chars)
- System Type (required, select: Major Application / General Support System)
- Operational Status (required, select: Operational / Under Development / Major Modification)

**And** when I enter valid data and click "Save & Continue"
**Then** data is saved to SSPDocument.sections
**And** I navigate to the next step (boundaries)

**And** when I return to this step later
**Then** previously saved data is pre-populated

**Prerequisites:** Story 3.1

**Technical Notes:**
- Create `src/views/SSPGenerator/Wizard/steps/SystemInfo.tsx`
- Use React Hook Form for form state
- Use TipTap for rich text description field
- Save to SSPDocument.sections with id "1.1"

---

### Story 3.3: Authorization Boundary Step

As a **Compliance Officer**,
I want **to define my system's authorization boundary**,
So that **the SSP clearly describes what is in scope for authorization**.

**Acceptance Criteria:**

**Given** I am on the Authorization Boundary wizard step
**When** I view the form
**Then** I see fields for:
- Boundary Description (required, rich text, describes what's in/out of scope)
- Network Architecture (optional, rich text + file upload for diagrams)
- Data Flow Description (required, rich text)
- External Connections (repeatable section):
  - Connection Name
  - Organization
  - Connection Type (select: Internet, Dedicated, VPN, etc.)
  - Data Transmitted
  - Authorization Status

**And** I can add/remove external connections dynamically
**And** data saves when navigating away or clicking Save

**Prerequisites:** Story 3.2

**Technical Notes:**
- Create `src/views/SSPGenerator/Wizard/steps/Boundaries.tsx`
- Use useFieldArray from React Hook Form for repeatable connections
- Save to SSPDocument.sections with id "1.2"
- Rich text fields use TipTap editor

---

### Story 3.4: Responsible Parties Step

As a **Compliance Officer**,
I want **to identify key personnel and their roles**,
So that **the SSP documents who is responsible for security**.

**Acceptance Criteria:**

**Given** I am on the Responsible Parties wizard step
**When** I view the form
**Then** I see sections for:
- System Owner (required):
  - Name, Title, Organization, Email, Phone
- Authorizing Official (required):
  - Name, Title, Organization, Email, Phone
- Information System Security Officer (required):
  - Name, Title, Organization, Email, Phone
- Additional Contacts (optional, repeatable):
  - Role (select: Security Engineer, Developer, etc.)
  - Name, Title, Organization, Email, Phone

**And** email fields validate RFC 5322 format
**And** phone fields accept various formats and normalize to E.164

**Prerequisites:** Story 3.3

**Technical Notes:**
- Create `src/views/SSPGenerator/Wizard/steps/ResponsibleParties.tsx`
- Use Yup for email/phone validation
- Save to SSPDocument.sections with id "1.3"
- Consider reusable ContactCard component

---

### Story 3.5: System Environment Step

As a **Compliance Officer**,
I want **to describe my system's technical environment**,
So that **the SSP captures infrastructure and deployment details**.

**Acceptance Criteria:**

**Given** I am on the System Environment wizard step
**When** I view the form
**Then** I see fields for:
- Cloud Service Model (select: IaaS / PaaS / SaaS / Hybrid / On-Premise)
- Cloud Deployment Model (select: Public / Private / Community / Hybrid)
- Cloud Provider (if cloud selected):
  - Provider Name (select: AWS / Azure / GCP / Other)
  - Regions Used (multi-select)
  - Services Used (multi-select or text)
- Operating Systems (repeatable):
  - OS Name, Version, Function
- Database Systems (repeatable):
  - DB Type, Version, Function
- Software Components (repeatable):
  - Name, Version, Function, License

**And** fields conditionally appear based on Cloud Service Model selection

**Prerequisites:** Story 3.4

**Technical Notes:**
- Create `src/views/SSPGenerator/Wizard/steps/SystemEnvironment.tsx`
- Use conditional rendering for cloud-specific fields
- Save to SSPDocument.sections with id "1.4"

---

## Epic 4: Control Library & Selection

**Goal:** Users can browse the NIST 800-53 control catalog and select controls for their FedRAMP baseline.

**User Value:** Users find and select the controls applicable to their system, with clear guidance on requirements.

**FRs Covered:** FR4 (Control Library)

---

### Story 4.1: Control Data Integration

As a **developer**,
I want **NIST 800-53 Rev 5 control data available in the application**,
So that **users can browse and select controls without external API calls**.

**Acceptance Criteria:**

**Given** the application loads
**When** I access the control library feature
**Then** control data is lazy-loaded from bundled JSON

**And** the JSON contains:
- All 800+ NIST 800-53 Rev 5 controls
- Control families (20 families: AC, AT, AU, CA, CM, etc.)
- Control descriptions and supplemental guidance
- FedRAMP baseline applicability (Low, Moderate, High)
- Control parameters (ODPs)
- Related controls

**And** data loads in <2 seconds on average connection

**Prerequisites:** Story 1.2

**Technical Notes:**
- Download NIST OSCAL catalog and transform to JSON
- Store in `src/data/nist-800-53-rev5.json` (~2MB)
- Create `src/services/ssp/controlsService.ts` for data access
- Lazy load using dynamic import
- Consider indexing for fast search

---

### Story 4.2: Control Library Browser

As a **Compliance Officer**,
I want **to browse the NIST 800-53 control catalog**,
So that **I can understand available controls and their requirements**.

**Acceptance Criteria:**

**Given** I navigate to `/app/ssp/:id/controls`
**When** the page loads
**Then** I see:
- Left sidebar: Control families as expandable list
- Main area: Control list with cards showing ID, title, baseline badges
- FedRAMP baseline filter tabs (All, Low, Moderate, High)
- Selected controls count badge

**And** clicking a family expands to show controls in that family
**And** scrolling the main area shows controls for selected family
**And** controls applicable to the project's baseline are highlighted

**Prerequisites:** Story 4.1

**Technical Notes:**
- Create `src/views/SSPGenerator/Controls/ControlLibrary.tsx`
- Create `src/views/SSPGenerator/Controls/FamilyList.tsx`
- Create `src/views/SSPGenerator/Controls/ControlList.tsx`
- Use MUI List, ListItem, Tabs components
- Implement virtualization if performance issues (react-window)

---

### Story 4.3: Control Search & Filter

As a **Compliance Officer**,
I want **to search and filter controls**,
So that **I can quickly find specific controls**.

**Acceptance Criteria:**

**Given** I am on the Control Library page
**When** I type in the search box
**Then** controls are filtered in real-time (debounced 300ms)
**And** search matches on: control ID, title, description

**And** I can filter by:
- Baseline (Low, Moderate, High, All)
- Family (multi-select)
- Status (All, Selected, Not Selected)

**And** when filters are applied
**Then** URL updates with query params
**And** "X controls found" shows result count
**And** "Clear filters" button resets to defaults

**Prerequisites:** Story 4.2

**Technical Notes:**
- Create `src/views/SSPGenerator/Controls/ControlSearch.tsx`
- Create `src/views/SSPGenerator/Controls/ControlFilters.tsx`
- Implement client-side filtering with useMemo
- Use useSearchParams for URL state

---

### Story 4.4: Control Detail View

As a **Compliance Officer**,
I want **to view detailed information about a control**,
So that **I understand the requirement before selecting it**.

**Acceptance Criteria:**

**Given** I click on a control in the library
**When** the detail panel opens
**Then** I see:
- Control ID and title (header)
- Baseline badges (Low/Moderate/High applicability)
- Full description
- Supplemental guidance (expandable)
- Control parameters (ODPs) with placeholders
- Related controls (clickable links)
- Control enhancements (if any)
- "Select Control" / "Deselect Control" button

**And** the detail view appears as a slide-out drawer from right
**And** clicking outside or X button closes the drawer

**Prerequisites:** Story 4.2

**Technical Notes:**
- Create `src/views/SSPGenerator/Controls/ControlDetail.tsx`
- Use MUI Drawer component
- Parse control parameters from data
- Link related controls to open their details

---

### Story 4.5: Control Selection for Project

As a **Compliance Officer**,
I want **to select controls for my SSP**,
So that **my SSP includes all required controls for my baseline**.

**Acceptance Criteria:**

**Given** I am viewing a control detail
**When** I click "Select Control"
**Then** the control is added to my SSP's selected controls
**And** the button changes to "Deselect Control"
**And** the control card shows a checkmark indicator
**And** the selected count updates in the header

**And** when I select a control with enhancements
**Then** I see a prompt to select applicable enhancements
**And** I can select individual enhancements

**And** controls are auto-selected based on FedRAMP baseline
**Then** all baseline-required controls are pre-selected
**And** additional controls can be added/removed

**Prerequisites:** Story 4.4

**Technical Notes:**
- Create `src/views/SSPGenerator/Controls/ControlSelector.tsx`
- Store selected controls in SSPDocument.controls array
- Auto-select on project creation based on baseline
- Track selection status: selected, required, optional

---

### Story 4.6: Control Selection Summary

As a **Compliance Officer**,
I want **to see a summary of my selected controls**,
So that **I can verify coverage before proceeding to implementation**.

**Acceptance Criteria:**

**Given** I have selected controls for my project
**When** I view the selection summary
**Then** I see:
- Total controls selected (e.g., "156 of 325 controls selected")
- Breakdown by family (bar chart or table)
- Baseline coverage indicator (100% required controls = green check)
- Missing required controls warning (if any)
- "Proceed to Implementation" button

**And** if required controls are missing
**Then** I see a list of missing controls
**And** "Select Required" button adds all missing required controls

**Prerequisites:** Story 4.5

**Technical Notes:**
- Create `src/views/SSPGenerator/Controls/SelectionSummary.tsx`
- Calculate coverage against baseline requirements
- Use MUI charts or simple bar representation
- Link to wizard implementation step

---

## Epic 5: Control Implementation & Documentation

**Goal:** Users document how they implement each selected control with rich text implementation statements.

**User Value:** Users can write detailed implementation statements for their controls, completing the core SSP documentation.

**FRs Covered:** FR3 (SSP Document Creator - Control Implementation)

---

### Story 5.1: Implementation Wizard Step

As a **Compliance Officer**,
I want **a wizard step for documenting control implementations**,
So that **I can systematically document how each control is implemented**.

**Acceptance Criteria:**

**Given** I am on the Implementation wizard step
**When** the page loads
**Then** I see:
- List of selected controls grouped by family (collapsible)
- Progress indicator (X of Y controls documented)
- Current control implementation form
- Previous/Next control navigation

**And** controls show status icons:
- Not started (empty circle)
- In progress (half circle)
- Complete (checkmark)

**And** clicking a control in the list loads its implementation form

**Prerequisites:** Story 4.5, Story 3.1

**Technical Notes:**
- Create `src/views/SSPGenerator/Wizard/steps/ControlImplementation.tsx`
- Group controls by family with MUI Accordion
- Track implementation status in SelectedControl.status
- Use keyboard shortcuts (Ctrl+← / Ctrl+→) for navigation

---

### Story 5.2: Rich Text Implementation Editor

As a **Compliance Officer**,
I want **a rich text editor for control implementation statements**,
So that **I can format documentation with lists, headings, and emphasis**.

**Acceptance Criteria:**

**Given** I am editing a control implementation
**When** I use the rich text editor
**Then** I can:
- Format text (bold, italic, underline)
- Create bulleted and numbered lists
- Add headings (H3, H4)
- Insert links
- Use keyboard shortcuts (Ctrl+B, Ctrl+I, etc.)

**And** content auto-saves after 2 seconds of inactivity
**And** save indicator shows "Saving..." then "Saved"
**And** content is stored as HTML in SelectedControl.implementation

**Prerequisites:** Story 5.1

**Technical Notes:**
- Create `src/views/SSPGenerator/Editor/RichTextEditor.tsx`
- Use TipTap with StarterKit extension
- Add custom toolbar with MUI IconButtons
- Implement debounced auto-save (2000ms)
- Sanitize HTML on save to prevent XSS

---

### Story 5.3: Implementation Status Tracking

As a **Compliance Officer**,
I want **to track implementation status for each control**,
So that **I know which controls need attention**.

**Acceptance Criteria:**

**Given** I am editing a control implementation
**When** I view the implementation form
**Then** I can set:
- Implementation Status (select: Planned / Partial / Implemented / Not Applicable)
- Responsible Role (text: e.g., "Security Engineer")

**And** when status is "Not Applicable"
**Then** a justification field appears (required)

**And** I can mark controls as "Inherited"
**Then** I specify: Inherited From (text), Provider (select: CSP / Organization)

**And** status changes are reflected immediately in the control list

**Prerequisites:** Story 5.2

**Technical Notes:**
- Add fields to SelectedControl type
- Create ImplementationStatusForm component
- Validate justification when N/A selected
- Update SSPDocument on status change

---

### Story 5.4: Implementation Templates

As a **Compliance Officer**,
I want **pre-written implementation templates for common controls**,
So that **I have a starting point for documentation**.

**Acceptance Criteria:**

**Given** I am editing a control implementation
**When** the implementation field is empty
**Then** I see a "Use Template" button

**And** when I click "Use Template"
**Then** I see a dropdown with available templates:
- Generic template (basic structure)
- AWS template (if applicable)
- Azure template (if applicable)
- Common implementation (based on control type)

**And** when I select a template
**Then** the template content is inserted into the editor
**And** placeholder text is highlighted (e.g., "[Organization Name]")

**Prerequisites:** Story 5.2

**Technical Notes:**
- Create `src/data/implementation-templates.json`
- Templates organized by control family and cloud provider
- Use TipTap placeholder extension for highlights
- Include at least 20 common control templates

---

### Story 5.5: Bulk Implementation Actions

As a **Compliance Officer**,
I want **bulk actions for control implementation**,
So that **I can efficiently update multiple controls at once**.

**Acceptance Criteria:**

**Given** I am on the Implementation wizard step
**When** I select multiple controls (checkboxes)
**Then** a bulk action bar appears with:
- "Mark as Inherited" - opens provider selection
- "Mark as N/A" - opens justification form
- "Apply Template" - opens template selection
- "Copy Implementation" - copies text from one control to selected

**And** when I apply a bulk action
**Then** all selected controls are updated
**And** a success message shows "X controls updated"

**Prerequisites:** Story 5.3, Story 5.4

**Technical Notes:**
- Add selection state to context
- Create BulkActionBar component
- Implement batch update in sspApi
- Show progress for large batch updates

---

## Epic 6: Document Export

**Goal:** Users can export their SSP to DOCX and PDF formats for submission.

**User Value:** Users get a downloadable, FedRAMP-compliant SSP document they can submit for authorization.

**FRs Covered:** FR5 (Document Export)

---

### Story 6.1: Export Dialog

As a **Compliance Officer**,
I want **an export dialog to choose export options**,
So that **I can customize the exported document format**.

**Acceptance Criteria:**

**Given** I click "Export" from project detail or wizard
**When** the export dialog opens
**Then** I see:
- Format selection (DOCX - recommended, PDF)
- Include options:
  - [ ] Cover page
  - [x] Table of contents
  - [x] System information
  - [x] Control implementations
  - [ ] Appendices
- Version note (optional text field)
- Preview sections (collapsible list)

**And** "Export" button is enabled when format is selected
**And** "Cancel" closes dialog without action

**Prerequisites:** Story 2.6

**Technical Notes:**
- Create `src/views/SSPGenerator/Export/ExportDialog.tsx`
- Store export preferences in localStorage
- Use MUI Dialog, RadioGroup, FormControlLabel

---

### Story 6.2: DOCX Export Generation

As a **Compliance Officer**,
I want **to export my SSP as a DOCX file**,
So that **I have a Word document following FedRAMP template format**.

**Acceptance Criteria:**

**Given** I click "Export" with DOCX format selected
**When** the export completes
**Then** a .docx file downloads automatically

**And** the document includes:
- Cover page with system name, date, version
- Table of contents with clickable links
- System information sections (from wizard)
- Control implementation matrix
- Control narrative sections (grouped by family)
- Proper heading styles (Heading 1, 2, 3)
- Page numbers in footer
- FedRAMP logo (if licensed)

**And** export completes in <30 seconds for typical SSP

**Prerequisites:** Story 6.1

**Technical Notes:**
- Create `src/views/SSPGenerator/Export/exporters/docxExporter.ts`
- Use docx.js library (Architecture ADR-002)
- Generate in WebWorker if >10 seconds
- Style matching FedRAMP template
- Add file-saver for download

---

### Story 6.3: Export Progress & Status

As a **Compliance Officer**,
I want **to see export progress and status**,
So that **I know the export is working for large documents**.

**Acceptance Criteria:**

**Given** I initiate an export
**When** the export is processing
**Then** I see:
- Progress bar (0-100%)
- Current step ("Generating system info...", "Processing controls...", etc.)
- Estimated time remaining
- Cancel button

**And** when export completes
**Then** progress shows 100%
**And** success message appears with download link
**And** "Export Another" button resets dialog

**And** when export fails
**Then** error message explains the issue
**And** "Retry" button is available

**Prerequisites:** Story 6.2

**Technical Notes:**
- Use state machine for export status
- Emit progress events from exporter
- Calculate time estimate from section count
- Log errors for debugging

---

### Story 6.4: PDF Export Generation

As a **Compliance Officer**,
I want **to export my SSP as a PDF file**,
So that **I have a non-editable document for submission**.

**Acceptance Criteria:**

**Given** I click "Export" with PDF format selected
**When** the export completes
**Then** a .pdf file downloads automatically

**And** the PDF includes same content as DOCX:
- Cover page, TOC, all sections
- Proper formatting and pagination
- Embedded fonts for consistent rendering
- Bookmarks for navigation

**And** file size is optimized (<10MB for typical SSP)

**Prerequisites:** Story 6.2

**Technical Notes:**
- Create `src/views/SSPGenerator/Export/exporters/pdfExporter.ts`
- Consider: html2pdf, jsPDF, or server-side generation
- For MVP: generate DOCX first, then convert (or use html2pdf)
- Optimize images if present

---

### Story 6.5: Export History

As a **Compliance Officer**,
I want **to see previous exports of my SSP**,
So that **I can track document versions**.

**Acceptance Criteria:**

**Given** I am on the Export page
**When** I view export history
**Then** I see a list of previous exports:
- Date/time of export
- Format (DOCX/PDF)
- Version note (if entered)
- File size
- "Download Again" button (if file cached)

**And** history shows last 10 exports
**And** I can clear history

**Prerequisites:** Story 6.3

**Technical Notes:**
- Store export metadata in localStorage
- Don't store actual files (too large)
- Track: timestamp, format, version note, success/fail
- Consider IndexedDB for larger storage needs

---

## Epic 7: File Attachments

**Goal:** Users can upload and attach evidence documents and diagrams to their SSP.

**User Value:** Users can include supporting documentation like network diagrams, policies, and evidence.

**FRs Covered:** FR6 (File Attachments)

---

### Story 7.1: Attachments Wizard Step

As a **Compliance Officer**,
I want **a wizard step for managing SSP attachments**,
So that **I can upload and organize supporting documents**.

**Acceptance Criteria:**

**Given** I am on the Attachments wizard step
**When** the page loads
**Then** I see:
- Upload area (drag & drop zone)
- List of uploaded attachments
- Categories: Diagrams, Policies, Evidence, Other
- Filter by category
- Sort by name/date/size

**And** the drag & drop zone accepts files when dragging over
**And** "Browse Files" button opens file picker

**Prerequisites:** Story 3.1

**Technical Notes:**
- Create `src/views/SSPGenerator/Wizard/steps/Attachments.tsx`
- Reuse existing MultiDropzone component
- Store attachments in SSPDocument.attachments
- For MVP: store as base64 in localStorage (size limited)

---

### Story 7.2: File Upload & Validation

As a **Compliance Officer**,
I want **to upload files with validation**,
So that **only appropriate files are attached to my SSP**.

**Acceptance Criteria:**

**Given** I drop or select files in the upload area
**When** files are validated
**Then** accepted formats include:
- Documents: PDF, DOCX, DOC, TXT
- Images: PNG, JPG, JPEG, GIF, SVG
- Diagrams: VSDX, DRAWIO

**And** file size limit is 10MB per file
**And** total storage limit is 100MB per project

**And** when a file fails validation
**Then** error message shows reason ("File too large", "Invalid format")
**And** file is not uploaded

**And** when upload succeeds
**Then** file appears in attachment list with thumbnail (images)
**And** progress indicator shows during upload

**Prerequisites:** Story 7.1

**Technical Notes:**
- Add file validation utility
- Generate thumbnails for images
- Calculate storage used
- Show warning at 80% storage

---

### Story 7.3: Attachment Management

As a **Compliance Officer**,
I want **to manage uploaded attachments**,
So that **I can organize and update evidence documents**.

**Acceptance Criteria:**

**Given** I view an attachment in the list
**When** I interact with it
**Then** I can:
- Click to preview (opens in modal/new tab)
- Edit name (inline edit)
- Change category (dropdown)
- Link to control (select from list)
- Link to section (select from list)
- Download original file
- Delete (with confirmation)

**And** attachments linked to a control show on that control's detail
**And** attachments linked to a section show in that wizard step

**Prerequisites:** Story 7.2

**Technical Notes:**
- Create AttachmentCard component
- Create AttachmentPreview modal
- Update SSPAttachment with controlId, sectionId fields
- Implement file download from stored data

---

### Story 7.4: Attachment Gallery View

As a **Compliance Officer**,
I want **to view attachments in a gallery**,
So that **I can quickly browse visual evidence like diagrams**.

**Acceptance Criteria:**

**Given** I am on the Attachments step
**When** I click "Gallery View" toggle
**Then** image attachments display as thumbnails in a grid
**And** clicking a thumbnail opens lightbox preview
**And** I can navigate between images with arrows
**And** non-image files show as icons with file type indicator

**And** I can toggle between "List View" and "Gallery View"
**And** preference is saved

**Prerequisites:** Story 7.3

**Technical Notes:**
- Create AttachmentGallery component
- Use MUI ImageList for grid
- Implement simple lightbox or use library
- Store view preference in localStorage

---

## Epic 8: Authentication Enhancements

**Goal:** Add role-based access control and audit logging to secure SSP management.

**User Value:** Organizations can control who can view, edit, and approve SSPs with proper audit trail.

**FRs Covered:** FR1 (Authentication & Authorization enhancements)

---

### Story 8.1: User Roles Definition

As a **System Administrator**,
I want **defined user roles for SSP management**,
So that **access can be controlled based on responsibility**.

**Acceptance Criteria:**

**Given** the application has RBAC enabled
**When** roles are configured
**Then** the following roles exist:
- **Viewer**: Can view SSPs, cannot edit
- **Editor**: Can view and edit SSPs, cannot approve
- **Approver**: Can view, edit, and change status to "Approved"
- **Admin**: Full access including user management

**And** roles are stored in user profile (Cognito custom attributes)
**And** default role for new users is "Viewer"

**Prerequisites:** Existing Cognito authentication

**Technical Notes:**
- Add custom attribute to Cognito user pool: `custom:ssp_role`
- Define Role type: 'viewer' | 'editor' | 'approver' | 'admin'
- Update AuthContext to include role
- Create role hierarchy utility

---

### Story 8.2: Role-Based UI Access Control

As a **Viewer**,
I want **UI elements hidden or disabled based on my role**,
So that **I only see actions I'm authorized to perform**.

**Acceptance Criteria:**

**Given** I am logged in with a specific role
**When** I view the SSP application
**Then** I see appropriate UI based on role:

**Viewer:**
- Can view all SSPs and details
- Edit/Delete/Export buttons are hidden
- Implementation fields are read-only
- "View Only" badge shown in header

**Editor:**
- Can view and edit SSPs
- Approve/Archive buttons are hidden
- Can create new projects

**Approver:**
- Can view, edit, and approve SSPs
- "Approve" button visible on In Review SSPs

**Admin:**
- Full access to all features
- User management link visible (future)

**Prerequisites:** Story 8.1

**Technical Notes:**
- Create usePermissions hook
- Create RequireRole wrapper component
- Add role checks to action buttons
- Use context to access current role

---

### Story 8.3: Action Authorization

As a **backend security measure**,
I want **all actions authorized based on role**,
So that **API calls are protected even if UI is bypassed**.

**Acceptance Criteria:**

**Given** a user attempts an action
**When** the action is processed
**Then** role is verified before execution:
- Viewers: Can only read data
- Editors: Can create, read, update projects/documents
- Approvers: Can also change status to Approved
- Admins: Can delete projects, manage users

**And** when authorization fails
**Then** error response includes: "Unauthorized: [role] cannot [action]"
**And** action is not performed
**And** attempt is logged

**Prerequisites:** Story 8.2

**Technical Notes:**
- Add authorization checks to sspApi methods
- Create authorize(role, action) utility
- For MVP: client-side checks (server-side when API added)
- Log unauthorized attempts to console

---

### Story 8.4: Audit Logging

As a **Compliance Officer**,
I want **all SSP actions logged**,
So that **I have an audit trail for compliance**.

**Acceptance Criteria:**

**Given** a user performs any SSP action
**When** the action completes
**Then** an audit log entry is created with:
- Timestamp (ISO 8601)
- User ID and email
- Action type (create, update, delete, export, status_change)
- Resource type (project, document, control, attachment)
- Resource ID
- Details (what changed)
- Result (success/failure)

**And** audit logs are stored in localStorage (MVP) or sent to API (future)
**And** logs are retained for 90 days minimum

**Prerequisites:** Story 8.3

**Technical Notes:**
- Create `src/services/auditService.ts`
- Create AuditLogEntry type
- Add logging to sspApi wrapper methods
- Store in localStorage key: `ssp_audit_logs`
- Implement log rotation (delete >90 days)

---

### Story 8.5: Audit Log Viewer

As a **Admin**,
I want **to view audit logs**,
So that **I can review SSP activity and investigate issues**.

**Acceptance Criteria:**

**Given** I am an Admin
**When** I navigate to audit log viewer
**Then** I see:
- Table of audit events (newest first)
- Columns: Date, User, Action, Resource, Status
- Filter by: Date range, User, Action type, Resource type
- Search by resource ID
- Export to CSV

**And** clicking a row expands to show full details
**And** pagination for large log sets (50 per page)

**Prerequisites:** Story 8.4

**Technical Notes:**
- Create `src/views/Admin/AuditLog.tsx`
- Add admin route `/admin/audit`
- Use MUI DataGrid for table
- Implement CSV export utility

---

## FR Coverage Matrix

| FR | Description | Stories |
|----|-------------|---------|
| FR1 | Auth & Authorization | 1.3 (context), 8.1, 8.2, 8.3, 8.4, 8.5 |
| FR2 | SSP Dashboard | 2.1, 2.2, 2.3, 2.4, 2.5, 2.6 |
| FR3 | SSP Document Creator | 3.1, 3.2, 3.3, 3.4, 3.5, 5.1, 5.2, 5.3, 5.4, 5.5 |
| FR4 | Control Library | 4.1, 4.2, 4.3, 4.4, 4.5, 4.6 |
| FR5 | Document Export | 6.1, 6.2, 6.3, 6.4, 6.5 |
| FR6 | File Attachments | 7.1, 7.2, 7.3, 7.4 |
| FR7 | Collaboration | OUT OF MVP (deferred to Phase 2) |

---

## Summary

**Total Epics:** 8
**Total Stories:** 41

**Epic Implementation Order:**
1. Foundation & Project Infrastructure (5 stories)
2. SSP Dashboard & Project Management (6 stories)
3. SSP Wizard - System Information (5 stories)
4. Control Library & Selection (6 stories)
5. Control Implementation & Documentation (5 stories)
6. Document Export (5 stories)
7. File Attachments (4 stories)
8. Authentication Enhancements (5 stories)

**Context Incorporated:**
- PRD requirements (all MVP FRs)
- Architecture decisions (state management, storage, export patterns)

**Next Steps:**
- Run `implementation-readiness` workflow for final validation
- Begin Sprint Planning with Epic 1

---

_Generated by BMAD Epic and Story Decomposition Workflow v1.0_
_Date: 2025-11-26_
_For: USER_
