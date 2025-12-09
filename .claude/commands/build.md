---
name: build
description: Build project for production
---

Build this project for production deployment.

Options based on argument:
- No argument: Build the main application
- `storybook`: Build Storybook static site
- `clean`: Clean dist folder before building

Commands:
- Build: `yarn build`
- Build Storybook: `yarn build-storybook`
- Clean: `yarn clean`

Report build success/failure and any TypeScript or build errors encountered.
