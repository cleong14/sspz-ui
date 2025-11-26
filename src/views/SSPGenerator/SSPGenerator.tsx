/**
 * SSP Generator - Main wizard view for creating System Security Plans
 * @module views/SSPGenerator/SSPGenerator
 */
import React, { useState } from 'react'
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
import { SystemCharacteristics, Baseline } from '@/types/ssp'
import { ToolMapping } from '@/types/tools'

const steps = [
  'Project Basics',
  'Baseline Selection',
  'Tool Selection',
  'Control Review',
  'AI Descriptions',
]

function SSPWizard() {
  const [activeStep, setActiveStep] = useState(0)
  const { state, dispatch } = useSSPProject()

  const handleProjectBasics = (data: SystemCharacteristics) => {
    dispatch({ type: 'UPDATE_SYSTEM_CHARACTERISTICS', payload: data })
    setActiveStep(1)
  }

  const handleBaselineSelection = (baseline: Baseline) => {
    dispatch({ type: 'UPDATE_BASELINE', payload: baseline })
    setActiveStep(2)
  }

  const handleToolSelection = (tools: ToolMapping[]) => {
    dispatch({ type: 'UPDATE_SELECTED_TOOLS', payload: tools })
    setActiveStep(3)
  }

  const handleControlReview = () => {
    setActiveStep(4)
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
            initialData={state.project?.systemCharacteristics}
          />
        )
      case 1:
        return (
          <BaselineSelectionStep
            onNext={handleBaselineSelection}
            onBack={handleBack}
            selectedBaseline={state.project?.baseline}
          />
        )
      case 2:
        return (
          <ToolSelectionStep
            onNext={handleToolSelection}
            onBack={handleBack}
            selectedTools={state.project?.selectedTools || []}
          />
        )
      case 3:
        return (
          <ControlReviewStep
            onNext={handleControlReview}
            onBack={handleBack}
            baseline={state.project?.baseline || 'moderate'}
            selectedTools={state.project?.selectedTools || []}
          />
        )
      case 4:
        return (
          <AIDescriptionStep
            onBack={handleBack}
            baseline={state.project?.baseline || 'moderate'}
            selectedTools={state.project?.selectedTools || []}
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
