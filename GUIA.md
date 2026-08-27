# Guía de uso — create-harnessed-project

Guía rápida de qué hay en esta carpeta y cómo usarla para crear proyectos con arnés.

## Qué hay en cada archivo

### La herramienta

| Archivo | Qué es |
|---|---|
| `bin/create-harnessed-project.mjs` | El comando ejecutable del CLI |
| `src/cli.mjs` | Lógica de los subcomandos `crear` y `validar` |
| `src/scaffold.mjs` | Genera los archivos del arnés a partir de las plantillas |
| `src/validate.mjs` | Audita un arnés y puntúa los 5 subsistemas (0-100) |
| `src/utils.mjs` | Detección de stack, gestor de paquetes y comandos de verificación |
| `test/cli.test.mjs` | 10 tests automáticos |

### El método

| Archivo | Qué es |
|---|---|
| `ENTREVISTA.md` | **El corazón del flujo.** Protocolo de 8 fases que un agente IA sigue para entrevistarte y extraer el alcance completo de un proyecto |
| `templates/PROYECTO.md` | Plantilla del brief: el documento donde se vuelca la entrevista |
| `templates/AGENTS.md` | Plantilla de instrucciones para el agente del proyecto generado |
| `templates/feature_list.json` | Plantilla del registro de funcionalidades |
| `templates/progress.md` | Plantilla de la bitácora entre sesiones |
| `templates/session-handoff.md` | Plantilla del traspaso de sesión |

### El arnés propio (dogfooding)

Este proyecto usa su propio arnés: `AGENTS.md`, `feature_list.json`, `progress.md`, `init.sh` y `session-handoff.md` en la raíz gobiernan CÓMO se trabaja en este repositorio. Las funcionalidades pendientes (feat-004 plantillas por tipo, feat-005 publicación npm) están en `feature_list.json`.

## Dónde se crean los proyectos (convención de carpetas)

Cada proyecto nuevo nace como **carpeta hermana del generador** dentro de `C:\Users\<usuario>\Projects\`:

```
C:\Users\<usuario>\Projects\
├── Harness_Generator\      ← la fábrica (este proyecto)
├── Facturacion\            ← proyecto generado, con su arnés
├── Inventario\             ← proyecto generado, con su arnés
└── ...
```

Cada proyecto generado es autocontenido e independiente: lleva su propio `AGENTS.md`, `PROYECTO.md`, `feature_list.json` e `init.sh`. El generador nunca hace falta para trabajar en ellos, solo para crearlos y auditarlos.

En Cowork: conecta la carpeta `Projects` completa a la sesión. Así el agente ve el generador y puede crear los proyectos al lado. En Claude Code o terminal no hay restricción: pasa cualquier ruta al comando `crear`.

## Cómo crear un proyecto nuevo (flujo completo)

### Paso 1 — La entrevista (en Cowork o Claude Code)

Abre una sesión con acceso a esta carpeta y di:

> "Quiero crear un proyecto nuevo. Sigue el protocolo de ENTREVISTA.md de Harness_Generator y entrevístame."

El agente te preguntará por fases: propósito, usuarios, funcionalidades, stack, negocio, datos y seguridad, despliegue, riesgos. Responde con tus palabras; él repregunta lo ambiguo y resume cada fase para que confirmes.

### Paso 2 — Aprobar el brief

El agente redacta `PROYECTO.md` con todo lo recogido y te lo presenta. Revísalo: es la fuente de verdad del alcance. Nada se genera hasta que digas "aprobado".

### Paso 3 — Generar el arnés

El agente ejecuta (o tú, a mano):

```bash
node bin/create-harnessed-project.mjs crear C:\ruta\al\nuevo-proyecto --project-name "Nombre" --owner "Jose" --purpose "propósito en una frase"
```

Esto crea en la carpeta destino: `AGENTS.md`, `feature_list.json`, `progress.md`, `session-handoff.md`, `PROYECTO.md` e `init.sh`, detectando el stack (Node, Python, Go, Rust, Java) y sus comandos de verificación. Nunca sobrescribe archivos existentes salvo con `--force`.

### Paso 4 — Personalizar con lo entrevistado

El agente sustituye el `feature_list.json` de plantilla por tus funcionalidades reales (con prioridades, dependencias y criterios de terminado de la Fase 3) y copia el brief aprobado como `PROYECTO.md` del proyecto.

### Paso 5 — Auditar

```bash
node bin/create-harnessed-project.mjs validar C:\ruta\al\nuevo-proyecto
```

Puntúa los 5 subsistemas y señala el más débil. Objetivo: 100/100.

### Paso 6 — Desarrollar con el arnés

A partir de aquí, cualquier agente que trabaje en el proyecto nuevo empieza leyendo su `AGENTS.md`: ejecuta `./init.sh`, elige UNA funcionalidad pendiente, la implementa, verifica y actualiza `progress.md` antes de cerrar. Ese es el arnés funcionando.

## Comandos de referencia

```bash
node bin/create-harnessed-project.mjs --help        # ayuda
node bin/create-harnessed-project.mjs crear <dir>    # generar arnés
node bin/create-harnessed-project.mjs validar <dir>  # auditar arnés
npm test                                             # tests del generador (10)
./init.sh                                            # verificación completa del generador
```

Requiere Node.js >= 18. Sin dependencias externas. Instalación global opcional: `npm install -g .` (luego basta `create-harnessed-project` desde cualquier carpeta).

## Los 5 subsistemas (el porqué de todo esto)

1. **Instrucciones** (`AGENTS.md`) — cómo debe arrancar y trabajar el agente.
2. **Estado** (`feature_list.json`, `progress.md`) — qué está hecho, en curso y pendiente, con evidencia.
3. **Verificación** (`init.sh`) — lo que hay que ejecutar antes de declarar algo terminado.
4. **Alcance** (dependencias y criterios de terminado) — evita que el agente se disperse o deje cosas a medias.
5. **Ciclo de vida** (`session-handoff.md`, rutina de cierre) — cada sesión termina en estado reanudable.

Basado en [walkinglabs/learn-harness-engineering](https://github.com/walkinglabs/learn-harness-engineering) (MIT).
