# md-kanban-tracker

## Backlog

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

### No funciona el click derecho sobre las tarjetas para ver las opciones "ejemplo: mover tarjeta arriba de todo"

    ```md
    El click derecho no hace nada.
    ```

### Al dar enter al agregar una suptask debe aceptarla y crear un nuevo subtask para estar listo para escribir.


## WIP

### no encuentro la opción "move on top"  o como la hallaz llamado, verifica que no sea un bug

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

    => Apunta a un problema propio del webview de VSCode en runtime (no
    reproducible desde jsdom) o a que se hace click derecho sobre el
    hueco entre tarjetas, no sobre la tarjeta. Falta repro en vivo:
    abrir "Developer: Open Webview Developer Tools", click derecho sobre
    una tarjeta y ver si el evento contextmenu dispara y si el <div
    role="menu"> aparece en el DOM (para separar CSS/stacking de evento).
    Bloqueada hasta tener esa info.
    ```

## Done

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

