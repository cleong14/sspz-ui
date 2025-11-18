/**
 * @module layouts/AppLayout/AppDrawerButtonList
 */
import { useMemo } from 'react'
import DashboardIcon from '@mui/icons-material/Dashboard'
import DescriptionIcon from '@mui/icons-material/Description'
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
        icon: <DescriptionIcon />,
        id: RouteIds.SSP_GENERATOR,
        label: RouteNames.SSP_GENERATOR,
        to: Routes.SSP_GENERATOR,
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
