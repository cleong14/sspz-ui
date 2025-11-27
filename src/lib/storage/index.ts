/**
 * SSP Storage Module
 * @module lib/storage
 *
 * Provides file-based persistence for SSP projects.
 *
 * @example
 * import { sspStorage, StorageError } from '@/lib/storage'
 *
 * // Request directory access
 * await sspStorage.requestProjectsDirectory()
 *
 * // List all projects
 * const projects = await sspStorage.list()
 *
 * // Create a new project
 * const newProject = await sspStorage.create({
 *   name: 'My System',
 *   baseline: 'MODERATE'
 * })
 */

export { sspStorage, SspStorageService } from './ssp-storage'
export {
  StorageError,
  type StorageErrorCode,
  type StorageCapabilities,
  type SspProjectMetadata,
  type StorageOptions,
  type StorageMode,
} from './types'
