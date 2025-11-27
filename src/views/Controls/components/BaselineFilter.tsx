/**
 * Baseline Filter Component
 * @module views/Controls/components/BaselineFilter
 *
 * Dropdown filter for filtering controls by NIST and FedRAMP baselines.
 *
 * Story: 3.6 - Implement Baseline Filter
 */

import * as React from 'react'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import ListSubheader from '@mui/material/ListSubheader'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'

export type BaselineFilterValue =
  | 'all'
  | 'low'
  | 'moderate'
  | 'high'
  | 'fedramp_low'
  | 'fedramp_moderate'
  | 'fedramp_high'
  | 'fedramp_li_saas'

interface BaselineFilterProps {
  value: BaselineFilterValue
  onChange: (value: BaselineFilterValue) => void
  showFedRamp?: boolean
  disabled?: boolean
}

interface BaselineOption {
  value: BaselineFilterValue
  label: string
  color?: 'default' | 'success' | 'warning' | 'error' | 'info'
}

const NIST_OPTIONS: BaselineOption[] = [
  { value: 'all', label: 'All Controls' },
  { value: 'low', label: 'NIST Low', color: 'success' },
  { value: 'moderate', label: 'NIST Moderate', color: 'warning' },
  { value: 'high', label: 'NIST High', color: 'error' },
]

const FEDRAMP_OPTIONS: BaselineOption[] = [
  { value: 'fedramp_low', label: 'FedRAMP Low', color: 'success' },
  { value: 'fedramp_moderate', label: 'FedRAMP Moderate', color: 'warning' },
  { value: 'fedramp_high', label: 'FedRAMP High', color: 'error' },
  { value: 'fedramp_li_saas', label: 'FedRAMP LI-SaaS', color: 'info' },
]

/**
 * Get display color for baseline
 */
function getBaselineColor(
  value: BaselineFilterValue
): 'default' | 'success' | 'warning' | 'error' | 'info' {
  const option = [...NIST_OPTIONS, ...FEDRAMP_OPTIONS].find(
    (o) => o.value === value
  )
  return option?.color || 'default'
}

/**
 * Get display label for baseline
 */
function getBaselineLabel(value: BaselineFilterValue): string {
  const option = [...NIST_OPTIONS, ...FEDRAMP_OPTIONS].find(
    (o) => o.value === value
  )
  return option?.label || 'All Controls'
}

/**
 * Baseline filter dropdown component.
 */
const BaselineFilter: React.FC<BaselineFilterProps> = ({
  value,
  onChange,
  showFedRamp = true,
  disabled = false,
}): JSX.Element => {
  const handleChange = React.useCallback(
    (event: SelectChangeEvent<BaselineFilterValue>) => {
      onChange(event.target.value as BaselineFilterValue)
    },
    [onChange]
  )

  return (
    <FormControl size="small" sx={{ minWidth: 180 }} disabled={disabled}>
      <InputLabel id="baseline-filter-label">Baseline</InputLabel>
      <Select
        labelId="baseline-filter-label"
        id="baseline-filter"
        value={value}
        label="Baseline"
        onChange={handleChange}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {selected !== 'all' && (
              <Chip
                size="small"
                color={getBaselineColor(selected)}
                sx={{
                  height: 20,
                  minWidth: 20,
                  '& .MuiChip-label': { px: 0.5 },
                }}
              />
            )}
            {getBaselineLabel(selected)}
          </Box>
        )}
      >
        {/* NIST Baselines */}
        <ListSubheader>NIST 800-53</ListSubheader>
        {NIST_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {option.color && (
                <Chip
                  size="small"
                  color={option.color}
                  sx={{
                    height: 16,
                    minWidth: 16,
                    '& .MuiChip-label': { display: 'none' },
                  }}
                />
              )}
              {option.label}
            </Box>
          </MenuItem>
        ))}

        {/* FedRAMP Baselines */}
        {showFedRamp && <ListSubheader>FedRAMP</ListSubheader>}
        {showFedRamp &&
          FEDRAMP_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {option.color && (
                  <Chip
                    size="small"
                    color={option.color}
                    sx={{
                      height: 16,
                      minWidth: 16,
                      '& .MuiChip-label': { display: 'none' },
                    }}
                  />
                )}
                {option.label}
              </Box>
            </MenuItem>
          ))}
      </Select>
    </FormControl>
  )
}

export default BaselineFilter
