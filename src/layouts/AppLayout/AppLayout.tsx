/**
 * The layout for rendering the authenticated user's layout.
 * @module layouts/AppLayout/AppLayout
 */
import { useCallback, useState } from 'react'
import { Outlet } from 'react-router-dom'
import CssBaseline from '@mui/material/CssBaseline'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import MenuIcon from '@mui/icons-material/Menu'
import AlertMessage from '@/components/AlertMessage'
import AppBar from '@/components/AppBar'
import AppDrawer from '@/components/AppDrawer'
import MenuListItems from '@/layouts/AppLayout/AppDrawerButtonList'
import { SSP_GENERATOR_TITLE } from '@/locales/en'

/**
 * The main layout that renders the application layout.
 * @returns {JSX.Element} The main application layout component.
 */
const AppLayout: React.FC = (): JSX.Element => {
  const [drawerOpen, setDrawerOpen] = useState(true)

  const toggleDrawer = useCallback(() => {
    setDrawerOpen(!drawerOpen)
  }, [drawerOpen])

  return (
    <>
      <CssBaseline />
      <Box
        data-testid="app"
        sx={{
          display: 'flex',
          flexGrow: 1,
          height: '100vh',
          overflow: 'scroll',
        }}
      >
        <AlertMessage />

        {/* top nav bar */}
        <AppBar position="absolute" open={drawerOpen} color="secondary">
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={toggleDrawer}
              sx={{
                marginRight: '36px',
                ...(drawerOpen && { display: 'none' }),
              }}
              aria-label="open drawer"
              data-testid="open-drawer-button"
              name="open drawer"
              aria-hidden={drawerOpen}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              color="inherit"
              component="span"
              noWrap
              sx={{ flexGrow: 1 }}
              variant="h6"
              data-testid="appbar-title"
            >
              {SSP_GENERATOR_TITLE}
            </Typography>
          </Toolbar>
        </AppBar>

        {/* menu drawer */}
        <AppDrawer
          open={drawerOpen}
          data-open={drawerOpen}
          data-testid="app-drawer"
        >
          <Toolbar
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              filter: `brightness(80%)`,
            }}
          >
            <IconButton
              onClick={toggleDrawer}
              aria-label="close drawer"
              data-testid="close-drawer-button"
              name="close drawer"
              aria-hidden={!drawerOpen}
            >
              <ChevronLeftIcon />
            </IconButton>
          </Toolbar>
          <Divider />

          <List component="nav">
            <MenuListItems />
          </List>
        </AppDrawer>
        <Container
          component="main"
          sx={{
            mt: (theme) => `${theme.mixins.toolbar.minHeight}px`,
            pt: (theme) => theme.spacing(4),
          }}
        >
          <Outlet />
        </Container>
      </Box>
    </>
  )
}

export default AppLayout
