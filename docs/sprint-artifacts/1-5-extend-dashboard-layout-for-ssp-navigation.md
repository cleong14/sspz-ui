# Story 1.5: Extend Dashboard Layout for SSP Navigation

Status: drafted

## Story

As a **developer**,
I want **the template dashboard layout extended with SSP navigation**,
so that **users can navigate to all SSP features**.

## Acceptance Criteria

1. **Given** template AppLayout exists **When** extending navigation **Then** sidebar includes:

   - Dashboard (home)
   - Projects (SSP list)
   - Control Catalog
   - Tool Library
   - Settings

2. `AppDrawerButtonList` is updated with new routes

3. Breadcrumbs work for nested routes (e.g., Projects > Project Name)

4. Mobile navigation (drawer) works correctly

5. All new navigation items have proper icons

6. Navigation preserves template styling (Federal Blue theme)

## Tasks / Subtasks

- [ ] Task 1: Add new route constants (AC: 1, 2)

  - [ ] Update `src/router/constants.ts` with new routes
  - [ ] Add: `/dashboard`, `/projects`, `/controls`, `/tools`, `/settings`
  - [ ] Add nested routes: `/projects/:id`, `/projects/:id/edit`

- [ ] Task 2: Create placeholder views (AC: 1)

  - [ ] Create `src/views/Dashboard/Dashboard.tsx` placeholder
  - [ ] Create `src/views/Projects/ProjectList.tsx` placeholder
  - [ ] Create `src/views/Controls/ControlCatalog.tsx` placeholder
  - [ ] Create `src/views/Tools/ToolLibrary.tsx` placeholder
  - [ ] Ensure placeholders render route name

- [ ] Task 3: Update router configuration (AC: 2)

  - [ ] Update `src/router/router.tsx` with new routes
  - [ ] Add protected route wrappers where needed
  - [ ] Set up nested route structure for projects

- [ ] Task 4: Update navigation drawer (AC: 1, 2, 5)

  - [ ] Update `AppDrawerButtonList` component
  - [ ] Add navigation items with icons:
    - Dashboard: `DashboardIcon`
    - Projects: `FolderIcon`
    - Controls: `SecurityIcon` or `ShieldIcon`
    - Tools: `BuildIcon`
    - Settings: `SettingsIcon`
  - [ ] Ensure active state highlights correctly

- [ ] Task 5: Implement breadcrumbs (AC: 3)

  - [ ] Create or extend breadcrumb component
  - [ ] Configure breadcrumbs for nested routes
  - [ ] Show project name in breadcrumb when on project page

- [ ] Task 6: Test mobile navigation (AC: 4)

  - [ ] Verify drawer opens/closes on mobile
  - [ ] Verify all items accessible
  - [ ] Test touch interactions

- [ ] Task 7: Verify styling consistency (AC: 6)
  - [ ] Check Federal Blue theme applied
  - [ ] Verify MUI component styling
  - [ ] Test dark mode if supported

## Dev Notes

### Relevant Architecture Patterns and Constraints

- **Template Layout:** Extend existing `AppLayout` component
- **MUI Icons:** Use Material-UI icons package
- **React Router:** v6 routing patterns
- **Protected Routes:** Use existing `authLoader` pattern

### Source Tree Components to Touch

- `src/router/constants.ts` - MODIFIED: Add route constants
- `src/router/router.tsx` - MODIFIED: Add new routes
- `src/layouts/AppLayout/AppDrawerButtonList.tsx` - MODIFIED: Add nav items
- `src/views/Dashboard/Dashboard.tsx` - NEW: Placeholder
- `src/views/Projects/ProjectList.tsx` - NEW: Placeholder
- `src/views/Controls/ControlCatalog.tsx` - NEW: Placeholder
- `src/views/Tools/ToolLibrary.tsx` - NEW: Placeholder

### Testing Standards Summary

- Verify navigation renders all items
- Test route transitions
- Mobile responsive testing

### Project Structure Notes

- Views follow template pattern with folder per view
- Keep placeholders simple - implementation comes in later stories
- Navigation structure should match UX design spec

### References

- [Source: docs/architecture.md#Project-Structure] - View organization
- [Source: docs/ux-design-specification.md#Section-4.1] - Navigation design
- [Source: docs/epics.md#Story-1.5] - Original story definition

### Learnings from Previous Story

**From Story 1-1 (Expected Status: done)**

- Dependencies installed and verified working
- Use MUI icons from `@mui/icons-material`

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
