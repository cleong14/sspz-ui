# Story 9.3: Generate Control Family Index

Status: drafted

## Story

As a **developer**,
I want **a control family index for fast lookup**,
so that **browsing by family is performant in the UI**.

## Acceptance Criteria

1. **Given** transformed control catalog exists at `public/data/nist-800-53-rev5.json`
   **When** running the family index generator (`npm run data:families`)
   **Then** `public/data/control-families.json` is created

2. **Given** the family index is generated
   **When** checking its contents
   **Then** it contains all 20 NIST 800-53 control families:

   - AC (Access Control)
   - AT (Awareness and Training)
   - AU (Audit and Accountability)
   - CA (Assessment, Authorization, and Monitoring)
   - CM (Configuration Management)
   - CP (Contingency Planning)
   - IA (Identification and Authentication)
   - IR (Incident Response)
   - MA (Maintenance)
   - MP (Media Protection)
   - PE (Physical and Environmental Protection)
   - PL (Planning)
   - PM (Program Management)
   - PS (Personnel Security)
   - PT (Personally Identifiable Information Processing and Transparency)
   - RA (Risk Assessment)
   - SA (System and Services Acquisition)
   - SC (System and Communications Protection)
   - SI (System and Information Integrity)
   - SR (Supply Chain Risk Management)

3. **Given** the family index
   **When** checking each family entry
   **Then** it contains:

   - `id`: Family code (e.g., "AC")
   - `name`: Full family name (e.g., "Access Control")
   - `description`: Brief description of the family's focus
   - `totalControls`: Total count including enhancements
   - `baseControls`: Count of base controls (no parenthetical)
   - `byBaseline`: Counts per baseline `{ low: number, moderate: number, high: number }`

4. **Given** control catalog is updated
   **When** family index is regenerated
   **Then** counts accurately reflect current catalog data

5. **Given** control catalog is missing
   **When** running family index generator
   **Then** clear error instructs to run transform first

## Tasks / Subtasks

- [ ] Task 1: Create family metadata (AC: #2)

  - [ ] 1.1: Create `scripts/data/family-metadata.ts` with family descriptions
  - [ ] 1.2: Include all 20 family codes with full names
  - [ ] 1.3: Add brief description for each family

- [ ] Task 2: Create family index generator (AC: #1, #5)

  - [ ] 2.1: Create `scripts/generate-family-index.ts`
  - [ ] 2.2: Load `public/data/nist-800-53-rev5.json`
  - [ ] 2.3: Verify catalog file exists, error if missing
  - [ ] 2.4: Initialize family index structure

- [ ] Task 3: Implement counting logic (AC: #3, #4)

  - [ ] 3.1: Group controls by family code
  - [ ] 3.2: Count total controls per family (including enhancements)
  - [ ] 3.3: Count base controls per family (no parenthetical in ID)
  - [ ] 3.4: Count controls per baseline per family

- [ ] Task 4: Generate output file (AC: #1)

  - [ ] 4.1: Merge family metadata with computed counts
  - [ ] 4.2: Sort families alphabetically by ID
  - [ ] 4.3: Write to `public/data/control-families.json`
  - [ ] 4.4: Verify output is valid JSON

- [ ] Task 5: Add npm script and testing (AC: #1-5)
  - [ ] 5.1: Add `"data:families": "tsx scripts/generate-family-index.ts"` to package.json
  - [ ] 5.2: Manual test: verify all 20 families present
  - [ ] 5.3: Manual test: verify counts are reasonable
  - [ ] 5.4: Cross-check a few families manually against NIST data

## Dev Notes

### Architecture Context

The family index enables O(1) lookup for family metadata and counts, avoiding runtime aggregation of the full control catalog. This supports:

- Family tab navigation with control counts
- Baseline-filtered family views
- Dashboard summary statistics

### Project Structure Notes

```
public/data/
  nist-800-53-rev5.json    # Input (from Story 9.2)
  control-families.json    # Output (this story)

scripts/
  data/
    family-metadata.ts     # Static family descriptions
  generate-family-index.ts # Generator script
```

### Output Schema

```typescript
interface ControlFamily {
  id: string // "AC"
  name: string // "Access Control"
  description: string // Brief description
  totalControls: number
  baseControls: number
  byBaseline: {
    low: number
    moderate: number
    high: number
  }
}

interface FamilyIndex {
  version: string
  generatedAt: string
  families: ControlFamily[]
}
```

### Expected Control Counts (Approximate)

| Family | Base Controls | Total (with enhancements) |
| ------ | ------------- | ------------------------- |
| AC     | 25            | 90+                       |
| AU     | 16            | 45+                       |
| CA     | 9             | 25+                       |
| ...    | ...           | ...                       |

**Note:** Exact counts should be verified against NIST source.

### Prerequisites

- Story 9.2 completed (transformed catalog exists)

### References

- [Source: docs/epics.md#Epic-9-Story-9.3] - Story requirements
- [Source: docs/architecture.md#Control-Catalog] - Control family structure
- [NIST SP 800-53 Rev 5](https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final) - Official control families

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

Claude Opus 4 (claude-opus-4-5-20251101)

### Debug Log References

### Completion Notes List

### File List

## Change Log

| Date       | Author   | Change                               |
| ---------- | -------- | ------------------------------------ |
| 2025-11-27 | SM Agent | Story drafted from Epic 9 definition |
