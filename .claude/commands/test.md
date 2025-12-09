---
name: test
description: Run Jest tests with various options
---

Run tests for this project using Jest.

Options based on argument:
- No argument: Run all tests with coverage
- `watch`: Run tests in watch mode for changed files
- `ci`: Run in CI mode with full coverage
- A file path: Run tests for that specific file

Commands:
- Default: `yarn test`
- Watch: `yarn test:watch`
- CI: `yarn test:ci`
- Specific file: `yarn test -- $ARGUMENTS`

After running, summarize the test results including pass/fail counts and any failures.
