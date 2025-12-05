/**
 * System Environment Step (Step 3)
 * @module views/SspWizard/steps/SystemEnvironmentStep
 *
 * Collects system environment details and stakeholder contacts.
 *
 * Story 5.5: Implement System Environment Form
 *
 * FR17: Users can document system environment and architecture
 * FR18: Users can identify system owners and contacts
 */
import { useCallback, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'
import Autocomplete from '@mui/material/Autocomplete'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import InfoIcon from '@mui/icons-material/Info'
import PersonIcon from '@mui/icons-material/Person'
import CloudIcon from '@mui/icons-material/Cloud'
import StorageIcon from '@mui/icons-material/Storage'
import BusinessIcon from '@mui/icons-material/Business'

import type { WizardStepProps } from '../SspWizard'
import type { Contact, SystemEnvironment } from '@/types/ssp'

// ============================================================================
// Constants
// ============================================================================

const DEPLOYMENT_MODELS = [
  {
    value: 'on-premise',
    label: 'On-Premise',
    description: 'Hosted in your own data center',
  },
  {
    value: 'cloud',
    label: 'Cloud',
    description: 'Hosted by a cloud service provider',
  },
  {
    value: 'hybrid',
    label: 'Hybrid',
    description: 'Mix of on-premise and cloud resources',
  },
] as const

const CLOUD_PROVIDERS = [
  'Amazon Web Services (AWS)',
  'Microsoft Azure',
  'Google Cloud Platform (GCP)',
  'Oracle Cloud',
  'IBM Cloud',
  'Other',
]

const CLOUD_SERVICE_MODELS = [
  { value: 'IaaS', label: 'IaaS - Infrastructure as a Service' },
  { value: 'PaaS', label: 'PaaS - Platform as a Service' },
  { value: 'SaaS', label: 'SaaS - Software as a Service' },
] as const

const COMMON_OS = [
  'Amazon Linux 2',
  'CentOS',
  'Debian',
  'macOS',
  'Red Hat Enterprise Linux (RHEL)',
  'Ubuntu',
  'Windows Server 2019',
  'Windows Server 2022',
  'Windows 10/11',
]

const COMMON_TECHNOLOGIES = [
  'Docker',
  'Kubernetes',
  'Terraform',
  'Node.js',
  'Python',
  'Java',
  'Go',
  'PostgreSQL',
  'MySQL',
  'MongoDB',
  'Redis',
  'Elasticsearch',
  'Apache Kafka',
  'RabbitMQ',
  'Nginx',
  'React',
  'Vue.js',
  'Angular',
  '.NET',
]

const COMMON_DATA_TYPES = [
  'Personally Identifiable Information (PII)',
  'Protected Health Information (PHI)',
  'Financial Data',
  'Authentication Credentials',
  'Audit Logs',
  'System Configuration',
  'Business Critical Data',
  'Public Information',
]

// ============================================================================
// Sub-Components
// ============================================================================

interface ContactFormProps {
  title: string
  description: string
  icon: React.ReactNode
  contact: Contact
  onChange: (contact: Contact) => void
}

const ContactForm: React.FC<ContactFormProps> = ({
  title,
  description,
  icon,
  contact,
  onChange,
}) => {
  const handleChange = useCallback(
    (field: keyof Contact) => (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange({
        ...contact,
        [field]: event.target.value,
      })
    },
    [contact, onChange]
  )

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        {icon}
        <Typography variant="subtitle1" fontWeight={600}>
          {title}
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {description}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            label="Name"
            value={contact.name || ''}
            onChange={handleChange('name')}
            size="small"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Title"
            value={contact.title || ''}
            onChange={handleChange('title')}
            size="small"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            type="email"
            label="Email"
            value={contact.email || ''}
            onChange={handleChange('email')}
            size="small"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="tel"
            label="Phone"
            value={contact.phone || ''}
            onChange={handleChange('phone')}
            size="small"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Organization/Department"
            value={contact.organization || ''}
            onChange={handleChange('organization')}
            size="small"
          />
        </Grid>
      </Grid>
    </Paper>
  )
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * System Environment Step component.
 */
const SystemEnvironmentStep: React.FC<WizardStepProps> = ({
  project,
  onUpdate,
}) => {
  const { environment, contacts } = project.systemInfo

  // Handlers for environment fields
  const handleDeploymentModelChange = useCallback(
    (event: SelectChangeEvent) => {
      onUpdate({
        systemInfo: {
          ...project.systemInfo,
          environment: {
            ...environment,
            deploymentModel: event.target
              .value as SystemEnvironment['deploymentModel'],
            // Clear cloud fields if switching away from cloud
            ...(event.target.value === 'on-premise' && {
              cloudProvider: undefined,
              cloudServiceModel: undefined,
            }),
          },
        },
      })
    },
    [project.systemInfo, environment, onUpdate]
  )

  const handleCloudProviderChange = useCallback(
    (_event: React.SyntheticEvent, value: string | null) => {
      onUpdate({
        systemInfo: {
          ...project.systemInfo,
          environment: {
            ...environment,
            cloudProvider: value || undefined,
          },
        },
      })
    },
    [project.systemInfo, environment, onUpdate]
  )

  const handleCloudServiceModelChange = useCallback(
    (event: SelectChangeEvent) => {
      onUpdate({
        systemInfo: {
          ...project.systemInfo,
          environment: {
            ...environment,
            cloudServiceModel: event.target
              .value as SystemEnvironment['cloudServiceModel'],
          },
        },
      })
    },
    [project.systemInfo, environment, onUpdate]
  )

  const handleOperatingSystemsChange = useCallback(
    (_event: React.SyntheticEvent, value: string[]) => {
      onUpdate({
        systemInfo: {
          ...project.systemInfo,
          environment: {
            ...environment,
            operatingSystems: value,
          },
        },
      })
    },
    [project.systemInfo, environment, onUpdate]
  )

  const handleTechnologiesChange = useCallback(
    (_event: React.SyntheticEvent, value: string[]) => {
      onUpdate({
        systemInfo: {
          ...project.systemInfo,
          environment: {
            ...environment,
            technologies: value,
          },
        },
      })
    },
    [project.systemInfo, environment, onUpdate]
  )

  const handleDataTypesChange = useCallback(
    (_event: React.SyntheticEvent, value: string[]) => {
      onUpdate({
        systemInfo: {
          ...project.systemInfo,
          environment: {
            ...environment,
            dataTypes: value,
          },
        },
      })
    },
    [project.systemInfo, environment, onUpdate]
  )

  // Contact handlers
  const handleContactChange = useCallback(
    (role: keyof typeof contacts) => (contact: Contact) => {
      onUpdate({
        systemInfo: {
          ...project.systemInfo,
          contacts: {
            ...contacts,
            [role]: contact,
          },
        },
      })
    },
    [project.systemInfo, contacts, onUpdate]
  )

  const isCloudDeployment = environment.deploymentModel !== 'on-premise'

  return (
    <Box>
      {/* Section: Deployment Information */}
      <Typography variant="h6" gutterBottom>
        System Environment
        <Tooltip title="Describe the technical environment where your system operates">
          <IconButton size="small" sx={{ ml: 1 }}>
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Specify the deployment model, cloud provider (if applicable), and
        technologies used by your system.
      </Typography>

      <Grid container spacing={3}>
        {/* Deployment Model */}
        <Grid item xs={12} md={4}>
          <FormControl fullWidth required>
            <InputLabel>Deployment Model</InputLabel>
            <Select
              value={environment.deploymentModel || ''}
              label="Deployment Model"
              onChange={handleDeploymentModelChange}
            >
              {DEPLOYMENT_MODELS.map((model) => (
                <MenuItem key={model.value} value={model.value}>
                  <Box>
                    <Typography variant="body1">{model.label}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {model.description}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Cloud Provider (conditional) */}
        {isCloudDeployment && (
          <>
            <Grid item xs={12} md={4}>
              <Autocomplete
                freeSolo
                options={CLOUD_PROVIDERS}
                value={environment.cloudProvider || ''}
                onChange={handleCloudProviderChange}
                renderInput={(params) => (
                  <TextField {...params} label="Cloud Provider" required />
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Cloud Service Model</InputLabel>
                <Select
                  value={environment.cloudServiceModel || ''}
                  label="Cloud Service Model"
                  onChange={handleCloudServiceModelChange}
                >
                  {CLOUD_SERVICE_MODELS.map((model) => (
                    <MenuItem key={model.value} value={model.value}>
                      {model.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </>
        )}

        {/* Operating Systems */}
        <Grid item xs={12} md={6}>
          <Autocomplete
            multiple
            freeSolo
            options={COMMON_OS}
            value={environment.operatingSystems || []}
            onChange={handleOperatingSystemsChange}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={option}
                  {...getTagProps({ index })}
                  key={option}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Operating Systems"
                helperText="Operating systems used in your environment"
              />
            )}
          />
        </Grid>

        {/* Technologies */}
        <Grid item xs={12} md={6}>
          <Autocomplete
            multiple
            freeSolo
            options={COMMON_TECHNOLOGIES}
            value={environment.technologies || []}
            onChange={handleTechnologiesChange}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={option}
                  {...getTagProps({ index })}
                  key={option}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Technologies & Frameworks"
                helperText="Key technologies and frameworks used"
              />
            )}
          />
        </Grid>

        {/* Data Types */}
        <Grid item xs={12}>
          <Autocomplete
            multiple
            freeSolo
            options={COMMON_DATA_TYPES}
            value={environment.dataTypes || []}
            onChange={handleDataTypesChange}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={option}
                  {...getTagProps({ index })}
                  key={option}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Data Types Processed"
                helperText="Types of sensitive or regulated data processed by the system"
              />
            )}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Section: System Contacts */}
      <Typography variant="h6" gutterBottom>
        System Stakeholders
        <Tooltip title="Identify key personnel responsible for the system">
          <IconButton size="small" sx={{ ml: 1 }}>
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Provide contact information for system stakeholders. These contacts will
        appear in your SSP documentation.
      </Typography>

      <Grid container spacing={3}>
        {/* System Owner */}
        <Grid item xs={12} md={6}>
          <ContactForm
            title="System Owner"
            description="Person accountable for the system's operation and security"
            icon={<BusinessIcon color="primary" />}
            contact={contacts.systemOwner}
            onChange={handleContactChange('systemOwner')}
          />
        </Grid>

        {/* Authorizing Official */}
        <Grid item xs={12} md={6}>
          <ContactForm
            title="Authorizing Official"
            description="Executive responsible for accepting system risk"
            icon={<PersonIcon color="primary" />}
            contact={contacts.authorizingOfficial}
            onChange={handleContactChange('authorizingOfficial')}
          />
        </Grid>

        {/* Security POC */}
        <Grid item xs={12} md={6}>
          <ContactForm
            title="Security Point of Contact"
            description="Primary contact for security-related matters"
            icon={<PersonIcon color="secondary" />}
            contact={contacts.securityPoc}
            onChange={handleContactChange('securityPoc')}
          />
        </Grid>

        {/* Technical POC */}
        <Grid item xs={12} md={6}>
          <ContactForm
            title="Technical Point of Contact"
            description="Primary contact for technical implementation questions"
            icon={<PersonIcon color="secondary" />}
            contact={contacts.technicalPoc}
            onChange={handleContactChange('technicalPoc')}
          />
        </Grid>
      </Grid>
    </Box>
  )
}

export default SystemEnvironmentStep
