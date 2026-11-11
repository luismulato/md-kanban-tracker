# Spike: tiempo efectivo por tarjeta cruzando el kanban con ActivityWatch y VSCode

_Creado: 2026-10-30. Estado: **estrategia propuesta, sin implementar.** Nada de la extensión, de los tableros ni de ActivityWatch se modificó para escribirlo._
_Continúa el §6 («Tracker de tiempo externo») de `projects/opi-openside/docs/runbooks/2026-10-30-md-kanban-tracker-pisa-el-tablero-solucion.md`, que proponía un tracker que solo mira cambios de columna. Este runbook lo mejora con señales de actividad real._

## 1. Contexto

La extensión mide hoy el tiempo con un temporizador atado a la tarjeta en WIP. No funciona, por tres razones:

1. **Estar en WIP no es estar trabajando.** La tarjeta queda en WIP de noche, en fines de semana y mientras Luis hace otra cosa.
2. **El temporizador corta por «cambio de foco», no por actividad**, así que no distingue trabajo de ausencia.
3. **El log resultante es inservible.** Medido en `projects/opi-openside/mng/md-kanban-tracker/opi.timelog.md`: una sola tarjeta registra `9435m` (≈157 h) y otras `7105m`, `5771m` y `5529m`; `2026-10-07 14:05–03:20 (9435m)` es el caso más claro.

Decisión previa de Luis (2026-10-30): el tiempo sale de la extensión y lo calcula un proceso externo que **nunca escribe el tablero** (la vista reescribe el archivo entero; ver el runbook enlazado arriba).

**Objetivo del spike:** estimar el tiempo efectivo invertido en cada historia/tarjeta, cruzando la tarjeta macro del kanban con la actividad real medida en el equipo.

## 2. Qué hay hoy (verificado el 2026-10-30)

| Pieza | Estado |
|---|---|
| ActivityWatch | Instalado y corriendo en `localhost:5600`. Buckets: `aw-watcher-window_peter` y `aw-watcher-afk_peter`, creados el 2026-10-30 20:25 UTC. **Histórico: solo desde esa hora.** |
| Título de ventana de VSCode | Llega con la forma `archivo — carpeta-de-trabajo` (ej. `opi-multi-idioma — opi-openside`). Ya da proyecto, no la ruta completa. |
| Watcher de VSCode / de navegador | **No instalados.** |
| Log de la extensión | `*.timelog.md` por tablero, con formato `YYYY-MM-DD HH:MM–HH:MM (Nm) — "tarjeta" (auto/manual) @owner`. |
| Tracker externo de WIP | Propuesto (§6 del runbook enlazado), **no construido**. |

## 3. Estrategia propuesta

### 3.1 Principio: el tablero dice *a qué*, la actividad dice *cuánto*

El tiempo efectivo de una tarjeta es la **intersección** de dos cosas:

> (intervalos en que la tarjeta estuvo en WIP) ∩ (minutos en que Luis estuvo realmente activo en ese proyecto)

El WIP pasa a ser un **tope superior** y un **selector**, no la medida. La actividad aporta el «cuánto». Esto resuelve el problema de raíz (WIP ≠ trabajando) sin pedir a Luis que haga nada nuevo.

### 3.2 Fuentes de señal

| # | Fuente | Qué aporta | Decisión |
|---|---|---|---|
| S1 | Kanban (cambios de columna, tracker externo del §6) | Tarjeta macro y ventana de WIP, por owner | **Conservar** (ya decidido) |
| S2 | ActivityWatch `afk` | Presencia: teclado/ratón vs ausente | **Conservar** |
| S3 | ActivityWatch `window` | App y título (carpeta de trabajo de VSCode) | **Conservar** |
| S4 | **`aw-watcher-vscode`** (extensión oficial de ActivityWatch) | Archivo, ruta del proyecto, lenguaje y rama git, como heartbeats en el mismo servidor local | **Agregar** (ver §4) |
| S5 | **`aw-watcher-web`** (navegador) | URL/título en Chrome: Botpress Studio, portal WordPress, GitHub. Parte grande del trabajo de OPI ocurre fuera de VSCode | **Agregar**, con lista de dominios |
| S6 | **Transcripts de Claude Code** (`~/.claude/projects/*/*.jsonl`) | Timestamps de cada turno y `cwd`. Mide el trabajo supervisando a un agente, que la señal de teclado subestima | **Agregar** como fuente propia, no inventada: hay que verificar el formato |
| S7 | Commits git (hora, rutas tocadas, mensaje) | Anclas de verdad: «a esta hora se cerró esto» | **Agregar**, solo para validar y desambiguar |
| — | WakaTime | Mide lo mismo que S4 | **No agregar** (§4) |
| — | Temporizador de la extensión | Origen del problema | **Quitar** (D6 del runbook enlazado) |

### 3.3 Algoritmo (cada hora o bajo demanda, solo lectura)

1. **Minutos activos.** Consulta a ActivityWatch (`POST /api/0/query/`), con intervalos `not-afk` ∩ ventanas de apps de trabajo. Esqueleto de la consulta:
   ```
   afk  = flood(query_bucket(find_bucket("aw-watcher-afk_")));
   win  = flood(query_bucket(find_bucket("aw-watcher-window_")));
   act  = filter_keyvals(afk, "status", ["not-afk"]);
   win  = filter_period_intersect(win, act);
   code = filter_keyvals(win, "app", ["Code"]);
   RETURN = merge_events_by_keys(code, ["title"]);
   ```
   Se repite para el navegador (solo dominios de la lista) y la terminal. Huecos menores a N minutos (propuesta: 5) se puentean como «mismo bloque de trabajo».
2. **Proyecto de cada minuto.** Carpeta de trabajo del título de VSCode (o del watcher S4) → raíz de repo → tableros bajo esa raíz. En el navegador, dominio → proyecto por tabla de reglas.
3. **Tarjeta de cada minuto.** Entre las tarjetas de Luis en WIP en ese instante, en los tableros de ese proyecto:
   - **Una sola** → se le asigna.
   - **Varias** (ocurre: `opi.kanban.md` y el tablero de una fase pueden tener cada uno una) → desambiguar por la **ruta del archivo** activo (S4) contra la carpeta del tablero (`phases/phase-X/...`); si no alcanza, marcar `ambigua` y repartir en partes iguales.
   - **Ninguna** → bucket `sin tarjeta`. Esto es una señal útil por sí misma: o falta la tarjeta, o el WIP está viejo.
4. **Trabajo de agentes aparte.** Los turnos de Claude Code (S6) se suman en una columna distinta, `agente (reloj)`, con el prefijo `ia-` del owner. Tiempo humano efectivo y tiempo de agente **no se mezclan**: sirven para ver el ahorro, no para facturar horas de Luis.
5. **Salida.** Un archivo hermano del tablero, `<tablero>.effort.md`, más un `.effort.json` con los intervalos crudos. **Jamás se escribe el `.kanban.md`.** Por tarjeta: tiempo efectivo humano, tiempo en WIP (el tope), % de aprovechamiento, tiempo de agente, y cuántos minutos fueron `ambigua`.
6. **Ejecutado/estimado/restante.** La tarjeta del backlog «Definir tiempo estimado, ejecutado, restante» puede leer *ejecutado* de ese `.effort.json` en modo solo lectura, sin que la extensión mida nada.

### 3.4 Qué reglas de formato respeta (aprendido del runbook del 2026-10-30)

El tracker lee tableros pero no los toca. Los resultados van a su propio archivo de estado; nunca a `epic:`, `links:` ni texto suelto en el tablero.

## 4. Qué agregar y qué quitar (con el porqué)

**Agregar**
- **`aw-watcher-vscode`.** Misma pila, mismo servidor local, cero cuentas. Con solo el título de ventana ya sabemos el *proyecto*; el watcher da la *ruta del archivo*, que es lo que permite elegir entre dos tableros del mismo repo y detectar cuándo se trabaja en una carpeta de fase. **El spike debe comprobar si hace falta**: si con el título alcanza (>90 % de asignaciones sin ambigüedad), no se instala.
- **`aw-watcher-web`** limitado a dominios de la lista. Sin él, una sesión entera en Botpress Studio cuenta como «Chrome, proyecto desconocido».
- **Transcripts de Claude Code.** Es el hueco más grande del enfoque teclado+ventana: mientras un agente corre, Luis lee o espera y el watcher de ausencia lo marca AFK (el umbral por defecto es de unos 3 minutos; **a verificar** en la configuración instalada).
- **Commits git** como verdad de terreno para validar.

**Quitar**
- **El temporizador de la extensión** (D6): dos medidas distintas del mismo tiempo se contradicen.
- **«Tiempo = permanencia en WIP»** como medida. Queda como tope superior.
- Las líneas `agregada a …` del `*.timelog.md` no son tiempo; conviene separarlas del log de esfuerzo (aparte, fuera del alcance de este spike).

**No agregar: WakaTime.** Hace lo mismo que `aw-watcher-vscode`, pero manda metadatos de código a un servicio externo, el historial largo es de pago y sería una segunda fuente de verdad. Solo vale la pena si Luis quisiera estadísticas por lenguaje, que no es el objetivo.

## 5. Riesgos y límites

| Riesgo | Mitigación |
|---|---|
| Leer/pensar sin teclear cuenta como AFK | Umbral configurable; S6 cubre el caso de supervisar agentes; la validación (§6) mide cuánto se pierde |
| Trabajo fuera del equipo (reunión, papel) invisible | Se declara: la medida es *tiempo en el equipo*. Se puede sumar una entrada manual por tarjeta |
| Varias tarjetas de Luis en WIP a la vez | Desambiguar por ruta; si no, `ambigua` y reparto parejo, visible en el reporte |
| Privacidad: los títulos de ventana contienen nombres de clientes y archivos | ActivityWatch es 100 % local. El `.effort.md` versionado lleva **solo título de tarjeta y minutos**, nunca títulos de ventana; el `.effort.json` crudo va a `.gitignore` |
| Los tableros de `mng/` se suben a GitHub | El esfuerzo se expresa en horas, **sin tarifa ni montos** (regla del proyecto OPI) |
| Datos de ActivityWatch solo desde el 2026-10-30 | No hay retroactivo: el spike mide hacia adelante y no sirve para reconstruir tarjetas viejas |
| El formato de transcripts de Claude Code puede cambiar | Aislar el lector en un módulo con pruebas; la fuente es opcional |

## 6. Plan del spike (pasos)

| Paso | Qué | Salida | Esfuerzo |
|---|---|---|---|
| S1 | **Línea base manual de 3 días**: Luis anota bloques por tarjeta (inicio–fin–tarjeta) en un archivo simple | `verdad-terreno.md` | 15 min/día |
| S2 | Script de **extracción** de ActivityWatch (consulta del §3.3) para un rango; imprimir bloques por app/título | Lista de bloques activos | 2 h |
| S3 | **Cruce con WIP** usando el estado del tracker (§6 del runbook enlazado) o, provisoriamente, `git log` del tablero | Tabla tarjeta × minutos | 3 h |
| S4 | **Comparar con S1.** Criterio de éxito: el total diario cae a ±15 % de la verdad de terreno y ≥80 % de los bloques de prueba quedan en la tarjeta correcta | Informe de error | 1 h |
| S5 | Decidir con datos: ¿hace falta `aw-watcher-vscode`? ¿`aw-watcher-web`? ¿S6? Instalar solo lo que baje el error | Decisión escrita | 1 h |
| S6 | Generar `<tablero>.effort.md`/`.json` y revisar un caso real de OPI | Reporte de ejemplo | 2 h |
| S7 | Si pasa: tarjeta de implementación dentro de la extensión (solo lectura del `.effort.json` en el campo *ejecutado*) y apagado del temporizador (D6) | Tarjetas nuevas | — |

Esfuerzo total estimado: **~9 h** de trabajo más 3 días de anotación manual en paralelo. Es una estimación, no una medida.

**Criterio de abandono:** si tras S4 el error no baja del 30 % ni siquiera con las fuentes agregadas, el tiempo automático se descarta y se pasa a un registro semiautomático (un comando de «estoy en X» en un clic).

## 7. Decisiones abiertas

| # | Pregunta | Propuesta |
|---|---|---|
| 1 | ¿Cuenta el tiempo de supervisar a un agente como tiempo humano efectivo? | Reportarlo separado y decidir viendo los datos |
| 2 | ¿Dónde vive el código del cruce? | Script en `sandbox/md-kanban-tracker/scripts/` (hermano de la extensión, no dentro de ella) |
| 3 | ¿`launchd` periódico o bajo demanda? | Bajo demanda al principio; `launchd` si se aprueba |
| 4 | ¿Lista de dominios del navegador? | Botpress Studio, `portal*.openside.group`, `github.com/luismulato`, localhost:8888 |
| 5 | ¿Qué pasa con las tarjetas que Luis dejó en WIP sin trabajar? | Aparecen con bajo % de aprovechamiento: es el diagnóstico buscado |

## 8. Referencias

- Runbook previo: `projects/opi-openside/docs/runbooks/2026-10-30-md-kanban-tracker-pisa-el-tablero-solucion.md` (causas, D1–D6, diseño del tracker de WIP). Ese `docs/` no se sube a GitHub.
- Plan original del timelog de la extensión: `docs/plans/board-automation-and-timelog.md`.
- Código de la extensión: `src/automation/timelog.ts`, `boardAutomation.ts`.
- API local de ActivityWatch: `http://localhost:5600/api/0/` (buckets en `/buckets/`, consultas en `/query/`).
