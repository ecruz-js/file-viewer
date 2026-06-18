import { visit } from 'unist-util-visit'

const WIKI_RE = /\[\[([^\]]+?)\]\]/g

/**
 * Plugin de remark que convierte la sintaxis de wikilinks en enlaces internos.
 *
 *   [[Archivo]]          -> enlace con texto "Archivo"
 *   [[Archivo|alias]]    -> enlace con texto "alias"
 *
 * El enlace generado usa el esquema `wiki:` en la URL para que el visor lo
 * pueda distinguir de un enlace normal e interceptar el clic. Como solo recorre
 * nodos de tipo `text`, ignora automáticamente el contenido dentro de bloques
 * de código e inline code.
 */
export default function remarkWikiLink() {
  return (tree) => {
    visit(tree, 'text', (node, index, parent) => {
      if (!parent || index === null || !node.value.includes('[[')) return

      const value = node.value
      const nodes = []
      let last = 0
      let match
      WIKI_RE.lastIndex = 0

      while ((match = WIKI_RE.exec(value))) {
        if (match.index > last) {
          nodes.push({ type: 'text', value: value.slice(last, match.index) })
        }
        const [target, alias] = match[1].split('|').map((s) => s.trim())
        nodes.push({
          type: 'link',
          url: `wiki:${target}`,
          data: { hProperties: { className: 'wikilink' } },
          children: [{ type: 'text', value: alias || target }],
        })
        last = match.index + match[0].length
      }

      if (last < value.length) {
        nodes.push({ type: 'text', value: value.slice(last) })
      }

      if (nodes.length) {
        parent.children.splice(index, 1, ...nodes)
        return index + nodes.length
      }
    })
  }
}
