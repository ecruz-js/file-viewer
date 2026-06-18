# File Viewer — Archivo de ejemplo

Bienvenido al **File Viewer**. Arrastra este archivo (o cualquier `.md`) a la
ventana para verlo renderizado.

## Características del MVP

- Renderizado de **Markdown** con [GitHub Flavored Markdown](https://github.github.com/gfm/)
- Resaltado de sintaxis en bloques de código
- Modos de vista: previa, dividido y fuente
- Arrastrar y soltar archivos

## Lista de tareas

- [x] Renderizar Markdown
- [x] Soporte para tablas y código
- [ ] Soporte para JSON
- [ ] Soporte para CSV
- [ ] Soporte para imágenes

## Tabla de ejemplo

| Formato   | Estado        |
| --------- | ------------- |
| Markdown  | ✅ Soportado   |
| JSON      | 🔜 Planeado    |
| CSV       | 🔜 Planeado    |

## Bloque de código

```js
function saludar(nombre) {
  return `¡Hola, ${nombre}!`
}

console.log(saludar('mundo'))
```

> Cita: el objetivo a largo plazo es un visor genérico de archivos.
