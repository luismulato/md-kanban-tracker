export const TRACKER_README_TEMPLATE = `# md-kanban-tracker

Tablero kanban en un archivo \`.kanban.md\`, editado con la extensión de
VSCode **md-kanban-tracker**. Esta carpeta la crea la extensión sola la
primera vez que abrís el \`.kanban.md\` de al lado — guarda acá el
registro de tiempos y la guía de uso.

## Qué hace la extensión sola

- **Un solo WIP a la vez** — mover una tarjeta nueva a WIP devuelve la
  anterior al tope de To Do.
- **Archivado diario** — lo que queda en Done se archiva en Done Done
  la primera vez que algo entra a WIP cada día.
- **Timer sincronizado con WIP** — arranca y para solo según qué
  tarjeta ocupa WIP, sin comandos manuales.
- **Título editable** — click en la tarjeta, click en el título, \`Enter\`
  guarda, \`Esc\` descarta.
- **Due date con calendario** — click en cualquier parte de la fila de
  fecha para abrir el selector nativo.

Ver \`kanban-guia-ES.md\` en esta misma carpeta para el detalle de cada
punto.

## Sobre este proyecto

md-kanban-tracker es un fork de [kanban.md](https://github.com/wguilherme/kanban.md),
de Withney Guilherme, licenciado MIT. Conserva esa licencia — ver
\`LICENSE.txt\` en el repo del proyecto.
`;
