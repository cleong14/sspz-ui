/**
 * Control Detail Sheet Component
 * @module views/Controls/components/ControlDetailSheet
 *
 * Slide-out sheet displaying full control details including description,
 * guidance, parameters, related controls, and baseline applicability.
 *
 * Story: 3.5 - Build Control Detail View
 */

import * as React from 'react'
import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
import CloseIcon from '@mui/icons-material/Close'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import LinkIcon from '@mui/icons-material/Link'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import type { Control } from '@/types/control'
import { getBaselineBadges } from '@/lib/controls'

interface ControlDetailSheetProps {
  control: Control | null
  open: boolean
  onClose: () => void
  onRelatedControlClick?: (controlId: string) => void
}

/**
 * Get the color for a baseline badge
 */
function getBaselineColor(baseline: string): 'success' | 'warning' | 'error' {
  switch (baseline) {
    case 'Low':
      return 'success'
    case 'Moderate':
      return 'warning'
    case 'High':
      return 'error'
    default:
      return 'success'
  }
}

/**
 * Format parameter ID for display
 */
function formatParamId(id: string): string {
  // Convert "ac-01_odp.01" to "AC-1 ODP.01"
  return id.toUpperCase().replace(/_/g, ' ').replace(/\./, '.')
}

/**
 * Control detail sheet component.
 */
const ControlDetailSheet: React.FC<ControlDetailSheetProps> = ({
  control,
  open,
  onClose,
  onRelatedControlClick,
}): JSX.Element => {
  const [copied, setCopied] = React.useState(false)

  // Handle keyboard escape
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  // Handle copy control ID
  const handleCopyId = React.useCallback(async () => {
    if (!control) return

    try {
      await navigator.clipboard.writeText(control.id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy control ID:', err)
    }
  }, [control])

  // Handle related control click
  const handleRelatedClick = React.useCallback(
    (controlId: string) => {
      onRelatedControlClick?.(controlId)
    },
    [onRelatedControlClick]
  )

  if (!control) return <></>

  const badges = getBaselineBadges(control)
  const isEnhancement = control.id.includes('(')
  const hasParameters = control.parameters && control.parameters.length > 0
  const hasRelatedControls =
    control.relatedControls && control.relatedControls.length > 0
  const hasEnhancements =
    control.enhancements && control.enhancements.length > 0

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 480, md: 560 },
          maxWidth: '100%',
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 2,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography
                variant="h5"
                component="h2"
                sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}
              >
                {control.id}
              </Typography>
              <Tooltip title={copied ? 'Copied!' : 'Copy control ID'}>
                <IconButton size="small" onClick={handleCopyId}>
                  {copied ? (
                    <CheckCircleOutlineIcon fontSize="small" color="success" />
                  ) : (
                    <ContentCopyIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
              {isEnhancement && (
                <Chip
                  label="Enhancement"
                  size="small"
                  color="info"
                  variant="outlined"
                />
              )}
            </Box>
            <Typography variant="h6" component="h3" gutterBottom>
              {control.title}
            </Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {badges.map((badge) => (
                <Chip
                  key={badge}
                  label={badge}
                  size="small"
                  color={getBaselineColor(badge)}
                />
              ))}
              {badges.length === 0 && (
                <Chip
                  label="Not in baseline"
                  size="small"
                  variant="outlined"
                  sx={{ opacity: 0.6 }}
                />
              )}
            </Stack>
          </Box>
          <IconButton
            onClick={onClose}
            aria-label="Close detail view"
            edge="end"
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {/* Description */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Control Statement
            </Typography>
            <Typography
              variant="body2"
              sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}
            >
              {control.description || 'No description available.'}
            </Typography>
          </Box>

          {/* Guidance */}
          {control.guidance && (
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">
                  Supplemental Guidance
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}
                >
                  {control.guidance}
                </Typography>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Parameters */}
          {hasParameters && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">
                  Parameters ({control.parameters!.length})
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  {control.parameters!.map((param) => (
                    <Box key={param.id}>
                      <Typography
                        variant="caption"
                        color="primary"
                        sx={{ fontFamily: 'monospace' }}
                      >
                        {formatParamId(param.id)}
                      </Typography>
                      {param.label && (
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {param.label}
                        </Typography>
                      )}
                      {param.guidelines && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 0.5 }}
                        >
                          {param.guidelines}
                        </Typography>
                      )}
                      {param.select && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Select{' '}
                            {param.select.howMany === 'one-or-more'
                              ? 'one or more'
                              : 'one'}
                            :
                          </Typography>
                          <Stack
                            direction="row"
                            spacing={0.5}
                            flexWrap="wrap"
                            useFlexGap
                            sx={{ mt: 0.5 }}
                          >
                            {param.select.choices.map((choice, idx) => (
                              <Chip
                                key={idx}
                                label={choice}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Related Controls */}
          {hasRelatedControls && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">
                  Related Controls ({control.relatedControls!.length})
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                  {control.relatedControls!.map((relatedId) => (
                    <Button
                      key={relatedId}
                      size="small"
                      variant="outlined"
                      startIcon={<LinkIcon />}
                      onClick={() => handleRelatedClick(relatedId)}
                      sx={{ textTransform: 'none' }}
                    >
                      {relatedId}
                    </Button>
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Enhancements */}
          {hasEnhancements && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">
                  Enhancements ({control.enhancements!.length})
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                  {control.enhancements!.map((enhancement) => {
                    const enhId =
                      typeof enhancement === 'string'
                        ? enhancement
                        : enhancement.id
                    return (
                      <Button
                        key={enhId}
                        size="small"
                        variant="outlined"
                        color="info"
                        onClick={() => handleRelatedClick(enhId)}
                        sx={{ textTransform: 'none' }}
                      >
                        {enhId}
                      </Button>
                    )
                  })}
                </Stack>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Parent Control (for enhancements) */}
          {control.parentControl && (
            <Box sx={{ mt: 2 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Parent Control
              </Typography>
              <Button
                size="small"
                variant="outlined"
                startIcon={<LinkIcon />}
                onClick={() => handleRelatedClick(control.parentControl!)}
                sx={{ textTransform: 'none' }}
              >
                {control.parentControl}
              </Button>
            </Box>
          )}
        </Box>

        {/* Footer */}
        <Divider />
        <Box sx={{ p: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Source: NIST SP 800-53 Rev 5
          </Typography>
        </Box>
      </Box>
    </Drawer>
  )
}

export default ControlDetailSheet
