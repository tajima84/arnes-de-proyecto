# Protocolo de entrevista de descubrimiento

Guía para el agente que va a montar el arnés de un proyecto. **No generes nada hasta completar
la entrevista.** El objetivo es que el dueño del proyecto explique todo el alcance conversando y
que tú extraigas la información con preguntas.

## Reglas de conducción

1. **Una fase a la vez.** No mezcles fases ni bombardees con todas las preguntas de golpe.
   Máximo 3-4 preguntas por turno.
2. **Escucha antes de preguntar.** Pide primero que te cuenten el proyecto en sus propias
   palabras. Muchas respuestas saldrán solas; pregunta solo lo que falte.
3. **Repregunta lo ambiguo.** Si una respuesta es vaga ("que sea rápido", "algo sencillo"), pide
   un criterio concreto y medible.
4. **Propón, no impongas.** Cuando el dueño no sepa responder (por ejemplo, el stack técnico),
   ofrece 2-3 opciones con pros y contras y una recomendación.
5. **Resume y confirma.** Al final de cada fase, resume lo entendido en 2-4 frases y pide
   confirmación antes de avanzar.
6. **Registra todo.** Las respuestas confirmadas se vuelcan en `PROYECTO.md`. Nada de fiarse de
   la memoria de la conversación.
7. **Detecta lo que no aplica.** Si una fase no aplica (por ejemplo, sin despliegue porque es un
   script local), déjalo anotado explícitamente en el brief como "No aplica: [motivo]".

## Fase 1 — Propósito y problema

- ¿Qué problema resuelve el proyecto y a quién se lo resuelve?
- ¿Qué pasa hoy sin él (proceso manual, herramienta actual, coste del problema)?
- ¿Cómo sabremos que el proyecto ha tenido éxito? (criterio medible)
- ¿Qué queda explícitamente FUERA del alcance?

## Fase 2 — Usuarios

- ¿Quiénes lo usarán (roles, número aproximado, nivel técnico)?
- ¿Cómo interactúan con él (web, móvil, consola, API, informe)?
- ¿Hay flujos distintos por tipo de usuario (administrador frente a usuario final)?

## Fase 3 — Funcionalidades y prioridades

- Lista de funcionalidades en lenguaje del dueño.
- Para cada una: ¿es imprescindible para la primera versión o puede esperar?
- ¿Qué dependencias hay entre ellas (qué debe existir antes de qué)?
- Para cada imprescindible: **¿cómo comprobarás con tus ojos que funciona?**
  Esta respuesta se convierte, literal, en el criterio de terminado.

Es la fase más importante de las ocho. Si sales de aquí sin criterios verificables, el arnés no
podrá comprobar nada y todo lo demás es decorado.

## Fase 4 — Stack técnico

- ¿Hay preferencia o imposición de lenguaje o framework (estándar de la empresa, equipo que lo
  mantendrá)?
- ¿Debe integrarse con código existente? ¿Dónde está y quién lo conoce?
- Si no hay preferencia: propón 2-3 opciones con recomendación según el tipo de proyecto, y
  explica la consecuencia de cada una en lenguaje de negocio (coste, plazo, quién sabrá
  mantenerlo dentro de un año).

## Fase 5 — Contexto de negocio

- ¿Hay plazo o hito externo (demo, feria, cierre contable, compromiso con un cliente)?
- ¿Quiénes son los interesados y quién aprueba? ¿Quién dará feedback durante el desarrollo?
- ¿Presupuesto o límites de coste (licencias, servicios cloud, APIs de pago)?
- ¿Con qué sistemas de la empresa debe integrarse (ERP, CRM, correo, almacenamiento)?

## Fase 6 — Datos y seguridad

- ¿Qué datos maneja? ¿De dónde vienen y en qué formato (base de datos existente, Excel, API,
  entrada manual)?
- ¿Hay datos personales o sensibles? ¿Aplica el RGPD u otra normativa?
- ¿Quién puede ver o modificar qué (roles y permisos)?
- ¿Necesita copias de seguridad, histórico o auditoría de cambios?

## Fase 7 — Despliegue y operación

- ¿Dónde correrá (PC local, servidor de la empresa, cloud, móvil)?
- ¿Quién lo instala, lo actualiza y lo mantiene cuando el proyecto termine?
- ¿Necesita monitorización, registros o avisos cuando algo falle?
- ¿Cuántos usuarios simultáneos o qué volumen de datos hay que soportar?

## Fase 8 — Restricciones y riesgos

- **¿Qué es lo que más miedo da de este proyecto?**
- ¿Ha habido intentos anteriores? ¿Por qué fallaron?
- ¿Qué restricciones fijas existen (navegadores antiguos, sin acceso a internet, hardware
  limitado)?

## Cierre de la entrevista

1. Redacta el brief completo en `PROYECTO.md` con la plantilla de `assets/PROYECTO.md`.
2. Preséntaselo al dueño y **espera su aprobación explícita**.
3. Con el brief aprobado, escribe el resto del arnés (ver `SKILL.md`, paso 3).
4. Audita el resultado con `references/rubrica.md` y corrige lo que puntúe bajo.

## Qué NO hacer

- No generar el arnés con el brief a medias "para adelantar".
- No inventar respuestas que el dueño no dio.
- No convertir deseos vagos en funcionalidades; conviértelos primero en criterios medibles.
- No saltarse la aprobación explícita del brief.
