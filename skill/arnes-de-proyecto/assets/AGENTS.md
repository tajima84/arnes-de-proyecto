# AGENTS.md

[Propósito del proyecto en una o dos frases: qué hace y para quién.]

## Flujo de arranque

Antes de escribir código:

1. **Confirma el directorio de trabajo** con `pwd`
2. **Lee este archivo** completo
3. **Lee `PROYECTO.md`** (brief de alcance, fuente de verdad) y la documentación del proyecto si existe
4. **Ejecuta `./init.sh`** para verificar que el entorno está sano
5. **Lee `feature_list.json`** para conocer el estado actual de las funcionalidades
6. **Revisa los últimos commits** con `git log --oneline -5` (si el proyecto usa git)

Si la verificación base falla, repárala antes de añadir nuevo alcance.

## Reglas de trabajo

- **Una funcionalidad a la vez**: elige exactamente una funcionalidad pendiente de `feature_list.json`
- **Verificación obligatoria**: no declares nada terminado sin ejecutar los comandos de verificación
- **Actualiza los artefactos**: antes de cerrar la sesión, actualiza `progress.md` y `feature_list.json`
- **Mantente en el alcance**: no modifiques archivos ajenos a la funcionalidad actual
- **Deja un estado limpio**: la siguiente sesión debe poder ejecutar `./init.sh` de inmediato
- **Habla en llano con el dueño**: nada de jerga interna; cierra siempre con una propuesta concreta

## Artefactos obligatorios

- `PROYECTO.md` — Brief de alcance aprobado por el propietario (fuente de verdad del QUÉ)
- `feature_list.json` — Registro de estado de funcionalidades (fuente de verdad del CÓMO VA)
- `progress.md` — Bitácora de continuidad entre sesiones
- `init.sh` — Ruta estándar de arranque y verificación
- `session-handoff.md` — Traspaso entre sesiones

## Definición de terminado

Una funcionalidad está terminada solo cuando TODO lo siguiente es cierto:

- [ ] El comportamiento objetivo está implementado
- [ ] La verificación requerida se ejecutó de verdad (tests / lint / comprobación de tipos)
- [ ] La evidencia quedó registrada en `feature_list.json` o `progress.md`
- [ ] El proyecto sigue siendo reiniciable desde la ruta estándar de arranque

## Cierre de sesión

1. Actualiza `progress.md` con el estado actual
2. Actualiza `feature_list.json` con el nuevo estado de las funcionalidades
3. Registra riesgos o bloqueos sin resolver
4. Haz commit con mensaje descriptivo cuando el trabajo esté en estado seguro
5. Deja el proyecto lo bastante limpio para que la siguiente sesión ejecute `./init.sh` de inmediato

## Comandos de verificación

```bash
./init.sh
```

Comprobaciones requeridas:
- [comando de instalación de dependencias]
- [comando de lint o comprobación de estilo]
- [comando de tests]

## Escalado

- **Decisiones de arquitectura**: consulta la documentación si existe; si no, pregunta al usuario
- **Requisitos poco claros**: relee `PROYECTO.md`; si no está, pregunta al usuario
- **Fallos de tests repetidos**: actualiza el progreso y márcalo para revisión humana
- **Ambigüedad de alcance**: relee la definición de terminado en `feature_list.json`
