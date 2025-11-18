import { SSPProject } from '../types/ssp'

const DB_NAME = 'SSPGeneratorDB'
const DB_VERSION = 1
const PROJECTS_STORE = 'projects'

let dbInstance: IDBDatabase | null = null

export async function initDB(): Promise<IDBDatabase> {
  if (dbInstance) {
    return dbInstance
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      dbInstance = request.result
      resolve(request.result)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      if (!db.objectStoreNames.contains(PROJECTS_STORE)) {
        const store = db.createObjectStore(PROJECTS_STORE, { keyPath: 'id' })
        store.createIndex('lastModified', 'metadata.lastModified', {
          unique: false,
        })
        store.createIndex('systemName', 'systemCharacteristics.systemName', {
          unique: false,
        })
      }
    }
  })
}

export async function saveProject(project: SSPProject): Promise<void> {
  const db = await initDB()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(PROJECTS_STORE, 'readwrite')
    const store = tx.objectStore(PROJECTS_STORE)

    // Ensure project has an ID
    if (!project.id) {
      project.id = `ssp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    }

    const request = store.put(project)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function loadProject(id: string): Promise<SSPProject | null> {
  const db = await initDB()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(PROJECTS_STORE, 'readonly')
    const store = tx.objectStore(PROJECTS_STORE)
    const request = store.get(id)

    request.onsuccess = () => resolve(request.result || null)
    request.onerror = () => reject(request.error)
  })
}

export async function listProjects(): Promise<SSPProject[]> {
  const db = await initDB()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(PROJECTS_STORE, 'readonly')
    const store = tx.objectStore(PROJECTS_STORE)
    const request = store.getAll()

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function deleteProject(id: string): Promise<void> {
  const db = await initDB()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(PROJECTS_STORE, 'readwrite')
    const store = tx.objectStore(PROJECTS_STORE)
    const request = store.delete(id)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}
