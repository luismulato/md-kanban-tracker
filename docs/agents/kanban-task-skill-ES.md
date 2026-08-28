# Skill de Claude Code: `agregar-tarea-kanban`

El formato de board de este proyecto (`mng/*.kanban.md`, ver
[Task Format Reference](../../README.md#-task-format-reference) en el
README principal) es Markdown plano, lo que permite que una
herramienta externa edite un board sin pasar por la UI de la
extensión. `agregar-tarea-kanban` es justamente eso: una skill de
[Claude Code](https://claude.com/claude-code), externa a este
repositorio, que agrega una tarjeta nueva a cualquier board
`*.kanban.md` del disco a partir de un pedido en lenguaje natural (ej.
*"add to:mi-proyecto task: arreglar el bug de login"*).

No forma parte del código de esta extensión ni del `.vsix` publicado —
corre por completo en la máquina de quien la tenga instalada, y solo
toca archivos, igual que si una persona editara el board a mano. Se
documenta acá porque depende directamente del contrato de formato de
este proyecto (headers de sección, sintaxis del header de tarea), así
que un cambio en ese contrato es algo que esta skill también necesita
seguir.

## Implementación de referencia

Una copia genérica y funcional de esta skill (definición + script) vive
en este repo, en
[`docs/agents/examples/agregar-tarea-kanban/`](examples/agregar-tarea-kanban/):

| Qué | Ruta (relativa a esa carpeta) |
|---|---|
| Definición de la skill | `SKILL.md` |
| Script que hace el trabajo | `scripts/kanban-task.sh` |

Claude Code carga las skills desde un directorio de skills por usuario
(ver la [documentación de Claude
Code](https://docs.claude.com/en/docs/claude-code/overview) para dónde
vive eso y cómo se instalan las skills); la copia de este repo es una
referencia portable, no está atada a ninguna instalación en particular.

La skill en sí es una capa fina: interpreta el pedido del usuario,
llama al script de abajo, e interpreta su salida JSON. Toda la lógica
de búsqueda y edición en el filesystem vive en el script, no en el
prompt del LLM.

## Cómo funciona

### 1. `kanban-task.sh find <query>`

Busca en un directorio raíz configurable (`$KANBAN_BOARDS_ROOT`, o el
directorio actual si no está seteado — ver el comentario al inicio del
script) archivos `mng/*.kanban.md`, y matchea el nombre de la carpeta
del proyecto contra `<query>`.

| Parámetro | Tipo | Descripción |
|---|---|---|
| `query` | string (posicional, obligatorio) | Nombre aproximado del proyecto — puede tener un typo o estar incompleto. |

El match ocurre en tres niveles, y solo se devuelve el mejor nivel que
tenga resultados:

1. **`exact`** — el nombre de la carpeta del proyecto es igual a
   `query` (sin distinguir mayúsculas/minúsculas).
2. **`partial`** — uno es substring del otro.
3. **`fuzzy`** — match por superposición de tokens (tolera typos y
   palabras faltantes), solo se usa si ninguno de los anteriores
   encontró nada.

Salida (stdout, array JSON):

```json
[
  {
    "project": "md-kanban-tracker",
    "root": "/path/to/md-kanban-tracker",
    "board": "/path/to/md-kanban-tracker/mng/md-kanban.kanban.md",
    "match": "exact"
  }
]
```

Un resultado vacío (`[]`) significa que ningún board matcheó.

### 2. `kanban-task.sh add-card <board> <section> <title>`

Agrega una tarjeta nueva (`### <title>`) al final de `<section>` en
`<board>`, justo antes del siguiente header `## ` (o al final del
archivo si `<section>` es la última).

| Parámetro | Tipo | Descripción |
|---|---|---|
| `board` | path (posicional, obligatorio) | Ruta al archivo `.kanban.md` a editar — normalmente el campo `board` de un resultado de `find`. |
| `section` | string (posicional, obligatorio) | Columna destino. Matchea sin distinguir mayúsculas/minúsculas contra los headers `## ` que ya existen en el board (`Backlog`, `To Do`, `WIP`, `Done`, `Done Done`, o cualquier columna custom que defina ese board en particular). |
| `title` | string (posicional, obligatorio) | Título de la tarjeta — se convierte en la línea `### <title>`. La tarjeta se agrega sin atributos (sin `tags`/`priority`/otros). |

Si `section` no matchea ningún header existente, el script **no** lo
crea — falla (exit 1) y lista los nombres reales de las secciones por
stderr, para que quien lo llama reintente con el valor correcto.

Salida (stdout, objeto JSON) si tiene éxito:

```json
{
  "board": "/path/to/md-kanban-tracker/mng/md-kanban.kanban.md",
  "section": "Backlog",
  "title": "Arreglar el bug de login"
}
```

## Comportamiento a nivel skill (no está en el script)

La skill envuelve las dos llamadas al script con una sola regla: solo
escribe en un board una vez que el proyecto destino no es ambiguo.

- **Un único match `exact`** → sigue directo a `add-card`, sin pedir
  confirmación.
- **Cualquier otro caso** (cero matches, más de uno, o el único
  encontrado no es `exact`) → le muestra al usuario los candidatos y
  pide confirmación antes de escribir nada.

## Fuera de alcance

- No crea un board nuevo — solo edita un `*.kanban.md` que ya existe.
- No crea una columna/sección nueva — el board define su propio set;
  un nombre de sección desconocido se reporta como error, no se crea
  sola.
- No setea `tags`, `priority`, `workload`, `due`, ni ningún otro
  [atributo de tarea](../../README.md#attribute-values) — la tarjeta
  se agrega solo con título. Los atributos hay que agregarlos después,
  vía la UI de la extensión (o a mano).
