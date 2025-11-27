# SSP Generator UX Design Specification

_Created on 2025-11-26 by USER_
_Generated using BMad Method - Create UX Design Workflow v1.0_

---

## Executive Summary

The SSP Generator democratizes NIST 800-53 and FedRAMP compliance by making System Security Plan (SSP) creation accessible to both **compliance officers** (intuitive web UI) and **software engineers** (Go CLI for automation).

**Core UX Philosophy:** Users should feel like the tool **speeds up authorization**, not slows them down. They should **approve pre-filled suggestions** rather than write from scratch, and **never input the same data twice**.

**Design System:** Material-UI (MUI) - from existing template infrastructure

- 40+ pre-themed components (Federal Blue theme configured)
- Accessibility-first (WCAG 2.1 AA compliant)
- Professional, government-appropriate aesthetic
- Comprehensive design system with responsive layouts

---

## 1. Design System Foundation

### 1.1 Design System Choice

**Selected:** Material-UI (MUI) - from existing template infrastructure

**Rationale:**

- **Already configured** in template with 40+ themed components
- **Federal Blue theme** already applied (Primary: #051094)
- Built-in WCAG-compliant accessibility
- Comprehensive component library covering all UI needs
- Well-documented, mature library with strong community support
- Responsive design patterns built-in
- Consistent with enterprise and government applications

**Components from MUI (already available in template):**

- **Navigation:** AppBar, Drawer, Tabs, Breadcrumbs, BottomNavigation
- **Forms:** TextField, Select, Checkbox, Radio, Switch, Autocomplete
- **Data Display:** Table, DataGrid, Card, Chip, Badge, Avatar, List
- **Feedback:** Alert, Snackbar, Dialog, Backdrop, Progress, Skeleton
- **Layout:** Grid, Box, Container, Stack, Accordion, Divider
- **Inputs:** Button, IconButton, Fab, ToggleButton

**Custom Components Needed (build on MUI primitives):**

- Control Status Badge (using MUI Chip with semantic colors)
- Tool Library Card (using MUI Card with structured content)
- Implementation Statement Card (using MUI Card with AI confidence indicator)
- Approval Action Bar (using MUI ButtonGroup with actions)
- SSP Progress Ring (using MUI CircularProgress with label)

---

## 2. Core User Experience

### 2.1 Target Users & Their Needs

**Persona 1: Compliance Officer (Primary Web UI User)**

- Non-technical background
- Needs guided, step-by-step workflows
- Values: Clear progress, no jargon, confidence in output
- Pain point: Overwhelmed by 400+ controls, manual documentation

**Persona 2: Software Engineer (Primary CLI User)**

- Technical background, DevSecOps mindset
- Needs scriptable, automatable workflows
- Values: Speed, Git-friendly output, CI/CD integration
- Pain point: Compliance work feels like overhead, not engineering

### 2.2 Defining Experience

> **"It's the tool where you pick your security tools and it pre-fills your compliance documentation"**

**Analogies:**

- TurboTax: Answer questions → pre-filled forms → review → file
- Terraform: Plan → see changes → approve → apply
- GitHub PR Templates: Pre-filled content you customize

**Core UX Pattern:** Selection → Auto-Mapping → Approval → Export

### 2.3 Core Experience Principles

| Principle         | Approach                      | Implementation                                  |
| ----------------- | ----------------------------- | ----------------------------------------------- |
| **Speed**         | Pre-fill everything possible  | Tool library auto-maps controls and statements  |
| **No Repetition** | Smart data reuse              | System info entered once, propagates everywhere |
| **Guidance**      | Wizard for new users          | Step-by-step flow with progress indicators      |
| **Flexibility**   | Advanced mode for power users | Skip steps, bulk operations, direct editing     |
| **Trust**         | Transparent AI                | Show confidence levels, reasoning, sources      |
| **Feedback**      | Celebratory completion        | Progress rings, milestone celebrations          |

### 2.4 Desired Emotional Response

Users should feel:

1. **Accelerated** - "This is way faster than doing it manually"
2. **Smart** - "The tool knows what I need before I ask"
3. **Confident** - "I can see why it suggested this control mapping"
4. **Productive** - "I'm approving and moving forward, not stuck writing"
5. **In Control** - "I can modify anything, nothing is locked"

### 2.5 Novel UX Pattern: Tool-to-Control Auto-Mapping

This is the signature UX pattern that differentiates SSP Generator.

**Pattern Name:** Tool Library Selection with Pre-Mapped Controls

**User Goal:** Rapidly document control implementations based on security tools already in use

**Flow:**

```
1. User opens Tool Library
2. User selects tools in use (e.g., semgrep, Trivy, Gitleaks)
3. System displays pre-mapped controls for each tool
4. For each mapping:
   - Shows control ID and title
   - Shows pre-written implementation statement
   - Shows confidence level (High/Medium/Low)
   - Shows source (community, vendor, custom)
5. User actions per mapping:
   - [Approve] → Adds to SSP with "AI-assisted" badge
   - [Modify] → Opens editor to customize, then approve
   - [Reject] → Skips this mapping
6. Approved mappings appear in control implementation section
```

**Visual Elements:**

- **Tool Card**: Logo, name, description, "X controls mapped" badge
- **Mapping Card**: Control ID, statement preview, confidence bar, action buttons
- **Confidence Indicator**:
  - High (green) = "Based on vendor documentation + community validation"
  - Medium (yellow) = "Based on common usage patterns"
  - Low (orange) = "Generic suggestion, review carefully"

**States:**

- Default: Tool unselected, grayed controls
- Selected: Tool highlighted, mapped controls revealed
- Approved: Green checkmark, moves to "Implemented" section
- Modified: Blue edit badge, preserves original for reference
- Rejected: Hidden from view (can restore later)

**Future Enhancement (Stretch Goal):**

- Community contributions for tool mappings
- User can submit new mappings for review
- Crowdsourced improvement of suggestions

---

## 3. Visual Foundation

### 3.1 Color System

**Theme: Federal Blue (from template theme.ts)**

The template already provides a Federal Blue theme optimized for GovTech compliance software. Blue is universally associated with trust, authority, and reliability - essential attributes for government-focused software.

**Primary Palette (from template):**
| Color | Hex | Usage |
|-------|-----|-------|
| Primary | #051094 | Main actions, navigation highlights, links |
| Primary Dark | #040c6e | Hover states, active elements |
| Primary Light | #3742fa | Secondary emphasis |
| Secondary | #6D788D | Secondary text, icons |

**Semantic Colors (from template):**
| Purpose | Hex | Usage |
|---------|-----|-------|
| Success | #72E128 | Implemented controls, approved items, completion |
| Success BG | #e8f9d9 | Success badges, notifications |
| Warning | #FDB528 | Partial implementation, needs attention |
| Warning BG | #fff5e0 | Warning badges, alerts |
| Error | #FF4D49 | Not applicable, rejected, validation errors |
| Error BG | #ffe8e8 | Error badges, alerts |
| Info | #26C6F9 | Planned controls, informational badges |
| Info BG | #e0f7fe | Info badges, highlights |

**Neutral Scale (Slate):**
| Token | Hex | Usage |
|-------|-----|-------|
| neutral-50 | #f8fafc | Page backgrounds |
| neutral-100 | #f1f5f9 | Card backgrounds, alternating rows |
| neutral-200 | #e2e8f0 | Borders, dividers |
| neutral-300 | #cbd5e1 | Disabled elements |
| neutral-400 | #94a3b8 | Placeholder text |
| neutral-500 | #64748b | Secondary text |
| neutral-600 | #475569 | Body text |
| neutral-700 | #334155 | Headings |
| neutral-800 | #1e293b | Sidebar background |
| neutral-900 | #0f172a | Primary text |

**WCAG Compliance:** All primary/semantic colors meet WCAG 2.1 AA contrast requirements (4.5:1 minimum for normal text).

**Interactive Visualization:** [ux-color-themes.html](./ux-color-themes.html)

### 3.2 Typography

**Font Strategy (from template):** Open Sans with system fallbacks

```css
font-family:
  'Open Sans',
  sans-serif,
  -apple-system,
  BlinkMacSystemFont,
  'Segoe UI',
  Roboto;
```

**Scale (MUI Typography variants):**

- h1: 2.25rem (36px) - Dashboard titles
- h2: 1.875rem (30px) - Page titles
- h3: 1.5rem (24px) - Section headers
- h4: 1.25rem (20px) - Subsection headers
- h5: 1rem (16px) - Card titles
- h6: 0.875rem (14px) - Small headings
- body1: 1rem (16px) - Standard text
- body2: 0.875rem (14px) - Secondary text
- caption: 0.75rem (12px) - Labels, metadata
- overline: 0.75rem (12px) - Badges, tags

**Font Weights (from template):**

- Light: 300
- Regular: 400
- SemiBold: 600
- Bold: 700

### 3.3 Spacing & Layout

**Base Unit:** 4px (MUI theme.spacing(1) = 4px)

**Spacing Scale (MUI sx prop):**

- spacing(0.5): 2px
- spacing(1): 4px (gap between inline elements)
- spacing(2): 8px (tight padding)
- spacing(3): 12px
- spacing(4): 16px (standard padding)
- spacing(6): 24px (section spacing)
- spacing(8): 32px (page margins)
- spacing(12): 48px (major section breaks)

**Layout Grid (MUI Grid component):**

- Desktop: 12-column grid, max-width 1280px (lg breakpoint)
- Tablet: 12-column grid, responsive at md breakpoint
- Mobile: Stack layout, single column at xs/sm breakpoints

**MUI Breakpoints:**

- xs: 0px (mobile)
- sm: 600px (small tablet)
- md: 900px (tablet)
- lg: 1200px (desktop)
- xl: 1536px (large desktop)

**Interactive Visualizations:**

- Color Theme Explorer: [ux-color-themes.html](./ux-color-themes.html)

---

## 4. Design Direction

### 4.1 Chosen Design Approach

**Selected: Hybrid Approach - Combining Best Elements**

After exploring 6 design directions (see [ux-design-directions.html](./ux-design-directions.html)), the recommended approach combines elements from multiple directions to serve both user personas optimally:

| Screen/Flow                 | Design Direction     | Rationale                                                   |
| --------------------------- | -------------------- | ----------------------------------------------------------- |
| **Dashboard**               | Dense Dashboard (#1) | Power users need quick access to all SSPs and stats         |
| **SSP Creation**            | Spacious Wizard (#2) | Guided experience reduces overwhelm for compliance officers |
| **Tool Library & Approval** | Split Panel (#5)     | Master-detail layout ideal for review/approve workflow      |
| **Control Catalog**         | Card Gallery (#3)    | Visual browsing helps users find controls quickly           |
| **Power User Features**     | Command First (#6)   | Keyboard shortcuts (⌘K) for developer efficiency            |

**Design Direction Summary:**

**Primary Layout Pattern:** Sidebar + Main Content

- Fixed sidebar navigation (collapsible on tablet/mobile)
- Main content area adapts based on context
- Breadcrumbs for navigation context

**Information Density:** Adaptive

- Dense for dashboard and data views
- Spacious for creation and editing flows
- Progressive disclosure throughout

**Visual Hierarchy:**

- Bold headers for page titles
- Card-based content organization
- Clear visual separation between sections

**Interaction Patterns:**

- Wizard flow for multi-step creation
- Inline editing where possible
- Modal for focused tasks (approve/reject)
- Command palette for power users

**Key Screens Defined:**

1. **Dashboard** - Stats overview, SSP list, quick actions
2. **Create SSP Wizard** - 5-step guided flow
3. **Tool Library** - Grid of tools with mapping preview
4. **Approval Queue** - Split panel with list + preview
5. **Control Catalog** - Filterable card grid
6. **SSP Detail** - Progress rings + control family tabs
7. **Export** - Format selection + preview

**Interactive Mockups:** [ux-design-directions.html](./ux-design-directions.html)

---

## 5. User Journey Flows

### 5.1 Critical User Paths

**Journey 1: Create New SSP (Compliance Officer - Web UI)**

```mermaid
graph TD
    A[Dashboard] --> B[Create New SSP]
    B --> C[Step 1: System Info]
    C --> D[Step 2: Select Baseline]
    D --> E[Step 3: Tool Library]
    E --> F[Auto-Map Controls]
    F --> G[Review Mappings]
    G --> H[Step 4: Complete Controls]
    H --> I[Step 5: Review & Export]
    I --> J[Download SSP]
```

**Step Details:**

| Step | User Action                                 | System Response              | Key UX                          |
| ---- | ------------------------------------------- | ---------------------------- | ------------------------------- |
| 1    | Enter system name, description, boundary    | Auto-saves                   | Inline help, no jargon          |
| 2    | Select baseline (Low/Moderate/High/FedRAMP) | Load applicable controls     | Clear comparison                |
| 3    | Select tools from library                   | Pre-map controls             | Tool cards with mapping count   |
| 4    | Review/approve auto-mapped controls         | Update implementation status | Approval workflow, bulk actions |
| 5    | Complete remaining controls                 | Track progress by family     | Progress ring, skip options     |
| 6    | Review full SSP, export                     | Generate OSCAL/Word/PDF      | Format comparison, validation   |

**Journey 2: Quick SSP Update (Engineer - CLI)**

```bash
# Engineer workflow
ssp init --baseline moderate --name "My System"
ssp tool add semgrep trivy gitleaks  # Auto-maps controls
ssp control review                    # Interactive approval
ssp validate                          # Check OSCAL compliance
ssp export --format oscal-json        # Export for CI/CD
```

**Journey 3: Import & Update Existing SSP**

```mermaid
graph TD
    A[Import OSCAL File] --> B[Validate & Parse]
    B --> C[Display Current Status]
    C --> D[Update Controls]
    D --> E[Re-validate]
    E --> F[Export Updated SSP]
```

---

## 6. Component Library

### 6.1 Component Strategy

**From MUI (template already provides):**

- **Button:** variants (contained, outlined, text), colors (primary, secondary, error)
- **TextField:** Input, multiline Textarea, with InputAdornment
- **Select, Checkbox, Radio, Switch:** Form controls with FormControlLabel
- **Card, Chip, Badge, Avatar:** Data display components
- **Alert, Snackbar:** Feedback and notifications
- **Dialog, Drawer, Popover, Tooltip:** Overlays and popovers
- **Table, DataGrid:** Data tables (DataGrid for advanced features)
- **Tabs, Accordion:** Navigation and disclosure
- **CircularProgress, LinearProgress, Skeleton:** Loading states
- **Autocomplete:** Search with suggestions (use for command palette-like features)

**Custom Components (build on MUI primitives):**

#### Control Status Badge

Shows implementation status with semantic color.

| Status         | Color      | Icon         |
| -------------- | ---------- | ------------ |
| Implemented    | Green      | Check circle |
| Partial        | Yellow     | Half circle  |
| Planned        | Blue       | Clock        |
| Not Applicable | Gray       | Minus circle |
| Not Started    | Light gray | Empty circle |

#### Tool Library Card

```
┌─────────────────────────────────────────┐
│ [Logo] Tool Name                   [+]  │
│ Brief description of the tool           │
│ ─────────────────────────────────────── │
│ 12 controls mapped • High confidence    │
│ [Preview Mappings]                      │
└─────────────────────────────────────────┘
```

#### Implementation Statement Card

```
┌─────────────────────────────────────────┐
│ AC-2(1) Account Management              │
│ ─────────────────────────────────────── │
│ Implementation Statement:               │
│ "Trivy scans container images for..."   │
│ ─────────────────────────────────────── │
│ Confidence: ████████░░ High             │
│ Source: Trivy vendor docs               │
│ ─────────────────────────────────────── │
│ [Approve]  [Modify]  [Reject]           │
└─────────────────────────────────────────┘
```

#### SSP Progress Ring

Circular progress indicator showing control family completion.

- Shows X/Y controls completed
- Color indicates status (all green = done, mixed = in progress)
- Click to drill into family

#### Approval Action Bar

Sticky bar at bottom when reviewing multiple items.

- "X items selected"
- [Approve All] [Reject All] [Clear Selection]

---

## 7. UX Pattern Decisions

### 7.1 Consistency Rules

**Button Hierarchy:**

- Primary (solid blue): Main action per screen (e.g., "Next", "Approve")
- Secondary (outline): Alternative actions (e.g., "Back", "Skip")
- Ghost (text): Tertiary actions (e.g., "Cancel", "Clear")
- Destructive (red): Dangerous actions (e.g., "Delete SSP")

**Feedback Patterns:**

- Success: Toast notification (top-right, auto-dismiss 5s)
- Error: Inline below input + toast for form submission errors
- Loading: Skeleton loaders for content, spinner for actions
- Progress: Progress bar in wizard, ring for control completion

**Form Patterns:**

- Labels: Above inputs (not floating)
- Required: Asterisk (\*) with "Required" legend
- Validation: On blur for individual fields, on submit for form
- Errors: Inline below field with red text and icon
- Help text: Below input in gray, expandable for long help

**Modal Patterns:**

- Confirmation modals for destructive actions
- Sheet (slide-out) for editing implementation statements
- Dialog for quick actions (approve mapping)
- Full-screen for complex multi-step flows

**Navigation Patterns:**

- Active state: Bold text + colored left border (sidebar)
- Breadcrumbs: On all pages except dashboard
- Back button: Uses browser back when possible

**Empty State Patterns:**

- First use: Illustration + "Get Started" CTA
- No results: Helpful message + clear filters option
- No content: Ghost state showing what will appear

**Confirmation Patterns:**

- Delete: Always confirm with modal
- Leave unsaved: Warning modal + "Save Draft" option
- Bulk reject: Confirm with count of affected items

---

## 8. Responsive Design & Accessibility

### 8.1 Responsive Strategy

**Breakpoints:**

- Mobile: <640px (single column, hamburger menu)
- Tablet: 640-1024px (collapsible sidebar, 2-column)
- Desktop: >1024px (persistent sidebar, 3-column layouts)

**Adaptation Patterns:**
| Element | Desktop | Tablet | Mobile |
|---------|---------|--------|--------|
| Navigation | Fixed sidebar | Collapsible sidebar | Hamburger menu |
| Wizard | Horizontal steps | Vertical steps | Vertical accordion |
| Control table | Full table | Scrollable table | Card stack |
| Tool library | Grid (3 columns) | Grid (2 columns) | Single column |
| Approval bar | Floating bottom | Floating bottom | Full-width fixed |

### 8.2 Accessibility Strategy

**Target:** WCAG 2.1 Level AA (required for government/GovTech)

**Key Requirements:**

- Color contrast: 4.5:1 minimum (text), 3:1 (large text/UI)
- Keyboard navigation: All interactive elements accessible via Tab
- Focus indicators: Visible focus ring on all focusable elements
- ARIA labels: Meaningful labels for screen readers
- Alt text: Descriptive text for all meaningful images
- Form labels: Properly associated with inputs
- Error identification: Clear, descriptive error messages
- Touch targets: Minimum 44x44px on mobile

**Testing Strategy:**

- Automated: Lighthouse, axe DevTools in CI/CD
- Manual: Keyboard-only navigation testing
- Screen reader: NVDA/VoiceOver testing

---

## 9. Implementation Guidance

### 9.1 Development Priorities

**Phase 1: Core Infrastructure (Template provides foundation)**

- Extend existing MUI theme with SSP-specific customizations
- Add SSP routes to existing router configuration
- Create SSP context and hooks for state management
- Build wizard component framework using MUI Stepper

**Phase 2: SSP Creation Flow**

- System info form (using MUI TextField, Select)
- Baseline selection (using MUI RadioGroup, Card)
- Control catalog browsing (using MUI DataGrid or Table)
- Export functionality (using MUI Dialog for format selection)

**Phase 3: Tool Library & Auto-Mapping (Differentiator)**

- Tool library UI (using MUI Card grid)
- Auto-mapping display (using MUI List with expandable items)
- Approval workflow components (using MUI ButtonGroup, Snackbar)
- Implementation statement editor (using MUI Drawer with TextField)

**Phase 4: Polish & Accessibility**

- WCAG 2.1 AA audit and fixes
- Responsive refinements using MUI breakpoints
- Animation using MUI transitions (Fade, Slide, Collapse)
- Performance optimization (React.memo, useMemo)

### 9.2 Completion Summary

**UX Design Specification Complete**

This document establishes the complete UX foundation for SSP Generator:

| Component         | Decision               | Rationale                                                    |
| ----------------- | ---------------------- | ------------------------------------------------------------ |
| **Design System** | Material-UI (MUI)      | Template configured, 40+ themed components, enterprise-ready |
| **Color Theme**   | Federal Blue (#051094) | Template theme, trust signals for GovTech                    |
| **Typography**    | Open Sans              | Template configured, professional, readable                  |
| **Layout**        | Hybrid approach        | Dense dashboard + spacious wizard + split panel approval     |
| **Accessibility** | WCAG 2.1 AA            | MUI built-in support, required for government users          |

**Core Deliverables Created:**

- UX Design Specification: `docs/ux-design-specification.md` (this document)
- Color Theme Visualizer: `docs/ux-color-themes.html`
- Design Direction Mockups: `docs/ux-design-directions.html`

**Key UX Innovations:**

1. **Tool-to-Control Auto-Mapping** - Users select security tools, system pre-fills implementation statements
2. **Approval Workflow** - Users approve/modify/reject suggestions rather than write from scratch
3. **Dual-Interface Support** - Same core experience for both Web UI and CLI users
4. **Confidence Indicators** - AI suggestions show confidence levels and sources for transparency

**Ready for Next Phase:**

- Architecture design (technical implementation)
- Epic and story breakdown (development planning)
- Interactive prototyping (user testing)

---

## Appendix

### Related Documents

- Product Requirements: `docs/prd.md`
- Research Summary: `docs/research-ssp-generator-2025-11-26.md`

### Core Interactive Deliverables

This UX Design Specification will be accompanied by:

- **Color Theme Visualizer**: `docs/ux-color-themes.html`

  - Interactive HTML showing all color theme options explored
  - Live UI component examples in each theme
  - Side-by-side comparison and semantic color usage

- **Design Direction Mockups**: `docs/ux-design-directions.html`
  - Interactive HTML with 6-8 complete design approaches
  - Full-screen mockups of key screens
  - Design philosophy and rationale for each direction

### Next Steps & Follow-Up Workflows

This UX Design Specification can serve as input to:

- **Architecture Workflow** - Define technical architecture with UX context
- **Epic/Story Creation** - Break down into implementable units
- **Interactive Prototype** - Build clickable HTML prototype
- **AI Frontend Prompt** - Generate prompts for v0, Lovable, Bolt

### Version History

| Date       | Version | Changes                                                   | Author |
| ---------- | ------- | --------------------------------------------------------- | ------ |
| 2025-11-26 | 1.1     | Updated for Material-UI (template infrastructure)         | USER   |
| 2025-11-26 | 1.0     | Complete UX Design Specification - All sections finalized | USER   |
| 2025-11-26 | 0.1     | Initial UX Design Specification - Core sections           | USER   |

---

_This UX Design Specification was created through collaborative design facilitation. All decisions were made with user input and are documented with rationale._
