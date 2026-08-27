# Arnés de proyecto

> Paquete técnico: `create-harnessed-project`. Skill para Claude: `arnes-de-proyecto` (en `skill/`).

CLI que crea proyectos nuevos con el **arnés adecuado** según los principios de [Harness Engineering](https://github.com/walkinglabs/learn-harness-engineering): la infraestructura de entorno, estado, verificación y control que hace fiables a los agentes de código con IA.

## Los 5 subsistemas del arnés

| Subsistema | Artefacto | Propósito |
|---|---|---|
| Instrucciones | `AGENTS.md` / `CLAUDE.md` | Ruta de arranque, reglas de trabajo, definición de terminado |
| Estado | `feature_list.json`, `progress.md` | Funcionalidad actual, estado, evidencia, siguiente paso |
| Verificación | `init.sh` | Comprobaciones que el agente debe ejecutar antes de declarar terminado |
| Alcance | Dependencias entre funcionalidades | Evita el exceso de alcance y el trabajo a medias |
| Ciclo de vida | `session-handoff.md`, rutina de cierre | Hace reanudable la siguiente sesión |

## La vía fácil: el skill (sin instalar nada)

Si no programas —o simplemente no quieres abrir una terminal— usa el **skill**, en `skill/`:

- `skill/arnes-de-proyecto.skill` — instalable de un clic en Claude.
- `skill/arnes-de-proyecto/` — el mismo contenido en abierto, por si prefieres leerlo o adaptarlo.

Una vez instalado, basta con pedirlo con palabras: *"móntame el arnés de este proyecto"*. El
agente te entrevista fase a fase, redacta el brief de alcance, espera tu aprobación y escribe
los seis ficheros del arnés. También sirve para **auditar un proyecto que ya existe** y decirte
qué le falta.

El skill hace lo mismo que el CLI, hablando. El CLI es la comodidad para quien prefiere un
comando; el método es el mismo en los dos.

## Requisitos

Node.js >= 18. Sin dependencias externas.

## Flujo de trabajo: la entrevista primero

El generador está pensado para un flujo **conversacional**: el propietario explica el proyecto y un agente IA le entrevista siguiendo el protocolo de [`ENTREVISTA.md`](./ENTREVISTA.md) (8 fases: propósito, usuarios, funcionalidades, stack, negocio, datos y seguridad, despliegue, riesgos). El resultado es un brief `PROYECTO.md` que el propietario aprueba, y del que se derivan `AGENTS.md` y `feature_list.json` reales.

1. El agente entrevista al propietario (fase a fase, resumiendo y confirmando).
2. Redacta `PROYECTO.md` y obtiene aprobación explícita.
3. Genera el arnés con el CLI y sustituye las funcionalidades de plantilla por las reales.
4. Audita con `validar` y corrige lo que puntúe bajo.

## Uso

```bash
# Crear un proyecto nuevo con arnés
node bin/create-harnessed-project.mjs crear ../mi-nuevo-proyecto

# Sobre un proyecto existente (detecta stack: node, python, go, rust, java)
node bin/create-harnessed-project.mjs crear /ruta/al/proyecto

# Opciones
node bin/create-harnessed-project.mjs crear mi-app \
  --agent-file CLAUDE.md \
  --package-manager pnpm \
  --commands "pnpm test,pnpm lint" \
  --purpose "API de facturación" \
  --project-name "Facturación" \
  --owner "Jose" \
  --force

# Auditar el arnés de cualquier proyecto (puntúa los 5 subsistemas 0-100)
node bin/create-harnessed-project.mjs validar /ruta/al/proyecto
```

Instalación global opcional: `npm install -g .` y luego usa `create-harnessed-project` directamente.

## Flujo recomendado tras generar un arnés

1. Sustituye los marcadores de `feature_list.json` por funcionalidades reales con dependencias.
2. Ajusta los comandos de verificación de `init.sh` si la detección automática no encaja.
3. Escribe el propósito real del proyecto en `AGENTS.md`.
4. Entrega el proyecto al agente: debe empezar leyendo `AGENTS.md` y ejecutando `./init.sh`.

## Desarrollo

```bash
./init.sh      # verificación completa (install + lint + tests)
npm test       # solo tests
```

Este repositorio usa su propio arnés (dogfooding): fue generado con su propio CLI. Consulta `AGENTS.md`, `feature_list.json` y `progress.md`.

## Antes de usarlo: lo que conviene saber

**Qué mide `validar` — y qué no.** La puntuación de 0 a 100 comprueba que el arnés **existe y
está completo**: que hay instrucciones, estado, verificación, alcance y ciclo de vida, y que
cada pieza tiene la forma correcta. **No juzga la calidad del contenido.** Un arnés relleno de
texto vacío puede puntuar 100. Es un detector de arneses ausentes o incompletos, no un revisor.
Úsalo para saber si te falta una pieza, no para saber si tu proyecto está bien planteado.

**Mac, Linux y Windows.** El generador es multiplataforma: solo necesita Node 18 o superior y
no tiene dependencias. En **Mac y Linux no hace falta nada más**: bash ya viene con el sistema.
El `init.sh` que genera es bash, así que en **Windows** hace falta **Git Bash o WSL**; en
PowerShell o CMD no se ejecuta.

**`init.sh` falla a propósito si no detecta el stack.** Cuando la carpeta no permite adivinar
los comandos de verificación, el script generado contiene un `exit 1` con un aviso. Es
deliberado: obliga a escribir la verificación real antes de dar nada por terminado. Sustituye
esa línea por tus comandos.

**`--force` sobrescribe sin copia de seguridad.** Reescribe `AGENTS.md`, `PROYECTO.md` y
`feature_list.json` si ya existen. En un proyecto en marcha, haz copia antes.

**`crear` sin ruta escribe en la carpeta actual.** Pasa siempre la ruta de destino de forma
explícita.

## Crédito y licencia

Basado en el curso y el skill `harness-creator` de [walkinglabs/learn-harness-engineering](https://github.com/walkinglabs/learn-harness-engineering) (MIT). Este proyecto también es MIT.
