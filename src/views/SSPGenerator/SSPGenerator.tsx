/**
 * SSP Generator View - A wizard-based interface for creating System Security Plans
 * @module views/SSPGenerator/SSPGenerator
 */
import * as React from 'react'
import {
  Box,
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Button,
  Alert,
} from '@mui/material'
import { ProjectBasicsStep } from '@/components/wizard/ProjectBasicsStep'
import { SSPProjectProvider, useSSPProject } from '@/contexts/SSPProjectContext'
import type { SystemCharacteristics, Baseline, SelectedTool } from '@/types/ssp'

const steps = [
  'Project Basics',
  'Baseline Selection',
  'Security Tools',
  'Control Review',
  'Implementation',
]

/**
 * Baseline Selection Step Component
 */
const BaselineSelectionStep: React.FC<{
  onNext: (baseline: Baseline) => void
  onBack: () => void
  initialBaseline?: Baseline
}> = ({ onNext, onBack, initialBaseline = 'moderate' }) => {
  const [selectedBaseline, setSelectedBaseline] =
    React.useState<Baseline>(initialBaseline)

  const baselineInfo = {
    low: {
      title: 'Low Impact',
      description:
        'For systems where loss of confidentiality, integrity, or availability would have limited adverse effect.',
      controls: '~130 controls',
    },
    moderate: {
      title: 'Moderate Impact',
      description:
        'For systems where loss would have serious adverse effect on operations, assets, or individuals.',
      controls: '~325 controls',
    },
    high: {
      title: 'High Impact',
      description:
        'For systems where loss would have severe or catastrophic adverse effect.',
      controls: '~420 controls',
    },
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select Control Baseline
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Choose the NIST SP 800-53 control baseline that matches your system's
        FIPS-199 categorization.
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}>
        {(Object.keys(baselineInfo) as Baseline[]).map((baseline) => (
          <Paper
            key={baseline}
            elevation={selectedBaseline === baseline ? 8 : 1}
            sx={{
              p: 3,
              flex: '1 1 250px',
              cursor: 'pointer',
              border:
                selectedBaseline === baseline
                  ? '2px solid primary.main'
                  : '2px solid transparent',
              borderColor:
                selectedBaseline === baseline ? 'primary.main' : 'transparent',
              '&:hover': {
                elevation: 4,
              },
            }}
            onClick={() => setSelectedBaseline(baseline)}
          >
            <Typography variant="h6" color="primary">
              {baselineInfo[baseline].title}
            </Typography>
            <Typography variant="body2" sx={{ my: 1 }}>
              {baselineInfo[baseline].description}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {baselineInfo[baseline].controls}
            </Typography>
          </Paper>
        ))}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={onBack}>Back</Button>
        <Button variant="contained" onClick={() => onNext(selectedBaseline)}>
          Next
        </Button>
      </Box>
    </Box>
  )
}

/**
 * Security Tools Selection Step Component
 */
const SecurityToolsStep: React.FC<{
  onNext: (tools: SelectedTool[]) => void
  onBack: () => void
  initialTools?: SelectedTool[]
}> = ({ onNext, onBack, initialTools = [] }) => {
  const [selectedTools, setSelectedTools] =
    React.useState<SelectedTool[]>(initialTools)

  const availableTools = [
    {
      id: 'semgrep',
      name: 'Semgrep',
      category: 'SAST',
      description:
        'Static analysis for finding bugs and enforcing code standards',
    },
    {
      id: 'gitleaks',
      name: 'Gitleaks',
      category: 'Secrets',
      description: 'Detect hardcoded secrets like passwords and API keys',
    },
    {
      id: 'grype',
      name: 'Grype',
      category: 'SCA',
      description: 'Vulnerability scanner for container images and filesystems',
    },
  ]

  const toggleTool = (toolId: string, toolName: string) => {
    setSelectedTools((prev) => {
      const exists = prev.find((t) => t.toolId === toolId)
      if (exists) {
        return prev.filter((t) => t.toolId !== toolId)
      }
      return [...prev, { toolId, toolName }]
    })
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select Security Tools
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Choose the security scanning tools you use. These tools will be mapped
        to NIST controls to show coverage.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
        {availableTools.map((tool) => {
          const isSelected = selectedTools.some((t) => t.toolId === tool.id)
          return (
            <Paper
              key={tool.id}
              elevation={isSelected ? 4 : 1}
              sx={{
                p: 2,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: isSelected ? '2px solid' : '2px solid transparent',
                borderColor: isSelected ? 'primary.main' : 'transparent',
              }}
              onClick={() => toggleTool(tool.id, tool.name)}
            >
              <Box>
                <Typography variant="subtitle1">
                  {tool.name}
                  <Typography
                    component="span"
                    variant="caption"
                    sx={{
                      ml: 1,
                      px: 1,
                      py: 0.5,
                      bgcolor: 'grey.200',
                      borderRadius: 1,
                    }}
                  >
                    {tool.category}
                  </Typography>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {tool.description}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  border: '2px solid',
                  borderColor: isSelected ? 'primary.main' : 'grey.400',
                  bgcolor: isSelected ? 'primary.main' : 'transparent',
                }}
              />
            </Paper>
          )
        })}
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        {selectedTools.length} tool(s) selected. Additional tools can be added
        by uploading custom mappings.
      </Alert>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={onBack}>Back</Button>
        <Button variant="contained" onClick={() => onNext(selectedTools)}>
          Next
        </Button>
      </Box>
    </Box>
  )
}

/**
 * Control Review Step Component (placeholder)
 */
const ControlReviewStep: React.FC<{
  onNext: () => void
  onBack: () => void
}> = ({ onNext, onBack }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Control Review
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Review the controls applicable to your baseline and see which ones are
        covered by your selected tools.
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Control review functionality will display NIST 800-53 Rev 5 controls
        with coverage status based on selected tools.
      </Alert>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Sample Controls Preview:
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {[
            { id: 'AC-1', title: 'Policy and Procedures', status: 'partial' },
            { id: 'AC-2', title: 'Account Management', status: 'covered' },
            { id: 'AC-3', title: 'Access Enforcement', status: 'covered' },
            { id: 'AU-2', title: 'Audit Events', status: 'not-covered' },
            { id: 'CA-7', title: 'Continuous Monitoring', status: 'partial' },
          ].map((control) => (
            <Box
              key={control.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 1,
                bgcolor: 'grey.50',
                borderRadius: 1,
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: 'bold', minWidth: 60 }}
              >
                {control.id}
              </Typography>
              <Typography variant="body2" sx={{ flex: 1 }}>
                {control.title}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor:
                    control.status === 'covered'
                      ? 'success.light'
                      : control.status === 'partial'
                        ? 'warning.light'
                        : 'error.light',
                  color:
                    control.status === 'covered'
                      ? 'success.dark'
                      : control.status === 'partial'
                        ? 'warning.dark'
                        : 'error.dark',
                }}
              >
                {control.status}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={onBack}>Back</Button>
        <Button variant="contained" onClick={onNext}>
          Next
        </Button>
      </Box>
    </Box>
  )
}

/**
 * Implementation Step Component (final step)
 */
const ImplementationStep: React.FC<{
  onBack: () => void
  onComplete: () => void
}> = ({ onBack, onComplete }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Implementation Descriptions
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Generate and customize implementation descriptions for each control.
      </Typography>

      <Alert severity="success" sx={{ mb: 3 }}>
        Your SSP project is ready! In a production environment, you would be
        able to:
        <ul>
          <li>Generate AI-assisted implementation descriptions</li>
          <li>Export to OSCAL JSON format</li>
          <li>Export to PDF/DOCX for submission</li>
          <li>Save project for later editing</li>
        </ul>
      </Alert>

      <Paper sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
        <Typography variant="subtitle2" gutterBottom>
          Project Summary
        </Typography>
        <Typography variant="body2">
          This SSP Generator demonstrates the core functionality for creating
          NIST SP 800-53 compliant System Security Plans with automated control
          coverage from security scanning tools.
        </Typography>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={onBack}>Back</Button>
        <Button variant="contained" color="success" onClick={onComplete}>
          Complete SSP
        </Button>
      </Box>
    </Box>
  )
}

/**
 * Main SSP Generator Wizard Component
 */
const SSPGeneratorWizard: React.FC = () => {
  const [activeStep, setActiveStep] = React.useState(0)
  const {
    project,
    updateSystemCharacteristics,
    setControlBaseline,
    addSelectedTool,
  } = useSSPProject()
  const [completed, setCompleted] = React.useState(false)

  const handleNext = () => {
    setActiveStep((prev) => prev + 1)
  }

  const handleBack = () => {
    setActiveStep((prev) => prev - 1)
  }

  const handleProjectBasicsNext = (data: SystemCharacteristics) => {
    updateSystemCharacteristics(data)
    handleNext()
  }

  const handleBaselineNext = (baseline: Baseline) => {
    setControlBaseline(baseline)
    handleNext()
  }

  const handleToolsNext = (tools: SelectedTool[]) => {
    tools.forEach((tool) => addSelectedTool(tool))
    handleNext()
  }

  const handleComplete = () => {
    setCompleted(true)
  }

  if (completed) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" color="success.main" gutterBottom>
            SSP Created Successfully!
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Your System Security Plan for "
            {project.systemCharacteristics.systemName}" has been created.
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              setCompleted(false)
              setActiveStep(0)
            }}
          >
            Create Another SSP
          </Button>
        </Paper>
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        SSP Generator
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Create a NIST SP 800-53 Rev 5 compliant System Security Plan
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper sx={{ p: 4 }}>
        {activeStep === 0 && (
          <ProjectBasicsStep
            onNext={handleProjectBasicsNext}
            initialData={project.systemCharacteristics}
          />
        )}
        {activeStep === 1 && (
          <BaselineSelectionStep
            onNext={handleBaselineNext}
            onBack={handleBack}
            initialBaseline={project.controlBaseline}
          />
        )}
        {activeStep === 2 && (
          <SecurityToolsStep
            onNext={handleToolsNext}
            onBack={handleBack}
            initialTools={project.selectedTools}
          />
        )}
        {activeStep === 3 && (
          <ControlReviewStep onNext={handleNext} onBack={handleBack} />
        )}
        {activeStep === 4 && (
          <ImplementationStep onBack={handleBack} onComplete={handleComplete} />
        )}
      </Paper>
    </Container>
  )
}

/**
 * SSP Generator View with Provider wrapper
 */
const SSPGenerator: React.FC = () => {
  return (
    <SSPProjectProvider>
      <SSPGeneratorWizard />
    </SSPProjectProvider>
  )
}

export default SSPGenerator
