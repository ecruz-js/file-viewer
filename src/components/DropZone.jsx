import { useRef, useState } from 'react'
import { acceptAttribute } from '../viewers/registry.js'

/**
 * Zona inicial para seleccionar o arrastrar archivos. Llama a onFiles(FileList)
 * cuando el usuario elige uno o varios, por diálogo o por drag & drop.
 */
export default function DropZone({ onFiles }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files?.length) onFiles(e.dataTransfer.files)
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
      <h2>Arrastra tus archivos aquí</h2>
      <p>o haz clic para seleccionarlos (puedes elegir varios)</p>
      <p className="dropzone-hint">Formatos soportados: Markdown (.md)</p>
      <input
        ref={inputRef}
        type="file"
        accept={acceptAttribute()}
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files?.length) onFiles(e.target.files)
          e.target.value = ''
        }}
      />
    </div>
  )
}
