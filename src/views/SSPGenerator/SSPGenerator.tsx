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

/**
 * Component that renders the contents of the SSP Generator view.
 * @returns {JSX.Element} Component that renders the SSP Generator contents.
 */
const SSPGeneratorContainer: React.FC = (): JSX.Element => {
  const data = useLoaderData() as { username: string }
  const [systemName, setSystemName] = React.useState('')
  const [systemVersion, setSystemVersion] = React.useState('')
  const [securityFramework, setSecurityFramework] = React.useState('')
  const [securityBaseline, setSecurityBaseline] = React.useState('')
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
    setSecurityBaseline(event.target.value as string)
  }

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
                '& .MuiTextField-root': { m: 1, width: '25ch' },
              }}
              noValidate
              autoComplete="off"
            >
              <TextField
                id="system-name"
                label="System Name"
                variant="outlined"
                value={systemName}
                onChange={handleSystemNameChange}
              />
              <TextField
                id="system-version"
                label="System Version"
                variant="outlined"
                value={systemVersion}
                onChange={handleSystemVersionChange}
              />
              <FormControl sx={{ m: 1, minWidth: 200 }}>
                <InputLabel id="security-framework-label">
                  Security Controls Framework
                </InputLabel>
                <Select
                  labelId="security-framework-label"
                  id="security-framework-select"
                  value={securityFramework}
                  label="Security Controls Framework"
                  onChange={handleSecurityFrameworkChange}
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

              {isLoading && (
                <Typography>Loading NIST 800-53 controls...</Typography>
              )}
              {error && (
                <Typography color="error" sx={{ mt: 2 }}>
                  {error}
                </Typography>
              )}

              {securityFramework === 'NIST SP 800-53 Rev. 5' &&
                nistControls.length > 0 && (
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
                            <TableCell>Description</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {nistControls.map((control) => (
                            <TableRow key={control.id} hover>
                              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                {control.id}
                              </TableCell>
                              <TableCell>{control.family}</TableCell>
                              <TableCell sx={{ minWidth: 200 }}>
                                {control.title}
                              </TableCell>
                              <TableCell>{control.priority}</TableCell>
                              <TableCell
                                sx={{
                                  maxWidth: 500,
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
              <FormControl sx={{ m: 1, minWidth: 200 }}>
                <InputLabel id="security-baseline-label">
                  Security Controls Baseline
                </InputLabel>
                <Select
                  labelId="security-baseline-label"
                  id="security-baseline-select"
                  value={securityBaseline}
                  label="Security Controls Baseline"
                  onChange={handleSecurityBaselineChange}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Moderate">Moderate</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </>
        )}
      />
    </React.Suspense>
  )
}

export default SSPGeneratorContainer
