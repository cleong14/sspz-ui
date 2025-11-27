/**
 * Control Card Component
 * @module views/Controls/components/ControlCard
 *
 * Displays a single control as a card with ID, title, and baseline badges.
 *
 * Story: 3.3 - Build Control Catalog Browse Page
 */

import * as React from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActionArea from '@mui/material/CardActionArea'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import type { Control } from '@/types/control'
import { getBaselineBadges } from '@/lib/controls'

interface ControlCardProps {
  control: Control
  onClick?: (control: Control) => void
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
 * Control card component displaying control info with baseline badges.
 */
const ControlCard: React.FC<ControlCardProps> = ({
  control,
  onClick,
}): JSX.Element => {
  const badges = getBaselineBadges(control)
  const isEnhancement = control.id.includes('(')

  const handleClick = React.useCallback(() => {
    onClick?.(control)
  }, [control, onClick])

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        onClick?.(control)
      }
    },
    [control, onClick]
  )

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow 0.2s, border-color 0.2s',
        '&:hover': {
          boxShadow: 2,
          borderColor: 'primary.main',
        },
        ...(isEnhancement && {
          borderLeft: '3px solid',
          borderLeftColor: 'info.main',
        }),
      }}
    >
      <CardActionArea
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
        }}
        tabIndex={0}
        role="button"
        aria-label={`View details for control ${control.id}: ${control.title}`}
      >
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mb: 1,
            }}
          >
            <Typography
              variant="subtitle1"
              component="h3"
              sx={{
                fontWeight: 'bold',
                fontFamily: 'monospace',
                color: 'primary.main',
              }}
            >
              {control.id}
            </Typography>
            {isEnhancement && (
              <Chip
                label="Enhancement"
                size="small"
                variant="outlined"
                color="info"
                sx={{ ml: 1, height: 20, fontSize: '0.65rem' }}
              />
            )}
          </Box>

          <Typography
            variant="body2"
            sx={{
              flex: 1,
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {control.title}
          </Typography>

          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {badges.map((badge) => (
              <Chip
                key={badge}
                label={badge}
                size="small"
                color={getBaselineColor(badge)}
                sx={{ height: 22, fontSize: '0.7rem' }}
              />
            ))}
            {badges.length === 0 && (
              <Chip
                label="No Baseline"
                size="small"
                variant="outlined"
                sx={{ height: 22, fontSize: '0.7rem', opacity: 0.6 }}
              />
            )}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

export default ControlCard
