/**
 * Component that renders all routes in the application.
 * @module router/router
 * @see {@link dashboard/main} for usage.
 */
import { createBrowserRouter } from 'react-router-dom'
import ErrorBoundary from '@/components/ErrorBoundary'

import { RouteIds, Routes } from '@/router/constants'
import configureCognito from '@/utils/configureCognito'
import AppLayout from '@/layouts/AppLayout/AppLayout'
// import SignIn from '@/views/SignIn/SignIn'
// import SignOut from '@/views/SignOut/SignOut'
// import Dashboard from '@/views/Dashboard/Dashboard'
// import dashboardLoader from '@/views/Dashboard/Dashboard.loader'
import SSPGenerator from '@/views/SSPGenerator/SSPGenerator'
import sspGeneratorLoader from '@/views/SSPGenerator/SSPGenerator.loader'
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
      // Authentication routes disabled
      // {
      //   id: RouteIds.AUTH,
      //   path: Routes.AUTH,
      //   errorElement: <ErrorBoundary />,
      //   children: [
      //     {
      //       id: RouteIds.LOGIN,
      //       path: RouteIds.LOGIN,
      //       element: <SignIn />,
      //       errorElement: <ErrorBoundary />,
      //     },
      //     {
      //       id: RouteIds.LOGOUT,
      //       path: RouteIds.LOGOUT,
      //       element: <SignOut />,
      //       errorElement: <ErrorBoundary />,
      //     },
      //   ],
      // },
      {
        path: Routes.DASHBOARD,
        id: RouteIds.PROTECTED,
        element: <AppLayout />,
        errorElement: <ErrorBoundary />,
        // Authentication loader disabled - direct access to SSP Generator
        // loader: authLoader,
        children: [
          // Dashboard route disabled
          // {
          //   index: true,
          //   id: RouteIds.DASHBOARD,
          //   element: <Dashboard />,
          //   errorElement: <ErrorBoundary />,
          //   loader: dashboardLoader,
          // },
          {
            index: true,
            path: RouteIds.SSP_GENERATOR,
            id: RouteIds.SSP_GENERATOR,
            element: <SSPGenerator />,
            errorElement: <ErrorBoundary />,
            loader: sspGeneratorLoader,
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
