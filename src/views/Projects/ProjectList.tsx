/**
 * Project List View
 * @module views/Projects/ProjectList
 *
 * Displays a list of SSP projects. This is a placeholder implementation
 * that will be expanded in Epic 4.
 */
import * as React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import FolderIcon from '@mui/icons-material/Folder'

/**
 * Component that renders the SSP project list view.
 * @returns {JSX.Element} The project list placeholder component.
 */
const ProjectList: React.FC = (): JSX.Element => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Projects
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
        <FolderIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
        <Typography variant="h6" color="text.secondary">
          SSP Project Management
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Create, manage, and track your System Security Plans. This feature
          will be available in a future release.
        </Typography>
      </Paper>
    </Box>
  )
}

export default ProjectList
