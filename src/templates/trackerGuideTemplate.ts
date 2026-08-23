export const KANBAN_GUIDE_ES_TEMPLATE = `# Guía rápida — md-kanban-tracker

Esta carpeta (\`md-kanban-tracker/\`) la creó la extensión sola la primera
vez que abriste el \`.kanban.md\` de al lado. Acá vive el registro de
tiempos y estos archivos de guía — no hace falta tocarlos a mano.

## Columnas del tablero

**Backlog**, **To Do**, **WIP**, **Done**, **Done Done**. La extensión
aplica sola, en cada movimiento:

1. **Un solo WIP a la vez.** Si arrastrás una segunda tarjeta a WIP, la
   que ya estaba vuelve sola al tope de To Do.
2. **Archivado diario Done → Done Done.** La primera vez en el día que
   algo entra a WIP, todo lo que había en Done se archiva solo en
   Done Done, dejando Done vacía.
3. **Timer sincronizado con WIP.** Mover una tarjeta a WIP arranca su
   timer solo. Sacarla lo para y anexa la línea al \`.timelog.md\` de
   esta carpeta. Cambiar el foco (una sale, otra entra) para la vieja y
   arranca la nueva en un solo movimiento.

Todo esto pasa en el momento, sin watchers externos ni que corras
ningún comando — es parte de la extensión.

## El archivo de tiempos

\`<nombre-del-board>.timelog.md\`, en esta misma carpeta. Cada línea:

\`\`\`
YYYY-MM-DD HH:MM–HH:MM (Nm) — "Tarea" (motivo)
\`\`\`

## Editar el título de una tarjeta

Click en la tarjeta para abrir el detalle, después click en el título:
se vuelve editable. \`Enter\` guarda, \`Esc\` descarta el cambio y vuelve
al valor original.

## Due date

El campo de fecha límite abre el calendario nativo — click en
cualquier parte de la fila, no hace falta acertarle al ícono chico.
`;
