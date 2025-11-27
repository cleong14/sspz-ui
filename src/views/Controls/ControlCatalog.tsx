/**
 * Control Catalog View
 * @module views/Controls/ControlCatalog
 *
 * Displays the NIST 800-53 control catalog for browsing and searching.
 * This is a placeholder implementation that will be expanded in Epic 3.
 */
import * as React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import SecurityIcon from '@mui/icons-material/Security'

/**
 * Component that renders the control catalog view.
 * @returns {JSX.Element} The control catalog placeholder component.
 */
const ControlCatalog: React.FC = (): JSX.Element => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Control Catalog
      </Typography>
      <Paper
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <SecurityIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
        <Typography variant="h6" color="text.secondary">
          NIST 800-53 Rev 5 Controls
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Browse and search the complete NIST 800-53 control catalog. Filter by
          baseline (Low, Moderate, High) and FedRAMP requirements. This feature
          will be available in a future release.
        </Typography>
      </Paper>
    </Box>
  )
}

export default ControlCatalog
