/**
 * SSP Storage Service
 * @module lib/storage/ssp-storage
 *
 * Provides file-based persistence for SSP projects using:
 * - File System Access API (Chrome, Edge) as primary method
 * - Download/upload fallback for unsupported browsers (Safari, Firefox)
 */

import { saveAs } from 'file-saver'
import { v4 as uuidv4 } from 'uuid'

import type { SspProject, CreateSspInput } from '@/types/ssp'

import {
  StorageError,
  type StorageCapabilities,
  type SspProjectMetadata,
  type StorageMode,
} from './types'

// File System Access API type declarations
// Using prefixed names to avoid conflicts with DOM lib types
interface FSADirectoryPickerOptions {
  id?: string
  mode?: 'read' | 'readwrite'
  startIn?:
    | 'desktop'
    | 'documents'
    | 'downloads'
    | 'music'
    | 'pictures'
    | 'videos'
}

interface FSADirectoryHandle {
  readonly kind: 'directory'
  readonly name: string
  getFileHandle(
    name: string,
    options?: { create?: boolean }
  ): Promise<FSAFileHandle>
  getDirectoryHandle(
    name: string,
    options?: { create?: boolean }
  ): Promise<FSADirectoryHandle>
  removeEntry(name: string, options?: { recursive?: boolean }): Promise<void>
  values(): AsyncIterableIterator<FSAFileHandle | FSADirectoryHandle>
  entries(): AsyncIterableIterator<[string, FSAFileHandle | FSADirectoryHandle]>
}

interface FSAFileHandle {
  readonly kind: 'file'
  readonly name: string
  getFile(): Promise<File>
  createWritable(): Promise<FSAWritableFileStream>
}

interface FSAWritableFileStream extends WritableStream {
  write(data: string | BufferSource | Blob): Promise<void>
  close(): Promise<void>
}

// Extend Window to include showDirectoryPicker
declare global {
  interface Window {
    showDirectoryPicker?: (
      options?: FSADirectoryPickerOptions
    ) => Promise<FSADirectoryHandle>
  }
}

/**
 * SSP Storage Service
 *
 * Manages persistence of SSP projects to local JSON files.
 */
class SspStorageService {
  private directoryHandle: FSADirectoryHandle | null = null
  private projectsHandle: FSADirectoryHandle | null = null

  /**
   * Check browser capabilities for file system access.
   */
  getCapabilities(): StorageCapabilities {
    return {
      hasFileSystemAccess: typeof window.showDirectoryPicker === 'function',
      hasDirectoryAccess: this.directoryHandle !== null,
    }
  }

  /**
   * Get current storage mode based on capabilities.
   */
  getStorageMode(): StorageMode {
    return this.getCapabilities().hasFileSystemAccess
      ? 'file-system-api'
      : 'fallback'
  }

  /**
   * Request access to the projects directory.
   * Opens a directory picker for the user to select their ssp-gen folder.
   *
   * @throws {StorageError} If permission is denied or directory picker fails
   */
  async requestProjectsDirectory(): Promise<void> {
    if (!window.showDirectoryPicker) {
      throw new StorageError(
        'UNSUPPORTED_BROWSER',
        'File System Access API is not supported in this browser'
      )
    }

    try {
      // Request directory with read/write access
      this.directoryHandle = await window.showDirectoryPicker({
        id: 'ssp-gen-projects',
        mode: 'readwrite',
        startIn: 'documents',
      })

      // Get or create projects subdirectory
      this.projectsHandle = await this.directoryHandle.getDirectoryHandle(
        'projects',
        { create: true }
      )
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new StorageError(
          'PERMISSION_DENIED',
          'User cancelled directory selection',
          error
        )
      }
      throw new StorageError(
        'DIRECTORY_ERROR',
        'Failed to access projects directory',
        error instanceof Error ? error : undefined
      )
    }
  }

  /**
   * Check if directory access has been granted.
   */
  hasDirectoryAccess(): boolean {
    return this.projectsHandle !== null
  }

  /**
   * List all SSP projects in the directory.
   *
   * @returns Array of SSP projects
   * @throws {StorageError} If directory access fails
   */
  async list(): Promise<SspProject[]> {
    if (!this.projectsHandle) {
      throw new StorageError(
        'DIRECTORY_ERROR',
        'No directory access. Call requestProjectsDirectory() first.'
      )
    }

    const projects: SspProject[] = []

    try {
      for await (const entry of this.projectsHandle.values()) {
        if (entry.kind === 'file' && entry.name.endsWith('.json')) {
          try {
            const file = await entry.getFile()
            const content = await file.text()
            const project = JSON.parse(content) as SspProject
            projects.push(project)
          } catch (parseError) {
            // Skip files that can't be parsed - log warning but continue
            console.warn(`Failed to parse ${entry.name}:`, parseError)
          }
        }
      }
    } catch (error) {
      throw new StorageError(
        'DIRECTORY_ERROR',
        'Failed to list projects',
        error instanceof Error ? error : undefined
      )
    }

    // Sort by updatedAt descending (most recent first)
    return projects.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  }

  /**
   * List project metadata without loading full content.
   * More efficient for displaying project lists.
   */
  async listMetadata(): Promise<SspProjectMetadata[]> {
    const projects = await this.list()
    return projects.map((p) => ({
      id: p.id,
      name: p.name,
      baseline: p.baseline,
      status: p.status,
      updatedAt: p.updatedAt,
      createdAt: p.createdAt,
    }))
  }

  /**
   * Get a specific SSP project by ID.
   *
   * @param id - Project UUID
   * @returns The SSP project or null if not found
   * @throws {StorageError} If read fails
   */
  async get(id: string): Promise<SspProject | null> {
    if (!this.projectsHandle) {
      throw new StorageError(
        'DIRECTORY_ERROR',
        'No directory access. Call requestProjectsDirectory() first.'
      )
    }

    const fileName = `${id}.json`

    try {
      const fileHandle = await this.projectsHandle.getFileHandle(fileName)
      const file = await fileHandle.getFile()
      const content = await file.text()
      return JSON.parse(content) as SspProject
    } catch (error) {
      if (error instanceof Error && error.name === 'NotFoundError') {
        return null
      }
      if (error instanceof SyntaxError) {
        throw new StorageError(
          'PARSE_ERROR',
          `Failed to parse project file: ${fileName}`,
          error
        )
      }
      throw new StorageError(
        'NOT_FOUND',
        `Failed to read project: ${id}`,
        error instanceof Error ? error : undefined
      )
    }
  }

  /**
   * Save an SSP project to file.
   * Automatically updates the updatedAt timestamp.
   *
   * @param project - The SSP project to save
   * @throws {StorageError} If write fails
   */
  async save(project: SspProject): Promise<SspProject> {
    if (!this.projectsHandle) {
      throw new StorageError(
        'DIRECTORY_ERROR',
        'No directory access. Call requestProjectsDirectory() first.'
      )
    }

    // Update timestamp
    const updatedProject: SspProject = {
      ...project,
      updatedAt: new Date().toISOString(),
    }

    const fileName = `${project.id}.json`

    try {
      const fileHandle = await this.projectsHandle.getFileHandle(fileName, {
        create: true,
      })
      const writable = await fileHandle.createWritable()
      await writable.write(JSON.stringify(updatedProject, null, 2))
      await writable.close()
      return updatedProject
    } catch (error) {
      throw new StorageError(
        'WRITE_ERROR',
        `Failed to save project: ${project.name}`,
        error instanceof Error ? error : undefined
      )
    }
  }

  /**
   * Create a new SSP project with generated ID and timestamps.
   *
   * @param input - Creation input (name, baseline, optional description)
   * @returns The newly created project
   */
  async create(input: CreateSspInput): Promise<SspProject> {
    const now = new Date().toISOString()

    const newProject: SspProject = {
      id: uuidv4(),
      name: input.name,
      description: input.description,
      baseline: input.baseline,
      status: 'DRAFT',
      createdAt: now,
      updatedAt: now,
      systemInfo: {
        systemName: input.name,
        systemType: 'major-application',
        description: input.description || '',
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

    return this.save(newProject)
  }

  /**
   * Delete an SSP project by ID.
   *
   * @param id - Project UUID
   * @throws {StorageError} If delete fails
   */
  async delete(id: string): Promise<void> {
    if (!this.projectsHandle) {
      throw new StorageError(
        'DIRECTORY_ERROR',
        'No directory access. Call requestProjectsDirectory() first.'
      )
    }

    const fileName = `${id}.json`

    try {
      await this.projectsHandle.removeEntry(fileName)
    } catch (error) {
      if (error instanceof Error && error.name === 'NotFoundError') {
        // File already doesn't exist - consider this success
        return
      }
      throw new StorageError(
        'DELETE_ERROR',
        `Failed to delete project: ${id}`,
        error instanceof Error ? error : undefined
      )
    }
  }

  // ============================================
  // Fallback Methods (for unsupported browsers)
  // ============================================

  /**
   * Download a project as a JSON file.
   * Used as fallback for browsers without File System Access API.
   *
   * @param project - The SSP project to download
   */
  downloadProject(project: SspProject): void {
    const blob = new Blob([JSON.stringify(project, null, 2)], {
      type: 'application/json',
    })
    saveAs(blob, `${project.id}.json`)
  }

  /**
   * Upload and parse a project from a JSON file.
   * Used as fallback for browsers without File System Access API.
   *
   * @param file - The uploaded file
   * @returns The parsed SSP project
   * @throws {StorageError} If file is invalid
   */
  async uploadProject(file: File): Promise<SspProject> {
    try {
      const content = await file.text()
      const project = JSON.parse(content) as SspProject

      // Validate required fields
      if (!project.id || !project.name || !project.baseline) {
        throw new Error('Invalid project file: missing required fields')
      }

      return project
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new StorageError('PARSE_ERROR', 'Invalid JSON file', error)
      }
      throw new StorageError(
        'PARSE_ERROR',
        'Failed to parse project file',
        error instanceof Error ? error : undefined
      )
    }
  }

  /**
   * Create a new project for download (without saving to file system).
   * Used in fallback mode.
   */
  createForDownload(input: CreateSspInput): SspProject {
    const now = new Date().toISOString()

    return {
      id: uuidv4(),
      name: input.name,
      description: input.description,
      baseline: input.baseline,
      status: 'DRAFT',
      createdAt: now,
      updatedAt: now,
      systemInfo: {
        systemName: input.name,
        systemType: 'major-application',
        description: input.description || '',
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
  }

  /**
   * Clear the directory handle (useful for testing or resetting state).
   */
  clearDirectoryAccess(): void {
    this.directoryHandle = null
    this.projectsHandle = null
  }
}

// Export singleton instance
export const sspStorage = new SspStorageService()

// Also export class for testing
export { SspStorageService }
