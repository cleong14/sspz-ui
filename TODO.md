# TODO


<!-- vim-markdown-toc GFM -->

* [Repo Setup](#repo-setup)
* [Roadmap](#roadmap)

<!-- vim-markdown-toc -->


## Repo Setup

- [ ] Use GitHub Flow for workflow, avoiding Git Flow.
- [ ] Ensure `README.md` is clear and comprehensive.
- [ ] For Open Source Projects:
    - [ ] Include `CONTRIBUTING.md` with contribution guidelines.
    - [ ] Include `SECURITY.md` with vulnerability reporting info.
    - [ ] Include `LICENSE.md` (e.g., Apache or MIT).
    - [ ] Include `CODE_OF_CONDUCT.MD` outlining behavior standards.
    - [ ] Include `SUPPORT.md` with help and support information.
    - [ ] Define `CODEOWNERS` for review responsibilities.
- [ ] Set default branch to `main`.
- [ ] Enable Issues and Discussion features.
- [ ] Configure Pull Requests:
    - [ ] DISABLE “Allow merge commits”.
    - [ ] ENABLE “Squash merging”.
        - [ ] Set default commit message to “Pull request title and description”.
    - [ ] DISABLE “Allow rebase merging”.
- [ ] ENABLE “Automatically delete head branches”.
- [ ] Configure `main` branch protection ruleset:
    - [ ] Ruleset Name: `main`.
    - [ ] DO NOT add anyone to the bypass list.
    - [ ] Target branches include by pattern: “main”.
    - [ ] Branch Rules:
        - [ ] DISABLE Restrict Creations.
        - [ ] DISABLE Restrict Updates.
        - [ ] DISABLE Restrict Deletions.
        - [ ] ENABLE Require Linear History.
        - [ ] ENABLE Require Signed Commits.
        - [ ] ENABLE Require a pull request before merging.
            - [ ] Required approvals at least 1.
            - [ ] ENABLE Dismiss stale pull request approvals when new commits are pushed.
            - [ ] ENABLE Require approval of the most recent reviewable push.
            - [ ] ENABLE Require conversation resolution before merging.
            - [ ] Configure Allowed Merge Methods:
                - [ ] DISABLE Merge.
                - [ ] ENABLE Squash.
                - [ ] DISABLE Rebase.
        - [ ] ENABLE Block force pushes.
- [ ] Suggested:
    - [ ] Ensure unit tests exist and new code includes new/updated tests.
    - [ ] ENABLE Require status checks to pass in branch protection ruleset.
    - [ ] Consider custom branding.
    - [ ] Consider an accompanying blog about the release.
    - [ ] Delete branch after merge (already covered by "Automatically delete head branches").
    - [ ] Add badges for CI, linting, code coverage, etc.


## Roadmap

- [ ] **Phase 1: Project Kick-off & Foundation**
    - [ ] Task 1.1: Requirements Elaboration
        - [ ] Detail all user input fields and their validation rules.
        - [ ] Specify exact default values for `CONTROL_CATALOG`, `CONTROL_VERSION`, `CONTROL_BASELINE`.
        - [ ] Define the structure and content requirements for the generated SSP.
        - [ ] Identify specific security control frameworks and their versions.
    - [ ] Task 1.2: Technology Stack Selection
        - [ ] Choose frontend framework (e.g., React, Vue, Angular).
        - [ ] Choose backend framework/language (e.g., Python/Flask, Node.js/Express, Go).
        - [ ] Select database system (e.g., PostgreSQL, MongoDB).
        - [ ] Identify libraries/tools for HTML-to-PDF conversion.
    - [ ] Task 1.3: Development Environment Setup
        - [ ] Initialize version control repository (Git).
        - [ ] Configure local development environments for frontend and backend.
        - [ ] Set up CI/CD pipeline basics.

- [ ] **Phase 2: Backend Core Development**
    - [ ] Task 2.1: Database Design & Implementation
        - [ ] Design schemas for `SystemDetails`, `ControlCatalogs`, `SecurityControls`, `Tools`, `ToolControlMappings`.
        - [ ] Implement database migrations and initial data seeding.
    - [ ] Task 2.2: API for System Inputs
        - [ ] Create RESTful API endpoint to accept system input values.
        - [ ] Implement logic to apply default values if not provided.
        - [ ] Store and retrieve user-provided system details.
    - [ ] Task 2.3: Security Controls & Tools Management
        - [ ] Develop internal APIs/logic for managing and querying `SecurityControls` and `Tools`.
        - [ ] Implement logic to retrieve relevant security controls based on selections.
        - [ ] Implement API for managing `ToolControlMappings`.
    - [ ] Task 2.4: SSP Generation Logic
        - [ ] Develop a robust SSP data model (in-memory representation).
        - [ ] Implement a templating engine to populate SSP data into a structured format.

- [ ] **Phase 3: Frontend Development**
    - [ ] Task 3.1: System Details Input UI
        - [ ] Build a web form for `SYSTEM_NAME`, `SYSTEM_VERSION`.
        - [ ] Implement dropdowns for `CONTROL_CATALOG`, `CONTROL_VERSION`, `CONTROL_BASELINE` with dynamic defaults.
        - [ ] Implement client-side validation.
    - [ ] Task 3.2: Tool Selection UI
        - [ ] Create a dropdown or multi-select interface for tool selection.
        - [ ] Display relevant security controls dynamically based on tool selections.
    - [ ] Task 3.3: SSP Generation & Preview Display
        - [ ] Implement "Generate SSP" button to send user inputs to the backend API.
        - [ ] Receive the generated SSP content (as HTML) from the backend.
        - [ ] Render the HTML SSP preview in the web UI.
    - [ ] Task 3.4: SSP Download Options
        - [ ] Implement buttons/links for "Download as PDF", "Download as CSV", "Download as JSON".
        - [ ] Trigger backend endpoints for file conversions and downloads.

- [ ] **Phase 4: Output Conversion & Delivery**
    - [ ] Task 4.1: HTML SSP Conversion Service
        - [ ] Develop a backend service that renders structured SSP data into HTML.
    - [ ] Task 4.2: PDF Conversion Service
        - [ ] Integrate a PDF generation library.
        - [ ] Create a backend endpoint to convert HTML SSP into PDF for download.
    - [ ] Task 4.3: CSV Conversion Service
        - [ ] Create a backend endpoint to extract key SSP data and convert to CSV for download.
    - [ ] Task 4.4: JSON Conversion Service
        - [ ] Create a backend endpoint to convert the complete SSP data model into a structured JSON for download.

- [ ] **Phase 5: Testing, Deployment & Documentation**
    - [ ] Task 5.1: Unit & Integration Testing
        - [ ] Write comprehensive unit tests for all backend services.
        - [ ] Write integration tests for database and frontend-backend communication.
    - [ ] Task 5.2: End-to-End Testing
        - [ ] Develop automated end-to-end tests covering the entire user flow.
    - [ ] Task 5.3: Security Testing
        - [ ] Perform vulnerability scanning and basic penetration testing.
    - [ ] Task 5.4: Deployment
        - [ ] Deploy the application to a staging environment for UAT.
        - [ ] Deploy to production environment.
    - [ ] Task 5.5: Documentation
        - [ ] Create user guides for the web UI.
        - [ ] Document the SSP generation process and control mappings.
        - [ ] Develop API documentation and deployment guides.
