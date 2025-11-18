# SSP Generator Wizard Completion Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete the Quick Start Wizard MVP by implementing steps 2-5 and wizard orchestration

**Architecture:** Five wizard steps with container orchestration, real-time coverage calculation, IndexedDB persistence after each step, Material-UI components following existing patterns

**Tech Stack:** React, TypeScript, Material-UI, React Hook Form, Yup validation, IndexedDB

---

## Task 8: Baseline Selection Step

**Files:**

- Create: `src/components/wizard/BaselineSelectionStep.tsx`
- Create: `src/components/wizard/__tests__/BaselineSelectionStep.test.tsx`

### Step 1: Write failing test for baseline selection rendering

```typescript
// src/components/wizard/__tests__/BaselineSelectionStep.test.tsx
import { render, screen } from '@testing-library/react'
import { BaselineSelectionStep } from '../BaselineSelectionStep'

describe('BaselineSelectionStep', () => {
  it('renders step title', () => {
    const mockOnNext = jest.fn()
    render(<BaselineSelectionStep onNext={mockOnNext} />)

    expect(screen.getByText(/Step 2: Baseline Selection/i)).toBeInTheDocument()
  })
})
```

### Step 2: Run test to verify it fails

Run: `npm test -- BaselineSelectionStep.test.tsx`
Expected: FAIL with "Unable to find BaselineSelectionStep"

### Step 3: Write minimal component implementation

```typescript
// src/components/wizard/BaselineSelectionStep.tsx
import React from 'react'
import { Box, Typography } from '@mui/material'
import { Baseline } from '../../types/ssp'

interface BaselineSelectionStepProps {
  onNext: (baseline: Baseline) => void
  initialBaseline?: Baseline
}

export function BaselineSelectionStep({
  onNext,
  initialBaseline,
}: BaselineSelectionStepProps) {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Step 2: Baseline Selection
      </Typography>
    </Box>
  )
}
```

### Step 4: Run test to verify it passes

Run: `npm test -- BaselineSelectionStep.test.tsx`
Expected: PASS

### Step 5: Write test for baseline options rendering

```typescript
// Add to BaselineSelectionStep.test.tsx
it('renders all three baseline options', () => {
  const mockOnNext = jest.fn()
  render(<BaselineSelectionStep onNext={mockOnNext} />)

  expect(screen.getByText(/Low Baseline/i)).toBeInTheDocument()
  expect(screen.getByText(/Moderate Baseline/i)).toBeInTheDocument()
  expect(screen.getByText(/High Baseline/i)).toBeInTheDocument()
})
```

### Step 6: Run test to verify it fails

Run: `npm test -- BaselineSelectionStep.test.tsx`
Expected: FAIL - baseline options not found

### Step 7: Implement baseline selection UI with cards

```typescript
// Update src/components/wizard/BaselineSelectionStep.tsx
import React, { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Button,
  Grid,
} from '@mui/material'
import { Baseline } from '../../types/ssp'

interface BaselineSelectionStepProps {
  onNext: (baseline: Baseline) => void
  initialBaseline?: Baseline
}

interface BaselineOption {
  value: Baseline
  title: string
  description: string
  controlCount: string
}

const baselineOptions: BaselineOption[] = [
  {
    value: 'low',
    title: 'Low Baseline',
    description: 'Minimal security controls for low-impact systems',
    controlCount: '~125 controls',
  },
  {
    value: 'moderate',
    title: 'Moderate Baseline',
    description: 'Standard controls for moderate-impact systems',
    controlCount: '~325 controls',
  },
  {
    value: 'high',
    title: 'High Baseline',
    description: 'Comprehensive controls for high-impact systems',
    controlCount: '~420 controls',
  },
]

export function BaselineSelectionStep({
  onNext,
  initialBaseline,
}: BaselineSelectionStepProps) {
  const [selectedBaseline, setSelectedBaseline] = useState<Baseline | undefined>(
    initialBaseline
  )

  const handleNext = () => {
    if (selectedBaseline) {
      onNext(selectedBaseline)
    }
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Step 2: Baseline Selection
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Select the NIST 800-53 security baseline for your system
      </Typography>

      <Grid container spacing={2}>
        {baselineOptions.map((option) => (
          <Grid item xs={12} md={4} key={option.value}>
            <Card
              variant="outlined"
              sx={{
                border: selectedBaseline === option.value ? 2 : 1,
                borderColor:
                  selectedBaseline === option.value
                    ? 'primary.main'
                    : 'divider',
              }}
            >
              <CardActionArea onClick={() => setSelectedBaseline(option.value)}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {option.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {option.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.controlCount}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleNext}
          disabled={!selectedBaseline}
        >
          Next
        </Button>
      </Box>
    </Box>
  )
}
```

### Step 8: Run test to verify it passes

Run: `npm test -- BaselineSelectionStep.test.tsx`
Expected: PASS

### Step 9: Write test for baseline selection interaction

```typescript
// Add to BaselineSelectionStep.test.tsx
import userEvent from '@testing-library/user-event'

it('calls onNext with selected baseline when clicked', async () => {
  const mockOnNext = jest.fn()
  const user = userEvent.setup()

  render(<BaselineSelectionStep onNext={mockOnNext} />)

  const moderateCard = screen.getByText(/Moderate Baseline/i).closest('.MuiCard-root')
  await user.click(moderateCard!)

  const nextButton = screen.getByRole('button', { name: /Next/i })
  await user.click(nextButton)

  expect(mockOnNext).toHaveBeenCalledWith('moderate')
})
```

### Step 10: Run test to verify it passes

Run: `npm test -- BaselineSelectionStep.test.tsx`
Expected: PASS

### Step 11: Write test for initial baseline prop

```typescript
// Add to BaselineSelectionStep.test.tsx
it('pre-selects baseline from initialBaseline prop', () => {
  const mockOnNext = jest.fn()
  render(<BaselineSelectionStep onNext={mockOnNext} initialBaseline="high" />)

  const highCard = screen.getByText(/High Baseline/i).closest('.MuiCard-root')
  expect(highCard).toHaveStyle({ borderWidth: '2px' })
})
```

### Step 12: Run test to verify it passes

Run: `npm test -- BaselineSelectionStep.test.tsx`
Expected: PASS (implementation already handles this)

### Step 13: Commit Task 8

```bash
git add src/components/wizard/BaselineSelectionStep.tsx src/components/wizard/__tests__/BaselineSelectionStep.test.tsx
git commit -m "feat: add baseline selection wizard step (Task 8)"
```

---

## Task 9: Tool Selection Step

**Files:**

- Create: `src/components/wizard/ToolSelectionStep.tsx`
- Create: `src/components/wizard/__tests__/ToolSelectionStep.test.tsx`

### Step 1: Write failing test for tool selection rendering

```typescript
// src/components/wizard/__tests__/ToolSelectionStep.test.tsx
import { render, screen } from '@testing-library/react'
import { ToolSelectionStep } from '../ToolSelectionStep'

describe('ToolSelectionStep', () => {
  const mockOnNext = jest.fn()

  beforeEach(() => {
    global.fetch = jest.fn()
  })

  it('renders step title', () => {
    render(
      <ToolSelectionStep
        onNext={mockOnNext}
        selectedBaseline="moderate"
      />
    )

    expect(screen.getByText(/Step 3: Tool Selection/i)).toBeInTheDocument()
  })
})
```

### Step 2: Run test to verify it fails

Run: `npm test -- ToolSelectionStep.test.tsx`
Expected: FAIL with "Unable to find ToolSelectionStep"

### Step 3: Write minimal component implementation

```typescript
// src/components/wizard/ToolSelectionStep.tsx
import React from 'react'
import { Box, Typography } from '@mui/material'
import { SelectedTool, Baseline } from '../../types/ssp'

interface ToolSelectionStepProps {
  onNext: (tools: SelectedTool[]) => void
  selectedBaseline: Baseline
  initialTools?: SelectedTool[]
}

export function ToolSelectionStep({
  onNext,
  selectedBaseline,
  initialTools = [],
}: ToolSelectionStepProps) {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Step 3: Tool Selection
      </Typography>
    </Box>
  )
}
```

### Step 4: Run test to verify it passes

Run: `npm test -- ToolSelectionStep.test.tsx`
Expected: PASS

### Step 5: Write test for loading and displaying tools

```typescript
// Add to ToolSelectionStep.test.tsx
it('loads and displays available tools', async () => {
  const mockTools = {
    tools: [
      {
        id: 'semgrep',
        name: 'Semgrep',
        category: 'SAST',
        version: '1.0.0',
        controlMappings: [],
      },
    ],
  }

  ;(global.fetch as jest.Mock).mockResolvedValueOnce({
    json: async () => mockTools,
  })

  render(<ToolSelectionStep onNext={mockOnNext} selectedBaseline="moderate" />)

  expect(await screen.findByText('Semgrep')).toBeInTheDocument()
})
```

### Step 6: Run test to verify it fails

Run: `npm test -- ToolSelectionStep.test.tsx`
Expected: FAIL - tools not loaded or displayed

### Step 7: Implement tool loading and display

```typescript
// Update src/components/wizard/ToolSelectionStep.tsx
import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Checkbox,
  FormControlLabel,
  Button,
  Grid,
  Chip,
} from '@mui/material'
import { SelectedTool, Baseline } from '../../types/ssp'
import { ToolControlMapping } from '../../types/tools'
import { loadToolMappings } from '../../services/tool-mappings'

interface ToolSelectionStepProps {
  onNext: (tools: SelectedTool[]) => void
  selectedBaseline: Baseline
  initialTools?: SelectedTool[]
}

export function ToolSelectionStep({
  onNext,
  selectedBaseline,
  initialTools = [],
}: ToolSelectionStepProps) {
  const [availableTools, setAvailableTools] = useState<ToolControlMapping[]>([])
  const [selectedTools, setSelectedTools] = useState<string[]>(
    initialTools.map((t) => t.toolId)
  )
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadToolMappings()
      .then((data) => {
        setAvailableTools(data.tools)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load tools:', err)
        setLoading(false)
      })
  }, [])

  const handleToggleTool = (toolId: string) => {
    setSelectedTools((prev) =>
      prev.includes(toolId)
        ? prev.filter((id) => id !== toolId)
        : [...prev, toolId]
    )
  }

  const handleNext = () => {
    const tools: SelectedTool[] = selectedTools.map((toolId) => {
      const tool = availableTools.find((t) => t.id === toolId)!
      return {
        toolId: tool.id,
        toolName: tool.name,
        version: tool.version,
      }
    })
    onNext(tools)
  }

  if (loading) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography>Loading tools...</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Step 3: Tool Selection
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Select security tools to analyze control coverage
      </Typography>

      <Grid container spacing={2}>
        {availableTools.map((tool) => (
          <Grid item xs={12} md={6} key={tool.id}>
            <Card variant="outlined">
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <Box>
                    <Typography variant="h6">{tool.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      v{tool.version}
                    </Typography>
                  </Box>
                  <Chip label={tool.category} size="small" />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Maps {tool.controlMappings.length} controls
                </Typography>
              </CardContent>
              <CardActions>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedTools.includes(tool.id)}
                      onChange={() => handleToggleTool(tool.id)}
                    />
                  }
                  label="Select"
                />
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="body2" color="text.secondary">
          {selectedTools.length} tool(s) selected
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleNext}
        >
          Next
        </Button>
      </Box>
    </Box>
  )
}
```

### Step 8: Run test to verify it passes

Run: `npm test -- ToolSelectionStep.test.tsx`
Expected: PASS

### Step 9: Write test for tool selection interaction

```typescript
// Add to ToolSelectionStep.test.tsx
import userEvent from '@testing-library/user-event'

it('allows selecting and deselecting tools', async () => {
  const mockTools = {
    tools: [
      {
        id: 'semgrep',
        name: 'Semgrep',
        category: 'SAST',
        version: '1.0.0',
        controlMappings: [],
      },
    ],
  }

  ;(global.fetch as jest.Mock).mockResolvedValueOnce({
    json: async () => mockTools,
  })

  const user = userEvent.setup()
  render(<ToolSelectionStep onNext={mockOnNext} selectedBaseline="moderate" />)

  const checkbox = await screen.findByRole('checkbox', { name: /Select/i })
  await user.click(checkbox)

  expect(screen.getByText(/1 tool\(s\) selected/i)).toBeInTheDocument()
})
```

### Step 10: Run test to verify it passes

Run: `npm test -- ToolSelectionStep.test.tsx`
Expected: PASS

### Step 11: Write test for calling onNext with selected tools

```typescript
// Add to ToolSelectionStep.test.tsx
it('calls onNext with selected tools', async () => {
  const mockTools = {
    tools: [
      {
        id: 'semgrep',
        name: 'Semgrep',
        category: 'SAST',
        version: '1.0.0',
        controlMappings: [],
      },
    ],
  }

  ;(global.fetch as jest.Mock).mockResolvedValueOnce({
    json: async () => mockTools,
  })

  const user = userEvent.setup()
  render(<ToolSelectionStep onNext={mockOnNext} selectedBaseline="moderate" />)

  const checkbox = await screen.findByRole('checkbox', { name: /Select/i })
  await user.click(checkbox)

  const nextButton = screen.getByRole('button', { name: /Next/i })
  await user.click(nextButton)

  expect(mockOnNext).toHaveBeenCalledWith([
    {
      toolId: 'semgrep',
      toolName: 'Semgrep',
      version: '1.0.0',
    },
  ])
})
```

### Step 12: Run test to verify it passes

Run: `npm test -- ToolSelectionStep.test.tsx`
Expected: PASS

### Step 13: Commit Task 9

```bash
git add src/components/wizard/ToolSelectionStep.tsx src/components/wizard/__tests__/ToolSelectionStep.test.tsx
git commit -m "feat: add tool selection wizard step (Task 9)"
```

---

## Task 10: Control Review Step

**Files:**

- Create: `src/components/wizard/ControlReviewStep.tsx`
- Create: `src/components/wizard/__tests__/ControlReviewStep.test.tsx`

### Step 1: Write failing test for control review rendering

```typescript
// src/components/wizard/__tests__/ControlReviewStep.test.tsx
import { render, screen } from '@testing-library/react'
import { ControlReviewStep } from '../ControlReviewStep'

describe('ControlReviewStep', () => {
  const mockOnNext = jest.fn()

  beforeEach(() => {
    global.fetch = jest.fn()
  })

  it('renders step title', () => {
    render(
      <ControlReviewStep
        onNext={mockOnNext}
        selectedBaseline="moderate"
        selectedTools={[]}
      />
    )

    expect(screen.getByText(/Step 4: Control Review/i)).toBeInTheDocument()
  })
})
```

### Step 2: Run test to verify it fails

Run: `npm test -- ControlReviewStep.test.tsx`
Expected: FAIL with "Unable to find ControlReviewStep"

### Step 3: Write minimal component implementation

```typescript
// src/components/wizard/ControlReviewStep.tsx
import React from 'react'
import { Box, Typography } from '@mui/material'
import { SelectedTool, Baseline } from '../../types/ssp'

interface ControlReviewStepProps {
  onNext: () => void
  selectedBaseline: Baseline
  selectedTools: SelectedTool[]
}

export function ControlReviewStep({
  onNext,
  selectedBaseline,
  selectedTools,
}: ControlReviewStepProps) {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Step 4: Control Review
      </Typography>
    </Box>
  )
}
```

### Step 4: Run test to verify it passes

Run: `npm test -- ControlReviewStep.test.tsx`
Expected: PASS

### Step 5: Write test for loading and displaying controls with coverage

```typescript
// Add to ControlReviewStep.test.tsx
it('loads and displays controls with coverage status', async () => {
  const mockCatalog = {
    uuid: 'test',
    metadata: { title: 'Test', lastModified: '', version: '1.0', oscalVersion: '1.0.4' },
    groups: [
      {
        id: 'ac',
        class: 'family',
        title: 'Access Control',
        controls: [
          {
            id: 'ac-1',
            class: 'AC',
            title: 'Policy and Procedures',
            parts: [],
          },
        ],
      },
    ],
  }

  const mockTools = {
    tools: [
      {
        id: 'semgrep',
        name: 'Semgrep',
        category: 'SAST',
        version: '1.0.0',
        controlMappings: [
          { controlId: 'ac-1', coverage: 'full' },
        ],
      },
    ],
  }

  ;(global.fetch as jest.Mock)
    .mockResolvedValueOnce({ json: async () => ({ catalog: mockCatalog }) })
    .mockResolvedValueOnce({ json: async () => mockTools })

  render(
    <ControlReviewStep
      onNext={mockOnNext}
      selectedBaseline="moderate"
      selectedTools={[{ toolId: 'semgrep', toolName: 'Semgrep', version: '1.0.0' }]}
    />
  )

  expect(await screen.findByText('ac-1')).toBeInTheDocument()
  expect(screen.getByText('Policy and Procedures')).toBeInTheDocument()
})
```

### Step 6: Run test to verify it fails

Run: `npm test -- ControlReviewStep.test.tsx`
Expected: FAIL - controls not loaded or displayed

### Step 7: Implement control loading and display with coverage

```typescript
// Update src/components/wizard/ControlReviewStep.tsx
import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import { SelectedTool, Baseline } from '../../types/ssp'
import { loadCatalog, getBaselineControls } from '../../services/oscal-catalog'
import { loadToolMappings } from '../../services/tool-mappings'
import { calculateControlCoverage, ControlCoverage, CoverageStatus } from '../../services/coverage-calculator'
import { OSCALControl } from '../../types/oscal'

interface ControlReviewStepProps {
  onNext: () => void
  selectedBaseline: Baseline
  selectedTools: SelectedTool[]
}

const statusColors: Record<CoverageStatus, 'success' | 'warning' | 'error'> = {
  covered: 'success',
  partial: 'warning',
  uncovered: 'error',
}

export function ControlReviewStep({
  onNext,
  selectedBaseline,
  selectedTools,
}: ControlReviewStepProps) {
  const [controls, setControls] = useState<OSCALControl[]>([])
  const [coverage, setCoverage] = useState<ControlCoverage[]>([])
  const [filterStatus, setFilterStatus] = useState<CoverageStatus | 'all'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([loadCatalog(), loadToolMappings()])
      .then(([catalog, toolData]) => {
        const baselineControls = getBaselineControls(catalog, selectedBaseline)
        setControls(baselineControls)

        const selectedToolMappings = toolData.tools.filter((t) =>
          selectedTools.some((st) => st.toolId === t.id)
        )

        const coverageReport = calculateControlCoverage(
          selectedBaseline,
          selectedToolMappings,
          catalog
        )
        setCoverage(coverageReport.coverage)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load controls:', err)
        setLoading(false)
      })
  }, [selectedBaseline, selectedTools])

  const filteredCoverage =
    filterStatus === 'all'
      ? coverage
      : coverage.filter((c) => c.status === filterStatus)

  const getControlById = (controlId: string) =>
    controls.find((c) => c.id === controlId)

  if (loading) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography>Loading controls...</Typography>
      </Box>
    )
  }

  const stats = {
    total: coverage.length,
    covered: coverage.filter((c) => c.status === 'covered').length,
    partial: coverage.filter((c) => c.status === 'partial').length,
    uncovered: coverage.filter((c) => c.status === 'uncovered').length,
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Step 4: Control Review
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Review security control coverage for {selectedBaseline} baseline
      </Typography>

      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Typography variant="body2">
          Total: {stats.total} | Covered: {stats.covered} | Partial:{' '}
          {stats.partial} | Uncovered: {stats.uncovered}
        </Typography>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={filterStatus}
            label="Filter by Status"
            onChange={(e) => setFilterStatus(e.target.value as CoverageStatus | 'all')}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="covered">Covered</MenuItem>
            <MenuItem value="partial">Partial</MenuItem>
            <MenuItem value="uncovered">Uncovered</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Control ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Tools</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCoverage.map((cov) => {
              const control = getControlById(cov.controlId)
              return (
                <TableRow key={cov.controlId}>
                  <TableCell>{cov.controlId}</TableCell>
                  <TableCell>{control?.title || 'Unknown'}</TableCell>
                  <TableCell>
                    <Chip
                      label={cov.status}
                      color={statusColors[cov.status]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {cov.tools.length > 0 ? cov.tools.join(', ') : '-'}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" color="primary" onClick={onNext}>
          Next
        </Button>
      </Box>
    </Box>
  )
}
```

### Step 8: Run test to verify it passes

Run: `npm test -- ControlReviewStep.test.tsx`
Expected: PASS

### Step 9: Write test for coverage filtering

```typescript
// Add to ControlReviewStep.test.tsx
import userEvent from '@testing-library/user-event'

it('filters controls by coverage status', async () => {
  const mockCatalog = {
    uuid: 'test',
    metadata: { title: 'Test', lastModified: '', version: '1.0', oscalVersion: '1.0.4' },
    groups: [
      {
        id: 'ac',
        class: 'family',
        title: 'Access Control',
        controls: [
          { id: 'ac-1', class: 'AC', title: 'Control 1', parts: [] },
          { id: 'ac-2', class: 'AC', title: 'Control 2', parts: [] },
        ],
      },
    ],
  }

  const mockTools = {
    tools: [
      {
        id: 'semgrep',
        name: 'Semgrep',
        category: 'SAST',
        version: '1.0.0',
        controlMappings: [{ controlId: 'ac-1', coverage: 'full' }],
      },
    ],
  }

  ;(global.fetch as jest.Mock)
    .mockResolvedValueOnce({ json: async () => ({ catalog: mockCatalog }) })
    .mockResolvedValueOnce({ json: async () => mockTools })

  const user = userEvent.setup()
  render(
    <ControlReviewStep
      onNext={mockOnNext}
      selectedBaseline="moderate"
      selectedTools={[{ toolId: 'semgrep', toolName: 'Semgrep', version: '1.0.0' }]}
    />
  )

  await screen.findByText('ac-1')
  expect(screen.getByText('ac-2')).toBeInTheDocument()

  const filterSelect = screen.getByLabelText(/Filter by Status/i)
  await user.click(filterSelect)
  await user.click(screen.getByText('Covered'))

  expect(screen.getByText('ac-1')).toBeInTheDocument()
  expect(screen.queryByText('ac-2')).not.toBeInTheDocument()
})
```

### Step 10: Run test to verify it passes

Run: `npm test -- ControlReviewStep.test.tsx`
Expected: PASS

### Step 11: Commit Task 10

```bash
git add src/components/wizard/ControlReviewStep.tsx src/components/wizard/__tests__/ControlReviewStep.test.tsx
git commit -m "feat: add control review wizard step (Task 10)"
```

---

## Task 11: AI Description Generation Step

**Files:**

- Create: `src/components/wizard/AIDescriptionStep.tsx`
- Create: `src/components/wizard/__tests__/AIDescriptionStep.test.tsx`

### Step 1: Write failing test for AI description step rendering

```typescript
// src/components/wizard/__tests__/AIDescriptionStep.test.tsx
import { render, screen } from '@testing-library/react'
import { AIDescriptionStep } from '../AIDescriptionStep'

describe('AIDescriptionStep', () => {
  const mockOnNext = jest.fn()

  it('renders step title', () => {
    render(
      <AIDescriptionStep
        onNext={mockOnNext}
        selectedBaseline="moderate"
        selectedTools={[]}
      />
    )

    expect(screen.getByText(/Step 5: AI Description Generation/i)).toBeInTheDocument()
  })
})
```

### Step 2: Run test to verify it fails

Run: `npm test -- AIDescriptionStep.test.tsx`
Expected: FAIL with "Unable to find AIDescriptionStep"

### Step 3: Write minimal component implementation

```typescript
// src/components/wizard/AIDescriptionStep.tsx
import React from 'react'
import { Box, Typography } from '@mui/material'
import { SelectedTool, Baseline, ControlImplementation } from '../../types/ssp'

interface AIDescriptionStepProps {
  onNext: (implementations: ControlImplementation[]) => void
  selectedBaseline: Baseline
  selectedTools: SelectedTool[]
  initialImplementations?: ControlImplementation[]
}

export function AIDescriptionStep({
  onNext,
  selectedBaseline,
  selectedTools,
  initialImplementations = [],
}: AIDescriptionStepProps) {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Step 5: AI Description Generation
      </Typography>
    </Box>
  )
}
```

### Step 4: Run test to verify it passes

Run: `npm test -- AIDescriptionStep.test.tsx`
Expected: PASS

### Step 5: Write test for loading controls and generating stub descriptions

```typescript
// Add to AIDescriptionStep.test.tsx
it('loads controls and displays generate buttons', async () => {
  const mockCatalog = {
    uuid: 'test',
    metadata: { title: 'Test', lastModified: '', version: '1.0', oscalVersion: '1.0.4' },
    groups: [
      {
        id: 'ac',
        class: 'family',
        title: 'Access Control',
        controls: [
          { id: 'ac-1', class: 'AC', title: 'Policy', parts: [] },
        ],
      },
    ],
  }

  ;(global.fetch as jest.Mock).mockResolvedValueOnce({
    json: async () => ({ catalog: mockCatalog }),
  })

  render(
    <AIDescriptionStep
      onNext={mockOnNext}
      selectedBaseline="moderate"
      selectedTools={[]}
    />
  )

  expect(await screen.findByText('ac-1')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Generate/i })).toBeInTheDocument()
})
```

### Step 6: Run test to verify it fails

Run: `npm test -- AIDescriptionStep.test.tsx`
Expected: FAIL - controls not loaded

### Step 7: Implement control loading and stub AI generation

```typescript
// Update src/components/wizard/AIDescriptionStep.tsx
import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  TextField,
  IconButton,
  Chip,
} from '@mui/material'
import { CheckCircle, Edit, Refresh, Close } from '@mui/icons-material'
import { SelectedTool, Baseline, ControlImplementation } from '../../types/ssp'
import { loadCatalog, getBaselineControls } from '../../services/oscal-catalog'
import { OSCALControl } from '../../types/oscal'

interface AIDescriptionStepProps {
  onNext: (implementations: ControlImplementation[]) => void
  selectedBaseline: Baseline
  selectedTools: SelectedTool[]
  initialImplementations?: ControlImplementation[]
}

interface ControlWithDescription {
  control: OSCALControl
  description: string
  status: 'pending' | 'generated' | 'editing' | 'accepted' | 'rejected'
}

export function AIDescriptionStep({
  onNext,
  selectedBaseline,
  selectedTools,
  initialImplementations = [],
}: AIDescriptionStepProps) {
  const [controls, setControls] = useState<ControlWithDescription[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCatalog()
      .then((catalog) => {
        const baselineControls = getBaselineControls(catalog, selectedBaseline)
        const controlsWithDesc = baselineControls.map((control) => {
          const existing = initialImplementations.find(
            (impl) => impl.controlId === control.id
          )
          return {
            control,
            description: existing?.description || '',
            status: existing ? 'accepted' : 'pending',
          } as ControlWithDescription
        })
        setControls(controlsWithDesc)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load controls:', err)
        setLoading(false)
      })
  }, [selectedBaseline, initialImplementations])

  const generateDescription = (controlId: string) => {
    // Stub AI generation - replace with actual AI provider later
    setControls((prev) =>
      prev.map((c) =>
        c.control.id === controlId
          ? {
              ...c,
              description: `[AI Generated] This control is implemented using ${selectedTools.map((t) => t.toolName).join(', ')}. The system ensures ${c.control.title.toLowerCase()} through automated security scanning and policy enforcement.`,
              status: 'generated',
            }
          : c
      )
    )
  }

  const generateAll = () => {
    controls.forEach((c) => {
      if (c.status === 'pending') {
        generateDescription(c.control.id)
      }
    })
  }

  const acceptDescription = (controlId: string) => {
    setControls((prev) =>
      prev.map((c) =>
        c.control.id === controlId ? { ...c, status: 'accepted' } : c
      )
    )
  }

  const editDescription = (controlId: string) => {
    setControls((prev) =>
      prev.map((c) =>
        c.control.id === controlId ? { ...c, status: 'editing' } : c
      )
    )
  }

  const saveDescription = (controlId: string, newDescription: string) => {
    setControls((prev) =>
      prev.map((c) =>
        c.control.id === controlId
          ? { ...c, description: newDescription, status: 'accepted' }
          : c
      )
    )
  }

  const rejectDescription = (controlId: string) => {
    setControls((prev) =>
      prev.map((c) =>
        c.control.id === controlId
          ? { ...c, description: '', status: 'rejected' }
          : c
      )
    )
  }

  const handleNext = () => {
    const implementations: ControlImplementation[] = controls
      .filter((c) => c.status === 'accepted' && c.description)
      .map((c) => ({
        controlId: c.control.id,
        implementationStatus: 'implemented' as const,
        responsibleRole: 'System Administrator',
        description: c.description,
        providingTools: selectedTools.map((t) => t.toolId),
      }))
    onNext(implementations)
  }

  if (loading) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography>Loading controls...</Typography>
      </Box>
    )
  }

  const acceptedCount = controls.filter((c) => c.status === 'accepted').length
  const pendingCount = controls.filter((c) => c.status === 'pending').length

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Step 5: AI Description Generation
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Generate implementation descriptions for {selectedBaseline} baseline
        controls
      </Typography>

      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Typography variant="body2">
          Accepted: {acceptedCount} / {controls.length}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={generateAll}
          disabled={pendingCount === 0}
        >
          Generate All ({pendingCount})
        </Button>
      </Box>

      <Box sx={{ maxHeight: 400, overflowY: 'auto', mb: 2 }}>
        {controls.map((item) => (
          <ControlDescriptionCard
            key={item.control.id}
            item={item}
            onGenerate={generateDescription}
            onAccept={acceptDescription}
            onEdit={editDescription}
            onSave={saveDescription}
            onReject={rejectDescription}
          />
        ))}
      </Box>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleNext}
          disabled={acceptedCount === 0}
        >
          Complete
        </Button>
      </Box>
    </Box>
  )
}

interface ControlDescriptionCardProps {
  item: ControlWithDescription
  onGenerate: (controlId: string) => void
  onAccept: (controlId: string) => void
  onEdit: (controlId: string) => void
  onSave: (controlId: string, description: string) => void
  onReject: (controlId: string) => void
}

function ControlDescriptionCard({
  item,
  onGenerate,
  onAccept,
  onEdit,
  onSave,
  onReject,
}: ControlDescriptionCardProps) {
  const [editText, setEditText] = useState(item.description)

  useEffect(() => {
    setEditText(item.description)
  }, [item.description])

  return (
    <Card variant="outlined" sx={{ mb: 1 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle2">
            {item.control.id} - {item.control.title}
          </Typography>
          <Chip
            label={item.status}
            size="small"
            color={item.status === 'accepted' ? 'success' : 'default'}
          />
        </Box>

        {item.status === 'editing' ? (
          <TextField
            fullWidth
            multiline
            rows={3}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            size="small"
          />
        ) : item.description ? (
          <Typography variant="body2" color="text.secondary">
            {item.description}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.disabled" fontStyle="italic">
            No description generated
          </Typography>
        )}
      </CardContent>

      <CardActions>
        {item.status === 'pending' && (
          <Button size="small" onClick={() => onGenerate(item.control.id)}>
            Generate
          </Button>
        )}
        {item.status === 'generated' && (
          <>
            <IconButton
              size="small"
              color="success"
              onClick={() => onAccept(item.control.id)}
            >
              <CheckCircle />
            </IconButton>
            <IconButton
              size="small"
              color="primary"
              onClick={() => onEdit(item.control.id)}
            >
              <Edit />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onReject(item.control.id)}
            >
              <Close />
            </IconButton>
          </>
        )}
        {item.status === 'editing' && (
          <>
            <Button
              size="small"
              onClick={() => onSave(item.control.id, editText)}
            >
              Save
            </Button>
            <Button size="small" onClick={() => onAccept(item.control.id)}>
              Cancel
            </Button>
          </>
        )}
        {item.status === 'accepted' && (
          <>
            <IconButton
              size="small"
              color="primary"
              onClick={() => onEdit(item.control.id)}
            >
              <Edit />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onGenerate(item.control.id)}
            >
              <Refresh />
            </IconButton>
          </>
        )}
        {item.status === 'rejected' && (
          <Button size="small" onClick={() => onGenerate(item.control.id)}>
            Generate
          </Button>
        )}
      </CardActions>
    </Card>
  )
}
```

### Step 8: Run test to verify it passes

Run: `npm test -- AIDescriptionStep.test.tsx`
Expected: PASS

### Step 9: Write test for generating description

```typescript
// Add to AIDescriptionStep.test.tsx
import userEvent from '@testing-library/user-event'

it('generates description for a control', async () => {
  const mockCatalog = {
    uuid: 'test',
    metadata: { title: 'Test', lastModified: '', version: '1.0', oscalVersion: '1.0.4' },
    groups: [
      {
        id: 'ac',
        class: 'family',
        title: 'Access Control',
        controls: [
          { id: 'ac-1', class: 'AC', title: 'Policy', parts: [] },
        ],
      },
    ],
  }

  ;(global.fetch as jest.Mock).mockResolvedValueOnce({
    json: async () => ({ catalog: mockCatalog }),
  })

  const user = userEvent.setup()
  render(
    <AIDescriptionStep
      onNext={mockOnNext}
      selectedBaseline="moderate"
      selectedTools={[{ toolId: 'semgrep', toolName: 'Semgrep', version: '1.0.0' }]}
    />
  )

  await screen.findByText('ac-1')

  const generateButton = screen.getByRole('button', { name: /Generate/i })
  await user.click(generateButton)

  expect(screen.getByText(/AI Generated/i)).toBeInTheDocument()
})
```

### Step 10: Run test to verify it passes

Run: `npm test -- AIDescriptionStep.test.tsx`
Expected: PASS

### Step 11: Write test for accepting description

```typescript
// Add to AIDescriptionStep.test.tsx
it('allows accepting a generated description', async () => {
  const mockCatalog = {
    uuid: 'test',
    metadata: { title: 'Test', lastModified: '', version: '1.0', oscalVersion: '1.0.4' },
    groups: [
      {
        id: 'ac',
        class: 'family',
        title: 'Access Control',
        controls: [
          { id: 'ac-1', class: 'AC', title: 'Policy', parts: [] },
        ],
      },
    ],
  }

  ;(global.fetch as jest.Mock).mockResolvedValueOnce({
    json: async () => ({ catalog: mockCatalog }),
  })

  const user = userEvent.setup()
  render(
    <AIDescriptionStep
      onNext={mockOnNext}
      selectedBaseline="moderate"
      selectedTools={[{ toolId: 'semgrep', toolName: 'Semgrep', version: '1.0.0' }]}
    />
  )

  await screen.findByText('ac-1')

  const generateButton = screen.getByRole('button', { name: /Generate/i })
  await user.click(generateButton)

  const acceptButton = screen.getByRole('button', { name: /CheckCircle/i })
  await user.click(acceptButton)

  expect(screen.getByText(/Accepted: 1/i)).toBeInTheDocument()
})
```

### Step 12: Run test to verify it passes

Run: `npm test -- AIDescriptionStep.test.tsx`
Expected: PASS

### Step 13: Commit Task 11

```bash
git add src/components/wizard/AIDescriptionStep.tsx src/components/wizard/__tests__/AIDescriptionStep.test.tsx
git commit -m "feat: add AI description generation wizard step (Task 11)"
```

---

## Task 12: Wizard Container

**Files:**

- Create: `src/components/wizard/WizardContainer.tsx`
- Create: `src/components/wizard/__tests__/WizardContainer.test.tsx`

### Step 1: Write failing test for wizard container rendering

```typescript
// src/components/wizard/__tests__/WizardContainer.test.tsx
import { render, screen } from '@testing-library/react'
import { WizardContainer } from '../WizardContainer'
import { SSPProjectProvider } from '../../contexts/SSPProjectContext'

describe('WizardContainer', () => {
  const renderWithContext = (component: React.ReactElement) => {
    return render(<SSPProjectProvider>{component}</SSPProjectProvider>)
  }

  it('renders wizard with step indicator', () => {
    renderWithContext(<WizardContainer />)

    expect(screen.getByText(/Step 1 of 5/i)).toBeInTheDocument()
  })
})
```

### Step 2: Run test to verify it fails

Run: `npm test -- WizardContainer.test.tsx`
Expected: FAIL with "Unable to find WizardContainer"

### Step 3: Write minimal component implementation

```typescript
// src/components/wizard/WizardContainer.tsx
import React, { useState } from 'react'
import { Box, Typography, Stepper, Step, StepLabel, Paper } from '@mui/material'

export function WizardContainer() {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    'Project Basics',
    'Baseline Selection',
    'Tool Selection',
    'Control Review',
    'AI Descriptions',
  ]

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        SSP Generator Wizard
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Step {currentStep + 1} of {steps.length}
      </Typography>

      <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper sx={{ p: 3 }}>
        <Typography>Wizard content goes here</Typography>
      </Paper>
    </Box>
  )
}
```

### Step 4: Run test to verify it passes

Run: `npm test -- WizardContainer.test.tsx`
Expected: PASS

### Step 5: Write test for rendering first step

```typescript
// Add to WizardContainer.test.tsx
it('renders project basics step initially', () => {
  renderWithContext(<WizardContainer />)

  expect(screen.getByText(/Step 1: Project Basics/i)).toBeInTheDocument()
})
```

### Step 6: Run test to verify it fails

Run: `npm test -- WizardContainer.test.tsx`
Expected: FAIL - ProjectBasicsStep not rendered

### Step 7: Implement step rendering and navigation

```typescript
// Update src/components/wizard/WizardContainer.tsx
import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Button,
} from '@mui/material'
import { ProjectBasicsStep } from './ProjectBasicsStep'
import { BaselineSelectionStep } from './BaselineSelectionStep'
import { ToolSelectionStep } from './ToolSelectionStep'
import { ControlReviewStep } from './ControlReviewStep'
import { AIDescriptionStep } from './AIDescriptionStep'
import { useSSPProject } from '../../contexts/SSPProjectContext'
import { saveProject } from '../../services/indexeddb'
import {
  SystemCharacteristics,
  Baseline,
  SelectedTool,
  ControlImplementation,
} from '../../types/ssp'

export function WizardContainer() {
  const [currentStep, setCurrentStep] = useState(0)
  const { project, updateSystemCharacteristics, setControlBaseline } =
    useSSPProject()

  const steps = [
    'Project Basics',
    'Baseline Selection',
    'Tool Selection',
    'Control Review',
    'AI Descriptions',
  ]

  useEffect(() => {
    // Auto-save project when it changes
    if (project.systemCharacteristics.systemName) {
      saveProject(project).catch((err) =>
        console.error('Failed to save project:', err)
      )
    }
  }, [project])

  const handleProjectBasicsNext = (characteristics: SystemCharacteristics) => {
    updateSystemCharacteristics(characteristics)
    setCurrentStep(1)
  }

  const handleBaselineNext = (baseline: Baseline) => {
    setControlBaseline(baseline)
    setCurrentStep(2)
  }

  const handleToolsNext = (tools: SelectedTool[]) => {
    // Tools are already added via context actions in the component
    setCurrentStep(3)
  }

  const handleControlReviewNext = () => {
    setCurrentStep(4)
  }

  const handleAIDescriptionsNext = (implementations: ControlImplementation[]) => {
    // Implementations are already added via context actions
    alert('Wizard complete! SSP ready for export.')
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1))
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <ProjectBasicsStep
            onNext={handleProjectBasicsNext}
            initialData={project.systemCharacteristics}
          />
        )
      case 1:
        return (
          <BaselineSelectionStep
            onNext={handleBaselineNext}
            initialBaseline={project.controlBaseline}
          />
        )
      case 2:
        return (
          <ToolSelectionStep
            onNext={handleToolsNext}
            selectedBaseline={project.controlBaseline}
            initialTools={project.selectedTools}
          />
        )
      case 3:
        return (
          <ControlReviewStep
            onNext={handleControlReviewNext}
            selectedBaseline={project.controlBaseline}
            selectedTools={project.selectedTools}
          />
        )
      case 4:
        return (
          <AIDescriptionStep
            onNext={handleAIDescriptionsNext}
            selectedBaseline={project.controlBaseline}
            selectedTools={project.selectedTools}
            initialImplementations={project.controlImplementations}
          />
        )
      default:
        return null
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        SSP Generator Wizard
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Step {currentStep + 1} of {steps.length}
      </Typography>

      <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper sx={{ p: 3 }}>
        {currentStep > 0 && (
          <Button onClick={handleBack} sx={{ mb: 2 }}>
            Back
          </Button>
        )}
        {renderStep()}
      </Paper>
    </Box>
  )
}
```

### Step 8: Run test to verify it passes

Run: `npm test -- WizardContainer.test.tsx`
Expected: PASS

### Step 9: Write test for step navigation

```typescript
// Add to WizardContainer.test.tsx
import userEvent from '@testing-library/user-event'

it('navigates to next step after completing project basics', async () => {
  const user = userEvent.setup()
  renderWithContext(<WizardContainer />)

  // Fill out project basics form
  await user.type(screen.getByLabelText(/System Name/i), 'Test System')
  await user.type(screen.getByLabelText(/System ID/i), 'test-001')
  await user.type(screen.getByLabelText(/Description/i), 'Test description')
  await user.type(screen.getByLabelText(/Authorization Boundary/i), 'Test boundary')

  const systemTypeSelect = screen.getByLabelText(/System Type/i)
  await user.click(systemTypeSelect)
  await user.click(screen.getByText('SaaS'))

  const nextButton = screen.getByRole('button', { name: /Next/i })
  await user.click(nextButton)

  expect(screen.getByText(/Step 2: Baseline Selection/i)).toBeInTheDocument()
})
```

### Step 10: Run test to verify it passes

Run: `npm test -- WizardContainer.test.tsx`
Expected: PASS

### Step 11: Write test for back button

```typescript
// Add to WizardContainer.test.tsx
it('allows navigating back to previous step', async () => {
  const user = userEvent.setup()
  renderWithContext(<WizardContainer />)

  // Navigate to step 2
  await user.type(screen.getByLabelText(/System Name/i), 'Test System')
  await user.type(screen.getByLabelText(/System ID/i), 'test-001')
  await user.type(screen.getByLabelText(/Description/i), 'Test description')
  await user.type(screen.getByLabelText(/Authorization Boundary/i), 'Test boundary')

  const systemTypeSelect = screen.getByLabelText(/System Type/i)
  await user.click(systemTypeSelect)
  await user.click(screen.getByText('SaaS'))

  await user.click(screen.getByRole('button', { name: /Next/i }))

  // Click back
  const backButton = screen.getByRole('button', { name: /Back/i })
  await user.click(backButton)

  expect(screen.getByText(/Step 1: Project Basics/i)).toBeInTheDocument()
})
```

### Step 12: Run test to verify it passes

Run: `npm test -- WizardContainer.test.tsx`
Expected: PASS

### Step 13: Update ToolSelectionStep to integrate with context

```typescript
// Update src/components/wizard/ToolSelectionStep.tsx - add context integration
import { useSSPProject } from '../../contexts/SSPProjectContext'

// Inside ToolSelectionStep component, add:
const { addSelectedTool, removeSelectedTool } = useSSPProject()

// Update handleNext:
const handleNext = () => {
  // Clear existing tools
  initialTools.forEach((tool) => removeSelectedTool(tool.toolId))

  // Add selected tools
  const tools: SelectedTool[] = selectedTools.map((toolId) => {
    const tool = availableTools.find((t) => t.id === toolId)!
    return {
      toolId: tool.id,
      toolName: tool.name,
      version: tool.version,
    }
  })

  tools.forEach((tool) => addSelectedTool(tool))
  onNext(tools)
}
```

### Step 14: Update AIDescriptionStep to integrate with context

```typescript
// Update src/components/wizard/AIDescriptionStep.tsx - add context integration
import { useSSPProject } from '../../contexts/SSPProjectContext'

// Inside AIDescriptionStep component, add:
const { updateControlImplementation } = useSSPProject()

// Update handleNext:
const handleNext = () => {
  const implementations: ControlImplementation[] = controls
    .filter((c) => c.status === 'accepted' && c.description)
    .map((c) => ({
      controlId: c.control.id,
      implementationStatus: 'implemented' as const,
      responsibleRole: 'System Administrator',
      description: c.description,
      providingTools: selectedTools.map((t) => t.toolId),
    }))

  implementations.forEach((impl) => updateControlImplementation(impl))
  onNext(implementations)
}
```

### Step 15: Run all wizard tests

Run: `npm test -- wizard`
Expected: All tests PASS

### Step 16: Commit Task 12

```bash
git add src/components/wizard/WizardContainer.tsx src/components/wizard/__tests__/WizardContainer.test.tsx src/components/wizard/ToolSelectionStep.tsx src/components/wizard/AIDescriptionStep.tsx
git commit -m "feat: add wizard container with step orchestration (Task 12)"
```

---

## Verification and Testing

### Step 1: Run full test suite

```bash
npm test
```

Expected: All tests pass (expect ~270+ tests)

### Step 2: Start development server

```bash
npm run dev
```

### Step 3: Manual testing checklist

- [ ] Navigate through all 5 wizard steps
- [ ] Verify data persists when going back/forward
- [ ] Select different baselines and verify control counts
- [ ] Select/deselect tools and verify coverage updates
- [ ] Filter controls by coverage status
- [ ] Generate AI descriptions for controls
- [ ] Accept/edit/reject generated descriptions
- [ ] Complete wizard and verify alert

### Step 4: Check IndexedDB persistence

- Open browser DevTools → Application → IndexedDB
- Verify `ssp-projects` database contains saved project
- Refresh page and verify data persists

---

## Final Commit and Push

### Step 1: Run final test suite

```bash
npm test
```

Expected: All tests pass

### Step 2: Build project

```bash
npm run build
```

Expected: Build succeeds with no errors

### Step 3: Push to remote

```bash
git push origin feat/ssp-generator
```

---

## Success Criteria

- ✅ All 5 wizard steps implemented and tested
- ✅ Wizard container orchestrates step navigation
- ✅ Data persists to IndexedDB after each step
- ✅ Coverage calculation works in real-time
- ✅ All tests pass (expect ~270+ total)
- ✅ Build succeeds
- ✅ Manual testing confirms full wizard flow works

---

## Next Steps After This Plan

**Priority 2: Enable OSCAL Export (Task 19)**

- Implement `oscal-export.ts` service
- Map SSPProject to OSCAL SSP schema
- Add export button to wizard completion
- Support JSON and XML formats

**Priority 3: Enhancements**

- Replace stub AI with real provider (OpenAI, Anthropic, etc.)
- Add full NIST 800-53 catalog (all controls)
- Implement custom tool upload
- Add project management (list, delete, duplicate)
