/**
 * Storage Service Type Definitions
 * @module lib/storage/types
 *
 * Types for the SSP file storage service including error handling.
 */

/**
 * Storage error codes for categorizing errors.
 */
export type StorageErrorCode =
  | 'PERMISSION_DENIED'
  | 'NOT_FOUND'
  | 'PARSE_ERROR'
  | 'WRITE_ERROR'
  | 'DELETE_ERROR'
  | 'DIRECTORY_ERROR'
  | 'UNSUPPORTED_BROWSER'
  | 'UNKNOWN_ERROR'

/**
 * Custom error class for storage operations.
 */
export class StorageError extends Error {
  readonly code: StorageErrorCode
  readonly originalError?: Error

  constructor(code: StorageErrorCode, message: string, originalError?: Error) {
    super(message)
    this.name = 'StorageError'
    this.code = code
    this.originalError = originalError

    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, StorageError)
    }
  }

  /**
   * Get a user-friendly error message based on error code.
   */
  getUserMessage(): string {
    switch (this.code) {
      case 'PERMISSION_DENIED':
        return 'Permission denied. Please grant access to the projects folder.'
      case 'NOT_FOUND':
        return 'The requested project was not found.'
      case 'PARSE_ERROR':
        return 'The project file is corrupted or invalid.'
      case 'WRITE_ERROR':
        return 'Failed to save the project. Please try again.'
      case 'DELETE_ERROR':
        return 'Failed to delete the project. Please try again.'
      case 'DIRECTORY_ERROR':
        return 'Unable to access the projects directory.'
      case 'UNSUPPORTED_BROWSER':
        return 'Your browser does not support direct file access. Use the download/upload feature instead.'
      default:
        return 'An unexpected error occurred. Please try again.'
    }
  }
}

/**
 * Result of checking File System Access API support.
 */
export interface StorageCapabilities {
  /** Whether File System Access API is supported */
  hasFileSystemAccess: boolean
  /** Whether the directory handle has been granted */
  hasDirectoryAccess: boolean
}

/**
 * Metadata about an SSP project file (without full content).
 */
export interface SspProjectMetadata {
  id: string
  name: string
  baseline: string
  status: string
  updatedAt: string
  createdAt: string
}

/**
 * Options for the storage service.
 */
export interface StorageOptions {
  /** Custom directory name (defaults to 'ssp-gen') */
  directoryName?: string
  /** Subdirectory for projects (defaults to 'projects') */
  projectsSubdirectory?: string
}

/**
 * Storage mode based on browser capabilities.
 */
export type StorageMode = 'file-system-api' | 'fallback'
