import { useCallback, useEffect, useRef, useState } from 'react'
import { Files, Plus, X } from 'lucide-react'
import DropZone from './components/DropZone.jsx'
import Sidebar from './components/Sidebar.jsx'
import { Button } from './components/ui/button.jsx'
import { findViewer, acceptAttribute } from './viewers/registry.js'
import { loadFiles, saveFiles, loadPrefs, savePrefs } from './lib/storage.js'

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

const FONT_MIN = 12
const FONT_MAX = 32
const FONT_STEP = 2
const FONT_DEFAULT = 16

/** Lee un File como texto y lo convierte en un item del visor, o un error. */
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

/**
 * Busca el archivo abierto que coincide con un destino de enlace o wikilink.
 * Tolera la extensión omitida, mayúsculas/minúsculas, prefijo "./" y anclas.
 */
function matchItem(items, target) {
  if (!target) return null
  let t = decodeURIComponent(target).trim()
  t = t.replace(/^\.?\//, '').replace(/#.*$/, '')
  const lower = t.toLowerCase()
  return (
    items.find((it) => {
      const name = it.name.toLowerCase()
      const base = name.replace(/\.[^.]+$/, '')
      return name === lower || base === lower || `${base}.md` === lower || `${base}.markdown` === lower
    }) || null
  )
}

function fileParam() {
  return new URLSearchParams(window.location.search).get('file')
}

export default function App() {
  const [items, setItems] = useState(loadFiles) // [{ id, name, content, viewer, size }]
  const [activeId, setActiveId] = useState(null)
  const [error, setError] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [fontSize, setFontSize] = useState(() => {
    const { fontSize } = loadPrefs()
    return typeof fontSize === 'number' ? fontSize : FONT_DEFAULT
  })
  const inputRef = useRef(null)
  const itemsRef = useRef(items)

  useEffect(() => {
    itemsRef.current = items
  }, [items])

  // Persistencia: guarda los archivos en cada cambio (avisa si no hay espacio).
  useEffect(() => {
    const ok = saveFiles(items)
    if (!ok && items.length) {
      setError(
        'No se pudieron guardar los archivos (almacenamiento lleno). Seguirán solo en memoria hasta recargar.',
      )
    }
  }, [items])

  // Persistencia del tamaño de letra.
  useEffect(() => {
    savePrefs({ fontSize })
  }, [fontSize])

  const changeFont = useCallback((delta) => {
    setFontSize((s) => Math.min(FONT_MAX, Math.max(FONT_MIN, s + delta)))
  }, [])

  const addFiles = useCallback((fileList) => {
    const files = Array.from(fileList || [])
    if (!files.length) return
    setError(null)
    Promise.all(files.map(readFile)).then((results) => {
      const loaded = results.filter((r) => r.item).map((r) => r.item)
      const errors = results.filter((r) => r.error).map((r) => r.error)
      if (loaded.length) setItems((prev) => [...prev, ...loaded])
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
    window.history.pushState(null, '', window.location.pathname)
  }, [])

  // Selecciona un archivo y refleja el cambio en la URL (sin recargar).
  const selectFile = useCallback((id) => {
    setActiveId(id)
    const item = itemsRef.current.find((it) => it.id === id)
    if (!item) return
    const search = `?file=${encodeURIComponent(item.name)}`
    if (window.location.search !== search) {
      window.history.pushState(null, '', `${window.location.pathname}${search}`)
    }
  }, [])

  // Navegación desde enlaces/wikilinks del Markdown hacia otro archivo abierto.
  const navigateTo = useCallback(
    (target) => {
      const clean = target.startsWith('wiki:') ? target.slice(5) : target.replace(/^#/, '')
      const item = matchItem(itemsRef.current, clean)
      if (item) {
        setError(null)
        selectFile(item.id)
      } else {
        setError(`No hay ningún archivo abierto que coincida con "${clean}".`)
      }
    },
    [selectFile],
  )

  // Mantiene un archivo activo válido; al cargar/volver atrás respeta ?file=.
  useEffect(() => {
    if (items.length === 0) {
      if (activeId !== null) setActiveId(null)
      return
    }
    if (!activeId || !items.some((it) => it.id === activeId)) {
      const fromUrl = matchItem(items, fileParam())
      setActiveId((fromUrl || items[0]).id)
    }
  }, [items, activeId])

  // Soporte de atrás/adelante del navegador y edición manual de ?file=.
  useEffect(() => {
    const onPop = () => {
      const item = matchItem(itemsRef.current, fileParam())
      if (item) setActiveId(item.id)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const active = items.find((it) => it.id === activeId) || null
  const Viewer = active?.viewer?.component
  const hasFiles = items.length > 0

  return (
    <div className="flex h-[100svh] flex-col overflow-hidden bg-background text-foreground">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b bg-card px-5 py-3">
        <div className="flex items-center gap-2 font-semibold">
          <Files className="size-5 text-muted-foreground" />
          <span>File Viewer</span>
        </div>
        {hasFiles && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {items.length} {items.length === 1 ? 'archivo' : 'archivos'}
            </span>
            <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
              <Plus />
              Añadir
            </Button>
            <Button variant="ghost" size="sm" onClick={clearAll}>
              <X />
              Cerrar todo
            </Button>
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

      {error && (
        <div className="border-b border-destructive/50 bg-destructive/10 px-5 py-2.5 text-sm text-destructive">
          {error}
        </div>
      )}

      <main className="flex min-h-0 min-w-0 flex-1 flex-col">
        {hasFiles ? (
          <div
            className="relative flex min-h-0 flex-1"
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
              onSelect={selectFile}
              onRemove={removeFile}
              onAdd={() => inputRef.current?.click()}
            />
            <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
              {active && Viewer ? (
                <Viewer
                  content={active.content}
                  name={active.name}
                  onNavigate={navigateTo}
                  fontSize={fontSize}
                  onFontDecrease={() => changeFont(-FONT_STEP)}
                  onFontIncrease={() => changeFont(FONT_STEP)}
                  onFontReset={() => setFontSize(FONT_DEFAULT)}
                  fontMin={FONT_MIN}
                  fontMax={FONT_MAX}
                />
              ) : (
                <div className="flex flex-1 items-center justify-center text-muted-foreground">
                  Selecciona un archivo del panel izquierdo
                </div>
              )}
            </section>
            {dragging && (
              <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-xl border-2 border-dashed border-ring bg-accent/30 text-lg backdrop-blur-sm">
                Suelta para añadir archivos
              </div>
            )}
          </div>
        ) : (
          <DropZone onFiles={addFiles} />
        )}
      </main>

      <footer className="shrink-0 border-t px-5 py-2.5 text-center text-xs text-muted-foreground">
        File Viewer · MVP Markdown
      </footer>
    </div>
  )
}
