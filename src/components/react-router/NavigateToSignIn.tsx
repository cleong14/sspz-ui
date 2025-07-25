/**
 * Component that renders the react-router Navigate component to
 *  redirect the user to the SSP Generator page.
 * @module components/react-router/NavigateToSignIn
 *
 * @see {@link dashboard/Routes} for usage.
 * @see {@link https://reactrouter.com/web/api/Navigate} for documentation.
 */
import { Navigate } from 'react-router-dom'
import { Routes } from '@/router/constants'

/**
 * Component that renders the Navigate component to redirect to the SSP Generator page.
 * @returns {JSX.Element}
 */
const NavigateToSignIn: React.FC = (): JSX.Element => (
  <Navigate to={Routes.SSP_GENERATOR} replace={true} />
)

export default NavigateToSignIn
