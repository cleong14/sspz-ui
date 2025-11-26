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
  const [selectedBaseline, setSelectedBaseline] = useState<
    Baseline | undefined
  >(initialBaseline)

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
