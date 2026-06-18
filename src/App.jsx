import { useCallback, useEffect, useRef, useState } from 'react'
import DropZone from './components/DropZone.jsx'
import Sidebar from './components/Sidebar.jsx'
import { findViewer, acceptAttribute } from './viewers/registry.js'

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

/** Lee un File como texto y lo convierte en un item del visor, o null si falla. */
function readFile(file) {
  return new Promise((resolve) => {
    const viewer = findViewer(file.name)
    if (!viewer) {
      resolve({ error: `"${file.name}": tipo no soportado` })
      return
    }
    if (file.size > MAX_SIZE) {
      resolve({ error: `"${file.name}": supera los ${MAX_SIZE / 1024 / 1024} MB` })
      return
    }
    const reader = new FileReader()
    reader.onload = () =>
      resolve({
        item: {
          id: crypto.randomUUID(),
          name: file.name,
          content: reader.result,
          viewer,
          size: file.size,
        },
      })
    reader.onerror = () => resolve({ error: `"${file.name}": no se pudo leer` })
    reader.readAsText(file)
  })
}

export default function App() {
  const [items, setItems] = useState([]) // [{ id, name, content, viewer, size }]
  const [activeId, setActiveId] = useState(null)
  const [error, setError] = useState(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  const addFiles = useCallback((fileList) => {
    const files = Array.from(fileList || [])
    if (!files.length) return
    setError(null)
    Promise.all(files.map(readFile)).then((results) => {
      const loaded = results.filter((r) => r.item).map((r) => r.item)
      const errors = results.filter((r) => r.error).map((r) => r.error)
      if (loaded.length) {
        setItems((prev) => [...prev, ...loaded])
        setActiveId((cur) => cur ?? loaded[0].id)
      }
      if (errors.length) setError(errors.join(' · '))
    })
  }, [])

  const removeFile = useCallback((id) => {
    setItems((prev) => prev.filter((it) => it.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setItems([])
    setActiveId(null)
    setError(null)
  }, [])

  // Si el archivo activo deja de existir, seleccionar otro automáticamente.
  useEffect(() => {
    if (activeId && !items.some((it) => it.id === activeId)) {
      setActiveId(items[0]?.id ?? null)
    }
  }, [items, activeId])

  const active = items.find((it) => it.id === activeId) || null
  const Viewer = active?.viewer?.component
  const hasFiles = items.length > 0

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <span className="brand-icon">🗂️</span>
          <span className="brand-name">File Viewer</span>
        </div>
        {hasFiles && (
          <div className="header-actions">
            <span className="file-count">
              {items.length} {items.length === 1 ? 'archivo' : 'archivos'}
            </span>
            <button className="btn" onClick={() => inputRef.current?.click()}>
              Añadir
            </button>
            <button className="btn ghost" onClick={clearAll}>
              Cerrar todo
            </button>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={acceptAttribute()}
          multiple
          hidden
          onChange={(e) => {
            addFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </header>

      {error && <div className="error-banner">{error}</div>}

      <main className="app-main">
        {hasFiles ? (
          <div
            className={dragging ? 'workspace dragging' : 'workspace'}
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragging(false)
              addFiles(e.dataTransfer.files)
            }}
          >
            <Sidebar
              items={items}
              activeId={activeId}
              onSelect={setActiveId}
              onRemove={removeFile}
              onAdd={() => inputRef.current?.click()}
            />
            <section className="workspace-main">
              {active && Viewer ? (
                <Viewer content={active.content} name={active.name} />
              ) : (
                <div className="empty-preview">Selecciona un archivo del panel izquierdo</div>
              )}
            </section>
            {dragging && <div className="drop-overlay">Suelta para añadir archivos</div>}
          </div>
        ) : (
          <DropZone onFiles={addFiles} />
        )}
      </main>

      <footer className="app-footer">
        <span>File Viewer · MVP Markdown</span>
      </footer>
    </div>
  )
}
