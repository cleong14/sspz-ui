import React, { createContext, useContext, useState, ReactNode } from 'react'
import {
  SSPProject,
  SystemCharacteristics,
  Baseline,
  SelectedTool,
  ControlImplementation,
  ResponsibleParty,
} from '../types/ssp'

interface SSPProjectContextType {
  project: SSPProject
  updateSystemCharacteristics: (characteristics: SystemCharacteristics) => void
  setControlBaseline: (baseline: Baseline) => void
  addSelectedTool: (tool: SelectedTool) => void
  removeSelectedTool: (toolId: string) => void
  updateControlImplementation: (implementation: ControlImplementation) => void
  addResponsibleParty: (party: ResponsibleParty) => void
  resetProject: () => void
  loadProject: (project: SSPProject) => void
}

const SSPProjectContext = createContext<SSPProjectContextType | undefined>(
  undefined
)

function createDefaultProject(): SSPProject {
  return {
    metadata: {
      title: 'Untitled System Security Plan',
      lastModified: new Date(),
      version: '1.0.0',
      oscalVersion: '1.0.4',
    },
    systemCharacteristics: {
      systemName: '',
      systemId: '',
      description: '',
      securityImpactLevel: {
        confidentiality: 'moderate',
        integrity: 'moderate',
        availability: 'moderate',
      },
      systemType: '',
      authorizationBoundary: '',
    },
    controlBaseline: 'moderate',
    selectedTools: [],
    controlImplementations: [],
    responsibleParties: [],
  }
}

export function SSPProjectProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<SSPProject>(createDefaultProject())

  const updateSystemCharacteristics = (
    characteristics: SystemCharacteristics
  ) => {
    setProject((prev) => ({
      ...prev,
      systemCharacteristics: characteristics,
      metadata: {
        ...prev.metadata,
        lastModified: new Date(),
        title: characteristics.systemName || prev.metadata.title,
      },
    }))
  }

  const setControlBaseline = (baseline: Baseline) => {
    setProject((prev) => ({
      ...prev,
      controlBaseline: baseline,
      metadata: { ...prev.metadata, lastModified: new Date() },
    }))
  }

  const addSelectedTool = (tool: SelectedTool) => {
    setProject((prev) => ({
      ...prev,
      selectedTools: [...prev.selectedTools, tool],
      metadata: { ...prev.metadata, lastModified: new Date() },
    }))
  }

  const removeSelectedTool = (toolId: string) => {
    setProject((prev) => ({
      ...prev,
      selectedTools: prev.selectedTools.filter((t) => t.toolId !== toolId),
      metadata: { ...prev.metadata, lastModified: new Date() },
    }))
  }

  const updateControlImplementation = (
    implementation: ControlImplementation
  ) => {
    setProject((prev) => {
      const existing = prev.controlImplementations.findIndex(
        (ci) => ci.controlId === implementation.controlId
      )

      const updated =
        existing >= 0
          ? prev.controlImplementations.map((ci, i) =>
              i === existing ? implementation : ci
            )
          : [...prev.controlImplementations, implementation]

      return {
        ...prev,
        controlImplementations: updated,
        metadata: { ...prev.metadata, lastModified: new Date() },
      }
    })
  }

  const addResponsibleParty = (party: ResponsibleParty) => {
    setProject((prev) => ({
      ...prev,
      responsibleParties: [...prev.responsibleParties, party],
      metadata: { ...prev.metadata, lastModified: new Date() },
    }))
  }

  const resetProject = () => {
    setProject(createDefaultProject())
  }

  const loadProject = (newProject: SSPProject) => {
    setProject(newProject)
  }

  return (
    <SSPProjectContext.Provider
      value={{
        project,
        updateSystemCharacteristics,
        setControlBaseline,
        addSelectedTool,
        removeSelectedTool,
        updateControlImplementation,
        addResponsibleParty,
        resetProject,
        loadProject,
      }}
    >
      {children}
    </SSPProjectContext.Provider>
  )
}

export function useSSPProject() {
  const context = useContext(SSPProjectContext)
  if (!context) {
    throw new Error('useSSPProject must be used within SSPProjectProvider')
  }
  return context
}
