# Story 1.4: Initialize Go CLI Repository

Status: drafted

## Story

As a **developer**,
I want **a separate Go CLI repository initialized**,
so that **CLI development can proceed independently**.

## Acceptance Criteria

1. **Given** decision to use Go for CLI **When** initializing CLI repository **Then** `ssp-cli` repository is created with:
   - Go module initialized (`go.mod`)
   - `cmd/ssp/main.go` entry point with cobra or flag package
   - `internal/commands/` directory structure
   - `internal/storage/` for JSON file operations
   - `internal/types/` matching Web UI types
   - `Makefile` for cross-platform builds

2. `go build ./cmd/ssp` produces a working binary

3. `ssp --help` displays usage information

4. `ssp version` displays version information

5. Basic Makefile targets work:
   - `make build` - builds for current platform
   - `make build-all` - builds for all platforms
   - `make test` - runs Go tests

## Tasks / Subtasks

- [ ] Task 1: Initialize Go module (AC: 1)
  - [ ] Create `ssp-cli/` directory (separate from web UI)
  - [ ] Run `go mod init github.com/[org]/ssp-cli`
  - [ ] Create `.gitignore` for Go projects

- [ ] Task 2: Create directory structure (AC: 1)
  - [ ] Create `cmd/ssp/` for entry point
  - [ ] Create `internal/commands/` for CLI commands
  - [ ] Create `internal/storage/` for file operations
  - [ ] Create `internal/types/` for type definitions
  - [ ] Create `pkg/catalog/` for embedded control catalog

- [ ] Task 3: Implement main entry point (AC: 1, 2, 3)
  - [ ] Create `cmd/ssp/main.go`
  - [ ] Set up cobra root command
  - [ ] Add --help flag handling
  - [ ] Add basic command structure

- [ ] Task 4: Implement version command (AC: 4)
  - [ ] Create `internal/commands/version.go`
  - [ ] Display version, build date, git commit
  - [ ] Use ldflags for build-time injection

- [ ] Task 5: Create type definitions (AC: 1)
  - [ ] Create `internal/types/ssp.go` matching Web UI types
  - [ ] Create `internal/types/control.go` for control types
  - [ ] Ensure JSON serialization compatibility

- [ ] Task 6: Create Makefile (AC: 1, 5)
  - [ ] Add `build` target for current platform
  - [ ] Add `build-all` target for darwin/linux/windows
  - [ ] Add `test` target
  - [ ] Add `clean` target
  - [ ] Include version ldflags

- [ ] Task 7: Verify builds (AC: 2, 5)
  - [ ] Run `make build` and test binary
  - [ ] Run `ssp --help` and verify output
  - [ ] Run `ssp version` and verify output
  - [ ] Run `make test` (even if no tests yet)

## Dev Notes

### Relevant Architecture Patterns and Constraints

- **Separate Repository:** CLI lives in its own repo, not in web UI monorepo
- **Go Version:** 1.21+ required
- **CLI Framework:** Cobra (industry standard for Go CLIs)
- **JSON Format:** Must match Web UI JSON exactly for file interoperability

### Source Tree Components to Touch (in ssp-cli repo)

- `cmd/ssp/main.go` - NEW: Entry point
- `internal/commands/root.go` - NEW: Root cobra command
- `internal/commands/version.go` - NEW: Version command
- `internal/types/ssp.go` - NEW: Type definitions
- `internal/storage/` - NEW: Directory stub
- `go.mod` - NEW: Go module file
- `Makefile` - NEW: Build automation
- `README.md` - NEW: Basic documentation

### Testing Standards Summary

- Go testing with `go test ./...`
- Table-driven tests preferred
- Mock file system for storage tests

### Project Structure Notes

- This story may need to create a new GitHub repository
- Coordinate with user on repository organization/name
- Consider if this should be in same org as web UI

### References

- [Source: docs/architecture.md#Go-CLI-Repository] - Directory structure
- [Source: docs/architecture.md#Go-CLI-Distribution] - Build targets
- [Source: docs/epics.md#Story-1.4] - Original story definition

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
