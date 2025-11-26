/**
 * Component that renders all routes in the application.
 * @module router/router
 * @see {@link dashboard/main} for usage.
 */
import { createBrowserRouter, Navigate } from 'react-router-dom'
import ErrorBoundary from '@/components/ErrorBoundary'
import authLoader from '@/router/authLoader'
import { RouteIds, Routes } from '@/router/constants'
import configureCognito from '@/utils/configureCognito'
import AppLayout from '@/layouts/AppLayout/AppLayout'
import SignIn from '@/views/SignIn/SignIn'
import SignOut from '@/views/SignOut/SignOut'
import Dashboard from '@/views/Dashboard/Dashboard'
import dashboardLoader from '@/views/Dashboard/Dashboard.loader'
import SSPGenerator from '@/views/SSPGenerator/SSPGenerator'
import RootProvider from '@/Root'
import NavigateToLogin from '@/components/react-router/NavigateToSignIn'
import CONFIG from '@/utils/config'

/**
 * Component that redirects to SSP Generator in bypass mode, otherwise to login
 */
const HomeRedirect = () => {
  if (CONFIG.AUTH_BYPASS) {
    return <Navigate to={Routes.SSP_GENERATOR} replace />
  }
  return <NavigateToLogin />
}

/**
 * Conditional loader that skips auth in bypass mode
 */
const conditionalAuthLoader = async () => {
  if (CONFIG.AUTH_BYPASS) {
    return { jwtToken: 'bypass-mode' }
  }
  return authLoader()
}

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
    element: <HomeRedirect />,
  },
  {
    id: RouteIds.ROOT,
    path: '/',
    element: <RootProvider />,
    errorElement: <ErrorBoundary />,
    loader: CONFIG.AUTH_BYPASS ? undefined : configureCognito,
    children: [
      // SSP Generator - accessible without auth
      {
        id: RouteIds.SSP_GENERATOR,
        path: Routes.SSP_GENERATOR,
        element: <SSPGenerator />,
        errorElement: <ErrorBoundary />,
      },
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
        loader: conditionalAuthLoader,
        children: [
          {
            index: true,
            id: RouteIds.DASHBOARD,
            element: <Dashboard />,
            errorElement: <ErrorBoundary />,
            loader: dashboardLoader,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <HomeRedirect />,
  },
])

export default router
