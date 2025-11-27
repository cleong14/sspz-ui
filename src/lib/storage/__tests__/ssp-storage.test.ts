/**
 * SSP Storage Service Tests
 *
 * Tests for the file-based SSP storage service.
 * Mocks the File System Access API for testing.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import type { SspProject, CreateSspInput } from '@/types/ssp'

import { SspStorageService, sspStorage } from '../ssp-storage'
import { StorageError } from '../types'

// Mock file-saver
jest.mock('file-saver', () => ({
  saveAs: jest.fn(),
}))

// Mock uuid - use doMock for ESM compatibility
jest.mock('uuid', () => ({
  v4: () => 'test-uuid-1234',
}))

// Sample project data for testing
const sampleProject: SspProject = {
  id: 'test-uuid-1234',
  name: 'Test System',
  description: 'A test system',
  baseline: 'MODERATE',
  status: 'DRAFT',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  systemInfo: {
    systemName: 'Test System',
    systemType: 'major-application',
    description: 'A test system',
    boundary: {
      description: '',
      components: [],
      externalConnections: [],
    },
    categorization: {
      confidentiality: 'MODERATE',
      integrity: 'MODERATE',
      availability: 'MODERATE',
    },
    environment: {
      deploymentModel: 'cloud',
      operatingSystems: [],
      technologies: [],
      dataTypes: [],
    },
    contacts: {
      systemOwner: { name: '', title: '', email: '' },
      authorizingOfficial: { name: '', title: '', email: '' },
      securityPoc: { name: '', title: '', email: '' },
      technicalPoc: { name: '', title: '', email: '' },
    },
  },
  implementations: [],
  selectedTools: [],
  aiSuggestionFeedback: [],
}

describe('SspStorageService', () => {
  let service: SspStorageService

  beforeEach(() => {
    service = new SspStorageService()
    // Clear any global mocks
    delete (window as { showDirectoryPicker?: unknown }).showDirectoryPicker
  })

  describe('getCapabilities', () => {
    it('should detect when File System Access API is not supported', () => {
      const caps = service.getCapabilities()
      expect(caps.hasFileSystemAccess).toBe(false)
      expect(caps.hasDirectoryAccess).toBe(false)
    })

    it('should detect when File System Access API is supported', () => {
      ;(window as { showDirectoryPicker?: unknown }).showDirectoryPicker =
        jest.fn()
      const caps = service.getCapabilities()
      expect(caps.hasFileSystemAccess).toBe(true)
      expect(caps.hasDirectoryAccess).toBe(false)
    })
  })

  describe('getStorageMode', () => {
    it('should return fallback mode when API not supported', () => {
      expect(service.getStorageMode()).toBe('fallback')
    })

    it('should return file-system-api mode when supported', () => {
      ;(window as { showDirectoryPicker?: unknown }).showDirectoryPicker =
        jest.fn()
      expect(service.getStorageMode()).toBe('file-system-api')
    })
  })

  describe('requestProjectsDirectory', () => {
    it('should throw UNSUPPORTED_BROWSER when API not available', async () => {
      await expect(service.requestProjectsDirectory()).rejects.toThrow(
        StorageError
      )
      try {
        await service.requestProjectsDirectory()
      } catch (error) {
        expect(error).toBeInstanceOf(StorageError)
        expect((error as StorageError).code).toBe('UNSUPPORTED_BROWSER')
      }
    })

    it('should throw PERMISSION_DENIED when user cancels', async () => {
      const abortError = new Error('User aborted')
      abortError.name = 'AbortError'
      ;(window as any).showDirectoryPicker = jest
        .fn()
        .mockRejectedValue(abortError)

      try {
        await service.requestProjectsDirectory()
        fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(StorageError)
        expect((error as StorageError).code).toBe('PERMISSION_DENIED')
      }
    })
  })

  describe('hasDirectoryAccess', () => {
    it('should return false initially', () => {
      expect(service.hasDirectoryAccess()).toBe(false)
    })
  })

  describe('list without directory access', () => {
    it('should throw DIRECTORY_ERROR when no access granted', async () => {
      try {
        await service.list()
        fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(StorageError)
        expect((error as StorageError).code).toBe('DIRECTORY_ERROR')
      }
    })
  })

  describe('get without directory access', () => {
    it('should throw DIRECTORY_ERROR when no access granted', async () => {
      try {
        await service.get('some-id')
        fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(StorageError)
        expect((error as StorageError).code).toBe('DIRECTORY_ERROR')
      }
    })
  })

  describe('save without directory access', () => {
    it('should throw DIRECTORY_ERROR when no access granted', async () => {
      try {
        await service.save(sampleProject)
        fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(StorageError)
        expect((error as StorageError).code).toBe('DIRECTORY_ERROR')
      }
    })
  })

  describe('delete without directory access', () => {
    it('should throw DIRECTORY_ERROR when no access granted', async () => {
      try {
        await service.delete('some-id')
        fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(StorageError)
        expect((error as StorageError).code).toBe('DIRECTORY_ERROR')
      }
    })
  })

  describe('clearDirectoryAccess', () => {
    it('should clear directory access state', () => {
      service.clearDirectoryAccess()
      expect(service.hasDirectoryAccess()).toBe(false)
    })
  })
})

describe('SspStorageService - Fallback Methods', () => {
  let service: SspStorageService

  beforeEach(() => {
    service = new SspStorageService()
  })

  describe('downloadProject', () => {
    it('should call saveAs with project JSON', () => {
      const { saveAs } = require('file-saver')
      service.downloadProject(sampleProject)

      expect(saveAs).toHaveBeenCalled()
      const [blob, filename] = saveAs.mock.calls[0]
      expect(blob).toBeInstanceOf(Blob)
      expect(filename).toBe('test-uuid-1234.json')
    })
  })

  describe('uploadProject', () => {
    it('should parse valid JSON file', async () => {
      const fileContent = JSON.stringify(sampleProject)
      // Create a mock file with text() method
      const mockFile = {
        text: async () => fileContent,
      } as unknown as File

      const result = await service.uploadProject(mockFile)
      expect(result.id).toBe(sampleProject.id)
      expect(result.name).toBe(sampleProject.name)
    })

    it('should throw PARSE_ERROR for invalid JSON', async () => {
      const mockFile = {
        text: async () => 'not valid json',
      } as unknown as File

      try {
        await service.uploadProject(mockFile)
        fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(StorageError)
        expect((error as StorageError).code).toBe('PARSE_ERROR')
      }
    })

    it('should throw PARSE_ERROR for missing required fields', async () => {
      const invalidProject = { foo: 'bar' }
      const mockFile = {
        text: async () => JSON.stringify(invalidProject),
      } as unknown as File

      try {
        await service.uploadProject(mockFile)
        fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(StorageError)
        expect((error as StorageError).code).toBe('PARSE_ERROR')
      }
    })
  })

  describe('createForDownload', () => {
    it('should create a new project with generated ID', () => {
      const input: CreateSspInput = {
        name: 'New System',
        baseline: 'HIGH',
        description: 'A new system',
      }

      const result = service.createForDownload(input)

      expect(result.id).toBe('test-uuid-1234')
      expect(result.name).toBe('New System')
      expect(result.baseline).toBe('HIGH')
      expect(result.status).toBe('DRAFT')
      expect(result.createdAt).toBeDefined()
      expect(result.updatedAt).toBeDefined()
    })

    it('should set default system info', () => {
      const input: CreateSspInput = {
        name: 'New System',
        baseline: 'MODERATE',
      }

      const result = service.createForDownload(input)

      expect(result.systemInfo.systemName).toBe('New System')
      expect(result.systemInfo.systemType).toBe('major-application')
      expect(result.systemInfo.categorization.confidentiality).toBe('MODERATE')
    })
  })
})

describe('StorageError', () => {
  it('should create error with code and message', () => {
    const error = new StorageError('NOT_FOUND', 'Project not found')
    expect(error.code).toBe('NOT_FOUND')
    expect(error.message).toBe('Project not found')
    expect(error.name).toBe('StorageError')
  })

  it('should include original error', () => {
    const originalError = new Error('Original')
    const error = new StorageError('PARSE_ERROR', 'Parse failed', originalError)
    expect(error.originalError).toBe(originalError)
  })

  it('should provide user-friendly messages', () => {
    const errors: Array<{ code: StorageError['code']; contains: string }> = [
      { code: 'PERMISSION_DENIED', contains: 'Permission denied' },
      { code: 'NOT_FOUND', contains: 'not found' },
      { code: 'PARSE_ERROR', contains: 'corrupted' },
      { code: 'WRITE_ERROR', contains: 'save' },
      { code: 'DELETE_ERROR', contains: 'delete' },
      { code: 'DIRECTORY_ERROR', contains: 'directory' },
      { code: 'UNSUPPORTED_BROWSER', contains: 'browser' },
      { code: 'UNKNOWN_ERROR', contains: 'unexpected' },
    ]

    errors.forEach(({ code, contains }) => {
      const error = new StorageError(code, 'Test')
      expect(error.getUserMessage().toLowerCase()).toContain(
        contains.toLowerCase()
      )
    })
  })
})

describe('sspStorage singleton', () => {
  it('should export a singleton instance', () => {
    expect(sspStorage).toBeInstanceOf(SspStorageService)
  })

  it('should have all expected methods', () => {
    expect(typeof sspStorage.getCapabilities).toBe('function')
    expect(typeof sspStorage.getStorageMode).toBe('function')
    expect(typeof sspStorage.requestProjectsDirectory).toBe('function')
    expect(typeof sspStorage.hasDirectoryAccess).toBe('function')
    expect(typeof sspStorage.list).toBe('function')
    expect(typeof sspStorage.get).toBe('function')
    expect(typeof sspStorage.save).toBe('function')
    expect(typeof sspStorage.delete).toBe('function')
    expect(typeof sspStorage.downloadProject).toBe('function')
    expect(typeof sspStorage.uploadProject).toBe('function')
    expect(typeof sspStorage.createForDownload).toBe('function')
  })
})
