# Rúbrica de auditoría del arnés

Puntúa cinco subsistemas de 0 a 100 y saca la media. Enseña siempre el desglose, no solo el
total, y nombra el **cuello de botella**: el subsistema con la puntuación más baja. Es el que
hay que arreglar primero.

## 1. Instrucciones

| Punto | Comprobación |
|---|---|
| 40 | Existe `AGENTS.md` o `CLAUDE.md` en la raíz |
| 20 | Menciona el script de verificación (`init.sh` o equivalente) |
| 20 | Menciona el registro de funcionalidades (`feature_list.json`) |
| 20 | Define qué significa "terminado" |

## 2. Estado

| Punto | Comprobación |
|---|---|
| 30 | Existe `feature_list.json` |
| 30 | Es JSON válido y contiene funcionalidades |
| 20 | Toda funcionalidad tiene `id` y `status` |
| 20 | Existe `progress.md` |

## 3. Verificación

| Punto | Comprobación |
|---|---|
| 50 | Existe `init.sh` (o el script de arranque equivalente) |
| 20 | Corta a la primera de cambio ante un error (`set -e` o equivalente) |
| 30 | Invoca de verdad tests, lint o comprobación de tipos |

## 4. Alcance

| Punto | Comprobación |
|---|---|
| 40 | Las funcionalidades declaran `dependencies` |
| 30 | Toda funcionalidad tiene una descripción con contenido real (no un marcador) |
| 30 | Existe el campo `evidence` para registrar la prueba de terminación |

## 5. Ciclo de vida

| Punto | Comprobación |
|---|---|
| 50 | Existe `session-handoff.md` |
| 50 | `AGENTS.md` incluye una rutina de cierre de sesión |

## Cómo presentar el resultado

```
Instrucciones  ████████░░  80/100
Estado         ██████████ 100/100
Verificación   ███████░░░  70/100   ← cuello de botella
Alcance        █████████░  90/100
Ciclo de vida  ██████████ 100/100
               ─────────────────
TOTAL                      88/100
```

Y debajo, los hallazgos concretos: qué falta exactamente y qué se gana al arreglarlo.

Por debajo de 60 el arnés no sostiene el trabajo: díselo claramente al dueño en vez de darle
una lista de deberes.

## La advertencia honesta — dila siempre

**Esta rúbrica mide forma, no sustancia.** Comprueba que el arnés existe y está completo, no que
el contenido sea bueno. Un proyecto con un `AGENTS.md` de una línea con las palabras correctas y
funcionalidades llamadas "a" con descripciones vacías puede sacar 100 sobre 100.

Sirve para detectar arneses ausentes o incompletos, que es el 90% de los casos reales. No
sustituye a leer lo que pone. Cuando enseñes la puntuación, dilo — o el primer lector avispado
lo destapará por ti.
