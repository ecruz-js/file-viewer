import { useRef, useState } from 'react'
import { FileUp } from 'lucide-react'
import { acceptAttribute } from '../viewers/registry.js'
import { cn } from '../lib/utils.js'

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
      className={cn(
        'm-8 flex flex-1 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed text-center text-muted-foreground transition-colors',
        dragging ? 'border-ring bg-accent/30' : 'hover:border-ring/60 hover:bg-accent/20',
      )}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <FileUp className="mb-4 size-12 stroke-[1.5]" />
      <h2 className="text-xl font-semibold text-foreground">Arrastra tus archivos aquí</h2>
      <p className="mt-1">o haz clic para seleccionarlos (puedes elegir varios)</p>
      <p className="mt-4 text-xs opacity-70">Formatos soportados: Markdown (.md)</p>
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
