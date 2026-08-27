# AGENTS.md

CLI create-harnessed-project: genera proyectos nuevos con el arnés adecuado según Harness Engineering. Este repositorio usa su propio arnés (dogfooding).

## Flujo de arranque

Antes de escribir código:

1. **Confirma el directorio de trabajo** con `pwd`
2. **Lee este archivo** completo
3. **Lee la documentación del proyecto si existe** (`docs/ARCHITECTURE.md`, `docs/PRODUCT.md`, README o equivalente)
4. **Ejecuta `./init.sh`** para verificar que el entorno está sano
5. **Lee `feature_list.json`** para conocer el estado actual de las funcionalidades
6. **Revisa los últimos commits** con `git log --oneline -5`

Si la verificación base falla, repárala antes de añadir nuevo alcance.

## Regla de oro de este proyecto

Cuando uses este generador para crear OTRO proyecto, sigue primero el protocolo de `ENTREVISTA.md`: entrevista al propietario, redacta y aprueba el brief `PROYECTO.md`, y solo entonces genera el arnés.

## Reglas de trabajo

- **Una funcionalidad a la vez**: elige exactamente una funcionalidad pendiente de `feature_list.json`
- **Verificación obligatoria**: no declares nada terminado sin ejecutar los comandos de verificación
- **Actualiza los artefactos**: antes de cerrar la sesión, actualiza `progress.md` y `feature_list.json`
- **Mantente en el alcance**: no modifiques archivos ajenos a la funcionalidad actual
- **Deja un estado limpio**: la siguiente sesión debe poder ejecutar `./init.sh` de inmediato

## Artefactos obligatorios

- `feature_list.json` — Registro de estado de funcionalidades (fuente de verdad)
- `progress.md` — Bitácora de continuidad entre sesiones
- `init.sh` — Ruta estándar de arranque y verificación
- `session-handoff.md` — Opcional, para sesiones largas

## Definición de terminado

Una funcionalidad está terminada solo cuando TODO lo siguiente es cierto:

- [ ] El comportamiento objetivo está implementado
- [ ] La verificación requerida se ejecutó de verdad (tests / lint / type-check)
- [ ] La evidencia quedó registrada en `feature_list.json` o `progress.md`
- [ ] El repositorio sigue siendo reiniciable desde la ruta estándar de arranque

## Cierre de sesión

Antes de terminar una sesión:

1. Actualiza `progress.md` con el estado actual
2. Actualiza `feature_list.json` con el nuevo estado de las funcionalidades
3. Registra riesgos o bloqueos sin resolver
4. Haz commit con mensaje descriptivo cuando el trabajo esté en estado seguro
5. Deja el repositorio lo bastante limpio para que la siguiente sesión ejecute `./init.sh` de inmediato

## Comandos de verificación

```bash
# Verificación completa (recomendada)
./init.sh
```

Comprobaciones requeridas:
- `npm install`
- `npm run lint`
- `npm test`

## Escalado

Si te encuentras con:
- **Decisiones de arquitectura**: consulta la documentación de arquitectura si existe; si no, pregunta al usuario
- **Requisitos poco claros**: revisa la documentación de producto/requisitos si existe; si no, pregunta al usuario
- **Fallos de tests repetidos**: actualiza el progreso y márcalo para revisión humana
- **Ambigüedad de alcance**: relee la definición de terminado en `feature_list.json`
