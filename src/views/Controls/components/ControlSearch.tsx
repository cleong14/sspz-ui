/**
 * Control Search Component
 * @module views/Controls/components/ControlSearch
 *
 * Real-time search input for filtering controls by ID, title, or description.
 * Debounced 300ms for performance.
 *
 * Story: 3.4 - Implement Control Search
 */

import * as React from 'react'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'

interface ControlSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  resultCount?: number
}

/**
 * Debounce hook for delaying value updates
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value)

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Search input component for filtering controls.
 */
const ControlSearch: React.FC<ControlSearchProps> = ({
  value,
  onChange,
  placeholder = 'Search controls by ID, title, or keyword...',
  resultCount,
}): JSX.Element => {
  const [inputValue, setInputValue] = React.useState(value)
  const debouncedValue = useDebounce(inputValue, 300)

  // Update parent when debounced value changes
  React.useEffect(() => {
    onChange(debouncedValue)
  }, [debouncedValue, onChange])

  // Sync with external value changes
  React.useEffect(() => {
    setInputValue(value)
  }, [value])

  const handleInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(event.target.value)
    },
    []
  )

  const handleClear = React.useCallback(() => {
    setInputValue('')
    onChange('')
  }, [onChange])

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClear()
      }
    },
    [handleClear]
  )

  return (
    <TextField
      fullWidth
      size="small"
      value={inputValue}
      onChange={handleInputChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon color="action" />
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end">
            {inputValue && (
              <>
                {resultCount !== undefined && (
                  <span
                    style={{
                      marginRight: 8,
                      fontSize: '0.875rem',
                      color: '#666',
                    }}
                  >
                    {resultCount} results
                  </span>
                )}
                <IconButton
                  size="small"
                  onClick={handleClear}
                  edge="end"
                  aria-label="Clear search"
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </>
            )}
          </InputAdornment>
        ),
      }}
      aria-label="Search controls"
      sx={{
        '& .MuiOutlinedInput-root': {
          bgcolor: 'background.paper',
        },
      }}
    />
  )
}

export default ControlSearch
