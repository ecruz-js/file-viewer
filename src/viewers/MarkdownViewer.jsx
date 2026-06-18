import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import remarkWikiLink from '../markdown/remarkWikiLink.js'

const MODES = [
  { id: 'preview', label: 'Vista previa' },
  { id: 'split', label: 'Dividido' },
  { id: 'source', label: 'Fuente' },
]

const remarkPlugins = [remarkGfm, remarkWikiLink]
const rehypePlugins = [rehypeHighlight]

/** ¿Es un enlace a un recurso externo (http, mailto, etc.)? */
function isExternal(href = '') {
  return /^[a-z][a-z0-9+.-]*:/i.test(href) && !href.startsWith('wiki:')
}

/**
 * Visor de Markdown.
 *
 * Soporta GitHub Flavored Markdown (tablas, listas de tareas, tachado),
 * resaltado de sintaxis y wikilinks `[[Archivo]]`. Los enlaces internos
 * (wikilinks y rutas relativas a otros archivos abiertos) se interceptan y
 * navegan mediante `onNavigate` en lugar de recargar la página. El HTML
 * embebido NO se renderiza (evita XSS al abrir archivos de terceros).
 */
export default function MarkdownViewer({ content, onNavigate }) {
  const [mode, setMode] = useState('preview')

  const components = {
    a({ node, href = '', children, ...props }) {
      if (isExternal(href)) {
        return (
          <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
            {children}
          </a>
        )
      }
      const className = href.startsWith('wiki:') ? 'wikilink' : undefined
      return (
        <a
          href={href}
          className={className}
          onClick={(e) => {
            e.preventDefault()
            onNavigate?.(href)
          }}
          {...props}
        >
          {children}
        </a>
      )
    },
  }

  const rendered = (
    <article className="markdown-body">
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </article>
  )

  const source = <pre className="source-view">{content}</pre>

  return (
    <div className="viewer">
      <div className="viewer-toolbar">
        {MODES.map((m) => (
          <button
            key={m.id}
            className={mode === m.id ? 'mode-btn active' : 'mode-btn'}
            onClick={() => setMode(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className={`viewer-content mode-${mode}`}>
        {mode === 'preview' && rendered}
        {mode === 'source' && source}
        {mode === 'split' && (
          <>
            <div className="pane">{source}</div>
            <div className="pane">{rendered}</div>
          </>
        )}
      </div>
    </div>
  )
}
