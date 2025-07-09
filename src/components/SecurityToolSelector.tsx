import * as React from 'react'
import {
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  MenuItem,
  Chip,
  Box,
  FormHelperText,
  IconButton,
  InputAdornment,
} from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'
import { SecurityTool } from '@/types/nist'
import { SECURITY_TOOLS, SECURITY_TOOL_OPTIONS } from '@/utils/securityTools'

interface SecurityToolSelectorProps {
  selectedTools: SecurityTool[]
  onChange: (tools: SecurityTool[]) => void
  disabled?: boolean
  label?: string
  helperText?: string
}

export const SecurityToolSelector: React.FC<SecurityToolSelectorProps> = ({
  selectedTools = [],
  onChange,
  disabled = false,
  label = 'Security Tools',
  helperText = 'Select tools to filter controls',
}) => {
  const handleChange = (event: SelectChangeEvent<SecurityTool[]>) => {
    const value = event.target.value
    // Handle both array and string values (for single select fallback)
    const tools = Array.isArray(value)
      ? value
      : ([value].filter(Boolean) as SecurityTool[])
    onChange(tools)
  }

  const handleDelete = (toolToDelete: SecurityTool) => {
    onChange(selectedTools.filter((tool) => tool !== toolToDelete))
  }

  return (
    <FormControl fullWidth size="small" disabled={disabled}>
      <InputLabel id="security-tools-label" shrink>
        {label}
      </InputLabel>
      <Select
        labelId="security-tools-label"
        id="security-tools-select"
        multiple
        value={selectedTools}
        onChange={handleChange}
        endAdornment={
          selectedTools.length > 0 ? (
            <InputAdornment position="end" sx={{ mr: 1 }}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation()
                  onChange([])
                }}
                onMouseDown={(e) => e.stopPropagation()}
                title="Clear all tools"
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : undefined
        }
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, pr: 1 }}>
            {selected.map((toolId) => {
              const tool = SECURITY_TOOLS[toolId]
              return (
                <Chip
                  key={toolId}
                  label={tool?.name || toolId}
                  size="small"
                  onDelete={() => handleDelete(toolId)}
                  onMouseDown={(event) => {
                    event.stopPropagation()
                  }}
                />
              )
            })}
          </Box>
        )}
        label={label}
        sx={{
          '& .MuiSelect-select': {
            paddingRight:
              selectedTools.length > 0 ? '40px !important' : undefined,
          },
        }}
      >
        {SECURITY_TOOL_OPTIONS.map((tool) => (
          <MenuItem key={tool.id} value={tool.id}>
            {tool.name}
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  )
}

export default SecurityToolSelector
