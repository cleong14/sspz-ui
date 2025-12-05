/**
 * System Identification Step (Step 1)
 * @module views/SspWizard/steps/SystemIdentificationStep
 *
 * Collects system identification and boundary information.
 *
 * Story 5.2: Implement System Identification Form
 * Story 5.3: Implement System Boundary Form
 *
 * FR14: Users can input system identification information
 * FR15: Users can define system boundary and components
 */
import { useState, useCallback } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Tooltip from '@mui/material/Tooltip'
import FormHelperText from '@mui/material/FormHelperText'
import Chip from '@mui/material/Chip'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import InfoIcon from '@mui/icons-material/Info'
import LinkIcon from '@mui/icons-material/Link'

import { v4 as uuidv4 } from 'uuid'

import type { WizardStepProps } from '../SspWizard'
import type {
  SystemComponent,
  ExternalConnection,
  SystemInfo,
} from '@/types/ssp'

// ============================================================================
// Types
// ============================================================================

type SystemType = SystemInfo['systemType']

interface ComponentDialogState {
  open: boolean
  mode: 'add' | 'edit'
  component: SystemComponent | null
}

interface ConnectionDialogState {
  open: boolean
  mode: 'add' | 'edit'
  connection: ExternalConnection | null
}

// ============================================================================
// Constants
// ============================================================================

const SYSTEM_TYPES: {
  value: SystemType
  label: string
  description: string
}[] = [
  {
    value: 'major-application',
    label: 'Major Application',
    description: 'A system that performs clearly defined functions',
  },
  {
    value: 'general-support-system',
    label: 'General Support System',
    description:
      'An interconnected set of information resources under the same management',
  },
  {
    value: 'minor-application',
    label: 'Minor Application',
    description: 'A small application that supports a specific function',
  },
  {
    value: 'other',
    label: 'Other',
    description: 'System type not covered by the above categories',
  },
]

const COMPONENT_TYPES = [
  { value: 'hardware', label: 'Hardware' },
  { value: 'software', label: 'Software' },
  { value: 'service', label: 'Service' },
  { value: 'policy', label: 'Policy' },
  { value: 'other', label: 'Other' },
] as const

const CONNECTION_TYPES = [
  'API',
  'Database Connection',
  'File Transfer',
  'Network Connection',
  'Message Queue',
  'Email',
  'Other',
]

// ============================================================================
// Component
// ============================================================================

/**
 * System Identification Step component.
 */
const SystemIdentificationStep: React.FC<WizardStepProps> = ({
  project,
  onUpdate,
}) => {
  // Component dialog state
  const [componentDialog, setComponentDialog] = useState<ComponentDialogState>({
    open: false,
    mode: 'add',
    component: null,
  })

  // Connection dialog state
  const [connectionDialog, setConnectionDialog] =
    useState<ConnectionDialogState>({
      open: false,
      mode: 'add',
      connection: null,
    })

  // Temporary form state for dialogs
  const [tempComponent, setTempComponent] = useState<Partial<SystemComponent>>(
    {}
  )
  const [tempConnection, setTempConnection] = useState<
    Partial<ExternalConnection>
  >({})

  // Handlers for system info fields
  const handleSystemNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({
        name: event.target.value,
        systemInfo: {
          ...project.systemInfo,
          systemName: event.target.value,
        },
      })
    },
    [project.systemInfo, onUpdate]
  )

  const handleSystemIdChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({
        systemInfo: {
          ...project.systemInfo,
          systemId: event.target.value,
        },
      })
    },
    [project.systemInfo, onUpdate]
  )

  const handleDescriptionChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({
        description: event.target.value,
        systemInfo: {
          ...project.systemInfo,
          description: event.target.value,
        },
      })
    },
    [project.systemInfo, onUpdate]
  )

  const handleSystemTypeChange = useCallback(
    (event: SelectChangeEvent) => {
      onUpdate({
        systemInfo: {
          ...project.systemInfo,
          systemType: event.target.value as SystemType,
        },
      })
    },
    [project.systemInfo, onUpdate]
  )

  const handleBoundaryDescriptionChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({
        systemInfo: {
          ...project.systemInfo,
          boundary: {
            ...project.systemInfo.boundary,
            description: event.target.value,
          },
        },
      })
    },
    [project.systemInfo, onUpdate]
  )

  const handleNetworkDiagramRefChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({
        systemInfo: {
          ...project.systemInfo,
          boundary: {
            ...project.systemInfo.boundary,
            networkDiagramRef: event.target.value,
          },
        },
      })
    },
    [project.systemInfo, onUpdate]
  )

  // Component CRUD handlers
  const handleOpenComponentDialog = useCallback(
    (mode: 'add' | 'edit', component?: SystemComponent) => {
      setTempComponent(
        mode === 'edit' && component ? { ...component } : { type: 'software' }
      )
      setComponentDialog({ open: true, mode, component: component || null })
    },
    []
  )

  const handleCloseComponentDialog = useCallback(() => {
    setComponentDialog({ open: false, mode: 'add', component: null })
    setTempComponent({})
  }, [])

  const handleSaveComponent = useCallback(() => {
    if (
      !tempComponent.name ||
      !tempComponent.description ||
      !tempComponent.type
    ) {
      return
    }

    const components = [...project.systemInfo.boundary.components]

    if (componentDialog.mode === 'add') {
      const newComponent: SystemComponent = {
        id: uuidv4(),
        name: tempComponent.name,
        description: tempComponent.description,
        type: tempComponent.type,
        vendor: tempComponent.vendor,
        version: tempComponent.version,
      }
      components.push(newComponent)
    } else if (componentDialog.component) {
      const index = components.findIndex(
        (c) => c.id === componentDialog.component!.id
      )
      if (index !== -1) {
        components[index] = {
          ...components[index],
          name: tempComponent.name,
          description: tempComponent.description,
          type: tempComponent.type,
          vendor: tempComponent.vendor,
          version: tempComponent.version,
        }
      }
    }

    onUpdate({
      systemInfo: {
        ...project.systemInfo,
        boundary: {
          ...project.systemInfo.boundary,
          components,
        },
      },
    })

    handleCloseComponentDialog()
  }, [
    tempComponent,
    componentDialog,
    project.systemInfo,
    onUpdate,
    handleCloseComponentDialog,
  ])

  const handleDeleteComponent = useCallback(
    (componentId: string) => {
      const components = project.systemInfo.boundary.components.filter(
        (c) => c.id !== componentId
      )
      onUpdate({
        systemInfo: {
          ...project.systemInfo,
          boundary: {
            ...project.systemInfo.boundary,
            components,
          },
        },
      })
    },
    [project.systemInfo, onUpdate]
  )

  // Connection CRUD handlers
  const handleOpenConnectionDialog = useCallback(
    (mode: 'add' | 'edit', connection?: ExternalConnection) => {
      setTempConnection(
        mode === 'edit' && connection
          ? { ...connection }
          : { connectionType: 'API', authorizationStatus: 'pending' }
      )
      setConnectionDialog({ open: true, mode, connection: connection || null })
    },
    []
  )

  const handleCloseConnectionDialog = useCallback(() => {
    setConnectionDialog({ open: false, mode: 'add', connection: null })
    setTempConnection({})
  }, [])

  const handleSaveConnection = useCallback(() => {
    if (
      !tempConnection.systemName ||
      !tempConnection.organization ||
      !tempConnection.connectionType ||
      !tempConnection.dataDescription
    ) {
      return
    }

    const connections = [...project.systemInfo.boundary.externalConnections]

    if (connectionDialog.mode === 'add') {
      const newConnection: ExternalConnection = {
        id: uuidv4(),
        systemName: tempConnection.systemName,
        organization: tempConnection.organization,
        connectionType: tempConnection.connectionType,
        dataDescription: tempConnection.dataDescription,
        securityRequirements: tempConnection.securityRequirements,
        authorizationStatus: tempConnection.authorizationStatus || 'pending',
      }
      connections.push(newConnection)
    } else if (connectionDialog.connection) {
      const index = connections.findIndex(
        (c) => c.id === connectionDialog.connection!.id
      )
      if (index !== -1) {
        connections[index] = {
          ...connections[index],
          systemName: tempConnection.systemName,
          organization: tempConnection.organization,
          connectionType: tempConnection.connectionType,
          dataDescription: tempConnection.dataDescription,
          securityRequirements: tempConnection.securityRequirements,
          authorizationStatus: tempConnection.authorizationStatus || 'pending',
        }
      }
    }

    onUpdate({
      systemInfo: {
        ...project.systemInfo,
        boundary: {
          ...project.systemInfo.boundary,
          externalConnections: connections,
        },
      },
    })

    handleCloseConnectionDialog()
  }, [
    tempConnection,
    connectionDialog,
    project.systemInfo,
    onUpdate,
    handleCloseConnectionDialog,
  ])

  const handleDeleteConnection = useCallback(
    (connectionId: string) => {
      const connections =
        project.systemInfo.boundary.externalConnections.filter(
          (c) => c.id !== connectionId
        )
      onUpdate({
        systemInfo: {
          ...project.systemInfo,
          boundary: {
            ...project.systemInfo.boundary,
            externalConnections: connections,
          },
        },
      })
    },
    [project.systemInfo, onUpdate]
  )

  return (
    <Box>
      {/* Section: System Identification */}
      <Typography variant="h6" gutterBottom>
        System Identification
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Provide basic identification information for your system.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            required
            label="System Name"
            value={project.systemInfo.systemName || ''}
            onChange={handleSystemNameChange}
            helperText="The official name of your system"
            inputProps={{ maxLength: 200 }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="System Identifier/Acronym"
            value={project.systemInfo.systemId || ''}
            onChange={handleSystemIdChange}
            helperText="Short identifier (e.g., ACME-SSO)"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            multiline
            rows={4}
            label="System Description"
            value={project.systemInfo.description || ''}
            onChange={handleDescriptionChange}
            helperText="Describe the system's purpose and functionality"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth required>
            <InputLabel id="system-type-label">System Type</InputLabel>
            <Select
              labelId="system-type-label"
              value={project.systemInfo.systemType || ''}
              label="System Type"
              onChange={handleSystemTypeChange}
            >
              {SYSTEM_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  <Box>
                    <Typography variant="body1">{type.label}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {type.description}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              Select the type of system being documented
            </FormHelperText>
          </FormControl>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Section: Authorization Boundary */}
      <Typography variant="h6" gutterBottom>
        Authorization Boundary
        <Tooltip title="The boundary defines what is included in the authorization scope">
          <IconButton size="small" sx={{ ml: 1 }}>
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Define the authorization boundary and list system components.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Boundary Description"
            value={project.systemInfo.boundary.description || ''}
            onChange={handleBoundaryDescriptionChange}
            helperText="Describe the authorization boundary and what it encompasses"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Network Diagram Reference"
            value={project.systemInfo.boundary.networkDiagramRef || ''}
            onChange={handleNetworkDiagramRefChange}
            helperText="File path or URL to network diagram"
            InputProps={{
              startAdornment: (
                <LinkIcon sx={{ mr: 1, color: 'action.active' }} />
              ),
            }}
          />
        </Grid>
      </Grid>

      {/* System Components List */}
      <Box sx={{ mt: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="subtitle1">
            System Components ({project.systemInfo.boundary.components.length})
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => handleOpenComponentDialog('add')}
          >
            Add Component
          </Button>
        </Box>

        {project.systemInfo.boundary.components.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No components defined. Add components that are part of your system
              boundary.
            </Typography>
          </Paper>
        ) : (
          <Paper variant="outlined">
            <List>
              {project.systemInfo.boundary.components.map(
                (component, index) => (
                  <ListItem
                    key={component.id}
                    divider={
                      index < project.systemInfo.boundary.components.length - 1
                    }
                  >
                    <ListItemText
                      primary={
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          {component.name}
                          <Chip
                            label={component.type}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          {component.description}
                          {component.vendor && ` • ${component.vendor}`}
                          {component.version && ` v${component.version}`}
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() =>
                          handleOpenComponentDialog('edit', component)
                        }
                        size="small"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={() => handleDeleteComponent(component.id)}
                        size="small"
                        sx={{ ml: 1 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                )
              )}
            </List>
          </Paper>
        )}
      </Box>

      {/* External Connections List */}
      <Box sx={{ mt: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="subtitle1">
            External Connections (
            {project.systemInfo.boundary.externalConnections.length})
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => handleOpenConnectionDialog('add')}
          >
            Add Connection
          </Button>
        </Box>

        {project.systemInfo.boundary.externalConnections.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No external connections defined. Add connections to systems
              outside your boundary.
            </Typography>
          </Paper>
        ) : (
          <Paper variant="outlined">
            <List>
              {project.systemInfo.boundary.externalConnections.map(
                (connection, index) => (
                  <ListItem
                    key={connection.id}
                    divider={
                      index <
                      project.systemInfo.boundary.externalConnections.length - 1
                    }
                  >
                    <ListItemText
                      primary={
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          {connection.systemName}
                          <Chip
                            label={connection.connectionType}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            label={connection.authorizationStatus?.replace(
                              '_',
                              ' '
                            )}
                            size="small"
                            color={
                              connection.authorizationStatus === 'authorized'
                                ? 'success'
                                : connection.authorizationStatus === 'pending'
                                  ? 'warning'
                                  : 'default'
                            }
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          {connection.organization} •{' '}
                          {connection.dataDescription}
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() =>
                          handleOpenConnectionDialog('edit', connection)
                        }
                        size="small"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={() => handleDeleteConnection(connection.id)}
                        size="small"
                        sx={{ ml: 1 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                )
              )}
            </List>
          </Paper>
        )}
      </Box>

      {/* Component Dialog */}
      <Dialog
        open={componentDialog.open}
        onClose={handleCloseComponentDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {componentDialog.mode === 'add' ? 'Add Component' : 'Edit Component'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Component Name"
                value={tempComponent.name || ''}
                onChange={(e) =>
                  setTempComponent({ ...tempComponent, name: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Component Type</InputLabel>
                <Select
                  value={tempComponent.type || 'software'}
                  label="Component Type"
                  onChange={(e) =>
                    setTempComponent({
                      ...tempComponent,
                      type: e.target.value as SystemComponent['type'],
                    })
                  }
                >
                  {COMPONENT_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Vendor"
                value={tempComponent.vendor || ''}
                onChange={(e) =>
                  setTempComponent({ ...tempComponent, vendor: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Version"
                value={tempComponent.version || ''}
                onChange={(e) =>
                  setTempComponent({
                    ...tempComponent,
                    version: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                multiline
                rows={2}
                label="Description"
                value={tempComponent.description || ''}
                onChange={(e) =>
                  setTempComponent({
                    ...tempComponent,
                    description: e.target.value,
                  })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseComponentDialog}>Cancel</Button>
          <Button
            onClick={handleSaveComponent}
            variant="contained"
            disabled={
              !tempComponent.name ||
              !tempComponent.description ||
              !tempComponent.type
            }
          >
            {componentDialog.mode === 'add' ? 'Add' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Connection Dialog */}
      <Dialog
        open={connectionDialog.open}
        onClose={handleCloseConnectionDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {connectionDialog.mode === 'add'
            ? 'Add External Connection'
            : 'Edit External Connection'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="External System Name"
                value={tempConnection.systemName || ''}
                onChange={(e) =>
                  setTempConnection({
                    ...tempConnection,
                    systemName: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Organization"
                value={tempConnection.organization || ''}
                onChange={(e) =>
                  setTempConnection({
                    ...tempConnection,
                    organization: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Connection Type</InputLabel>
                <Select
                  value={tempConnection.connectionType || 'API'}
                  label="Connection Type"
                  onChange={(e) =>
                    setTempConnection({
                      ...tempConnection,
                      connectionType: e.target.value,
                    })
                  }
                >
                  {CONNECTION_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Authorization Status</InputLabel>
                <Select
                  value={tempConnection.authorizationStatus || 'pending'}
                  label="Authorization Status"
                  onChange={(e) =>
                    setTempConnection({
                      ...tempConnection,
                      authorizationStatus: e.target
                        .value as ExternalConnection['authorizationStatus'],
                    })
                  }
                >
                  <MenuItem value="authorized">Authorized</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="not_required">Not Required</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                multiline
                rows={2}
                label="Data Description"
                value={tempConnection.dataDescription || ''}
                onChange={(e) =>
                  setTempConnection({
                    ...tempConnection,
                    dataDescription: e.target.value,
                  })
                }
                helperText="Describe the data exchanged through this connection"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Security Requirements"
                value={tempConnection.securityRequirements || ''}
                onChange={(e) =>
                  setTempConnection({
                    ...tempConnection,
                    securityRequirements: e.target.value,
                  })
                }
                helperText="Encryption, authentication, and other security requirements"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConnectionDialog}>Cancel</Button>
          <Button
            onClick={handleSaveConnection}
            variant="contained"
            disabled={
              !tempConnection.systemName ||
              !tempConnection.organization ||
              !tempConnection.connectionType ||
              !tempConnection.dataDescription
            }
          >
            {connectionDialog.mode === 'add' ? 'Add' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default SystemIdentificationStep
