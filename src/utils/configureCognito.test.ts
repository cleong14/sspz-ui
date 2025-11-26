beforeEach(() => {
  jest.resetAllMocks()
})

afterAll(() => {
  jest.clearAllMocks()
})

describe('configureCognito', () => {
  test('returns null and handles missing config gracefully', () => {
    // Since CONFIG is evaluated at module load time before env vars are set,
    // this test verifies the function doesn't throw and returns null
    const configureCognito = require('@/utils/configureCognito').default
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation()

    const result = configureCognito()
    expect(result).toBeNull()

    warnSpy.mockRestore()
  })

  test('calls Amplify.configure when all required config values are present', () => {
    // Reset modules to get fresh config with env vars set
    jest.resetModules()

    // Set environment variables before importing
    process.env.VITE_USER_POOL_ID = 'us-east-1_test123'
    process.env.VITE_USER_POOL_CLIENT_ID = 'test-client-id-123'
    process.env.VITE_COGNITO_DOMAIN = 'test.auth.us-east-1.amazoncognito.com'
    process.env.VITE_AWS_REGION = 'us-east-1'

    // Get fresh mock and module after resetting
    const { Amplify } = require('aws-amplify')
    const {
      default: freshConfigureCognito,
    } = require('@/utils/configureCognito')

    freshConfigureCognito()
    expect(Amplify.configure).toHaveBeenCalled()
  })

  test('shows warning when config is incomplete', () => {
    jest.resetModules()

    // Clear the env vars
    delete process.env.VITE_USER_POOL_ID
    delete process.env.VITE_USER_POOL_CLIENT_ID
    delete process.env.VITE_COGNITO_DOMAIN

    // Get fresh mock and module after resetting
    const { Amplify } = require('aws-amplify')
    const {
      default: freshConfigureCognito,
    } = require('@/utils/configureCognito')

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation()
    freshConfigureCognito()

    expect(warnSpy).toHaveBeenCalledWith(
      'Cognito configuration is incomplete. Auth features will be disabled.'
    )
    expect(Amplify.configure).not.toHaveBeenCalled()

    warnSpy.mockRestore()
  })
})
