import { useRef, useState } from 'react'
import { acceptAttribute } from '../viewers/registry.js'

/**
 * Zona para seleccionar o arrastrar un archivo. Llama a onFile(File) cuando
 * el usuario elige uno, ya sea por diálogo o por drag & drop.
 */
export default function DropZone({ onFile }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) onFile(file)
  }

  return (
    <div
      className={dragging ? 'dropzone dragging' : 'dropzone'}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <div className="dropzone-icon">📄</div>
      <h2>Arrastra un archivo aquí</h2>
      <p>o haz clic para seleccionarlo</p>
      <p className="dropzone-hint">Formatos soportados: Markdown (.md)</p>
      <input
        ref={inputRef}
        type="file"
        accept={acceptAttribute()}
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onFile(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}
