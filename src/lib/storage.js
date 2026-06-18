import { getViewerById } from '../viewers/registry.js'

const FILES_KEY = 'file-viewer:files:v1'
const PREFS_KEY = 'file-viewer:prefs:v1'

/**
 * Carga los archivos guardados y los rehidrata adjuntando su visor desde el
 * registro (el componente del visor no es serializable, solo se guarda su id).
 * Los archivos cuyo tipo ya no exista se descartan.
 */
export function loadFiles() {
  try {
    const raw = localStorage.getItem(FILES_KEY)
    if (!raw) return []
    const data = JSON.parse(raw)
    if (!Array.isArray(data)) return []
    return data
      .map((it) => {
        const viewer = getViewerById(it.viewerId)
        return viewer ? { id: it.id, name: it.name, content: it.content, size: it.size, viewer } : null
      })
      .filter(Boolean)
  } catch {
    return []
  }
}

/** Guarda los archivos. Devuelve false si el almacenamiento está lleno. */
export function saveFiles(items) {
  try {
    if (!items.length) {
      localStorage.removeItem(FILES_KEY)
      return true
    }
    const data = items.map((it) => ({
      id: it.id,
      name: it.name,
      content: it.content,
      size: it.size,
      viewerId: it.viewer.id,
    }))
    localStorage.setItem(FILES_KEY, JSON.stringify(data))
    return true
  } catch {
    return false
  }
}

export function loadPrefs() {
  try {
    return JSON.parse(localStorage.getItem(PREFS_KEY)) || {}
  } catch {
    return {}
  }
}

export function savePrefs(prefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
  } catch {
    /* sin persistencia de preferencias */
  }
}
