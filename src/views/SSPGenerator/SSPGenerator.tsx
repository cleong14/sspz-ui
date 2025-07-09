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
import Fallback from '@/components/SimpleLoadingFallback'

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

  const handleSecurityFrameworkChange = (event: SelectChangeEvent) => {
    setSecurityFramework(event.target.value as string)
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
