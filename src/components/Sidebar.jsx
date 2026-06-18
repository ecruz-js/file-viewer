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
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-title">Archivos</span>
        <button className="sidebar-add" onClick={onAdd} title="Añadir archivos">
          + Añadir
        </button>
      </div>

      <ul className="file-list">
        {items.map((it) => (
          <li
            key={it.id}
            className={it.id === activeId ? 'file-item active' : 'file-item'}
            onClick={() => onSelect(it.id)}
            title={it.name}
          >
            <span className="file-icon">{it.viewer.icon || '📄'}</span>
            <span className="file-info">
              <span className="file-name">{it.name}</span>
              <span className="file-meta">
                {it.viewer.label} · {formatSize(it.size)}
              </span>
            </span>
            <button
              className="file-remove"
              title="Quitar"
              onClick={(e) => {
                e.stopPropagation()
                onRemove(it.id)
              }}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}
