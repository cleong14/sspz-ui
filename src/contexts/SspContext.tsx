/**
 * SSP Context Provider
 * @module contexts/SspContext
 *
 * Provides SSP project state management across the application.
 * Story 4.1: Build SSP Dashboard
 */
import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import type { SspProject, CreateSspInput, SspStatus } from '@/types/ssp'
import { sspStorage } from '@/lib/storage/ssp-storage'

// ============================================================================
// Types
// ============================================================================

interface SspState {
  projects: SspProject[]
  currentProject: SspProject | null
  isLoading: boolean
  error: string | null
  hasDirectoryAccess: boolean
}

type SspAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_PROJECTS'; payload: SspProject[] }
  | { type: 'SET_CURRENT_PROJECT'; payload: SspProject | null }
  | { type: 'ADD_PROJECT'; payload: SspProject }
  | { type: 'UPDATE_PROJECT'; payload: SspProject }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_DIRECTORY_ACCESS'; payload: boolean }

interface SspContextValue extends SspState {
  // Actions
  loadProjects: () => Promise<void>
  createProject: (input: CreateSspInput) => Promise<SspProject>
  updateProject: (project: SspProject) => Promise<SspProject>
  deleteProject: (id: string) => Promise<void>
  archiveProject: (id: string) => Promise<SspProject>
  restoreProject: (id: string) => Promise<SspProject>
  duplicateProject: (id: string, newName: string) => Promise<SspProject>
  setCurrentProject: (project: SspProject | null) => void
  requestDirectoryAccess: () => Promise<void>
  // Computed
  getProjectById: (id: string) => SspProject | undefined
  getProjectsByStatus: (status: SspStatus) => SspProject[]
  getArchivedProjects: () => SspProject[]
  getActiveProjects: () => SspProject[]
  getProjectStats: () => ProjectStats
}

export interface ProjectStats {
  total: number
  draft: number
  inProgress: number
  review: number
  complete: number
  archived: number
}

// ============================================================================
// Initial State & Reducer
// ============================================================================

const initialState: SspState = {
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,
  hasDirectoryAccess: false,
}

function sspReducer(state: SspState, action: SspAction): SspState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload, isLoading: false }
    case 'SET_CURRENT_PROJECT':
      return { ...state, currentProject: action.payload }
    case 'ADD_PROJECT':
      return {
        ...state,
        projects: [action.payload, ...state.projects],
      }
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.payload.id ? action.payload : p
        ),
        currentProject:
          state.currentProject?.id === action.payload.id
            ? action.payload
            : state.currentProject,
      }
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter((p) => p.id !== action.payload),
        currentProject:
          state.currentProject?.id === action.payload
            ? null
            : state.currentProject,
      }
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }
    case 'SET_DIRECTORY_ACCESS':
      return { ...state, hasDirectoryAccess: action.payload }
    default:
      return state
  }
}

// ============================================================================
// Context
// ============================================================================

const SspContext = createContext<SspContextValue | null>(null)

// ============================================================================
// Provider Component
// ============================================================================

interface SspProviderProps {
  children: ReactNode
}

export function SspProvider({ children }: SspProviderProps): JSX.Element {
  const [state, dispatch] = useReducer(sspReducer, initialState)

  // Check for existing directory access on mount
  useEffect(() => {
    const hasAccess = sspStorage.hasDirectoryAccess()
    dispatch({ type: 'SET_DIRECTORY_ACCESS', payload: hasAccess })
  }, [])

  // Request directory access
  const requestDirectoryAccess = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      await sspStorage.requestProjectsDirectory()
      dispatch({ type: 'SET_DIRECTORY_ACCESS', payload: true })
      // Load projects after getting access
      const projects = await sspStorage.list()
      dispatch({ type: 'SET_PROJECTS', payload: projects })
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload:
          error instanceof Error ? error.message : 'Failed to access directory',
      })
      throw error
    }
  }, [])

  // Load all projects
  const loadProjects = useCallback(async () => {
    if (!sspStorage.hasDirectoryAccess()) {
      dispatch({ type: 'SET_PROJECTS', payload: [] })
      return
    }
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const projects = await sspStorage.list()
      dispatch({ type: 'SET_PROJECTS', payload: projects })
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload:
          error instanceof Error ? error.message : 'Failed to load projects',
      })
    }
  }, [])

  // Create a new project
  const createProject = useCallback(async (input: CreateSspInput) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const project = await sspStorage.create(input)
      dispatch({ type: 'ADD_PROJECT', payload: project })
      dispatch({ type: 'SET_LOADING', payload: false })
      return project
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload:
          error instanceof Error ? error.message : 'Failed to create project',
      })
      throw error
    }
  }, [])

  // Update an existing project
  const updateProject = useCallback(async (project: SspProject) => {
    try {
      const updated = await sspStorage.save(project)
      dispatch({ type: 'UPDATE_PROJECT', payload: updated })
      return updated
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload:
          error instanceof Error ? error.message : 'Failed to update project',
      })
      throw error
    }
  }, [])

  // Delete a project
  const deleteProject = useCallback(async (id: string) => {
    try {
      await sspStorage.delete(id)
      dispatch({ type: 'DELETE_PROJECT', payload: id })
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload:
          error instanceof Error ? error.message : 'Failed to delete project',
      })
      throw error
    }
  }, [])

  // Archive a project (soft delete)
  const archiveProject = useCallback(
    async (id: string) => {
      const project = state.projects.find((p) => p.id === id)
      if (!project) throw new Error('Project not found')

      const archived: SspProject = {
        ...project,
        archivedAt: new Date().toISOString(),
      }
      return updateProject(archived)
    },
    [state.projects, updateProject]
  )

  // Restore an archived project
  const restoreProject = useCallback(
    async (id: string) => {
      const project = state.projects.find((p) => p.id === id)
      if (!project) throw new Error('Project not found')

      const restored: SspProject = {
        ...project,
        archivedAt: undefined,
      }
      return updateProject(restored)
    },
    [state.projects, updateProject]
  )

  // Duplicate a project
  const duplicateProject = useCallback(
    async (id: string, newName: string) => {
      const project = state.projects.find((p) => p.id === id)
      if (!project) throw new Error('Project not found')

      const input: CreateSspInput = {
        name: newName,
        description: project.description,
        baseline: project.baseline,
      }

      // Create new project
      const newProject = await sspStorage.create(input)

      // Copy over system info and implementations
      const duplicated: SspProject = {
        ...newProject,
        systemInfo: { ...project.systemInfo, systemName: newName },
        implementations: project.implementations.map((impl) => ({
          ...impl,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
        selectedTools: [...project.selectedTools],
      }

      const saved = await sspStorage.save(duplicated)
      dispatch({ type: 'ADD_PROJECT', payload: saved })
      return saved
    },
    [state.projects]
  )

  // Set current project
  const setCurrentProject = useCallback((project: SspProject | null) => {
    dispatch({ type: 'SET_CURRENT_PROJECT', payload: project })
  }, [])

  // Get project by ID
  const getProjectById = useCallback(
    (id: string) => state.projects.find((p) => p.id === id),
    [state.projects]
  )

  // Get projects by status
  const getProjectsByStatus = useCallback(
    (status: SspStatus) =>
      state.projects.filter((p) => p.status === status && !p.archivedAt),
    [state.projects]
  )

  // Get archived projects
  const getArchivedProjects = useCallback(
    () => state.projects.filter((p) => p.archivedAt),
    [state.projects]
  )

  // Get active (non-archived) projects
  const getActiveProjects = useCallback(
    () => state.projects.filter((p) => !p.archivedAt),
    [state.projects]
  )

  // Get project statistics
  const getProjectStats = useCallback((): ProjectStats => {
    const active = state.projects.filter((p) => !p.archivedAt)
    const archived = state.projects.filter((p) => p.archivedAt)

    return {
      total: active.length,
      draft: active.filter((p) => p.status === 'DRAFT').length,
      inProgress: active.filter((p) => p.status === 'IN_PROGRESS').length,
      review: active.filter((p) => p.status === 'REVIEW').length,
      complete: active.filter((p) => p.status === 'COMPLETE').length,
      archived: archived.length,
    }
  }, [state.projects])

  const value: SspContextValue = {
    ...state,
    loadProjects,
    createProject,
    updateProject,
    deleteProject,
    archiveProject,
    restoreProject,
    duplicateProject,
    setCurrentProject,
    requestDirectoryAccess,
    getProjectById,
    getProjectsByStatus,
    getArchivedProjects,
    getActiveProjects,
    getProjectStats,
  }

  return <SspContext.Provider value={value}>{children}</SspContext.Provider>
}

// ============================================================================
// Hook
// ============================================================================

export function useSsp(): SspContextValue {
  const context = useContext(SspContext)
  if (!context) {
    throw new Error('useSsp must be used within an SspProvider')
  }
  return context
}

export default SspContext
