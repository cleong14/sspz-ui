/**
 * SSP Generator - Main wizard view for creating System Security Plans
 * @module views/SSPGenerator/SSPGenerator
 */
import { useState } from 'react'
import {
  Box,
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Typography,
} from '@mui/material'
import { SSPProjectProvider, useSSPProject } from '@/contexts/SSPProjectContext'
import { ProjectBasicsStep } from '@/components/wizard/ProjectBasicsStep'
import { BaselineSelectionStep } from '@/components/wizard/BaselineSelectionStep'
import { ToolSelectionStep } from '@/components/wizard/ToolSelectionStep'
import { ControlReviewStep } from '@/components/wizard/ControlReviewStep'
import { AIDescriptionStep } from '@/components/wizard/AIDescriptionStep'
import {
  SystemCharacteristics,
  Baseline,
  SelectedTool,
  ControlImplementation,
} from '@/types/ssp'

const steps = [
  'Project Basics',
  'Baseline Selection',
  'Tool Selection',
  'Control Review',
  'AI Descriptions',
]

function SSPWizard() {
  const [activeStep, setActiveStep] = useState(0)
  const {
    project,
    updateSystemCharacteristics,
    setControlBaseline,
    addSelectedTool,
    removeSelectedTool,
    updateControlImplementation,
  } = useSSPProject()

  const handleProjectBasics = (data: SystemCharacteristics) => {
    updateSystemCharacteristics(data)
    setActiveStep(1)
  }

  const handleBaselineSelection = (baseline: Baseline) => {
    setControlBaseline(baseline)
    setActiveStep(2)
  }

  const handleToolSelection = (tools: SelectedTool[]) => {
    // Clear existing tools and add new ones
    project.selectedTools.forEach((t) => removeSelectedTool(t.toolId))
    tools.forEach((t) => addSelectedTool(t))
    setActiveStep(3)
  }

  const handleControlReview = () => {
    setActiveStep(4)
  }

  const handleAIDescriptions = (implementations: ControlImplementation[]) => {
    implementations.forEach((impl) => updateControlImplementation(impl))
    // Could navigate to a summary/export step here in the future
  }

  const handleBack = () => {
    setActiveStep((prev) => Math.max(0, prev - 1))
  }

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <ProjectBasicsStep
            onNext={handleProjectBasics}
            initialData={project.systemCharacteristics}
          />
        )
      case 1:
        return (
          <BaselineSelectionStep
            onNext={handleBaselineSelection}
            onBack={handleBack}
            initialBaseline={project.controlBaseline}
          />
        )
      case 2:
        return (
          <ToolSelectionStep
            onNext={handleToolSelection}
            onBack={handleBack}
            baseline={project.controlBaseline}
            initialTools={project.selectedTools}
          />
        )
      case 3:
        return (
          <ControlReviewStep
            onNext={handleControlReview}
            onBack={handleBack}
            baseline={project.controlBaseline}
            selectedTools={project.selectedTools}
          />
        )
      case 4:
        return (
          <AIDescriptionStep
            onNext={handleAIDescriptions}
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          SSP Generator
        </Typography>
        <Typography
          variant="subtitle1"
          color="textSecondary"
          align="center"
          sx={{ mb: 4 }}
        >
          Create your System Security Plan with guided assistance
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ minHeight: 400 }}>{renderStep()}</Box>
      </Paper>
    </Container>
  )
}

/**
 * SSP Generator view wrapped with context provider
 */
export default function SSPGenerator() {
  return (
    <SSPProjectProvider>
      <SSPWizard />
    </SSPProjectProvider>
  )
}
