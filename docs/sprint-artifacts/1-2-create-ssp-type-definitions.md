# Story 1.2: Create SSP Type Definitions

Status: drafted

## Story

As a **developer**,
I want **TypeScript type definitions for SSP data structures**,
so that **I have type safety across the application**.

## Acceptance Criteria

1. **Given** template TypeScript configuration **When** creating type definitions **Then** types are defined for:

   - `SspProject` (id, name, baseline, status, systemInfo, implementations)
   - `ControlImplementation` (controlId, status, statement, aiGenerated)
   - `Control`, `ControlFamily`, `ControlCatalog`
   - `Tool`, `ToolControlMapping`
   - All enums (`Baseline`, `SspStatus`, `ImplementationStatus`, `ImpactLevel`)

2. Types match the Architecture doc "JSON File Schema" section exactly

3. Types are exported from `src/types/` directory with proper barrel exports

4. TypeScript strict mode passes with no errors (`yarn tsc --noEmit`)

5. IntelliSense works correctly in IDE when using the types

## Tasks / Subtasks

- [ ] Task 1: Create SSP project types (AC: 1, 2)

  - [ ] Create `src/types/ssp.ts` with `SspProject` interface
  - [ ] Define `SystemInfo`, `SystemComponent`, `Contact` interfaces
  - [ ] Define `Baseline`, `SspStatus`, `ImpactLevel` enums
  - [ ] Match structure from architecture.md JSON File Schema

- [ ] Task 2: Create control implementation types (AC: 1, 2)

  - [ ] Create `src/types/control.ts` with `ControlImplementation` interface
  - [ ] Define `ImplementationStatus` enum
  - [ ] Define `Evidence` interface for attachments
  - [ ] Define inherited control structure

- [ ] Task 3: Create control catalog types (AC: 1, 2)

  - [ ] Add `Control`, `ControlFamily`, `ControlCatalog` interfaces to `control.ts`
  - [ ] Define `ControlParameter` interface
  - [ ] Support nested control enhancements

- [ ] Task 4: Create tool library types (AC: 1, 2)

  - [ ] Create `src/types/tool.ts` with `Tool` interface
  - [ ] Define `ToolControlMapping` interface
  - [ ] Define `ToolCategory` type union
  - [ ] Define confidence levels type

- [ ] Task 5: Create barrel export (AC: 3)

  - [ ] Create `src/types/index.ts`
  - [ ] Export all types from ssp.ts, control.ts, tool.ts
  - [ ] Ensure clean public API

- [ ] Task 6: Verify TypeScript compilation (AC: 4)

  - [ ] Run `yarn tsc --noEmit`
  - [ ] Fix any type errors

- [ ] Task 7: Test IntelliSense (AC: 5)
  - [ ] Create sample usage in a test file
  - [ ] Verify autocomplete works for all types
  - [ ] Verify documentation comments appear in hover

## Dev Notes

### Relevant Architecture Patterns and Constraints

- **TypeScript Strict Mode:** All types must be fully defined, no implicit any
- **JSON Compatibility:** Types must serialize cleanly to JSON (no functions, no circular refs)
- **Naming Convention:** PascalCase for interfaces/types, SCREAMING_SNAKE for enum values

### Source Tree Components to Touch

- `src/types/ssp.ts` - NEW: SSP project types
- `src/types/control.ts` - NEW: Control and implementation types
- `src/types/tool.ts` - NEW: Tool library types
- `src/types/index.ts` - NEW: Barrel export

### Testing Standards Summary

- Type definitions don't need unit tests
- Compilation check validates correctness
- IntelliSense verification is manual

### Project Structure Notes

- Types directory should match template patterns
- Use JSDoc comments for documentation that appears in IntelliSense
- Consider `readonly` modifiers where appropriate

### References

- [Source: docs/architecture.md#JSON-File-Schema] - Complete type definitions
- [Source: docs/architecture.md#Data-Architecture] - Type structure overview
- [Source: docs/epics.md#Story-1.2] - Original story definition

## Changelog

| Change                      | Date       | Version | Author   |
| --------------------------- | ---------- | ------- | -------- |
| Story drafted from epics.md | 2025-11-26 | 1.0     | SM Agent |

## Dev Agent Record

### Context Reference

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
