import {
  initDB,
  saveProject,
  loadProject,
  listProjects,
  deleteProject,
} from '../indexeddb'
import { SSPProject } from '../../types/ssp'

describe('IndexedDB Service', () => {
  beforeEach(async () => {
    await initDB()
  })

  it('should initialize database', async () => {
    const db = await initDB()
    expect(db).toBeDefined()
  })

  it('should save and load project', async () => {
    const project: SSPProject = {
      id: 'test-1',
      metadata: {
        title: 'Test Project',
        lastModified: new Date(),
        version: '1.0.0',
        oscalVersion: '1.0.4',
      },
      systemCharacteristics: {
        systemName: 'Test',
        systemId: 'test',
        description: 'Test',
        securityImpactLevel: {
          confidentiality: 'low',
          integrity: 'low',
          availability: 'low',
        },
        systemType: 'Test',
        authorizationBoundary: 'Test',
      },
      controlBaseline: 'low',
      selectedTools: [],
      controlImplementations: [],
      responsibleParties: [],
    }

    await saveProject(project)
    const loaded = await loadProject('test-1')

    expect(loaded).toBeDefined()
    expect(loaded?.id).toBe('test-1')
    expect(loaded?.metadata.title).toBe('Test Project')
  })

  it('should list all projects', async () => {
    const project1: SSPProject = {
      id: 'test-2',
      metadata: {
        title: 'Project 1',
        lastModified: new Date(),
        version: '1.0.0',
        oscalVersion: '1.0.4',
      },
      systemCharacteristics: {
        systemName: 'Test',
        systemId: 'test',
        description: 'Test',
        securityImpactLevel: {
          confidentiality: 'low',
          integrity: 'low',
          availability: 'low',
        },
        systemType: 'Test',
        authorizationBoundary: 'Test',
      },
      controlBaseline: 'low',
      selectedTools: [],
      controlImplementations: [],
      responsibleParties: [],
    }

    await saveProject(project1)
    const projects = await listProjects()

    expect(projects.length).toBeGreaterThan(0)
  })

  it('should delete project', async () => {
    const project: SSPProject = {
      id: 'test-3',
      metadata: {
        title: 'To Delete',
        lastModified: new Date(),
        version: '1.0.0',
        oscalVersion: '1.0.4',
      },
      systemCharacteristics: {
        systemName: 'Test',
        systemId: 'test',
        description: 'Test',
        securityImpactLevel: {
          confidentiality: 'low',
          integrity: 'low',
          availability: 'low',
        },
        systemType: 'Test',
        authorizationBoundary: 'Test',
      },
      controlBaseline: 'low',
      selectedTools: [],
      controlImplementations: [],
      responsibleParties: [],
    }

    await saveProject(project)
    await deleteProject('test-3')
    const loaded = await loadProject('test-3')

    expect(loaded).toBeNull()
  })
})
