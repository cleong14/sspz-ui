import { useState, useCallback } from 'react'
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Typography,
  Button,
  Container,
  Alert,
} from '@mui/material'
import { ProjectBasicsStep } from './ProjectBasicsStep'
import { BaselineSelectionStep } from './BaselineSelectionStep'
import { ToolSelectionStep } from './ToolSelectionStep'
import { ControlReviewStep } from './ControlReviewStep'
import {
  SystemCharacteristics,
  Baseline,
  SelectedTool,
  SSPProject,
} from '../../types/ssp'
import { useSSPProject } from '../../contexts/SSPProjectContext'

const STEPS = [
  {
    label: 'Project Basics',
    description: 'System information and categorization',
  },
  {
    label: 'Baseline Selection',
    description: 'Choose security control baseline',
  },
  { label: 'Security Tools', description: 'Select your security tools' },
  { label: 'Control Review', description: 'Review control coverage' },
  { label: 'Generate SSP', description: 'Generate your SSP document' },
]

interface SSPWizardProps {
  onComplete?: (project: SSPProject) => void
}

export function SSPWizard({ onComplete }: SSPWizardProps) {
  const [activeStep, setActiveStep] = useState(0)
  const {
    project,
    updateSystemCharacteristics,
    setControlBaseline,
    addSelectedTool,
    removeSelectedTool,
  } = useSSPProject()

  // Local state for wizard progression (before committing to context)
  const [wizardData, setWizardData] = useState<{
    systemCharacteristics: SystemCharacteristics | null
    baseline: Baseline
    selectedTools: SelectedTool[]
  }>({
    systemCharacteristics: null,
    baseline: project.controlBaseline,
    selectedTools: project.selectedTools,
  })

  const handleNext = useCallback(() => {
    setActiveStep((prev) => Math.min(prev + 1, STEPS.length - 1))
  }, [])

  const handleBack = useCallback(() => {
    setActiveStep((prev) => Math.max(prev - 1, 0))
  }, [])

  const handleProjectBasicsComplete = useCallback(
    (characteristics: SystemCharacteristics) => {
      setWizardData((prev) => ({
        ...prev,
        systemCharacteristics: characteristics,
      }))
      updateSystemCharacteristics(characteristics)
      handleNext()
    },
    [updateSystemCharacteristics, handleNext]
  )

  const handleBaselineComplete = useCallback(
    (baseline: Baseline) => {
      setWizardData((prev) => ({ ...prev, baseline }))
      setControlBaseline(baseline)
      handleNext()
    },
    [setControlBaseline, handleNext]
  )

  const handleToolsComplete = useCallback(
    (tools: SelectedTool[]) => {
      setWizardData((prev) => ({ ...prev, selectedTools: tools }))

      // Update context - remove old tools and add new ones
      project.selectedTools.forEach((t) => removeSelectedTool(t.toolId))
      tools.forEach((t) => addSelectedTool(t))

      handleNext()
    },
    [project.selectedTools, removeSelectedTool, addSelectedTool, handleNext]
  )

  const handleControlReviewComplete = useCallback(() => {
    handleNext()
  }, [handleNext])

  const handleGenerateSSP = useCallback(() => {
    if (onComplete) {
      onComplete(project)
    }
    // For now, just log - actual generation will be implemented in a later story
    console.log('SSP Generation triggered with project:', project)
  }, [onComplete, project])

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <ProjectBasicsStep
            onNext={handleProjectBasicsComplete}
            initialData={
              wizardData.systemCharacteristics || project.systemCharacteristics
            }
          />
        )
      case 1:
        return (
          <BaselineSelectionStep
            onNext={handleBaselineComplete}
            onBack={handleBack}
            initialBaseline={wizardData.baseline}
          />
        )
      case 2:
        return (
          <ToolSelectionStep
            onNext={handleToolsComplete}
            onBack={handleBack}
            baseline={wizardData.baseline}
            initialTools={wizardData.selectedTools}
          />
        )
      case 3:
        return (
          <ControlReviewStep
            onNext={handleControlReviewComplete}
            onBack={handleBack}
            baseline={wizardData.baseline}
            selectedTools={wizardData.selectedTools}
          />
        )
      case 4:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Step 5: Generate Your SSP
            </Typography>
            <Alert severity="success" sx={{ mb: 3 }}>
              Your System Security Plan is ready to be generated!
            </Alert>

            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                SSP Summary
              </Typography>
              <Box
                component="dl"
                sx={{ '& dt': { fontWeight: 'bold', mt: 1 } }}
              >
                <dt>System Name</dt>
                <dd>{project.systemCharacteristics.systemName || 'Not set'}</dd>

                <dt>Security Baseline</dt>
                <dd style={{ textTransform: 'capitalize' }}>
                  {project.controlBaseline}
                </dd>

                <dt>Selected Tools</dt>
                <dd>
                  {project.selectedTools.length > 0
                    ? project.selectedTools.map((t) => t.toolName).join(', ')
                    : 'None selected'}
                </dd>

                <dt>FIPS-199 Categorization</dt>
                <dd>
                  Confidentiality:{' '}
                  {project.systemCharacteristics.securityImpactLevel
                    .confidentiality || 'Not set'}
                  , Integrity:{' '}
                  {project.systemCharacteristics.securityImpactLevel
                    .integrity || 'Not set'}
                  , Availability:{' '}
                  {project.systemCharacteristics.securityImpactLevel
                    .availability || 'Not set'}
                </dd>
              </Box>
            </Paper>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              In the next phase, you&apos;ll be able to generate AI-assisted
              implementation descriptions and export your SSP in multiple
              formats (OSCAL, PDF, DOCX, Markdown).
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={handleBack}>Back</Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleGenerateSSP}
              >
                Complete Setup
              </Button>
            </Box>
          </Box>
        )
      default:
        return null
    }
  }

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h4" gutterBottom>
          SSP Generator Wizard
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Create a NIST 800-53 compliant System Security Plan in 5 easy steps.
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {STEPS.map((step, index) => (
            <Step key={step.label}>
              <StepLabel
                optional={
                  index === activeStep ? (
                    <Typography variant="caption">
                      {step.description}
                    </Typography>
                  ) : null
                }
              >
                {step.label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ minHeight: 400 }}>{renderStepContent()}</Box>
      </Paper>
    </Container>
  )
}
