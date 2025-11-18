# SSP Generator Web Application - System Design

## Overview

The SSP Generator is a client-side React application that helps security and compliance teams author NIST SP 800-53 Rev 5 System Security Plans (SSPs) using pre-mapped security tool coverage, AI-assisted implementation text, and OSCAL-first data structures. All processing occurs in the browser, enabling offline-friendly and air-gapped deployments while supporting multiple export formats for audit delivery.

## Architecture

- **Client-only delivery:** React + TypeScript front-end served as a static bundle. No application server is required beyond hosting static assets.
- **State management:** Project state is held in React Context and persisted to IndexedDB for draft autosave. Tool mappings and OSCAL catalog content are bundled as static assets and hydrated at runtime.
- **Module boundaries:**
  - **Presentation:** Wizard and dashboard flows, Material UI components, export wizards.
  - **Domain services:** OSCAL parsing/generation, control coverage engine, AI orchestration, and export formatters.
  - **Data access:** IndexedDB adapter for drafts, local catalog/tool mapping loaders, and provider configuration storage.
- **Performance and resilience:** Web Workers for heavy OSCAL parsing, virtualized control tables, debounced autosave, and defensive validation around imports/exports.

## Data Models

- **SSP project (OSCAL-inspired):**
  - Metadata (title, version, lastModified, oscalVersion)
  - System characteristics (name, ID, description, type, FIPS-199 impact levels, authorization boundary)
  - Baseline selection (low | moderate | high)
  - Selected tools with configuration and optional custom mappings
  - Control implementations with status, responsible role, description, and tool references
  - Responsible parties and optional custom fields
- **Security tool mapping:** toolId, toolName, vendor, category, default configuration, and `controlMappings` entries with controlId, coverage (full|partial), rationale, and evidence.
- **Custom tool upload schema:** JSON schema enforcing required identifiers, category enumeration, controlId patterns, and rationale/evidence fields for uploaded mappings.

## User Workflows

- **Quick Start wizard (5 steps):** project basics → baseline selection → tool selection/upload → control review with coverage preview → AI-assisted implementation descriptions with inline editing.
- **Advanced dashboard:** single-page view for system info, baseline & tools with live coverage stats, control matrix with filtering, responsible parties, custom fields, and export options.
- **Project management:** landing page for new/imported projects, OSCAL import validation, 30-second autosave to IndexedDB, and draft clearing after export.

## AI Integration

- **Pluggable provider interface:** abstract `AIProvider` supporting OAuth and API-key flows with configuration validation and generation preferences (length, technical level, tone, evidence/references toggles).
- **Supported providers:** Anthropic Claude (OAuth or API key, including Claude 4.5 Sonnet/Haiku and 4.1 Opus), OpenAI (GPT-5 and GPT-5-Codex), Ollama for local/offline use, and custom OpenAI-compatible endpoints.
- **Generation flow:** prompt builder collects control text, enhancements, system context, tool capabilities/rationales, and user preferences; calls provider API with streaming responses; user can accept, edit, regenerate, or reject outputs.

## Pre-mapped Security Tools

Initial library of nine tools with NIST 800-53 enhancement-level mappings:

1. **Semgrep** (SAST) – si-10.1, si-11.1, ac-3.1, sc-28.1, etc.
2. **Gitleaks** (Secrets) – ia-5.1, ia-5.2, sc-12.1
3. **Grype** (SCA) – si-2.1, si-2.2, ra-5.1
4. **OWASP ZAP** (DAST) – sa-11.1, ra-5.1, si-11.1
5. **Snyk** (SCA/Container) – si-2.1, si-2.2, ra-5.1, cm-2.1
6. **KICS** (IaC) – cm-2.1, cm-6.1, sc-7.1
7. **SonarQube** (SAST/Quality) – sa-11.1, si-10.1, si-11.1
8. **Nessus** (Vulnerability Scanning) – ra-5.1, ra-5.2, si-2.1
9. **Trivy** (Container/IaC) – si-2.1, cm-2.1, ra-5.1

## Export Capabilities

- **OSCAL (primary):** JSON and optional XML outputs fully aligned to OSCAL SSP structure and bundled baselines.
- **PDF:** jsPDF-based templates (Standard, NIST-styled, or custom) covering cover page, TOC, system overview, tools, control implementations, and appendices.
- **DOCX:** docx.js templates mirroring PDF structure for editable distribution, with optional custom template support.
- **Markdown:** structured headings/tables for git-based workflows.

## Technical Considerations

- **Error handling:** granular OSCAL import validation, AI retries with exponential backoff and manual fallback, catalog loading validation, and completeness checks before export.
- **Performance:** virtualized control grids, Web Worker parsing, lazy-loading control families, memoized coverage stats, and debounced autosave.
- **Security:** client-only processing, HTTPS requirement for OAuth, encrypted API-key storage via Web Crypto, strict input validation, CSP-backed XSS prevention, and no data transmission to servers except explicit AI provider calls.
- **Testing strategy:** unit tests for OSCAL parsing/generation, coverage calculations, mapping resolution, and export formatters; integration tests for full SSP lifecycle and AI/provider flows; Playwright E2E for wizard completion, advanced dashboard, import/export, export formats, and custom tool uploads.
- **Deployment:** optimized static builds targeting ES2020 for Netlify, Vercel, CloudFront/S3, GitHub Pages, or self-hosted (including air-gapped) environments; source maps disabled by default.
