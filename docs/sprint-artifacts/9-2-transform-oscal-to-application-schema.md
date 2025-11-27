# Story 9.2: Transform OSCAL to Application Schema

Status: drafted

## Story

As a **developer**,
I want **to transform raw OSCAL data into optimized application JSON**,
so that **the UI can efficiently query and display controls**.

## Acceptance Criteria

1. **Given** raw OSCAL catalog data exists in `data/oscal-raw/`
   **When** running the transform script (`npm run data:transform`)
   **Then** `public/data/nist-800-53-rev5.json` is generated with:
   - All 20 control families (AC, AT, AU, CA, CM, CP, IA, IR, MA, MP, PE, PL, PM, PS, PT, RA, SA, SC, SI, SR)
   - All controls with their enhancements flattened for efficient search
   - Baseline applicability flags per control (Low: boolean, Moderate: boolean, High: boolean)

2. **Given** the transform runs
   **When** checking the output structure
   **Then** each control entry contains:
   - `id`: Control ID (e.g., "AC-1", "AC-2(1)")
   - `family`: Family code (e.g., "AC")
   - `title`: Control title
   - `description`: Control description/statement text
   - `guidance`: Supplemental guidance (if available)
   - `baselines`: `{ low: boolean, moderate: boolean, high: boolean }`
   - `parameters`: Array of customizable parameters (if any)
   - `enhancements`: Array of enhancement IDs (for base controls)
   - `parentControl`: Parent control ID (for enhancements)

3. **Given** the transform completes
   **When** checking output file
   **Then** structure matches the ControlCatalog TypeScript interface in `src/types/control.ts`

4. **Given** the same raw input
   **When** running transform multiple times
   **Then** output is identical (idempotent/deterministic)

5. **Given** transform completes
   **When** checking file size
   **Then** output is reasonable (<5MB) for client-side loading

6. **Given** raw OSCAL files are missing
   **When** running transform
   **Then** clear error message instructs to run download first

## Tasks / Subtasks

- [ ] Task 1: Create TypeScript type definitions (AC: #2, #3)
  - [ ] 1.1: Create `src/types/control.ts` with Control interface
  - [ ] 1.2: Create ControlFamily interface
  - [ ] 1.3: Create ControlCatalog interface (top-level)
  - [ ] 1.4: Export types for use in transform script and UI

- [ ] Task 2: Create transform script (AC: #1, #6)
  - [ ] 2.1: Create `scripts/transform-oscal.ts`
  - [ ] 2.2: Load raw OSCAL catalog JSON
  - [ ] 2.3: Load all three baseline profile JSONs
  - [ ] 2.4: Verify input files exist, error if missing

- [ ] Task 3: Implement OSCAL parsing logic (AC: #1, #2)
  - [ ] 3.1: Parse OSCAL catalog structure to extract controls
  - [ ] 3.2: Extract control metadata (id, title, description)
  - [ ] 3.3: Extract supplemental guidance
  - [ ] 3.4: Parse control parameters
  - [ ] 3.5: Identify control enhancements and parent relationships
  - [ ] 3.6: Flatten nested OSCAL structure

- [ ] Task 4: Implement baseline mapping (AC: #1, #2)
  - [ ] 4.1: Parse LOW baseline profile for control list
  - [ ] 4.2: Parse MODERATE baseline profile for control list
  - [ ] 4.3: Parse HIGH baseline profile for control list
  - [ ] 4.4: Create baseline flags per control

- [ ] Task 5: Generate output file (AC: #1, #4, #5)
  - [ ] 5.1: Structure output as ControlCatalog
  - [ ] 5.2: Sort controls by family then ID
  - [ ] 5.3: Write to `public/data/nist-800-53-rev5.json`
  - [ ] 5.4: Ensure deterministic JSON output (sorted keys)
  - [ ] 5.5: Verify file size is acceptable

- [ ] Task 6: Add npm script and testing (AC: #1-6)
  - [ ] 6.1: Add `"data:transform": "tsx scripts/transform-oscal.ts"` to package.json
  - [ ] 6.2: Manual test: run transform and verify output structure
  - [ ] 6.3: Manual test: verify control count (~1000+)
  - [ ] 6.4: Manual test: run twice to verify idempotency

## Dev Notes

### Architecture Context

This story transforms the raw NIST OSCAL data (downloaded in Story 9.1) into an optimized JSON format for the application. The output becomes the single source of truth for control catalog data in the UI.

**OSCAL Structure Understanding:**
- OSCAL catalogs use a nested structure with groups (families) containing controls
- Controls can have sub-controls (enhancements) indicated by parenthetical notation (e.g., AC-2(1))
- Baseline profiles reference controls by ID, indicating which controls apply to each level

**Output Design Goals:**
- Flat array for easy filtering and search
- Pre-computed baseline flags (avoid runtime joins)
- Include all text needed for display (no secondary lookups)

### Project Structure Notes

```
src/types/
  control.ts           # TypeScript interfaces for controls

public/data/
  nist-800-53-rev5.json  # Transformed output (committed to repo)

scripts/
  transform-oscal.ts     # Transform script
```

**Note:** Unlike raw OSCAL files, the transformed output IS committed to the repo since it's small enough and needed at runtime.

### TypeScript Interface Design

```typescript
interface Control {
  id: string;              // "AC-1", "AC-2(1)"
  family: string;          // "AC"
  title: string;
  description: string;
  guidance?: string;
  baselines: {
    low: boolean;
    moderate: boolean;
    high: boolean;
  };
  parameters?: ControlParameter[];
  enhancements?: string[]; // For base controls
  parentControl?: string;  // For enhancements
}

interface ControlCatalog {
  version: string;
  generatedAt: string;
  source: string;
  controls: Control[];
  families: ControlFamily[];
}
```

### Prerequisites

- Story 9.1 completed (raw OSCAL files downloaded)

### References

- [Source: docs/epics.md#Epic-9-Story-9.2] - Story requirements
- [Source: docs/architecture.md#JSON-File-Schema] - Data schema guidance
- [OSCAL Catalog Model](https://pages.nist.gov/OSCAL/reference/latest/catalog/json-outline/) - OSCAL spec

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

Claude Opus 4 (claude-opus-4-5-20251101)

### Debug Log References

### Completion Notes List

### File List

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2025-11-27 | SM Agent | Story drafted from Epic 9 definition |
