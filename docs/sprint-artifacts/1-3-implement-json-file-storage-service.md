# Story 1.3: Implement JSON File Storage Service

Status: drafted

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

- [ ] Task 1: Create storage service structure (AC: 1)
  - [ ] Create `src/lib/storage/ssp-storage.ts`
  - [ ] Create `src/lib/storage/types.ts` for storage-specific types
  - [ ] Create `src/lib/storage/index.ts` barrel export

- [ ] Task 2: Implement File System Access API methods (AC: 1, 3)
  - [ ] Implement `requestProjectsDirectory()` to get directory handle
  - [ ] Implement `list()` to enumerate JSON files
  - [ ] Implement `get(id)` to read specific file
  - [ ] Implement `save(project)` to write file with timestamp
  - [ ] Implement `delete(id)` to remove file

- [ ] Task 3: Implement browser fallback (AC: 4)
  - [ ] Create `downloadProject(project)` using file-saver
  - [ ] Create `uploadProject(file)` using FileReader
  - [ ] Detect File System Access API support
  - [ ] Provide fallback UI guidance

- [ ] Task 4: Implement error handling (AC: 2)
  - [ ] Create `StorageError` class with error codes
  - [ ] Handle permission denied errors
  - [ ] Handle file not found errors
  - [ ] Handle JSON parse errors
  - [ ] Provide user-friendly error messages

- [ ] Task 5: Implement auto-timestamp (AC: 1)
  - [ ] Update `updatedAt` on every save
  - [ ] Set `createdAt` only on new projects
  - [ ] Use ISO 8601 date format

- [ ] Task 6: Write unit tests (AC: 5)
  - [ ] Create `src/lib/storage/__tests__/ssp-storage.test.ts`
  - [ ] Test list operation
  - [ ] Test get operation
  - [ ] Test save operation
  - [ ] Test delete operation
  - [ ] Test error handling scenarios

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

**From Story 1-2-create-ssp-type-definitions (Expected Status: drafted)**

- **Types Available**: Use types from `src/types/ssp.ts` for `SspProject` interface
- **Import Pattern**: `import { SspProject } from '@/types'`

## Changelog

| Change | Date | Version | Author |
|--------|------|---------|--------|
| Story drafted from epics.md | 2025-11-26 | 1.0 | SM Agent |

## Dev Agent Record

### Context Reference

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
