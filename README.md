# 🗂️ File Viewer

Visualizador de archivos en el navegador. **MVP:** renderizado de Markdown (`.md`).

La visión a largo plazo es un visor genérico capaz de mostrar múltiples tipos de
archivo (JSON, CSV, imágenes, etc.) mediante un registro de visores extensible.

## ✨ Características (MVP)

- Renderizado de **Markdown** con GitHub Flavored Markdown (tablas, listas de tareas, tachado)
- Resaltado de sintaxis en bloques de código
- Tres modos de vista: **previa**, **dividido** y **fuente**
- Abrir archivos por **arrastrar y soltar** o por diálogo
- 100 % en el cliente: los archivos no se suben a ningún servidor

## 🚀 Desarrollo

Requisitos: [Bun](https://bun.sh) 1.0+.

```bash
bun install
bun run dev      # servidor de desarrollo en http://localhost:5173
bun run build    # build de producción en dist/
bun run preview  # sirve el build de producción localmente
```

Abre la app y arrastra el archivo [`sample.md`](./sample.md) para probarla.

## 🧩 Arquitectura

Los tipos de archivo se gestionan con un **registro de visores** en
[`src/viewers/registry.js`](src/viewers/registry.js). Cada visor declara las
extensiones que soporta y el componente React que renderiza el contenido.

Para añadir un nuevo tipo de archivo:

1. Crea un componente en `src/viewers/`, p. ej. `JsonViewer.jsx`, que reciba la
   prop `content` (texto del archivo).
2. Regístralo en `registry.js` con sus extensiones.

El resto de la aplicación (selección de archivos, `accept` del input, enrutado al
visor) lo detecta automáticamente.

```
src/
├── App.jsx                 # estado global, carga de archivos
├── components/
│   └── DropZone.jsx        # selección / drag & drop
└── viewers/
    ├── registry.js         # registro de tipos de archivo
    └── MarkdownViewer.jsx  # visor de Markdown (MVP)
```

## 🗺️ Roadmap

- [ ] Visor de JSON (con árbol plegable)
- [ ] Visor de CSV (tabla)
- [ ] Visor de imágenes
- [ ] Tema claro / oscuro
- [ ] Abrir archivos desde una URL

## 📄 Licencia

MIT
