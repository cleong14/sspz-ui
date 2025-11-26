/**
 * Configures Amazon Cognito auth in the root loader of the router.
 * @module utils/configureCognito
 * @see {@link dashboard/router/routes.tsx}
 */
/**
 * Configures Amazon Cognito auth in the root loader of the router.
 * @see {@link dashboard/craco.config.js}.
 */
import { Amplify } from 'aws-amplify'
import CONFIG from '@/utils/config'

/**
 * Check if a config value is properly set (not undefined or the string "undefined")
 */
function isConfigured(value: string | undefined): boolean {
  return Boolean(value && value !== 'undefined')
}

function configureCognito(): null {
  // Skip Cognito configuration if required values are not set
  // This allows the app to run in development without Cognito
  const hasRequiredConfig =
    isConfigured(CONFIG.USER_POOL_ID) &&
    isConfigured(CONFIG.USER_POOL_CLIENT_ID) &&
    isConfigured(CONFIG.COGNITO_DOMAIN)

  if (!hasRequiredConfig) {
    console.warn(
      'Cognito configuration is incomplete. Auth features will be disabled.'
    )
    return null
  }

  const options = {
    region: CONFIG.AWS_REGION,
    userPoolId: CONFIG.USER_POOL_ID,
    userPoolWebClientId: CONFIG.USER_POOL_CLIENT_ID,
  }

  const oauth = {
    domain: CONFIG.COGNITO_DOMAIN,
    scope: ['openid', 'email', 'profile'],
    redirectSignIn: CONFIG.COGNITO_REDIRECT_SIGN_IN,
    redirectSignOut: CONFIG.COGNITO_REDIRECT_SIGN_OUT,
    responseType: 'code',
  }

  // Configure Amplify Auth with the Cognito User Pool
  Amplify.configure({
    Auth: {
      ...options,
      oauth,
    },
  })

  // a loader has to return something or null
  return null
}

export default configureCognito
