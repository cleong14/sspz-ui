import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import {
  Box,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Typography,
} from '@mui/material'
import { SystemCharacteristics, ImpactLevel } from '../../types/ssp'

const schema = yup.object({
  systemName: yup.string().required('System name is required'),
  systemId: yup.string().required('System ID is required'),
  description: yup.string().required('Description is required'),
  systemType: yup.string().required('System type is required'),
  authorizationBoundary: yup
    .string()
    .required('Authorization boundary is required'),
  confidentiality: yup
    .string()
    .oneOf(['low', 'moderate', 'high'])
    .required('Confidentiality is required'),
  integrity: yup
    .string()
    .oneOf(['low', 'moderate', 'high'])
    .required('Integrity is required'),
  availability: yup
    .string()
    .oneOf(['low', 'moderate', 'high'])
    .required('Availability is required'),
})

interface FormData {
  systemName: string
  systemId: string
  description: string
  systemType: string
  authorizationBoundary: string
  confidentiality: ImpactLevel
  integrity: ImpactLevel
  availability: ImpactLevel
}

interface ProjectBasicsStepProps {
  onNext: (data: SystemCharacteristics) => void
  initialData?: SystemCharacteristics
}

export function ProjectBasicsStep({
  onNext,
  initialData,
}: ProjectBasicsStepProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      systemName: initialData?.systemName || '',
      systemId: initialData?.systemId || '',
      description: initialData?.description || '',
      systemType: initialData?.systemType || '',
      authorizationBoundary: initialData?.authorizationBoundary || '',
      confidentiality:
        initialData?.securityImpactLevel.confidentiality || 'moderate',
      integrity: initialData?.securityImpactLevel.integrity || 'moderate',
      availability: initialData?.securityImpactLevel.availability || 'moderate',
    },
  })

  const onSubmit = (data: FormData) => {
    const systemCharacteristics: SystemCharacteristics = {
      systemName: data.systemName,
      systemId: data.systemId,
      description: data.description,
      systemType: data.systemType,
      authorizationBoundary: data.authorizationBoundary,
      securityImpactLevel: {
        confidentiality: data.confidentiality,
        integrity: data.integrity,
        availability: data.availability,
      },
    }
    onNext(systemCharacteristics)
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Step 1: Project Basics
      </Typography>

      <Controller
        name="systemName"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="System Name"
            fullWidth
            margin="normal"
            error={!!errors.systemName}
            helperText={errors.systemName?.message}
          />
        )}
      />

      <Controller
        name="systemId"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="System ID"
            fullWidth
            margin="normal"
            error={!!errors.systemId}
            helperText={errors.systemId?.message}
          />
        )}
      />

      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Description"
            fullWidth
            multiline
            rows={4}
            margin="normal"
            error={!!errors.description}
            helperText={errors.description?.message}
          />
        )}
      />

      <Controller
        name="systemType"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth margin="normal" error={!!errors.systemType}>
            <InputLabel>System Type</InputLabel>
            <Select {...field} label="System Type">
              <MenuItem value="SaaS">SaaS</MenuItem>
              <MenuItem value="PaaS">PaaS</MenuItem>
              <MenuItem value="IaaS">IaaS</MenuItem>
              <MenuItem value="On-Premise">On-Premise</MenuItem>
              <MenuItem value="Hybrid">Hybrid</MenuItem>
            </Select>
          </FormControl>
        )}
      />

      <Controller
        name="authorizationBoundary"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Authorization Boundary"
            fullWidth
            margin="normal"
            error={!!errors.authorizationBoundary}
            helperText={errors.authorizationBoundary?.message}
          />
        )}
      />

      <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
        FIPS-199 Security Categorization
      </Typography>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Controller
          name="confidentiality"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel>Confidentiality</InputLabel>
              <Select {...field} label="Confidentiality">
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="moderate">Moderate</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          )}
        />

        <Controller
          name="integrity"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel>Integrity</InputLabel>
              <Select {...field} label="Integrity">
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="moderate">Moderate</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          )}
        />

        <Controller
          name="availability"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel>Availability</InputLabel>
              <Select {...field} label="Availability">
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="moderate">Moderate</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          )}
        />
      </Box>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="submit" variant="contained" color="primary">
          Next
        </Button>
      </Box>
    </Box>
  )
}
