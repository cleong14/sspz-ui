/**
 * @module layouts/AppLayout/AppDrawerButtonList
 */
import { useMemo } from 'react'
import DashboardIcon from '@mui/icons-material/Dashboard'
import FolderIcon from '@mui/icons-material/Folder'
import SecurityIcon from '@mui/icons-material/Security'
import BuildIcon from '@mui/icons-material/Build'
import SettingsIcon from '@mui/icons-material/Settings'
import AppDrawerButton from '@/components/AppDrawerButton'
import { RouteIds, RouteNames, Routes } from '@/router/constants'

const AppDrawerButtonList: React.FC = (): JSX.Element => {
  const items = useMemo(
    () => [
      {
        icon: <DashboardIcon />,
        id: RouteIds.DASHBOARD,
        label: RouteNames.DASHBOARD,
        to: Routes.DASHBOARD,
      },
      {
        icon: <FolderIcon />,
        id: RouteIds.PROJECTS,
        label: RouteNames.PROJECTS,
        to: Routes.PROJECTS,
      },
      {
        icon: <SecurityIcon />,
        id: RouteIds.CONTROLS,
        label: RouteNames.CONTROLS,
        to: Routes.CONTROLS,
      },
      {
        icon: <BuildIcon />,
        id: RouteIds.TOOLS,
        label: RouteNames.TOOLS,
        to: Routes.TOOLS,
      },
      {
        icon: <SettingsIcon />,
        id: RouteIds.SETTINGS,
        label: RouteNames.SETTINGS,
        to: Routes.SETTINGS,
      },
    ],
    []
  )

  return (
    <>
      {items.map(({ icon, id, label, to }) => (
        <AppDrawerButton icon={icon} key={id} label={label} to={to} />
      ))}
    </>
  )
}

export default AppDrawerButtonList
