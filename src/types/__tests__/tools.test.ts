import { ToolControlMapping, ToolCategory } from '../tools'

describe('Tool Types', () => {
  it('should create valid tool control mapping', () => {
    const tool: ToolControlMapping = {
      toolId: 'semgrep',
      toolName: 'Semgrep',
      vendor: 'Semgrep, Inc.',
      category: 'SAST',
      controlMappings: [
        {
          controlId: 'si-10.1',
          coverage: 'full',
          rationale: 'Semgrep detects input validation flaws',
        },
      ],
    }

    expect(tool.category).toBe('SAST')
    expect(tool.controlMappings).toHaveLength(1)
  })
})
