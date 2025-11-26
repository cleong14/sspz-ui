/**
 * @module @cyclone-dx/ui/sbom/utils/setupTests
 */
// global mocks
jest.mock('aws-amplify')
jest.mock('web-vitals')

// enable mocking of fetch requests
import { enableFetchMocks } from 'jest-fetch-mock'
enableFetchMocks()

import '@testing-library/jest-dom'

if (process.env.NODE_ENV === 'test') {
  // mock environment variables for the global app config during tests
  process.env.VITE_AWS_REGION = 'us-east-1'
  process.env.VITE_CF_DOMAIN = 'https://localhost:3000/'
  process.env.VITE_USER_POOL_ID = 'us-east-1_123456789'
  process.env.VITE_USER_POOL_CLIENT_ID = '1234567890123456789012'
  process.env.VITE_COGNITO_DOMAIN =
    'test-domain.auth.us-east-1.amazoncognito.com'
}

window.matchMedia = (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
})

Object.defineProperty(URL, 'createObjectURL', {
  writable: true,
  value: jest.fn(),
})

// Mock IndexedDB for testing using fake-indexeddb
import 'fake-indexeddb/auto'

// Polyfill structuredClone for Node.js environment
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj))
}
