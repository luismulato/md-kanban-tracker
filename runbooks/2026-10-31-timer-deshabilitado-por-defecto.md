# Timer de WIP deshabilitado por defecto (setting `md-kanban-tracker.timer.enabled`)

Fecha: 2026-10-31

## Problema
El timer sincronizado con WIP escribe en el `.timelog.md` y en el estado del
companion cada vez que una tarjeta entra o sale de WIP. Cuando un agente
actualiza el `.kanban.md` y Luis lo toca a la vez, esas escrituras
simultáneas generaban conflictos.

## Cambio
- Nuevo setting `md-kanban-tracker.timer.enabled` (boolean, **default `false`**).
- Apagado: `applyBoardAutomation` no inicia ni detiene timers ni escribe el
  timelog (`src/automation/boardAutomation.ts`, parámetro `timerEnabled`).
- Apagado: las acciones manuales pausar/reanudar/reset se ignoran
  (`src/kanbanWebviewPanel.ts`).
- Apagado: el webview no muestra el timer de las tarjetas ni los botones
  "Pause all / Resume all" (`timersEnabled` viaja en cada `updateBoard`).
- Sigue activo: single-WIP por owner y archivado diario de Done.

## Cómo reactivarlo
Settings de VS Code → `md-kanban-tracker.timer.enabled` = true. Los
cambios de board posteriores ya lo aplican; para ver los timers en la
vista abierta, recargar el panel.

## Verificación
`npx vitest run` → 302 tests en verde, incluido uno nuevo que prueba que
con el default no se crea timelog ni timer. `tsc --noEmit` sin errores.

## Relacionado
- [Spike tiempo efectivo con ActivityWatch](2026-10-30-spike-tiempo-efectivo-activitywatch-vscode.md): reemplazo previsto del timelog de la extensión.
