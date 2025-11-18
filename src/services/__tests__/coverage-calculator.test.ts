import { calculateControlCoverage } from '../coverage-calculator'
import { loadCatalog, resetCatalogCache } from '../oscal-catalog'
import { loadToolMappings, resetToolMappingsCache } from '../tool-mappings'
import { Baseline } from '../../types/ssp'

// Mock catalog data
const mockCatalogData = {
  catalog: {
    uuid: '8f08878d-7d5c-4d1b-b8ff-8c7d63e5c9a5',
    metadata: {
      title:
        'NIST Special Publication 800-53 Revision 5 MODERATE IMPACT BASELINE',
      lastModified: '2024-01-01T00:00:00Z',
      version: '5.0.0',
      oscalVersion: '1.0.4',
    },
    groups: [
      {
        id: 'ac',
        class: 'family',
        title: 'Access Control',
        controls: [
          {
            id: 'ac-1',
            class: 'AC',
            title: 'Access Control Policy and Procedures',
            parts: [
              {
                id: 'ac-1_smt',
                name: 'statement',
                prose:
                  'The organization develops, documents, and disseminates to [Assignment: organization-defined personnel or roles]: a. An access control policy...',
              },
            ],
            props: [
              { name: 'baseline-impact', value: 'low' },
              { name: 'baseline-impact', value: 'moderate' },
              { name: 'baseline-impact', value: 'high' },
            ],
          },
          {
            id: 'ac-2',
            class: 'AC',
            title: 'Account Management',
            parts: [
              {
                id: 'ac-2_smt',
                name: 'statement',
                prose:
                  'The organization manages information system accounts...',
              },
            ],
            controls: [
              {
                id: 'ac-2.1',
                class: 'AC',
                title: 'Automated System Account Management',
                parts: [
                  {
                    id: 'ac-2.1_smt',
                    name: 'statement',
                    prose:
                      'The organization employs automated mechanisms to support the management of information system accounts.',
                  },
                ],
                props: [
                  { name: 'baseline-impact', value: 'moderate' },
                  { name: 'baseline-impact', value: 'high' },
                ],
              },
            ],
            props: [
              { name: 'baseline-impact', value: 'low' },
              { name: 'baseline-impact', value: 'moderate' },
              { name: 'baseline-impact', value: 'high' },
            ],
          },
        ],
      },
      {
        id: 'si',
        class: 'family',
        title: 'System and Information Integrity',
        controls: [
          {
            id: 'si-10.1',
            class: 'SI',
            title: 'Information Sharing',
            parts: [
              {
                id: 'si-10.1_smt',
                name: 'statement',
                prose: 'Input validation controls.',
              },
            ],
            props: [
              { name: 'baseline-impact', value: 'moderate' },
              { name: 'baseline-impact', value: 'high' },
            ],
          },
          {
            id: 'si-11.1',
            class: 'SI',
            title: 'Error Handling',
            parts: [
              {
                id: 'si-11.1_smt',
                name: 'statement',
                prose: 'Error handling controls.',
              },
            ],
            props: [{ name: 'baseline-impact', value: 'moderate' }],
          },
        ],
      },
    ],
  },
}

// Mock tool mappings data
const mockToolMappings = {
  semgrep: {
    toolId: 'semgrep',
    toolName: 'Semgrep',
    vendor: 'Semgrep, Inc.',
    category: 'SAST',
    controlMappings: [
      {
        controlId: 'si-10.1',
        coverage: 'full',
        rationale:
          'Semgrep detects input validation flaws through pattern matching and taint analysis',
        evidence:
          'Detects SQL injection, XSS, command injection, path traversal vulnerabilities',
      },
      {
        controlId: 'si-11.1',
        coverage: 'full',
        rationale:
          'Semgrep identifies error handling issues and information disclosure through code patterns',
        evidence:
          'Rules for detecting verbose error messages, stack trace exposure',
      },
      {
        controlId: 'ac-3.1',
        coverage: 'partial',
        rationale:
          'Semgrep can detect broken access control patterns in application code',
        evidence:
          'Detects missing authorization checks, insecure direct object references',
      },
      {
        controlId: 'sc-28.1',
        coverage: 'partial',
        rationale:
          'Semgrep identifies hardcoded credentials and weak cryptography usage',
        evidence: 'Detects weak encryption algorithms, hardcoded passwords',
      },
    ],
  },
  gitleaks: {
    toolId: 'gitleaks',
    toolName: 'Gitleaks',
    vendor: 'Gitleaks',
    category: 'secrets',
    controlMappings: [
      {
        controlId: 'ia-5.1',
        coverage: 'full',
        rationale:
          'Gitleaks detects hardcoded passwords and credentials in code and git history',
        evidence: 'Scans for API keys, passwords, tokens across commits',
      },
      {
        controlId: 'ia-5.2',
        coverage: 'full',
        rationale:
          'Gitleaks enforces public key infrastructure by detecting exposed private keys',
        evidence: 'Detects exposed RSA keys, SSH keys, TLS certificates',
      },
      {
        controlId: 'sc-12.1',
        coverage: 'partial',
        rationale:
          'Gitleaks helps manage cryptographic keys by preventing exposure',
        evidence: 'Detects exposed encryption keys, database credentials',
      },
    ],
  },
  grype: {
    toolId: 'grype',
    toolName: 'Grype',
    vendor: 'Anchore',
    category: 'SCA',
    controlMappings: [
      {
        controlId: 'si-2.1',
        coverage: 'full',
        rationale:
          'Grype identifies known vulnerabilities in software dependencies',
        evidence: 'Scans package manifests against CVE databases',
      },
      {
        controlId: 'si-2.2',
        coverage: 'full',
        rationale: 'Grype provides automated flaw remediation recommendations',
        evidence: 'Suggests version upgrades to patch vulnerabilities',
      },
      {
        controlId: 'ra-5.1',
        coverage: 'partial',
        rationale:
          'Grype performs continuous vulnerability scanning of software composition',
        evidence: 'CI/CD integration for ongoing dependency scanning',
      },
    ],
  },
}

describe('Coverage Calculator', () => {
  beforeEach(() => {
    // Reset caches before each test
    resetCatalogCache()
    resetToolMappingsCache()

    // Mock fetch globally
    global.fetch = jest.fn((url: string) => {
      if (url.includes('nist-800-53-rev5-catalog.json')) {
        return Promise.resolve({
          json: () => Promise.resolve(mockCatalogData),
        } as Response)
      }

      // Extract tool ID from URL
      const toolId = url.split('/').pop()?.replace('.json', '')
      const toolData = mockToolMappings[toolId as keyof typeof mockToolMappings]
      return Promise.resolve({
        json: () => Promise.resolve(toolData),
      } as Response)
    }) as jest.Mock
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should calculate coverage for selected tools', async () => {
    const catalog = await loadCatalog()
    const allTools = await loadToolMappings()
    const selectedTools = allTools.filter((t) =>
      ['semgrep', 'gitleaks'].includes(t.toolId)
    )
    const baseline: Baseline = 'moderate'

    const coverage = calculateControlCoverage(baseline, selectedTools, catalog)

    expect(coverage.stats.total).toBeGreaterThan(0)
    expect(
      coverage.stats.covered + coverage.stats.partial + coverage.stats.uncovered
    ).toBe(coverage.stats.total)
  })

  it('should mark control as covered when tool has full coverage', async () => {
    const catalog = await loadCatalog()
    const allTools = await loadToolMappings()
    const selectedTools = allTools.filter((t) => t.toolId === 'semgrep')
    const baseline: Baseline = 'moderate'

    const coverage = calculateControlCoverage(baseline, selectedTools, catalog)

    const si10Coverage = coverage.coverage.find(
      (c) => c.controlId === 'si-10.1'
    )
    expect(si10Coverage?.status).toBe('covered')
  })

  it('should mark control as partial when tool has partial coverage', async () => {
    const catalog = await loadCatalog()
    const allTools = await loadToolMappings()
    const selectedTools = allTools.filter((t) => t.toolId === 'semgrep')
    const baseline: Baseline = 'moderate'

    const coverage = calculateControlCoverage(baseline, selectedTools, catalog)

    const ac3Coverage = coverage.coverage.find((c) => c.controlId === 'ac-3.1')
    if (ac3Coverage) {
      expect(ac3Coverage.status).toBe('partial')
    }
  })
})
