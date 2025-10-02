/**
 * Unit tests for SSP Generator loader
 */
import { Auth } from 'aws-amplify'
import { defer } from 'react-router-dom'
import sspGeneratorLoader from './SSPGenerator.loader'

// Mock AWS Amplify Auth
jest.mock('aws-amplify', () => ({
  Auth: {
    currentUserInfo: jest.fn(),
  },
}))

// Mock defer
jest.mock('react-router-dom', () => ({
  defer: jest.fn((data) => data),
}))

describe('sspGeneratorLoader', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should call defer with user data when user is authenticated', async () => {
    const mockUserInfo = {
      username: 'testuser',
    }

    ;(Auth.currentUserInfo as jest.Mock).mockResolvedValue(mockUserInfo)

    await sspGeneratorLoader({
      params: {},
      request: new Request('http://localhost/app/ssp-generator'),
    })

    expect(Auth.currentUserInfo).toHaveBeenCalled()
    expect(defer).toHaveBeenCalledWith({
      username: 'testuser',
    })
  })

  it('should call defer with default username when currentUserInfo fails', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {})

    ;(Auth.currentUserInfo as jest.Mock).mockRejectedValue(
      new Error('Auth error')
    )

    await sspGeneratorLoader({
      params: {},
      request: new Request('http://localhost/app/ssp-generator'),
    })

    expect(Auth.currentUserInfo).toHaveBeenCalled()
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error loading user info:',
      expect.any(Error)
    )
    expect(defer).toHaveBeenCalledWith({
      username: 'User',
    })

    consoleErrorSpy.mockRestore()
  })

  it('should call defer with default username when username is missing', async () => {
    const mockUserInfo = {
      // username is missing
    }

    ;(Auth.currentUserInfo as jest.Mock).mockResolvedValue(mockUserInfo)

    await sspGeneratorLoader({
      params: {},
      request: new Request('http://localhost/app/ssp-generator'),
    })

    expect(defer).toHaveBeenCalledWith({
      username: 'User',
    })
  })
})
