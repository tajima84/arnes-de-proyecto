# Bitácora de progreso de sesiones

## Estado actual

**Última actualización:** 2026-10-22
**Funcionalidad activa:** ninguna (feat-007 a feat-009 terminadas)

## Estado

### Hecho

- [x] feat-001: estructura del proyecto, lint y tests operativos
- [x] feat-002: comando `crear` con detección de stack y plantillas en español
- [x] feat-003: comando `validar` con puntuación de los 5 subsistemas
- [x] Dogfooding: este repositorio generó su propio arnés con su propio CLI
- [x] feat-006: flujo conversacional (ENTREVISTA.md + brief PROYECTO.md integrado en el CLI)
- [x] feat-007: `.gitattributes` generado para que `init.sh` conserve LF en Windows
- [x] feat-008: `--commands` ya no puede hacer que `init.sh` se llame a sí mismo
- [x] feat-009: perfil documental (`--profile documental`) para proyectos sin código

### En curso

- (nada)

### Siguiente

1. Hallazgos consultivos de la revisión nativa de feat-007 a feat-009 (ninguno bloqueante):
   - `init-documental.sh:45`: la regex del BOM lleva un U+FEFF literal e invisible; usar el escape `﻿`
   - La guarda de recursión guarda una sola ruta: dos `init.sh` que se llaman entre sí (raíz → subproyecto → raíz) no se cortan; usar una lista de rutas activas
   - Falta un test que pase `--profile documental` por `main()` y no solo por `scaffoldHarness`
   - Sugerencias: `.env.*` también rechaza `.env.example`; probar datos prohibidos en la raíz; ruido de `undefined` en ids ausentes; la descripción de las comprobaciones vive en tres sitios además de la plantilla
2. feat-004: plantillas por tipo de proyecto (el perfil documental es la primera variante)
3. feat-005: publicación como paquete npm

## Bloqueos / Riesgos

- El skill (`skill/arnes-de-proyecto/`) todavía no genera `.gitattributes` ni conoce el perfil documental: hace lo mismo que el CLI anterior a feat-007

## Decisiones tomadas

- **CLI sin dependencias externas**: solo Node >= 18 y módulos nativos, para que el arnés sea instalable en cualquier entorno
  - Contexto: minimizar fricción y superficie de fallo
- **Plantillas en español**: decisión del propietario del proyecto
- **Basado en learn-harness-engineering (walkinglabs, MIT)**: se adaptaron los 5 subsistemas y las plantillas del skill harness-creator
- **`.gitattributes` nunca se sobrescribe, ni con `--force`**: puede llevar reglas propias (LFS, binarios); si le falta la regla de los `.sh`, `crear` avisa
- **Recursión de `init.sh` cortada en dos capas**: `crear` rechaza el comando que llama al `init.sh` de la raíz, y el `init.sh` generado se corta si lo relanzan de forma indirecta (por ejemplo, desde `npm test`)
- **Los tests de `init.sh` usan Git Bash en Windows**: el `bash` del PATH puede ser el de WSL

## Evidencia de finalización

- [x] Tests en verde: `npm test` → 24/24 pass, desde Git Bash y desde PowerShell
- [x] Lint limpio: `npm run lint` → OK
- [x] `crear <tmp> --agent-file CLAUDE.md` genera `.gitattributes`; con `core.autocrlf=true`, `init.sh` vuelve del checkout con LF
- [x] `validar` da 100/100 a un proyecto relleno con perfil de código y con perfil documental
- [x] Revisión nativa RDD de 98aae32..5833a92 (riesgo alto, 705 líneas, 4 lentes): consentida y aprobada, linaje `review-9d585f30061b9559`, autoridad quemada (2026-10-22)

## Notas para la siguiente sesión

Lee AGENTS.md y ejecuta ./init.sh. Las funcionalidades pendientes (feat-004, feat-005) están definidas en feature_list.json con sus dependencias.
