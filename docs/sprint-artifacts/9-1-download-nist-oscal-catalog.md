# Story 9.1: Download NIST OSCAL Catalog

Status: drafted

## Story

As a **developer**,
I want **to download the official NIST 800-53 Rev 5 OSCAL catalog**,
so that **I have authoritative control data for the application**.

## Acceptance Criteria

1. **Given** the NIST OSCAL content repository is accessible
   **When** running the download script (`npm run data:download`)
   **Then** the following are downloaded to `data/oscal-raw/`:
   - NIST 800-53 Rev 5 catalog (JSON format): `NIST_SP-800-53_rev5_catalog.json`
   - NIST 800-53 Rev 5 LOW baseline: `NIST_SP-800-53_rev5_LOW-baseline_profile.json`
   - NIST 800-53 Rev 5 MODERATE baseline: `NIST_SP-800-53_rev5_MODERATE-baseline_profile.json`
   - NIST 800-53 Rev 5 HIGH baseline: `NIST_SP-800-53_rev5_HIGH-baseline_profile.json`

2. **Given** files are downloaded
   **When** checking file validity
   **Then** each file is valid JSON and passes basic OSCAL structure validation

3. **Given** download completes
   **When** checking the download manifest
   **Then** `data/oscal-raw/manifest.json` exists with:
   - Download timestamp (ISO 8601)
   - Source URLs for each file
   - File checksums (SHA256)
   - OSCAL version info

4. **Given** the download script runs twice
   **When** files already exist and checksums match
   **Then** files are not re-downloaded (cache behavior)

5. **Given** network is unavailable
   **When** running the download script
   **Then** clear error message is displayed with retry instructions

## Tasks / Subtasks

- [ ] Task 1: Create download script infrastructure (AC: #1, #5)
  - [ ] 1.1: Create `scripts/download-oscal.ts` with TypeScript
  - [ ] 1.2: Add `tsx` dev dependency for running TypeScript scripts
  - [ ] 1.3: Configure source URLs pointing to NIST OSCAL content repository
  - [ ] 1.4: Implement fetch with error handling and timeout
  - [ ] 1.5: Create `data/oscal-raw/` directory if not exists

- [ ] Task 2: Implement file download logic (AC: #1, #4)
  - [ ] 2.1: Download NIST 800-53 Rev 5 catalog JSON
  - [ ] 2.2: Download LOW baseline profile JSON
  - [ ] 2.3: Download MODERATE baseline profile JSON
  - [ ] 2.4: Download HIGH baseline profile JSON
  - [ ] 2.5: Implement checksum calculation (SHA256)
  - [ ] 2.6: Add skip-if-exists logic based on checksums

- [ ] Task 3: Create manifest tracking (AC: #3)
  - [ ] 3.1: Design manifest.json schema
  - [ ] 3.2: Generate manifest after successful downloads
  - [ ] 3.3: Include timestamp, URLs, checksums, version info

- [ ] Task 4: Add basic validation (AC: #2)
  - [ ] 4.1: Validate JSON parsing for each downloaded file
  - [ ] 4.2: Check for required OSCAL root properties
  - [ ] 4.3: Report validation results

- [ ] Task 5: Add npm script (AC: #1)
  - [ ] 5.1: Add `"data:download": "tsx scripts/download-oscal.ts"` to package.json
  - [ ] 5.2: Add `data/oscal-raw/` to `.gitignore` (files are large)
  - [ ] 5.3: Document usage in README or inline comments

- [ ] Task 6: Testing (AC: #1-5)
  - [ ] 6.1: Manual test: run download script and verify files
  - [ ] 6.2: Manual test: run again to verify cache behavior
  - [ ] 6.3: Manual test: verify manifest content is correct

## Dev Notes

### Architecture Context

This is the **first story in Epic 9: Control Catalog Data**. It establishes the data pipeline foundation for NIST 800-53 control data that will be consumed by Epic 3's browsing UI.

**Data Source:**
- Primary: https://github.com/usnistgov/oscal-content
- Catalog: `nist.gov/SP800-53/rev5/json/NIST_SP-800-53_rev5_catalog.json`
- Baselines: `nist.gov/SP800-53/rev5/json/NIST_SP-800-53_rev5_*-baseline_profile.json`

**Key Decisions:**
- Raw OSCAL files are gitignored due to size (~5MB+ combined)
- Manifest tracks download state for reproducibility
- Scripts use TypeScript for type safety and consistency with project

### Project Structure Notes

```
data/
  oscal-raw/           # Gitignored - raw NIST OSCAL downloads
    manifest.json      # Download metadata and checksums
    NIST_SP-800-53_rev5_catalog.json
    NIST_SP-800-53_rev5_LOW-baseline_profile.json
    NIST_SP-800-53_rev5_MODERATE-baseline_profile.json
    NIST_SP-800-53_rev5_HIGH-baseline_profile.json

scripts/
  download-oscal.ts    # Download script
```

### Technical Notes

- Use native `fetch` (Node 18+) for HTTP requests
- SHA256 via `crypto` module for checksums
- `fs/promises` for async file operations
- Consider adding `--force` flag to bypass cache

### References

- [Source: docs/epics.md#Epic-9-Story-9.1] - Story requirements
- [Source: docs/architecture.md#Control-Catalog] - Control catalog architecture
- [NIST OSCAL Content Repository](https://github.com/usnistgov/oscal-content) - Official data source

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
