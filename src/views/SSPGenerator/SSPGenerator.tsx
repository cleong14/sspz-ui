/**
 * SSP Generator view component.
 * @module views/SSPGenerator/SSPGenerator
 */
import * as React from 'react'
import { useLoaderData, Await } from 'react-router-dom'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Fallback from '@/components/SimpleLoadingFallback'
import { NistControl } from '@/types/nist'

type SecurityBaseline = 'low' | 'moderate' | 'high' | ''

/**
 * Component that renders the contents of the SSP Generator view.
 * @returns {JSX.Element} Component that renders the SSP Generator contents.
 */
const SSPGeneratorContainer: React.FC = (): JSX.Element => {
  const data = useLoaderData() as { username: string }
  const [systemName, setSystemName] = React.useState('')
  const [systemVersion, setSystemVersion] = React.useState('')
  const [securityFramework, setSecurityFramework] = React.useState('')
  const [securityBaseline, setSecurityBaseline] =
    React.useState<SecurityBaseline>('')
  const [nistControls, setNistControls] = React.useState<NistControl[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSystemNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSystemName(event.target.value)
  }

  const handleSystemVersionChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSystemVersion(event.target.value)
  }

  const handleSecurityFrameworkChange = async (event: SelectChangeEvent) => {
    const selectedFramework = event.target.value as string
    setSecurityFramework(selectedFramework)

    if (selectedFramework === 'NIST SP 800-53 Rev. 5') {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch('/src/data/nist/nist-800-53-rev5.json')
        if (!response.ok) {
          throw new Error('Failed to load NIST 800-53 controls')
        }
        const data = await response.json()
        setNistControls(data.controls || [])
      } catch (err) {
        console.error('Error loading NIST 800-53 controls:', err)
        setError('Failed to load NIST 800-53 controls. Please try again later.')
        setNistControls([])
      } finally {
        setIsLoading(false)
      }
    } else {
      setNistControls([])
    }
  }

  const handleSecurityBaselineChange = (event: SelectChangeEvent) => {
    setSecurityBaseline(event.target.value as SecurityBaseline)
  }

  // Filter controls based on selected baseline
  const filteredControls = React.useMemo(() => {
    if (!securityBaseline || !nistControls.length) return nistControls

    return nistControls.filter((control) => {
      if (!control.baselines?.security) return false

      // Check if the control has the selected baseline
      const baselineKey =
        securityBaseline.toLowerCase() as keyof typeof control.baselines.security
      const baselineValue = control.baselines.security[baselineKey]

      // Return true if the baseline value exists and is not empty
      return (
        baselineValue !== null &&
        baselineValue !== undefined &&
        baselineValue !== ''
      )
    })
  }, [nistControls, securityBaseline])

  return (
    <React.Suspense fallback={<Fallback />}>
      <Await
        resolve={data}
        errorElement={<div>Could not load SSP Generator</div>}
        // eslint-disable-next-line react/no-children-prop
        children={({ username = '' }) => (
          <>
            <Typography variant="h4" component="h1" gutterBottom>
              SSP Generator
            </Typography>
            <Typography variant="body1">
              Welcome to the SSP Generator, <code>{username}</code>
            </Typography>
            <Box
              component="form"
              sx={{
                mt: 3,
                '& .MuiFormControl-root': { mb: 3 },
              }}
              noValidate
              autoComplete="off"
            >
              <Box
                sx={{
                  display: 'grid',
                  gap: 3,
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                  mb: 4,
                }}
              >
                <TextField
                  id="system-name"
                  label="System Name"
                  variant="outlined"
                  value={systemName}
                  onChange={handleSystemNameChange}
                  size="small"
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <TextField
                  id="system-version"
                  label="System Version"
                  variant="outlined"
                  value={systemVersion}
                  onChange={handleSystemVersionChange}
                  size="small"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gap: 3,
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                  mb: 4,
                }}
              >
                <FormControl variant="outlined" size="small">
                  <InputLabel id="security-framework-label" shrink>
                    Security Controls Framework
                  </InputLabel>
                  <Select
                    labelId="security-framework-label"
                    id="security-framework-select"
                    value={securityFramework}
                    label="Security Controls Framework"
                    onChange={handleSecurityFrameworkChange}
                    notched
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    <MenuItem value="NIST SP 800-53 Rev. 5">
                      NIST SP 800-53 Rev. 5
                    </MenuItem>
                    <MenuItem value="NIST SP 800-53B">NIST SP 800-53B</MenuItem>
                  </Select>
                </FormControl>

                <FormControl variant="outlined" size="small">
                  <InputLabel id="security-baseline-label" shrink>
                    Security Baseline
                  </InputLabel>
                  <Select
                    labelId="security-baseline-label"
                    id="security-baseline-select"
                    value={securityBaseline}
                    label="Security Controls Baseline"
                    onChange={handleSecurityBaselineChange}
                  >
                    <MenuItem value="">
                      <em>All Baselines</em>
                    </MenuItem>
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Moderate">Moderate</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {isLoading && (
                <Typography>Loading NIST 800-53 controls...</Typography>
              )}
              {error && (
                <Typography color="error" sx={{ mt: 2 }}>
                  {error}
                </Typography>
              )}

              {securityFramework === 'NIST SP 800-53 Rev. 5' &&
                (filteredControls.length > 0 || nistControls.length > 0) && (
                  <Box sx={{ mt: 4, width: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                      NIST 800-53 Rev. 5 Controls
                    </Typography>
                    <TableContainer
                      component={Paper}
                      sx={{ mt: 2, maxHeight: 600, overflow: 'auto' }}
                    >
                      <Table stickyHeader size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Family</TableCell>
                            <TableCell>Title</TableCell>
                            <TableCell>Priority</TableCell>
                            <TableCell>Baseline</TableCell>
                            <TableCell>Description</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {(securityBaseline
                            ? filteredControls
                            : nistControls
                          ).map((control) => (
                            <TableRow key={control.id} hover>
                              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                {control.id}
                              </TableCell>
                              <TableCell>{control.family}</TableCell>
                              <TableCell sx={{ minWidth: 200 }}>
                                {control.title}
                              </TableCell>
                              <TableCell>{control.priority}</TableCell>
                              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                {control.baselines?.security?.high && 'High '}
                                {control.baselines?.security?.moderate &&
                                  'Moderate '}
                                {control.baselines?.security?.low && 'Low'}
                              </TableCell>
                              <TableCell
                                sx={{
                                  maxWidth: 400,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {control.description}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}
            </Box>
          </>
        )}
      />
    </React.Suspense>
  )
}

export default SSPGeneratorContainer
