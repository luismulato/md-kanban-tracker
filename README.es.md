# md-kanban-tracker

<div align="center">

![Kanban.md Logo](./imgs/logo.png)

**Un tablero Kanban en Markdown con seguimiento de WIP integrado — sin scripts externos, sin watchers**

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/luismulato/md-kanban-tracker)
[![VSCode](https://img.shields.io/badge/VSCode-1.74.0+-green.svg)](https://code.visualstudio.com/)
[![License](https://img.shields.io/badge/license-MIT-orange.svg)](LICENSE)

[Features](#-funcionalidades) • [Instalación](#-instalación) • [Uso](#-uso) • [Contribuir](#-contribuir) • [Changelog](CHANGELOG.md) • [English](README.md)

</div>

---

## 🍴 Sobre este fork

**md-kanban-tracker** es un fork de [kanban.md](https://github.com/wguilherme/kanban.md), de Withney Guilherme, licenciado MIT (se conserva tal cual — ver [`LICENSE.txt`](LICENSE.txt)). Agrega automatización a nivel de tablero (una sola tarea activa en WIP, archivado diario de Done, un timer sincronizado con WIP) directo en el backend de la extensión, más edición de título en línea y un selector de fecha límite más descubrible. No está afiliado ni respaldado por el proyecto original; todo el crédito por la arquitectura y el diseño original es de su autor.

## 📖 Descripción general

**md-kanban-tracker** es una extensión de VSCode que trae el poder de los tableros Kanban directo a tu flujo de trabajo en Markdown, con seguimiento automático de WIP y tiempo integrado. Gestioná tareas, seguí el progreso y organizá proyectos usando archivos Markdown planos con una interfaz de drag-and-drop interactiva — sin scripts externos ni watchers de archivos para mantener los límites de WIP y los registros de tiempo al día.

Construido con tecnologías modernas (React 19, TypeScript 5.9, Vite 7) y diseñado para respetar tu tema de VSCode, md-kanban-tracker se integra sin fricción con tu entorno de desarrollo.

![Kanban Board Demo](./imgs/image.png)

---

## ✨ Funcionalidades

### ⏱️ Automatización del tablero (nuevo en este fork)

- **Una sola tarea en WIP**: arrastrar una segunda tarea a la columna `WIP` devuelve automáticamente la anterior al tope de `To Do` — nunca más de una cosa "en curso" a la vez.
- **Archivado diario de Done**: la primera vez que una tarea entra a `WIP` en el día, todo lo que hay en `Done` se mueve al final de `Done Done`, así `Done` solo muestra lo terminado hoy.
- **Timer sincronizado con WIP**: mover una tarea a WIP arranca su timer solo; sacarla lo para y anexa una línea a un archivo `.timelog.md` propio de ese tablero. Cambiar el foco (una sale de WIP, otra entra) para la vieja y arranca la nueva en un solo paso. Un timer iniciado a mano para algo que no está en WIP nunca se ve afectado por esto.
- **Carpeta compañera**: la primera vez que abrís un `.kanban.md`, aparece una carpeta `md-kanban-tracker/` al lado con el registro de tiempos, una guía de uso y un readme corto — todo generado solo, sin configurar nada.

### 🎯 Funcionalidad principal

- **📋 Enfoque Markdown-first**: tus datos viven en archivos `.kanban.md` — sin bases de datos, sin formatos propietarios
- **🔄 Sincronización bidireccional en tiempo real**: los cambios en la vista Kanban actualizan el Markdown al instante y viceversa
- **🎨 UI que respeta el tema**: se adapta solo a tu tema de VSCode (Dracula, One Dark Pro, etc.)
- **⚡ Drag & Drop fluido**: construido con [@dnd-kit](https://dndkit.com/) para interacciones fluidas y responsivas
- **🗂️ Integración en la barra lateral**: ícono propio en la Activity Bar con un TreeView de todos los tableros del workspace

### 📝 Gestión rica de tareas

- **Niveles de prioridad**: tres niveles mostrados como borde izquierdo de color (estilo Trello)
  - Alta: borde rojo
  - Media: borde amarillo
  - Baja: borde verde
- **Seguimiento de carga de trabajo**: cuatro niveles de intensidad con íconos de diamante
  - Easy (◇), Normal (◈), Hard (◆), Extreme (◆◆)
- **Modal de tarea editable**: click en cualquier tarea abre un modal donde podés:
  - Click en el título para renombrarlo in-place — `Enter` guarda, `Esc` descarta el cambio y restaura el título original
  - Click en las etiquetas para ciclar entre valores de prioridad/carga de trabajo
  - Agregar, quitar y editar sub-tareas en línea
  - Editar la descripción con guardado al perder el foco
  - Poner fecha límite — click en cualquier parte de la fila abre el calendario nativo, no solo el ícono chico
  - Indicador de cambios sin guardar (●) en el header
- **Tareas paso a paso**: sub-tareas con checkbox usando el formato `- [ ] paso`
- **Sistema de tags**: soporta varios formatos:
  - En línea: `#tag1 #tag2`
  - Array: `[tag1, tag2, tag3]`
- **Fechas límite**: seguimiento con `due:YYYY-MM-DD`
- **Descripciones de tarea**: multilínea, con soporte de bloques de código Markdown
- **Expandir/colapsar**: las tareas arrancan colapsadas para una vista limpia

### 🔧 Funcionalidades avanzadas

- **Soporte de archivado**: mover columnas terminadas a estado archivado
- **Gestión de columnas**: ocultar/mostrar, reordenar por drag & drop
- **Filtro por tag**: filtrar tareas por uno o varios tags (separados por coma)
- **Múltiples opciones de orden**: por nombre, fecha límite, prioridad, carga de trabajo
- **Selector de archivo**: activar/desactivar el cambio automático de archivo
- **Creación rápida de tablero**: creación con un click y plantilla precargada
- **Auto-refresh**: la barra lateral se actualiza sola cuando cambian los `.kanban.md`
- **Formato de tarea configurable**: elegir entre header (`###`) o lista (`-`)

### 🏗️ Detalles técnicos

- **Arquitectura moderna**:
  - React 19 con componentes funcionales y hooks
  - Zustand para estado centralizado
  - TypeScript 5.9 en modo estricto
  - Vite 7 para builds rápidos
  - TailwindCSS 3 para estilos utility-first
- **Drag & Drop sin parpadeo**:
  - Comparación de contenido por fingerprint (patrón NormalizedDocument)
  - Cola de promesas para serializar guardados
  - Actualizaciones optimistas de UI con protección de sincronización del backend
  - Patrón de guardado diferido — los cambios se guardan al cerrar el modal
- **Optimizaciones de rendimiento**:
  - Componentes memoizados (`React.memo`) para evitar renders innecesarios
  - Un solo build de HTML por ciclo de vida del panel
  - Seguimiento de estado por referencia para los manejadores de mensajes
- **Detección de colisiones**: `pointerWithin` como estrategia primaria, con `closestCorners` como respaldo — arregla soltar tarjetas sobre columnas vacías, algo que `closestCorners` solo no siempre detecta
- **Vista previa entre columnas**: feedback visual en tiempo real al arrastrar tareas entre columnas

---

## 🚀 Instalación

Este fork no está publicado en la VSCode Marketplace — se instala desde un `.vsix`.

### Desde un `.vsix` ya construido

```bash
code --install-extension md-kanban-tracker-0.1.0.vsix
```

### Construyendo tu propio `.vsix`

```bash
git clone https://github.com/luismulato/md-kanban-tracker.git
cd md-kanban-tracker
npm install
npx @vscode/vsce package --no-dependencies
code --install-extension md-kanban-tracker-0.1.0.vsix
```

### Requisitos

- **VSCode**: 1.74.0 o superior
- **Node.js**: 22+ (para desarrollo)

---

## 💡 Uso

### Inicio rápido

#### 1️⃣ Crear un tablero Kanban

**Opción A: desde la barra lateral** (recomendado)

1. Click en el ícono de Kanban en la Activity Bar (barra lateral izquierda)
2. Click en el botón **➕ New Kanban Board**
3. Poné un nombre (ej. `sprint-planning`)
4. El tablero se abre solo con tareas de ejemplo

**Opción B: creación manual**

Creá un archivo con extensión `.kanban.md`:

```markdown
# Project Sprint

## To Do

### Design User Interface
#design #ui #frontend
**Priority:** High
**Workload:** Hard
**Due:** 2024-12-01

Design user login and registration pages, including:
- Responsive layout design
- Brand color application
- User experience optimization

- [ ] Create wireframes
- [ ] Design mockups
- [ ] Get stakeholder approval

### Write API Documentation
#documentation #backend
**Priority:** Medium
**Workload:** Normal

Write complete REST API documentation using OpenAPI 3.0 specification.

## In Progress

### Implement Authentication
#security #backend
**Priority:** High
**Workload:** Extreme

- [x] Setup JWT tokens
- [ ] Add OAuth providers
- [ ] Write security tests

## Done

### Project Setup
#setup
**Priority:** Low
**Workload:** Easy

Initial repository setup complete!
```

#### 2️⃣ Abrir la vista Kanban

Cualquiera de estas formas:

- **Método 1**: click en un tablero desde la barra lateral
- **Método 2**: click derecho sobre el `.kanban.md` → **"Kanban"**
- **Método 3**: Paleta de comandos (`Ctrl/Cmd+Shift+P`) → **"md-kanban-tracker: Kanban"**

#### 3️⃣ Gestionar tareas

**Mover tareas**
- Arrastrá cualquier tarjeta a otra columna
- Los cambios se guardan solos en el Markdown

**Filtrar y ordenar**
- Escribí tags en el filtro: `design,urgent`
- Usá el dropdown de orden: nombre, fecha límite, prioridad, carga de trabajo
- Click en "Clear Filters" para resetear

**Operaciones sobre tareas**
- **Expandir**: click en la tarea para ver el detalle completo
- **Editar**: botón "Edit" en la tarjeta
- **Borrar**: botón "Delete"
- **Agregar**: "+ Add Task" al pie de la columna

**Operaciones sobre columnas**
- **Ocultar**: ícono de ojo en el título de la columna
- **Reordenar**: arrastrar el header de la columna
- **Archivar**: marcar columnas como archivadas

---

## 🎨 Referencia de formato de tarea

### Formatos soportados

**Formato estructurado moderno** (recomendado)

```markdown
### Task Title
- tags: [tag1, tag2, tag3]
- priority: high
- workload: Hard
- due: 2024-12-31
- defaultExpanded: true
- steps:
    - [x] Step 1
    - [ ] Step 2
  ```md
  Detailed description with **Markdown** support.
  Can include code blocks, lists, etc.
  ```
```

**Formato clásico en línea** (también soportado)

```markdown
### Task Title
#tag1 #tag2
**Priority:** High
**Workload:** Hard
**Due:** 2024-12-31

Task description here

- [ ] Step 1
- [x] Step 2
```

### Valores de atributos

| Atributo | Valores | Ejemplo |
|-----------|--------|---------|
| `priority` | `high`, `medium`, `low` | `priority: high` |
| `workload` | `Easy`, `Normal`, `Hard`, `Extreme` | `workload: Hard` |
| `due` | `YYYY-MM-DD` | `due: 2024-12-31` |
| `defaultExpanded` | `true`, `false` | `defaultExpanded: true` |
| `tags` | Array o hashtags | `[ui, design]` o `#ui #design` |

---

## ⚙️ Configuración

### Settings

`File > Preferences > Settings` → buscar "md-kanban-tracker"

#### `md-kanban-tracker.taskHeader`

Elige el formato de las tareas en el Markdown:

- **`"title"`** (default): tareas con formato `### Header`
- **`"list"`**: tareas con formato `- List item`

```json
{
  "md-kanban-tracker.taskHeader": "title"
}
```

### Comandos

| Comando | Atajo | Descripción |
|---------|----------|-------------|
| `md-kanban-tracker: Kanban` | - | Abre la vista Kanban del archivo actual |
| `md-kanban-tracker: New Kanban Board` | - | Crea un tablero nuevo |
| `md-kanban-tracker: Refresh` | - | Refresca la lista de tableros de la barra lateral |
| `md-kanban-tracker: Enable/Disable File Switcher` | - | Activa/desactiva el cambio automático de archivo |

---

## 🏗️ Desarrollo

Ver la sección [🏗️ Development](README.md#-development) del README en inglés — comandos y estructura del proyecto son iguales, sin necesidad de duplicarlos acá.

---

## 🐛 Reportar bugs

¿Encontraste un bug? [Abrí un issue](https://github.com/luismulato/md-kanban-tracker/issues/new) con:

- **Versión de VSCode**: `Help > About`
- **Versión de la extensión**: panel de extensiones
- **SO**: Windows/macOS/Linux + versión
- **Pasos para reproducir**
- **Comportamiento esperado vs. real**
- **Capturas/GIFs** si aplica
- **Archivo `.kanban.md` de ejemplo** si es relevante

---

## 📜 Licencia

Este proyecto está licenciado bajo **MIT** — ver [`LICENSE.txt`](LICENSE.txt). Es un fork de [wguilherme/kanban.md](https://github.com/wguilherme/kanban.md), también MIT — la licencia y el aviso de copyright originales se conservan tal cual.

---

## 🙏 Agradecimientos

- Forkeado de [kanban.md](https://github.com/wguilherme/kanban.md), de Withney Guilherme — todo el crédito de la arquitectura, el diseño y la mayor parte del código original es suyo.
- Construido con la [VSCode Extension API](https://code.visualstudio.com/api)
- Drag & drop con [@dnd-kit](https://dndkit.com/)
- Componentes de UI siguiendo [Atomic Design](https://atomicdesign.bradfrost.com/)

---

<div align="center">

[⬆ Volver arriba](#md-kanban-tracker)

</div>
