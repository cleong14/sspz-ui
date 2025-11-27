/**
 * SSP Statistics Card Component
 * @module components/ssp/SspStatsCard
 *
 * Displays a statistic value with label and optional icon.
 * Story 4.1: Build SSP Dashboard
 */
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import type { SxProps, Theme } from '@mui/material/styles'

interface SspStatsCardProps {
  /** The title/label for the stat */
  title: string
  /** The statistic value to display */
  value: number | string
  /** Optional icon to display */
  icon?: React.ReactNode
  /** Optional color for the value */
  color?: string
  /** Optional background color */
  bgcolor?: string
  /** Additional sx props */
  sx?: SxProps<Theme>
}

/**
 * A card displaying a single statistic with title and optional icon.
 */
export function SspStatsCard({
  title,
  value,
  icon,
  color,
  bgcolor,
  sx,
}: SspStatsCardProps): JSX.Element {
  return (
    <Card
      sx={{
        height: '100%',
        bgcolor: bgcolor || 'background.paper',
        ...sx,
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ fontWeight: 500 }}
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              component="div"
              sx={{
                fontWeight: 700,
                color: color || 'text.primary',
              }}
            >
              {value}
            </Typography>
          </Box>
          {icon && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: color ? `${color}15` : 'action.hover',
                color: color || 'text.secondary',
              }}
            >
              {icon}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

export default SspStatsCard
