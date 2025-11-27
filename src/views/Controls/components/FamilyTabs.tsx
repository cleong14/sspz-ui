/**
 * Family Tabs Component
 * @module views/Controls/components/FamilyTabs
 *
 * Tab navigation for control families with control counts.
 *
 * Story: 3.3 - Build Control Catalog Browse Page
 */

import * as React from 'react'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import type { ControlFamily } from '@/types/control'

interface FamilyTabsProps {
  families: ControlFamily[]
  selectedFamily: string
  onFamilyChange: (familyId: string) => void
}

/**
 * Tab navigation for control families.
 */
const FamilyTabs: React.FC<FamilyTabsProps> = ({
  families,
  selectedFamily,
  onFamilyChange,
}): JSX.Element => {
  const handleChange = React.useCallback(
    (_event: React.SyntheticEvent, newValue: string) => {
      onFamilyChange(newValue)
    },
    [onFamilyChange]
  )

  return (
    <Box
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        mb: 3,
        bgcolor: 'background.paper',
      }}
    >
      <Tabs
        value={selectedFamily}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        aria-label="Control family tabs"
        sx={{
          '& .MuiTab-root': {
            minWidth: 'auto',
            px: 2,
            py: 1.5,
          },
        }}
      >
        {families.map((family) => (
          <Tab
            key={family.id}
            value={family.id}
            label={
              <Badge
                badgeContent={family.totalControls}
                color="primary"
                max={999}
                sx={{
                  '& .MuiBadge-badge': {
                    right: -12,
                    top: 0,
                    fontSize: '0.65rem',
                    height: 18,
                    minWidth: 18,
                  },
                }}
              >
                <Box sx={{ pr: 1.5 }}>{family.id}</Box>
              </Badge>
            }
            id={`family-tab-${family.id}`}
            aria-controls={`family-tabpanel-${family.id}`}
          />
        ))}
      </Tabs>
    </Box>
  )
}

export default FamilyTabs
