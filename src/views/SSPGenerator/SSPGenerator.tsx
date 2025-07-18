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
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import Fallback from '@/components/SimpleLoadingFallback'
import { NistControl, SecurityTool } from '@/types/nist'
import { SECURITY_TOOLS } from '@/utils/securityTools'
import SecurityToolSelector from '@/components/SecurityToolSelector'
import { generateSSPPDF } from '@/utils/pdfGenerator'

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
  const [selectedTools, setSelectedTools] = React.useState<SecurityTool[]>([])
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

  const handleGeneratePDF = () => {
    const controlsToExport = securityBaseline ? filteredControls : nistControls

    generateSSPPDF({
      systemName,
      systemVersion,
      securityFramework,
      securityBaseline,
      selectedTools,
      controls: controlsToExport,
      username: data.username || 'Unknown User',
    })
  }

  // Filter controls based on selected baseline and tools
  const filteredControls = React.useMemo(() => {
    let result = [...nistControls]

    // Apply baseline filter if selected
    if (securityBaseline) {
      result = result.filter((control) => {
        if (!control.baselines?.security) return false
        const baselineKey =
          securityBaseline.toLowerCase() as keyof typeof control.baselines.security
        const baselineValue = control.baselines.security[baselineKey]
        return (
          baselineValue !== null &&
          baselineValue !== undefined &&
          baselineValue !== ''
        )
      })
    }

    // Apply tool filter if any tools are selected
    if (selectedTools.length > 0) {
      result = result.filter(
        (control) =>
          control.tools &&
          control.tools.some((tool) => selectedTools.includes(tool))
      )
    }

    return result
  }, [nistControls, securityBaseline, selectedTools])

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
                  mb: 2,
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
                  mb: 2,
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

              {/* Security Tools Filter */}
              <Box sx={{ mb: 4 }}>
                <SecurityToolSelector
                  selectedTools={selectedTools}
                  onChange={setSelectedTools}
                  disabled={
                    !nistControls.length ||
                    securityFramework !== 'NIST SP 800-53 Rev. 5'
                  }
                  helperText={
                    securityFramework === 'NIST SP 800-53 Rev. 5'
                      ? 'Filter controls by security tools'
                      : 'Select NIST SP 800-53 Rev. 5 framework first'
                  }
                />
              </Box>

              {/* Generate PDF Button */}
              <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<PictureAsPdfIcon />}
                  onClick={handleGeneratePDF}
                  disabled={!systemName || !securityFramework}
                  sx={{
                    minWidth: 200,
                    py: 1.5,
                  }}
                >
                  Generate SSP PDF
                </Button>
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
                            <TableCell>Tools</TableCell>
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
                              <TableCell>
                                <Box
                                  sx={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 0.5,
                                  }}
                                >
                                  {control.tools?.map((toolId) => {
                                    const toolName =
                                      SECURITY_TOOLS[toolId]?.name || toolId
                                    return (
                                      <Tooltip
                                        key={toolId}
                                        title={toolName}
                                        arrow
                                      >
                                        <Chip
                                          label={toolId}
                                          size="small"
                                          variant="outlined"
                                          sx={{
                                            textTransform: 'uppercase',
                                            fontSize: '0.65rem',
                                            height: 24,
                                          }}
                                        />
                                      </Tooltip>
                                    )
                                  })}
                                </Box>
                              </TableCell>
                              <TableCell
                                sx={{
                                  maxWidth: 400,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                <Tooltip
                                  title={control.description}
                                  arrow
                                  placement="top-start"
                                  enterDelay={500}
                                >
                                  <Box
                                    component="span"
                                    sx={{
                                      display: 'inline-block',
                                      maxWidth: '100%',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    {control.description}
                                  </Box>
                                </Tooltip>
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
