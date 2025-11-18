import {
  loadToolMappings,
  getToolById,
  getToolsByCategory,
  resetToolMappingsCache,
} from '../tool-mappings'

// Mock data for tool mappings
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

describe('Tool Mappings Service', () => {
  beforeEach(() => {
    // Reset the cached tools before each test
    resetToolMappingsCache()
    // Mock fetch globally
    global.fetch = jest.fn((url: string) => {
      const toolId = url.split('/').pop()?.replace('.json', '')
      const toolData = mockToolMappings[toolId as keyof typeof mockToolMappings]
      return Promise.resolve({
        json: () => Promise.resolve(toolData),
      })
    }) as jest.Mock
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should load all bundled tool mappings', async () => {
    const tools = await loadToolMappings()
    expect(tools.length).toBeGreaterThan(0)
  })

  it('should get tool by ID', async () => {
    const tools = await loadToolMappings()
    const semgrep = getToolById(tools, 'semgrep')
    expect(semgrep).toBeDefined()
    expect(semgrep?.toolName).toBe('Semgrep')
  })

  it('should filter tools by category', async () => {
    const tools = await loadToolMappings()
    const sastTools = getToolsByCategory(tools, 'SAST')
    expect(sastTools.length).toBeGreaterThan(0)
    expect(sastTools.every((t) => t.category === 'SAST')).toBe(true)
  })
})
