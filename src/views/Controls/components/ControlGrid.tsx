/**
 * Control Grid Component
 * @module views/Controls/components/ControlGrid
 *
 * Responsive grid layout for control cards.
 * 3 columns on desktop, 2 on tablet, 1 on mobile.
 *
 * Story: 3.3 - Build Control Catalog Browse Page
 */

import * as React from 'react'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import type { Control } from '@/types/control'
import ControlCard from './ControlCard'

interface ControlGridProps {
  controls: Control[]
  loading?: boolean
  onControlClick?: (control: Control) => void
  emptyMessage?: string
}

/**
 * Responsive grid of control cards.
 */
const ControlGrid: React.FC<ControlGridProps> = ({
  controls,
  loading = false,
  onControlClick,
  emptyMessage = 'No controls found',
}): JSX.Element => {
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 300,
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  if (controls.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 200,
          p: 4,
        }}
      >
        <Typography variant="body1" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Box>
    )
  }

  return (
    <Grid container spacing={2}>
      {controls.map((control) => (
        <Grid item key={control.id} xs={12} sm={6} md={4}>
          <ControlCard control={control} onClick={onControlClick} />
        </Grid>
      ))}
    </Grid>
  )
}

export default ControlGrid
