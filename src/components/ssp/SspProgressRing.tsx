/**
 * SSP Progress Ring Component
 * @module components/ssp/SspProgressRing
 *
 * Displays a circular progress indicator showing control completion percentage.
 * Story 4.1: Build SSP Dashboard
 */
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'

interface SspProgressRingProps {
  /** Completion percentage (0-100) */
  value: number
  /** Size of the ring in pixels */
  size?: number
  /** Thickness of the ring */
  thickness?: number
  /** Whether to show the percentage text */
  showLabel?: boolean
}

/**
 * Circular progress ring showing SSP completion percentage.
 * Uses color coding: red < 25%, orange < 50%, yellow < 75%, green >= 75%
 */
export function SspProgressRing({
  value,
  size = 60,
  thickness = 4,
  showLabel = true,
}: SspProgressRingProps): JSX.Element {
  // Ensure value is within bounds
  const normalizedValue = Math.min(100, Math.max(0, value))

  // Determine color based on progress
  const getColor = (): 'error' | 'warning' | 'info' | 'success' => {
    if (normalizedValue < 25) return 'error'
    if (normalizedValue < 50) return 'warning'
    if (normalizedValue < 75) return 'info'
    return 'success'
  }

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      {/* Background circle */}
      <CircularProgress
        variant="determinate"
        value={100}
        size={size}
        thickness={thickness}
        sx={{
          color: (theme) => theme.palette.grey[200],
        }}
      />
      {/* Progress circle */}
      <CircularProgress
        variant="determinate"
        value={normalizedValue}
        size={size}
        thickness={thickness}
        color={getColor()}
        sx={{
          position: 'absolute',
          left: 0,
        }}
      />
      {showLabel && (
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="caption"
            component="div"
            color="text.secondary"
            sx={{
              fontWeight: 600,
              fontSize: size > 50 ? '0.75rem' : '0.625rem',
            }}
          >
            {`${Math.round(normalizedValue)}%`}
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default SspProgressRing
