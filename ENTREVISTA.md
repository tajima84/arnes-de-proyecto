# Protocolo de entrevista de descubrimiento

Guía para el agente (Claude, Codex u otro) que va a crear un proyecto nuevo con este generador. **No generes nada hasta completar la entrevista.** El objetivo es que el propietario del proyecto explique todo el alcance conversando, y que tú extraigas la información con preguntas.

## Reglas de la entrevista

1. **Una fase a la vez.** No mezcles fases ni bombardees con todas las preguntas de golpe. Máximo 3-4 preguntas por turno.
2. **Escucha antes de preguntar.** Pide primero que te cuenten el proyecto en sus propias palabras. Muchas respuestas saldrán solas; pregunta solo lo que falte.
3. **Repregunta lo ambiguo.** Si una respuesta es vaga ("que sea rápido", "algo sencillo"), pide un criterio concreto y medible.
4. **Propón, no impongas.** Cuando el propietario no sepa responder (p. ej. stack técnico), ofrece 2-3 opciones con pros y contras y una recomendación.
5. **Resume y confirma.** Al final de cada fase, resume lo entendido en 2-4 frases y pide confirmación antes de avanzar.
6. **Registra todo.** Las respuestas confirmadas se vuelcan en `PROYECTO.md` (el brief). Nada de fiarse de la memoria de la conversación.
7. **Detecta lo que no aplica.** Si una fase no aplica (p. ej. sin despliegue porque es un script local), déjalo anotado explícitamente en el brief como "No aplica: [motivo]".

## Fases y preguntas

### Fase 1 — Propósito y problema

- ¿Qué problema resuelve el proyecto y a quién se lo resuelve?
- ¿Qué pasa hoy sin él (proceso manual, herramienta actual, coste del problema)?
- ¿Cómo sabremos que el proyecto ha tenido éxito? (criterio medible)
- ¿Qué queda explícitamente FUERA del alcance?

### Fase 2 — Usuarios

- ¿Quiénes lo usarán (roles, número aproximado, nivel técnico)?
- ¿Cómo interactúan con él (web, móvil, consola, API, informe)?
- ¿Hay flujos distintos por tipo de usuario (admin vs. usuario final)?

### Fase 3 — Funcionalidades y prioridades

- Lista de funcionalidades en lenguaje del propietario.
- Para cada una: ¿es imprescindible para la primera versión o puede esperar?
- ¿Qué dependencias hay entre ellas (qué debe existir antes de qué)?
- Para cada imprescindible: ¿cómo comprobarás con tus ojos que funciona? (esto se convierte en el criterio de terminado)

### Fase 4 — Stack técnico

- ¿Hay preferencia o imposición de lenguaje/framework (estándar de la empresa, equipo que lo mantendrá)?
- ¿Debe integrarse con código existente? ¿Dónde está y quién lo conoce?
- Si no hay preferencia: propón 2-3 opciones con recomendación según el tipo de proyecto.

### Fase 5 — Contexto de negocio

- ¿Hay plazo o hito externo (demo, feria, cierre contable, compromiso con cliente)?
- ¿Quiénes son los interesados y quién aprueba? ¿Quién dará feedback durante el desarrollo?
- ¿Presupuesto o límites de coste (licencias, servicios cloud, APIs de pago)?
- ¿Con qué sistemas de la empresa debe integrarse (ERP, CRM, correo, almacenamiento)?

### Fase 6 — Datos y seguridad

- ¿Qué datos maneja? ¿De dónde vienen y en qué formato (BD existente, Excel, API, entrada manual)?
- ¿Hay datos personales o sensibles? ¿Aplica RGPD u otra normativa?
- ¿Quién puede ver o modificar qué (roles y permisos)?
- ¿Necesita copias de seguridad, histórico o auditoría de cambios?

### Fase 7 — Despliegue y operación

- ¿Dónde correrá (PC local, servidor de la empresa, cloud, móvil)?
- ¿Quién lo instala, lo actualiza y lo mantiene cuando el proyecto termine?
- ¿Necesita monitorización, logs o avisos cuando algo falle?
- ¿Cuántos usuarios simultáneos / volumen de datos hay que soportar?

### Fase 8 — Restricciones y riesgos

- ¿Qué es lo que más miedo da de este proyecto?
- ¿Ha habido intentos anteriores? ¿Por qué fallaron?
- ¿Qué restricciones fijas existen (navegadores antiguos, sin acceso a internet, hardware limitado)?

## Cierre de la entrevista

1. Redacta el brief completo en `PROYECTO.md` usando la plantilla (`templates/PROYECTO.md`).
2. Preséntaselo al propietario y **espera su aprobación explícita**.
3. Con el brief aprobado, genera el arnés:
   ```bash
   node bin/create-harnessed-project.mjs crear <directorio> --purpose "<propósito en una frase>"
   ```
4. Sustituye el `feature_list.json` de plantilla por las funcionalidades reales de la Fase 3, con sus dependencias, prioridades y criterios de terminado como `description`.
5. Copia `PROYECTO.md` al proyecto generado: es la fuente de verdad del alcance.
6. Ajusta `AGENTS.md` e `init.sh` con lo aprendido en las fases 4, 6 y 7.
7. Ejecuta `node bin/create-harnessed-project.mjs validar <directorio>` y corrige lo que puntúe bajo.

## Qué NO hacer

- No generar el arnés con el brief a medias "para adelantar".
- No inventar respuestas que el propietario no dio.
- No convertir deseos vagos en funcionalidades; conviértelos primero en criterios medibles.
- No saltarte la aprobación explícita del brief.
