import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { Minus, Plus } from 'lucide-react'
import remarkWikiLink from '../markdown/remarkWikiLink.js'
import { Button } from '../components/ui/button.jsx'
import { cn } from '../lib/utils.js'

const MODES = [
  { id: 'preview', label: 'Vista previa' },
  { id: 'split', label: 'Dividido' },
  { id: 'source', label: 'Fuente' },
]

const remarkPlugins = [remarkGfm, remarkWikiLink]
const rehypePlugins = [rehypeHighlight]

const PROSE_CLASS =
  'prose prose-invert max-w-3xl px-10 py-8 prose-pre:bg-card prose-pre:border prose-headings:scroll-mt-4'

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
export default function MarkdownViewer({
  content,
  onNavigate,
  fontSize = 16,
  onFontDecrease,
  onFontIncrease,
  onFontReset,
  fontMin = 12,
  fontMax = 32,
}) {
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
    <article className={cn(PROSE_CLASS, 'mx-auto w-full')} style={{ fontSize }}>
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </article>
  )

  const source = (
    <pre
      className="m-0 whitespace-pre-wrap break-words p-6 font-mono leading-relaxed"
      style={{ fontSize }}
    >
      {content}
    </pre>
  )

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b bg-card px-3 py-2">
        <div className="inline-flex items-center gap-1 rounded-lg bg-muted p-1">
          {MODES.map((m) => (
            <button
              key={m.id}
              className={cn(
                'rounded-md px-3 py-1 text-sm transition-colors',
                mode === m.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              onClick={() => setMode(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={onFontDecrease}
            disabled={fontSize <= fontMin}
            title="Reducir tamaño de letra"
          >
            <Minus />
          </Button>
          <button
            className="min-w-[3.25rem] rounded-md px-1 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            onClick={onFontReset}
            title="Restablecer tamaño"
          >
            {fontSize}px
          </button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={onFontIncrease}
            disabled={fontSize >= fontMax}
            title="Aumentar tamaño de letra"
          >
            <Plus />
          </Button>
        </div>
      </div>

      {mode === 'split' ? (
        <div className="grid min-h-0 flex-1 grid-cols-2">
          <div className="min-w-0 overflow-auto border-r">{source}</div>
          <div className="min-w-0 overflow-auto">{rendered}</div>
        </div>
      ) : (
        <div className="min-w-0 flex-1 overflow-auto">{mode === 'preview' ? rendered : source}</div>
      )}
    </div>
  )
}
