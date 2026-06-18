import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

const MODES = [
  { id: 'preview', label: 'Vista previa' },
  { id: 'split', label: 'Dividido' },
  { id: 'source', label: 'Fuente' },
]

/**
 * Visor de Markdown.
 *
 * Soporta GitHub Flavored Markdown (tablas, listas de tareas, tachado) y
 * resaltado de sintaxis en bloques de código. El HTML embebido NO se renderiza
 * (react-markdown lo ignora por defecto) para evitar XSS al abrir archivos
 * de terceros.
 */
export default function MarkdownViewer({ content }) {
  const [mode, setMode] = useState('preview')

  const rendered = (
    <article className="markdown-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
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
