import MarkdownViewer from './MarkdownViewer.jsx'

/**
 * Registro de visores por tipo de archivo.
 *
 * Cada entrada declara qué extensiones soporta, una etiqueta legible y el
 * componente que renderiza el contenido. Para añadir un nuevo tipo de archivo
 * (JSON, CSV, imágenes...) basta con registrar un nuevo visor aquí; el resto
 * de la app lo descubre automáticamente.
 */
const viewers = [
  {
    id: 'markdown',
    label: 'Markdown',
    icon: '📝',
    extensions: ['md', 'markdown', 'mdown', 'mkd'],
    accept: '.md,.markdown,.mdown,.mkd',
    component: MarkdownViewer,
  },
]

export function getExtension(filename = '') {
  const dot = filename.lastIndexOf('.')
  return dot === -1 ? '' : filename.slice(dot + 1).toLowerCase()
}

export function findViewer(filename) {
  const ext = getExtension(filename)
  return viewers.find((v) => v.extensions.includes(ext)) || null
}

/** Cadena lista para el atributo `accept` de un <input type="file">. */
export function acceptAttribute() {
  return viewers.map((v) => v.accept).join(',')
}

export default viewers
