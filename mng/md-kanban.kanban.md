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

### Botón (+) "add new card" por columna al hacer hover + contador de tarjetas junto al nombre de la columna (estilo Notion)

## To Do

## WIP

## Done

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

## Done Done

