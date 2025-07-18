/**
 * State loader for react-router data routes that require user's SSP data.
 * @module views/SSPGenerator/SSPGenerator.loader
 * @see {@link router/Routes}
 */
import { Auth } from 'aws-amplify'
import { defer, LoaderFunction } from 'react-router-dom'

interface UserInfo {
  username?: string
  // Add other user properties as needed
}

/**
 * Loader function for the SSP Generator route
 * @returns {Promise<{username: string}>} Deferred user data for the SSP Generator
 */
const sspGeneratorLoader: LoaderFunction = async () => {
  try {
    const userInfo: UserInfo | null = await Auth.currentUserInfo()

    if (!userInfo) {
      console.warn('No authenticated user found, using default username')
      return defer({
        username: 'User',
      })
    }

    return defer({
      username: userInfo.username || 'User',
    })
  } catch (error) {
    console.warn('Authentication not configured or user not signed in:', error)
    return defer({
      username: 'User',
    })
  }
}

export default sspGeneratorLoader
