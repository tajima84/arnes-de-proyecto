---
name: arnes-de-proyecto
description: Entrevista al dueño de un proyecto y le monta el "arnés" que necesita para que un agente de IA trabaje en él sin perderse: instrucciones, estado, verificación, alcance y ciclo de vida. Úsalo cuando alguien quiera arrancar un proyecto nuevo con IA, ordenar uno que ya empezó y se le está yendo de las manos, o cuando diga que su agente se olvida de todo entre sesiones, no verifica lo que entrega o da por terminado lo que no lo está. También para auditar un proyecto existente y decir qué le falta. Palabras que lo activan - arnés, harness, harness engineering, empezar un proyecto con IA, AGENTS.md, CLAUDE.md, feature list, mi agente se pierde, mi agente se inventa que ha terminado.
---

# Arnés de proyecto

## Qué problema resuelve esto

Un agente de IA capaz falla en un proyecto real por tres motivos, y ninguno es que no sepa
programar:

1. **No recuerda.** Cada sesión empieza de cero y repite trabajo o contradice lo ya decidido.
2. **No verifica.** Entrega algo que parece bien y nadie comprueba que funcione.
3. **No sabe cuándo ha terminado.** Declara victoria antes de tiempo.

El arnés es el andamiaje que cierra esos tres agujeros. No hace al modelo más listo: le monta
un sistema de trabajo cerrado alrededor. Son cinco subsistemas y seis ficheros de texto:

| Subsistema | Fichero | Para qué sirve |
|---|---|---|
| Instrucciones | `AGENTS.md` | Cómo se arranca, cómo se trabaja, qué significa "terminado" |
| Estado | `feature_list.json` + `progress.md` | Qué hay hecho, qué falta, con qué evidencia |
| Verificación | `init.sh` | Lo que hay que ejecutar antes de dar nada por bueno |
| Alcance | dependencias entre funcionalidades | Evita el trabajo a medias y el irse por las ramas |
| Ciclo de vida | `session-handoff.md` | Que la siguiente sesión pueda retomar |
| (el qué) | `PROYECTO.md` | El alcance acordado con el dueño, fuente de verdad |

**El principio que lo gobierna todo: lo que el agente no ve, no existe.** Si una decisión vive
solo en la cabeza de alguien o en el historial de un chat, para el proyecto no existe.

## Cómo usar este skill

Hay dos caminos. Pregunta al usuario cuál quiere si no está claro:

- **A — Proyecto nuevo**: entrevista primero, arnés después. Es el camino por defecto.
- **B — Proyecto que ya existe**: auditoría primero, y luego se completa lo que falte.

---

## Camino A — Proyecto nuevo

### Paso 1: la entrevista (no te la saltes)

Lee `references/entrevista.md` y condúcela **fase a fase**. Ocho fases: propósito, usuarios,
funcionalidades, stack, negocio, datos y seguridad, despliegue, riesgos.

Reglas que no se negocian:

- **No generes nada hasta terminar la entrevista.** Ni un fichero "para ir adelantando".
- **Una fase por turno**, máximo 3-4 preguntas. Nada de cuestionarios de veinte preguntas.
- **Escucha antes de preguntar**: pide primero que te cuenten el proyecto con sus palabras, y
  pregunta solo lo que no haya salido solo.
- **Repregunta lo vago.** "Que sea rápido" no es un requisito; "que responda en menos de dos
  segundos" sí.
- **Propón, no impongas.** Si el dueño no sabe qué stack quiere, dale 2-3 opciones con pros y
  contras y una recomendación tuya.
- **Resume y confirma** al cerrar cada fase, en 2-4 frases.
- **No inventes** lo que el dueño no dijo. Si una fase no aplica, escríbelo: "No aplica porque…".

Si quien te habla no es técnico, habla en llano y no le pidas que elija por ti: propón y
explica la consecuencia de cada opción en su lenguaje (coste, plazo, quién lo mantendrá).

### Paso 2: el brief, y su aprobación explícita

Redacta `PROYECTO.md` con la plantilla de `assets/PROYECTO.md`, enséñaselo entero y **espera su
aprobación explícita**. No sigas con un "supongo que sí".

La pregunta más importante de toda la entrevista está en la fase 3: *"¿cómo comprobarás con tus
ojos que funciona?"*. Esa respuesta, literal, es el criterio de terminado de cada funcionalidad.
Sin ella no hay verificación posible.

### Paso 3: escribir el arnés

Copia los seis ficheros de `assets/` a la carpeta del proyecto y **rellénalos con lo real**:

1. **`PROYECTO.md`** — el brief aprobado en el paso 2.
2. **`feature_list.json`** — sustituye las funcionalidades de plantilla por las de la fase 3.
   Cada una con `id`, `name`, `description` (que incluya el criterio de terminado),
   `dependencies` y `status`. Borra los marcadores; no dejes ninguno.
3. **`AGENTS.md`** — pon el propósito real y los comandos de verificación reales del paso 4.
4. **`init.sh`** — los comandos que de verdad comprueban este proyecto. Si no sabes cuáles son,
   pregunta. Deja `set -e` al principio.
5. **`progress.md`** y **`session-handoff.md`** — tal cual, se llenan al trabajar.

Si el proyecto no tiene comandos de verificación todavía (por ejemplo, aún no hay código), deja
`init.sh` con un `exit 1` y un aviso claro de qué hay que escribir ahí. Es deliberado: mejor que
falle a que finja comprobar.

### Paso 4: auditar lo que acabas de crear

Aplica la rúbrica de `references/rubrica.md` y dile al dueño la puntuación y el punto más débil.
Corrige lo que puntúe bajo antes de dar el arnés por puesto.

---

## Camino B — Proyecto que ya existe

1. **Mira qué hay**: busca `AGENTS.md`/`CLAUDE.md`, `feature_list.json`, `progress.md`,
   `init.sh`, `session-handoff.md` y cualquier documentación de alcance.
2. **Puntúa con `references/rubrica.md`**, subsistema por subsistema, y nombra el cuello de
   botella (el más bajo).
3. **Enseña el diagnóstico antes de tocar nada.** Di qué falta y qué se gana al arreglarlo.
4. **Completa solo lo que falte**, respetando lo que ya funciona. Nunca sobrescribas un
   `AGENTS.md` existente sin enseñar antes qué se pierde.
5. Si no hay un alcance escrito en ninguna parte, haz la entrevista del camino A: es la pieza
   que casi siempre falta.

---

## Reglas que valen para los dos caminos

- **Un arnés no es documentación**: es el sistema de trabajo. Si nadie lo lee ni lo actualiza,
  no existe.
- **Mapa, no enciclopedia.** `AGENTS.md` en torno a 100 líneas. Un fichero de instrucciones que
  solo crece deja de leerse.
- **Nada se da por terminado sin una comprobación que se haya ejecutado de verdad.** "Parece que
  funciona" no es evidencia.
- **Una funcionalidad a la vez.** El trabajo a medias en cinco frentes es el fallo más caro.
- **Al cerrar sesión**: actualiza `progress.md` y `feature_list.json`, y deja el proyecto en
  estado de arrancar de inmediato. Limpiar después es no limpiar nunca.

## Qué NO hacer

- Generar el arnés con el brief a medias.
- Convertir deseos vagos en funcionalidades sin pasarlos antes a criterios medibles.
- Saltarse la aprobación del brief.
- Recitar esta terminología a la cara del dueño. Habla en llano: "trabajamos una cosa a la vez",
  "¿en qué trabajamos hoy?". Y cierra siempre con una propuesta concreta o una lista numerada
  donde la última opción sea "no hagas nada / otra cosa".

---

## Crédito

El método viene del curso **Harness Engineering de Walking Labs**
(https://walkinglabs.github.io/learn-harness-engineering/) y de su skill `harness-creator`,
material MIT. Este skill es una adaptación al castellano, pensada para que alguien que no
programa pueda montar el arnés hablando con su agente, sin instalar nada.

Existe además una versión en línea de comandos que hace el andamiaje automáticamente
(`create-harnessed-project`), para quien prefiera un comando y tenga Node instalado.
