import { FileText, Plus, X } from 'lucide-react'
import { Button } from './ui/button.jsx'
import { cn } from '../lib/utils.js'

/** Formatea un tamaño en bytes a una cadena legible (B / KB / MB). */
function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

/**
 * Panel lateral con la lista de archivos subidos. Permite seleccionar el archivo
 * a previsualizar y quitar archivos de la lista.
 */
export default function Sidebar({ items, activeId, onSelect, onRemove, onAdd }) {
  return (
    <aside className="flex w-64 shrink-0 flex-col overflow-hidden border-r bg-card">
      <div className="flex items-center justify-between border-b px-3 py-2.5">
        <span className="text-sm font-semibold">Archivos</span>
        <Button variant="ghost" size="sm" onClick={onAdd} title="Añadir archivos">
          <Plus />
          Añadir
        </Button>
      </div>

      <ul className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {items.map((it) => (
          <li
            key={it.id}
            className={cn(
              'group flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors',
              it.id === activeId ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50',
            )}
            onClick={() => onSelect(it.id)}
            title={it.name}
          >
            <FileText className="size-4 shrink-0 text-muted-foreground" />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate">{it.name}</span>
              <span className="text-xs text-muted-foreground">
                {it.viewer.label} · {formatSize(it.size)}
              </span>
            </span>
            <button
              className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition hover:bg-destructive/15 hover:text-destructive focus:opacity-100 group-hover:opacity-100"
              title="Quitar"
              onClick={(e) => {
                e.stopPropagation()
                onRemove(it.id)
              }}
            >
              <X className="size-4" />
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}
