import { useCallback, useRef, useState } from 'react'
import DropZone from './components/DropZone.jsx'
import { findViewer, acceptAttribute } from './viewers/registry.js'

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

export default function App() {
  const [file, setFile] = useState(null) // { name, content, viewer }
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const loadFile = useCallback((f) => {
    setError(null)
    const viewer = findViewer(f.name)
    if (!viewer) {
      setError(`Tipo de archivo no soportado: "${f.name}". Por ahora solo Markdown (.md).`)
      return
    }
    if (f.size > MAX_SIZE) {
      setError(`El archivo es demasiado grande (máx. ${MAX_SIZE / 1024 / 1024} MB).`)
      return
    }
    const reader = new FileReader()
    reader.onload = () => setFile({ name: f.name, content: reader.result, viewer })
    reader.onerror = () => setError('No se pudo leer el archivo.')
    reader.readAsText(f)
  }, [])

  const Viewer = file?.viewer?.component

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <span className="brand-icon">🗂️</span>
          <span className="brand-name">File Viewer</span>
        </div>
        {file && (
          <div className="header-actions">
            <span className="current-file" title={file.name}>
              {file.viewer.label} · {file.name}
            </span>
            <button className="btn" onClick={() => inputRef.current?.click()}>
              Abrir otro
            </button>
            <button className="btn ghost" onClick={() => setFile(null)}>
              Cerrar
            </button>
            <input
              ref={inputRef}
              type="file"
              accept={acceptAttribute()}
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) loadFile(f)
                e.target.value = ''
              }}
            />
          </div>
        )}
      </header>

      {error && <div className="error-banner">{error}</div>}

      <main className="app-main">
        {file && Viewer ? (
          <Viewer content={file.content} name={file.name} />
        ) : (
          <DropZone onFile={loadFile} />
        )}
      </main>

      <footer className="app-footer">
        <span>File Viewer · MVP Markdown</span>
      </footer>
    </div>
  )
}
