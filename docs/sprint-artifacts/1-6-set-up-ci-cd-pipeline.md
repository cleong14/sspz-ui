# Story 1.6: Set Up CI/CD Pipeline

Status: drafted

## Story

As a **developer**,
I want **GitHub Actions CI/CD configured**,
so that **code quality is enforced and deployments are automated**.

## Acceptance Criteria

1. **Given** project repository exists **When** configuring CI/CD **Then** GitHub Actions workflows include:
   - `ci.yml`: Lint, type-check, unit tests on PR
   - `deploy.yml`: Deploy to static hosting (Vercel/Netlify) on main branch
   - Environment secrets for AWS Cognito configured

2. PR checks block merge on failure

3. Preview deployments work for PRs

4. Production deployment triggers on merge to main

5. All workflow steps complete within reasonable time (<10 minutes)

## Tasks / Subtasks

- [ ] Task 1: Create CI workflow (AC: 1, 2)
  - [ ] Create `.github/workflows/ci.yml`
  - [ ] Add Node.js setup step
  - [ ] Add yarn install with cache
  - [ ] Add lint step (`yarn lint`)
  - [ ] Add type-check step (`yarn tsc --noEmit`)
  - [ ] Add test step (`yarn test`)
  - [ ] Configure to run on PR

- [ ] Task 2: Create deployment workflow (AC: 1, 4)
  - [ ] Create `.github/workflows/deploy.yml`
  - [ ] Add build step (`yarn build`)
  - [ ] Configure Vercel/Netlify deployment action
  - [ ] Add production deployment on main merge
  - [ ] Add preview deployment on PR

- [ ] Task 3: Configure environment secrets (AC: 1)
  - [ ] Document required secrets in README
  - [ ] Add VITE_AWS_REGION secret
  - [ ] Add VITE_COGNITO_USER_POOL_ID secret
  - [ ] Add VITE_COGNITO_CLIENT_ID secret
  - [ ] Add deployment platform token (VERCEL_TOKEN or NETLIFY_AUTH_TOKEN)

- [ ] Task 4: Configure branch protection (AC: 2)
  - [ ] Document branch protection rules needed
  - [ ] Require CI checks to pass
  - [ ] Require PR reviews (optional)

- [ ] Task 5: Test CI workflow (AC: 1, 5)
  - [ ] Create test PR
  - [ ] Verify lint step runs
  - [ ] Verify type-check step runs
  - [ ] Verify test step runs
  - [ ] Verify completion time

- [ ] Task 6: Test deployment workflow (AC: 3, 4)
  - [ ] Verify preview deployment on PR
  - [ ] Verify production deployment on main
  - [ ] Test deployed site functionality

- [ ] Task 7: Update documentation (AC: 1)
  - [ ] Update README with CI/CD info
  - [ ] Document required GitHub secrets
  - [ ] Document deployment process

## Dev Notes

### Relevant Architecture Patterns and Constraints

- **Static Hosting:** Vercel or Netlify (no backend server)
- **Environment Variables:** Build-time via VITE_ prefix
- **Node Version:** 20.x LTS (match local development)
- **Package Manager:** Yarn 4.x

### Source Tree Components to Touch

- `.github/workflows/ci.yml` - NEW: CI workflow
- `.github/workflows/deploy.yml` - NEW: Deploy workflow
- `README.md` - MODIFIED: Add CI/CD documentation
- `.env.example` - MODIFIED: Document all env vars

### Testing Standards Summary

- CI runs existing test suite
- No new tests needed for this story
- Manual verification of deployment

### Project Structure Notes

- Template may have partial CI/CD already - extend if present
- Consider reusable workflow actions
- Cache node_modules for faster builds

### References

- [Source: docs/architecture.md#Deployment-Architecture] - Deployment strategy
- [Source: docs/architecture.md#Development-Environment] - Build commands
- [Source: docs/epics.md#Story-1.6] - Original story definition

### Learnings from Previous Story

**From Story 1-1 through 1-5 (Expected)**

- All dependencies and tests should be working
- Navigation routes established
- Build process verified locally

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
