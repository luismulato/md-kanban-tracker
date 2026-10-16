# md-kanban-tracker

## Backlog

### no encuentro la opción "move on top"  o como la hallaz llamado, verifica que no sea un bug

- type: story
    ```md
    Si es un bug, registralo aquí, y realiza el ciclo tdd, atdd, y deja lista la versión para desplegar.
    
    --- Investigación 2026-09-03 (md-kanban-run) ---
    La opción existe: "Move to top" en el menú contextual de la tarjeta
    (click derecho) — TaskContextMenu.tsx, cableado en SortableTask.tsx
    (handleContextMenu -> setContextMenuPos). moveTaskToTop está en el
    store y tiene tests.
    
    NO se pudo reproducir "el click derecho no hace nada" en el harness:
    fireEvent.contextMenu abre el menú tanto con dnd-kit mockeado como
    real, con secuencia completa de punteros, y tras un press previo.
    253 tests en verde, incluidos los del menú (SortableTask.test.tsx).
    
    --- Causa raíz encontrada (pista del usuario: click derecho sobre la
    columna sí da menú nativo, sobre la tarjeta no) ---
    El menú SÍ abría, pero se desmontaba al instante. El parser le
    asignaba un id random (Math.random) a cada columna y tarjeta en cada
    parseo. La extensión reparsea y reenvía el board ante cualquier
    disparador no relacionado (archivo tocado en disco, foco del editor,
    timer de WIP); como el fingerprint cambiaba siempre, el webview
    reemplazaba el board entero y React remontaba todas las tarjetas —
    matando el menú contextual abierto (y el hover / edición en curso).
    
    Fix: ids deterministas en el parser (hash de título de
    columna/tarjeta + nº de ocurrencia). Un reparseo sin cambios ahora
    matchea el fingerprint y syncFromBackend corta antes. Tarjetas con
    el mismo título siguen recibiendo ids distintos.
    
    Ciclo ATDD+TDD: docs/features/context-menu-survives-sync.feature,
    src/webview/__tests__/contextMenuPersistence.test.tsx (2 casos,
    rojos antes / verdes después) + bloque "Deterministic ids" en
    markdownParser.test.ts. 261 tests en verde.
    ```

### Icono "X" de eliminar en hover sobre la tarjeta

- type: story
    ```md
    Al hacer hover sobre una tarjeta debe aparecer un icono "X" para
    eliminarla, junto a los controles de mover (chevron-up / fold-up).
    Hoy borrar está solo en el menú contextual (click derecho ->
    "Delete card").
    
    Criterios de aceptación:
    
    - La X solo se ve en hover, alineada con los otros controles de
    hover de la tarjeta.
    - Pide confirmación antes de borrar, igual que la opción del menú
    contextual.
    - Con varias tarjetas seleccionadas (Cmd/Ctrl+click), respeta el
    borrado múltiple como el menú contextual.
    - El click sobre la X no abre la edición de la tarjeta ni arranca
    un drag.
    ```

### No funciona el click derecho sobre las tarjetas para ver las opciones "ejemplo: mover tarjeta arriba de todo"

- type: spike
    ```md
    El click derecho no hace nada.
    
    Mismo bug que "no encuentro la opción move on top" — el menú abría
    pero se desmontaba al instante porque el parser regeneraba ids
    random en cada parseo y la extensión reenvía el board seguido,
    forzando un remount de todas las tarjetas. Arreglado con ids
    deterministas en el parser (ver esa tarjeta para el detalle).
    ```

### Al dar enter al agregar una suptask debe aceptarla y crear un nuevo subtask para estar listo para escribir.


### Rotar tipos de tarjetas en kanban

    ```md
    En la vista kanban, al dar click en type empieza a circular la lista de tipos, cuando llega al último y le doy click debería volver a salir el primero y seguir así infinito. Hoy llega al último y para.
    ```

### Cambiar columna a la que pertenece una tarjeta dentro de la edición de la misma

    ```md
    Poder editar a que columna pertenece una nota dentro de la ventana de edición de nota (puede ser al lado de Type, Priority, Workload)
    ```

### Dejar configurable el color de los tipos de tarjeta

    ```md
    crear una boton de tuerca (tipo config) que despliega menu de configuaracion.
    Ahí despliega opción de personalizar colores de tipo de tarjeta (Epic,Story, Task, Spike, Bug:
    Agrega por defecto colores distintos para cada tipo.
    Ubica el botón donde sea más adecuado para este tipo de plugin.
    ```

### En editar tarjeta Definir tiempo estimado, ejecutado, restante

    ```md
    Al editar al nivel de type, priority y workload, 
    Estimado, ejecutado, restante.
    Restricciones:
    - toda la interfaz en ingles.
    ```

### Eliminar tarjeta

    ```md
    En vista kanban, click derecho y opcion de menu eliminar.
    O al hacer rollover sobre la tarjeta activa boton X para eliminar
    ```

### Agregar propiedad URL a las tarjetas y mostrar icono clickeable en la vista principal para abrirla


### Agregar drag handler en substasks al editar una tarjeta

- type: story

### Versión web del board (para verlo desde el celular sin VSCode)

- tags: [epic]

### Linkear el feature creado en bdd dentro de la doc de la tarjeta como un link navegable (relativo)

    ```md
    El link se debe poder ver dentro de las tarjetas.
    Y dentro del as columnas.
    ```

### Botón "+" para agregar tarjeta en cada columna, y borde sutil de columna para destacarla

    ```md
    Referencia visual: ![ref](assets/ref-columna-borde-boton-plus.png)
    
    Dos cambios sobre las columnas del board, inspirados en la imagen:
    
    - Botón "+" junto al título de la columna (o al pie, tipo
    "+ New page" de Notion) para agregar una tarjeta a esa columna
    sin editar el markdown a mano.
    - Borde sutil alrededor de la columna para destacarla —
    redondeado, de bajo contraste, como el de la referencia.
    ```

### Links html/file en la descripción de una tarjeta deben abrirse con Cmd+Click

- tags: [story]
    ```md
    Al desplegar una historia, si su descripción tiene links `http(s)://`
    o `file://` (o rutas relativas navegables), deben renderizarse como
    enlaces y abrirse con Cmd+Click (macOS) / Ctrl+Click, igual que en
    un archivo Markdown de VSCode. Hoy salen como texto plano.
    ```

## To Do

## WIP

## Verify

### Iconos de subir / subir al tope al hacer hover sobre una tarjeta

- type: story
- owner: Claude
    ```md
    Como usuario del board, quiero mover una tarjeta hacia arriba dentro
    de su columna directamente desde la tarjeta, para reordenar
    prioridades sin abrir el menú contextual ni arrastrar.
    
    Al hacer rollover (hover) sobre una tarjeta aparecen dos iconos de
    acción:
    
    - Flecha hacia arriba (↑): sube la tarjeta una posición en su
    columna.
    - Flecha hacia arriba con línea (⤒): manda la tarjeta al tope de su
    columna (equivalente a "Move to top" del menú contextual).
    
    Criterios de aceptación:
    
    - Los iconos solo se ven en hover, alineados con los otros controles
    de hover de la tarjeta (ej. la X de eliminar).
    - Si la tarjeta ya es la primera de su columna, los iconos se
    deshabilitan (o no se muestran).
    - El click sobre un icono no abre la edición de la tarjeta.
    - El orden queda persistido en el Markdown del board.
    
    Hecho: al hacer hover sobre una tarjeta aparecen dos iconos arriba a
    la derecha, junto al timer — chevron-up (sube una posición) y
    fold-up (manda al tope). Deshabilitados si la tarjeta ya es la
    primera; el click no abre el modal ni arranca un drag, y el orden se
    persiste vía el mismo mensaje moveTask que usa el drag & drop.
    
    Nueva acción moveTaskUp en kanbanStore + selector
    useIsFirstTaskInColumn, componente CardMoveControls.tsx, hover state
    en TaskCard. Ciclo ATDD+TDD:
    docs/features/card-hover-move-controls.feature +
    src/webview/__tests__/cardHoverMoveControls.test.tsx (8 casos).
    
    Fuera de alcance: no se agregaron iconos de bajar / mandar al fondo,
    ni la X de eliminar en hover (borrar sigue en el menú contextual).
    ```

### Agregar autor o propietario a las tarjetas.

- type: story
- owner: Claude
- priority: high
- workload: Normal
    ```md
    Como persona (o agente de IA) que trabaja el board, quiero ver y
    editar quién es el autor/propietario de cada tarjeta, y que quede
    registrado en el log de tiempo, para saber quién hizo qué.
    
    Contexto: `- owner:` ya existe en el markdown (default "Luis", agrupa
    el WIP por dueño) pero no tiene UI ni aparece en el timelog.
    
    Criterios de aceptación:
    
    - La tarjeta muestra el owner como chip cuando está definido; sin
    owner no se muestra nada (se asume "Luis").
    - El modal de edición/creación tiene un campo "Owner"; vaciarlo
    quita la propiedad del markdown.
    - Cada línea nueva del timelog termina con `@<owner>` (owner
    explícito o "Luis" por defecto).
    - Si la tarjeta la crea o ejecuta una IA, la skill pone
    `- owner: <nombre del agente>` (ej. Claude) como autora.
    
    Definition of Done:
    
    - [x] Feature Gherkin en docs/features/card-owner.feature.
    - [x] Tests unitarios en verde (chip, modal, timelog, panel).
    - [x] make check verde (tipos, lint, tests, build).
    - [x] CHANGELOG y README actualizados (owner ya no es markdown-only).
    - [x] Skill md-kanban-run setea owner de IA.
    - [x] Versión nueva empaquetada en releases/ e instalada para probar.
    - [x] Tarjeta en Verify (la aprueba Luis a mano).
    
    Hecho en 0.3.5 (instalada en VSCode; recargar ventana para probar):
    chip @owner en la tarjeta, campo Owner en el modal, timelog con
    @owner. Tests: cardOwner.test.tsx, timelog.test.ts,
    boardAutomation.test.ts. Fuera de alcance: owner automático al crear
    tarjetas desde la UI (queda vacío = Luis).
    ```

### Permitir varias tarjetas en el WIP desde que sean de owners distintos.

- type: story
- owner: Claude
    ```md
    **Historia.** Como persona que trabaja el board junto con agentes de IA,
    quiero que el WIP admita una tarjeta por owner, para que yo y uno o
    más agentes trabajemos en paralelo sin que el board nos baje las
    tarjetas a To Do.
    
    **Pedido original.** Permitir varias tarjetas en el WIP desde que sean
    de owners distintos.
    
    **Criterios de aceptación.**
    - Dado un WIP con una tarjeta de Luis, cuando entra una tarjeta de
    Claude, entonces ambas quedan en WIP.
    - Dado un owner con dos tarjetas en WIP, cuando se reconcilia el
    board, entonces queda una sola (la recién movida) y la otra vuelve
    arriba de To Do.
    - Una tarjeta sin owner cuenta como "Luis".
    - Cada owner con conflicto se resuelve por separado.
    
    Ya estaba resuelta (commit 8f81740, enforceSingleWip por owner): no se
    tocó código. Se documentó con docs/features/wip-per-owner.feature y se
    confirmó con boardRules.test.ts + boardAutomation.test.ts (23 en verde).
    Para verificar a mano: poné dos tarjetas de owners distintos en WIP
    (ej. Luis y Claude) y comprobá que ambas se quedan.
    ```

### Borrar una tarjeta desde la pantalla principal

- type: story
- owner: Claude
    ```md
    **Historia.** Como persona que usa el board, quiero borrar una tarjeta
    directo desde la pantalla principal, para no tener que abrir el menú
    contextual ni editar el markdown.
    
    **Pedido original.** Explora que es más facil. menu con click derecho?
    botón X, otra. Escoje la más rapida de implementar.
    
    **Decisión.** El click derecho -> "Delete card" ya existe. La opción
    más rápida y más visible es una X en hover junto a los controles de
    mover, reusando el borrado existente (confirmación + selección
    múltiple). Es la misma idea que la tarjeta de Backlog "Icono X de
    eliminar en hover" (queda duplicada).
    
    **Criterios de aceptación.**
    - La X solo se ve con el puntero sobre la tarjeta.
    - Al clickearla pide confirmación; si se cancela, no se borra nada.
    - Si se confirma, la tarjeta desaparece del board.
    - Con varias tarjetas seleccionadas, borra todas las seleccionadas.
    - Clickear la X no abre el modal de edición de la tarjeta.
    
    Hecho: X "Delete card" en hover, junto a los controles de mover
    (CardMoveControls -> TaskCard -> SortableTask, reusa handleDelete).
    Feature: docs/features/card-hover-delete.feature. Tests:
    cardHoverDelete.test.tsx (6). 297 tests, tipos, lint y build en verde.
    Fuera de alcance: probado solo en jsdom, no en la extensión instalada.
    Para verificar a mano: pasá el mouse sobre una tarjeta, clic en la X,
    cancelá y luego confirmá; probá también con varias seleccionadas.
    Queda duplicada la tarjeta de Backlog "Icono X de eliminar en hover".
    ```

### Agrega versión en la UI

- type: story
- priority: high
- owner: Claude
    ```md
    **Historia.** Como persona que usa el board, quiero ver la versión del
    plugin en la esquina superior derecha, en letra chica y color discreto,
    para saber qué versión tengo instalada sin abrir el panel de extensiones.

    **Pedido original.** Quiero que la versión del plugin salga visible en
    la UI en la esquina superior derecha con una fuente chica, un color muy
    discreto.

    **Criterios de aceptación.**
    - Dado el board abierto, entonces se ve "v<versión>" en la esquina
    superior derecha, con la versión de package.json.
    - La etiqueta es de letra chica y color discreto (texto atenuado).
    - La etiqueta no tapa ni desplaza el board ni sus controles, y no
    captura clics.
    - Al actualizar la versión del plugin, la etiqueta la refleja sin
    tocar código.

    Hecho: etiqueta "v<versión>" fija arriba a la derecha, letra chica,
    opacidad baja, sin capturar clics. La versión sale de package.json vía
    define de vite (build y vitest). Feature: docs/features/ui-version-label.feature.
    Tests: versionLabel.test.tsx (4). 301 tests, tipos, lint y build en verde.
    Fuera de alcance: no probado en la extensión instalada (solo jsdom).
    Para verificar a mano: instalá la versión nueva y mirá la esquina
    superior derecha del board.
    ```

## Done

## Done Done

### Cuando se llama por primera vez al plugin y el archivo está vacío debe crear un esqueleto vacío y una tarjeta por defecto

    ```md
    Al abrir un `.kanban.md` vacío (o con solo espacios/saltos), la
    extensión ahora escribe el esqueleto estándar — las cinco columnas
    Backlog / To Do / WIP / Done / Done Done más una tarjeta inicial en
    To Do — y guarda el archivo antes de parsear. Un board recién creado
    abre en algo usable en vez de un panel vacío; los archivos que ya
    tienen contenido no se tocan.
    
    Esqueleto y predicado de "vacío" en un módulo puro
    (src/templates/emptyBoardSkeleton.ts) con tests unitarios; el
    guardado va en kanbanWebviewPanel.loadMarkdownFile, marcando
    isSavingFromWebview para que el listener de cambios no lo tome como
    edición externa.
    ```

### Propiedad `origin` en las tarjetas (marca de procedencia)

- tags: [story]
    ```md
    Las tarjetas pueden llevar `- origin: <dominio>/<proyecto>`. Registra
    de dónde se promovió una card, para boards agregadores (un
    planificador semanal que junta cards de varios backlogs en un solo
    board). En el board propio de un proyecto se deja sin setear.
    
    Solo markdown por ahora (sin UI), igual que `owner`. Parseada,
    serializada primera entre las propiedades, round-trip limpio.
    De paso se documentaron en el README las propiedades `type` y
    `owner`, que estaban sin documentar. Pedido por el proyecto Kairos.
    ```

### Cuando edita una tarjeta y da enter debe cerrarla

    ```md
    Alcance: solo el título de la tarjeta (click para editar). Enter
    ahora guarda Y cierra todo el modal, no solo el modo edición del
    título. Descripción (textarea) y los inputs de steps quedan sin
    tocar — Enter ahí sigue con su comportamiento normal (salto de
    línea / nada), forzar el cierre del modal en cada uno hubiera sido
    disruptivo.
    ```

### Agregar timer automático al pasar al WIP, con pausa/restart y reset por tarjeta y por columna

    ```md
    Fusiona la tarjeta original de To Do con la de Backlog que la
    refinaba. Cada tarjeta en WIP tiene su propio timer (visible solo
    mientras está en WIP, se detiene apenas sale). Pausa/reanudar y
    reset a nivel de tarjeta; la columna WIP tiene "Pause all"/"Resume
    all" para todas a la vez.
    
    "Single WIP" ahora es por owner (- owner: <nombre> en el markdown,
    sin owner = Luis por default), no por columna: Luis y uno o más
    agentes de IA pueden tener cada uno su propia tarjeta en WIP al
    mismo tiempo; una segunda tarjeta del mismo owner sigue empujando
    la anterior de ese owner a To Do.
    
    No se agregó UI para asignar el owner de una tarjeta (se setea a
    mano en el markdown) — quedó fuera de alcance de esta historia.
    ```

### Multi-select cards with Cmd+Click and delete them via right-click

    ```md
    Same selection mechanic as the previous card (Cmd+Click to select,
    plain click still opens a card). With one or more cards selected,
    right-click shows a "Delete cards" option that removes all of them
    at once, with the same confirmation prompt as deleting a single card.
    ```

### Multi-select cards with Cmd+Click and move them to another column

    ```md
    A plain click keeps opening the card (current behavior). Cmd+Click
    instead toggles selection mode, selecting/deselecting the card
    without opening it. With two or more cards selected, dragging any
    one of them moves the whole selection to the target column.
    ```

### Borrar una tarjeta desde la vista de kanban


### Editar tipo de tarjeta dentro de la card.


### Cambiar tipo de tarjeta con un click, rotativo (epic,story,task, spike)


### Agregar type a las tarjetas: epic, story, task, spike

- tags: [story]

### En una tarjeta, al hacer click derecho, Agregar opción "move on top" (nombrala mejor con algun estandar) para que una card quede de primera en su columna.

- tags: [story]

### Botón (+) "add new card" por columna al hacer hover + contador de tarjetas junto al nombre de la columna (estilo Notion)

    ```md
    El contador de tarjetas junto al título de columna ya existía; el
    botón "+ Add card" también, pero estaba siempre visible (sutil) al
    pie. Ahora es estilo Notion: aparece solo mientras el puntero está
    sobre la columna. El área vacía de la columna sigue abriendo el
    mismo editor, así que el botón no es la única vía.
    
    Cambio en Column.tsx (render condicional por isHovered) + testids
    column-<id> y column-count-<id>. Ciclo ATDD+TDD:
    docs/features/hover-add-card-button.feature +
    src/webview/__tests__/Column.test.tsx (4 casos nuevos).
    ```

### Agregar tipo bug

    ```md
    En la vista del kanban que se pueda agregar un nuevo tipo: bug
    
    Se agregó `bug` como quinto tipo de tarjeta (epic/story/task/spike/bug).
    Se setea con `- type: bug` en el markdown o clickeando el badge: el
    ciclo ahora es epic -> story -> task -> spike -> bug -> (sin tipo),
    en la tarjeta y en el modal. Badge rojo ("Bug").
    
    Ciclo ATDD+TDD: docs/features/bug-task-type.feature +
    src/webview/__tests__/bugTaskType.test.tsx (5 casos). Implementación
    en markdownParser.ts, webview/types/kanban.ts, webview/utils/taskType.ts
    y TaskModal.tsx. Fuera de alcance: color de tipo configurable (tarjeta
    aparte en To Do).
    ```

