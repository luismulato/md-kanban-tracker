# md-kanban-tracker

## Backlog

### Versión web del board (para verlo desde el celular sin VSCode)

- tags: [epic]

### Linkear el feature creado en bdd dentro de la doc de la tarjeta como un link navegable (relativo)

    ```md
    El link se debe poder ver dentro de las tarjetas.
    Y dentro del as columnas.
    ```

## To Do

## WIP

## Done

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

