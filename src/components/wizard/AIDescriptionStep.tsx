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
            <IconButton size="small" onClick={() => onReject(item.control.id)}>
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
