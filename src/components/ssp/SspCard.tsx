/**
 * SSP Project Card Component
 * @module components/ssp/SspCard
 *
 * Displays an SSP project as a card with summary info and quick actions.
 * Story 4.1: Build SSP Dashboard
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import ArchiveIcon from '@mui/icons-material/Archive'
import UnarchiveIcon from '@mui/icons-material/Unarchive'
import DeleteIcon from '@mui/icons-material/Delete'
import type { SspProject, SspStatus, Baseline } from '@/types/ssp'
import SspProgressRing from './SspProgressRing'

interface SspCardProps {
  /** The SSP project to display */
  project: SspProject
  /** Callback when Open action is clicked */
  onOpen?: (project: SspProject) => void
  /** Callback when Duplicate action is clicked */
  onDuplicate?: (project: SspProject) => void
  /** Callback when Archive action is clicked */
  onArchive?: (project: SspProject) => void
  /** Callback when Restore action is clicked (for archived projects) */
  onRestore?: (project: SspProject) => void
  /** Callback when Delete action is clicked */
  onDelete?: (project: SspProject) => void
}

// Status configuration for display
const STATUS_CONFIG: Record<
  SspStatus,
  {
    label: string
    color: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'info'
  }
> = {
  DRAFT: { label: 'Draft', color: 'default' },
  IN_PROGRESS: { label: 'In Progress', color: 'primary' },
  REVIEW: { label: 'Review', color: 'warning' },
  COMPLETE: { label: 'Complete', color: 'success' },
}

// Baseline configuration for display
const BASELINE_CONFIG: Record<Baseline, { label: string; color: string }> = {
  LOW: { label: 'Low', color: '#4caf50' },
  MODERATE: { label: 'Moderate', color: '#ff9800' },
  HIGH: { label: 'High', color: '#f44336' },
  FEDRAMP_LOW: { label: 'FedRAMP Low', color: '#2196f3' },
  FEDRAMP_MODERATE: { label: 'FedRAMP Moderate', color: '#9c27b0' },
  FEDRAMP_HIGH: { label: 'FedRAMP High', color: '#e91e63' },
  FEDRAMP_LI_SAAS: { label: 'FedRAMP LI-SaaS', color: '#00bcd4' },
}

/**
 * Calculate control implementation progress.
 */
function calculateProgress(project: SspProject): number {
  const { implementations } = project
  if (!implementations || implementations.length === 0) return 0

  const completed = implementations.filter(
    (impl) => impl.status === 'IMPLEMENTED' || impl.status === 'NOT_APPLICABLE'
  ).length

  return Math.round((completed / implementations.length) * 100)
}

/**
 * SSP Project Card for dashboard display.
 */
export function SspCard({
  project,
  onOpen,
  onDuplicate,
  onArchive,
  onRestore,
  onDelete,
}: SspCardProps): JSX.Element {
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const menuOpen = Boolean(anchorEl)

  const isArchived = Boolean(project.archivedAt)
  const progress = calculateProgress(project)
  const statusConfig = STATUS_CONFIG[project.status]
  const baselineConfig = BASELINE_CONFIG[project.baseline]

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleOpen = () => {
    handleMenuClose()
    if (onOpen) {
      onOpen(project)
    } else {
      navigate(`/app/projects/${project.id}`)
    }
  }

  const handleDuplicate = () => {
    handleMenuClose()
    onDuplicate?.(project)
  }

  const handleArchive = () => {
    handleMenuClose()
    if (isArchived) {
      onRestore?.(project)
    } else {
      onArchive?.(project)
    }
  }

  const handleDelete = () => {
    handleMenuClose()
    onDelete?.(project)
  }

  const handleCardClick = () => {
    handleOpen()
  }

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s, transform 0.2s',
        opacity: isArchived ? 0.7 : 1,
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-2px)',
        },
      }}
      onClick={handleCardClick}
    >
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Chip
            label={statusConfig.label}
            color={statusConfig.color}
            size="small"
            sx={{ fontWeight: 500 }}
          />
          <Tooltip title={baselineConfig.label}>
            <Chip
              label={baselineConfig.label}
              size="small"
              sx={{
                bgcolor: baselineConfig.color,
                color: 'white',
                fontWeight: 500,
              }}
            />
          </Tooltip>
        </Box>

        <Typography
          variant="h6"
          component="h3"
          gutterBottom
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {project.name}
        </Typography>

        {project.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              mb: 2,
              minHeight: '2.5em',
            }}
          >
            {project.description}
          </Typography>
        )}

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mt: 'auto',
          }}
        >
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              Last updated
            </Typography>
            <Typography variant="body2">
              {format(new Date(project.updatedAt), 'MMM d, yyyy')}
            </Typography>
          </Box>
          <SspProgressRing value={progress} size={50} thickness={4} />
        </Box>
      </CardContent>

      <Divider />

      <CardActions sx={{ justifyContent: 'flex-end', py: 0.5 }}>
        <Tooltip title="Open">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              handleOpen()
            }}
          >
            <OpenInNewIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <IconButton
          size="small"
          onClick={handleMenuClick}
          aria-label="More actions"
          aria-controls={menuOpen ? 'ssp-card-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={menuOpen ? 'true' : undefined}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
        <Menu
          id="ssp-card-menu"
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          onClick={(e) => e.stopPropagation()}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleOpen}>
            <ListItemIcon>
              <OpenInNewIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Open</ListItemText>
          </MenuItem>
          {!isArchived && (
            <MenuItem onClick={handleDuplicate}>
              <ListItemIcon>
                <ContentCopyIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Duplicate</ListItemText>
            </MenuItem>
          )}
          <Divider />
          <MenuItem onClick={handleArchive}>
            <ListItemIcon>
              {isArchived ? (
                <UnarchiveIcon fontSize="small" />
              ) : (
                <ArchiveIcon fontSize="small" />
              )}
            </ListItemIcon>
            <ListItemText>{isArchived ? 'Restore' : 'Archive'}</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>
      </CardActions>
    </Card>
  )
}

export default SspCard
