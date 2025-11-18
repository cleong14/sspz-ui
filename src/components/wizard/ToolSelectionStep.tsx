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
      .then((tools) => {
        setAvailableTools(tools)
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
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
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
        <Button variant="contained" color="primary" onClick={handleNext}>
          Next
        </Button>
      </Box>
    </Box>
  )
}
