# Story 1.3: Implement JSON File Storage Service

Status: done

## Story

As a **developer**,
I want **a service for reading/writing SSP JSON files**,
so that **data persists locally and is portable**.

## Acceptance Criteria

1. **Given** type definitions are created **When** implementing storage service **Then** `sspStorage` service provides:

   - `list()`: Load all SSP projects from `~/.ssp-gen/projects/`
   - `get(id)`: Load specific project
   - `save(project)`: Write project to JSON file
   - `delete(id)`: Remove project file
   - Automatic `updatedAt` timestamp on save

2. Service handles file system errors gracefully with proper error types

3. Works in browser using File System Access API where supported

4. Provides download/upload fallback for unsupported browsers

5. Unit tests cover all storage operations

## Tasks / Subtasks

- [x] Task 1: Create storage service structure (AC: 1)

  - [x] Create `src/lib/storage/ssp-storage.ts`
  - [x] Create `src/lib/storage/types.ts` for storage-specific types
  - [x] Create `src/lib/storage/index.ts` barrel export

- [x] Task 2: Implement File System Access API methods (AC: 1, 3)

  - [x] Implement `requestProjectsDirectory()` to get directory handle
  - [x] Implement `list()` to enumerate JSON files
  - [x] Implement `get(id)` to read specific file
  - [x] Implement `save(project)` to write file with timestamp
  - [x] Implement `delete(id)` to remove file

- [x] Task 3: Implement browser fallback (AC: 4)

  - [x] Create `downloadProject(project)` using file-saver
  - [x] Create `uploadProject(file)` using FileReader
  - [x] Detect File System Access API support
  - [x] Provide fallback UI guidance

- [x] Task 4: Implement error handling (AC: 2)

  - [x] Create `StorageError` class with error codes
  - [x] Handle permission denied errors
  - [x] Handle file not found errors
  - [x] Handle JSON parse errors
  - [x] Provide user-friendly error messages

- [x] Task 5: Implement auto-timestamp (AC: 1)

  - [x] Update `updatedAt` on every save
  - [x] Set `createdAt` only on new projects
  - [x] Use ISO 8601 date format

- [x] Task 6: Write unit tests (AC: 5)
  - [x] Create `src/lib/storage/__tests__/ssp-storage.test.ts`
  - [x] Test list operation
  - [x] Test get operation
  - [x] Test save operation
  - [x] Test delete operation
  - [x] Test error handling scenarios

## Dev Notes

### Relevant Architecture Patterns and Constraints

- **File System Access API:** Primary method for browser file access (Chrome, Edge)
- **Fallback Pattern:** Download/upload for Safari, Firefox
- **Storage Location:** `~/.ssp-gen/projects/` (user's home directory)
- **File Format:** JSON with `.json` extension

### Source Tree Components to Touch

- `src/lib/storage/ssp-storage.ts` - NEW: Main storage service
- `src/lib/storage/types.ts` - NEW: Storage error types
- `src/lib/storage/index.ts` - NEW: Barrel export
- `src/lib/storage/__tests__/ssp-storage.test.ts` - NEW: Unit tests

### Testing Standards Summary

- Jest for unit tests
- Mock File System Access API for testing
- Test error scenarios with mock failures

### Project Structure Notes

- Storage service is a dependency for all SSP operations
- Service should be stateless (no caching at service level)
- Consider React Context wrapper in future story

### References

- [Source: docs/architecture.md#File-Operations-Pattern] - Service pattern
- [Source: docs/architecture.md#File-Storage-Locations] - Storage locations
- [Source: docs/epics.md#Story-1.3] - Original story definition

### Learnings from Previous Story

**From Story 1-2-create-ssp-type-definitions (Status: done)**

- **Types Available**: Use types from `src/types/ssp.ts` for `SspProject` interface
- **Import Pattern**: `import { SspProject } from '@/types/ssp'`

## Changelog

| Change                      | Date       | Version | Author    |
| --------------------------- | ---------- | ------- | --------- |
| Story drafted from epics.md | 2025-11-26 | 1.0     | SM Agent  |
| Story implemented           | 2025-11-27 | 1.1     | Dev Agent |

## Dev Agent Record

### Context Reference

Story 1.2 completed - TypeScript types available in `src/types/`

### Agent Model Used

Claude Opus 4 (claude-opus-4-5-20251101)

### Debug Log References

- TypeScript compilation: PASS (no errors)
- Test suite: 59 suites, 256 tests passed (including 23 new storage tests)

### Completion Notes List

1. Created `src/lib/storage/types.ts` with:

   - StorageError class with error codes and user-friendly messages
   - StorageErrorCode type union for categorized errors
   - StorageCapabilities interface for API detection
   - SspProjectMetadata interface for efficient listings
   - StorageMode type for API vs fallback detection

2. Created `src/lib/storage/ssp-storage.ts` with SspStorageService class:

   - File System Access API integration for Chrome/Edge
   - Methods: requestProjectsDirectory(), list(), listMetadata(), get(), save(), create(), delete()
   - Fallback methods: downloadProject(), uploadProject(), createForDownload()
   - Automatic updatedAt timestamp on save
   - Automatic createdAt on create
   - Proper error handling with StorageError

3. Created `src/lib/storage/index.ts` barrel export

4. Created comprehensive test suite with 23 tests covering:
   - Capability detection
   - Storage mode detection
   - Directory access errors
   - Fallback methods (download/upload)
   - Error handling for all error codes
   - Singleton export verification

### File List

**NEW:**

- `src/lib/storage/types.ts` - Storage error types and interfaces
- `src/lib/storage/ssp-storage.ts` - Main storage service implementation
- `src/lib/storage/index.ts` - Barrel export
- `src/lib/storage/__tests__/ssp-storage.test.ts` - Unit tests (23 tests)
