/**
 * SSP Empty State Component
 * @module components/ssp/SspEmptyState
 *
 * Displays an empty state with CTA when no SSP projects exist.
 * Story 4.1: Build SSP Dashboard
 */
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import AddIcon from '@mui/icons-material/Add'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import DescriptionIcon from '@mui/icons-material/Description'

interface SspEmptyStateProps {
  /** Whether directory access has been granted */
  hasDirectoryAccess: boolean
  /** Callback when Create SSP button is clicked */
  onCreateClick?: () => void
  /** Callback when Connect Directory button is clicked */
  onConnectDirectory?: () => void
}

/**
 * Empty state component for SSP dashboard when no projects exist.
 */
export function SspEmptyState({
  hasDirectoryAccess,
  onCreateClick,
  onConnectDirectory,
}: SspEmptyStateProps): JSX.Element {
  if (!hasDirectoryAccess) {
    return (
      <Paper
        sx={{
          p: 6,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          bgcolor: 'background.paper',
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: 'primary.light',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
          }}
        >
          <FolderOpenIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        </Box>
        <Typography variant="h5" gutterBottom>
          Connect Your Projects Folder
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 3, maxWidth: 500 }}
        >
          To get started, connect to a folder where your SSP projects will be
          stored. This allows SSP Generator to save and load your System
          Security Plans locally.
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={<FolderOpenIcon />}
          onClick={onConnectDirectory}
        >
          Connect Projects Folder
        </Button>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
          Your data stays on your computer. Nothing is uploaded to any server.
        </Typography>
      </Paper>
    )
  }

  return (
    <Paper
      sx={{
        p: 6,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          bgcolor: 'primary.light',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
        }}
      >
        <DescriptionIcon sx={{ fontSize: 40, color: 'primary.main' }} />
      </Box>
      <Typography variant="h5" gutterBottom>
        Create Your First SSP
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mb: 3, maxWidth: 500 }}
      >
        Get started by creating a new System Security Plan. Select a baseline,
        add system information, and document your control implementations with
        AI assistance.
      </Typography>
      <Button
        variant="contained"
        size="large"
        startIcon={<AddIcon />}
        onClick={onCreateClick}
      >
        Create New SSP
      </Button>
    </Paper>
  )
}

export default SspEmptyState
