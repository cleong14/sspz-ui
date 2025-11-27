/**
 * Component that renders all routes in the application.
 * @module router/router
 * @see {@link dashboard/main} for usage.
 */
import { createBrowserRouter } from 'react-router-dom'
import ErrorBoundary from '@/components/ErrorBoundary'
import authLoader from '@/router/authLoader'
import { RouteIds, Routes } from '@/router/constants'
import configureCognito from '@/utils/configureCognito'
import AppLayout from '@/layouts/AppLayout/AppLayout'
import SignIn from '@/views/SignIn/SignIn'
import SignOut from '@/views/SignOut/SignOut'
import Dashboard from '@/views/Dashboard/Dashboard'
import dashboardLoader from '@/views/Dashboard/Dashboard.loader'
import ProjectList from '@/views/Projects/ProjectList'
import ControlCatalog from '@/views/Controls/ControlCatalog'
import ToolLibrary from '@/views/Tools/ToolLibrary'
import Settings from '@/views/Settings/Settings'
import RootProvider from '@/Root'
import NavigateToLogin from '@/components/react-router/NavigateToSignIn'

/**
 * The hash router for the application that defines routes
 *  and specifies the loaders for routes with dynamic data.
 * @type {React.ComponentType} router - The browser router
 * @see {@link https://reactrouter.com/web/api/BrowserRouter BrowserRouter}
 * @see {@link https://reactrouter.com/en/main/route/loader loader}
 */
const router = createBrowserRouter([
  {
    index: true,
    element: <NavigateToLogin />,
  },
  {
    id: RouteIds.ROOT,
    path: '/',
    element: <RootProvider />,
    errorElement: <ErrorBoundary />,
    loader: configureCognito,
    children: [
      {
        id: RouteIds.AUTH,
        path: Routes.AUTH,
        errorElement: <ErrorBoundary />,
        children: [
          {
            id: RouteIds.LOGIN,
            path: RouteIds.LOGIN,
            element: <SignIn />,
            errorElement: <ErrorBoundary />,
          },
          {
            id: RouteIds.LOGOUT,
            path: RouteIds.LOGOUT,
            element: <SignOut />,
            errorElement: <ErrorBoundary />,
          },
        ],
      },
      {
        path: Routes.DASHBOARD,
        id: RouteIds.PROTECTED,
        element: <AppLayout />,
        errorElement: <ErrorBoundary />,
        loader: authLoader,
        children: [
          {
            index: true,
            id: RouteIds.DASHBOARD,
            element: <Dashboard />,
            errorElement: <ErrorBoundary />,
            loader: dashboardLoader,
          },
          {
            path: RouteIds.PROJECTS,
            id: RouteIds.PROJECTS,
            element: <ProjectList />,
            errorElement: <ErrorBoundary />,
          },
          {
            path: RouteIds.CONTROLS,
            id: RouteIds.CONTROLS,
            element: <ControlCatalog />,
            errorElement: <ErrorBoundary />,
          },
          {
            path: RouteIds.TOOLS,
            id: RouteIds.TOOLS,
            element: <ToolLibrary />,
            errorElement: <ErrorBoundary />,
          },
          {
            path: RouteIds.SETTINGS,
            id: RouteIds.SETTINGS,
            element: <Settings />,
            errorElement: <ErrorBoundary />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NavigateToLogin />,
  },
])

export default router
