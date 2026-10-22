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

1. Sugerencias no bloqueantes de las dos revisiones nativas de feat-007 a feat-009 (los avisos ya están corregidos):
   - `templates/gitattributes`: `* text=auto` en un repositorio existente con ficheros en CRLF puede renormalizar todo el árbol; bastaría con `*.sh text eol=lf`, o con avisar del efecto
   - `templates/init-documental.sh`, check 3: acepta `**Estado:** Aprobado` como subcadena; una regex sobre la línea completa sería más estricta
   - `templates/init-documental.sh`, check 4: `.env.*` también rechaza `.env.example` y `.env.sample`
   - `templates/init-documental.sh`: los `node -e` van entre comillas simples de bash, así que una comilla simple en el JavaScript rompe el script; documentarlo o pasar a heredoc
   - `templates/init-documental.sh`, check 2: aparece `undefined` en los mensajes cuando un entregable no tiene id
   - `src/scaffold.mjs`: `cd sub && ./init.sh` se rechaza como recursivo, aunque es el init.sh de un subproyecto
   - Las comprobaciones documentales se describen en `DOCUMENT_CHECKS`, el README y la GUIA además de en la plantilla, y nada las mantiene alineadas
   - Falta un test con datos prohibidos en la raíz del proyecto
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
- **Recursión de `init.sh` cortada en dos capas**: `crear` rechaza el comando que llama al `init.sh` de la raíz, y el `init.sh` generado se corta si lo relanzan de forma indirecta (por ejemplo, desde `npm test` o a través del `init.sh` de un subproyecto). `ARNES_INIT_ACTIVOS` lista todos los `init.sh` en curso, no solo el último
- **Los escapes `\u` no se escriben con las herramientas de edición del agente**: las convierten en el carácter real. Se escriben con node o bash y se verifica que no queden bytes `EF BB BF`
- **Los tests de `init.sh` usan Git Bash en Windows**: el `bash` del PATH puede ser el de WSL

## Evidencia de finalización

- [x] Tests en verde: `npm test` → 26/26 pass, desde Git Bash y desde PowerShell
- [x] Lint limpio: `npm run lint` → OK
- [x] `crear <tmp> --agent-file CLAUDE.md` genera `.gitattributes`; con `core.autocrlf=true`, `init.sh` vuelve del checkout con LF
- [x] `validar` da 100/100 a un proyecto relleno con perfil de código y con perfil documental
- [x] Revisión nativa RDD de 98aae32..5833a92 (riesgo alto, 705 líneas, 4 lentes): consentida y aprobada, linaje `review-9d585f30061b9559`, autoridad quemada (2026-10-22). Segunda revisión de 98aae32..3d1ab4b, también aprobada (linaje `review-2224733f96b8861c`)
- [x] Avisos de las revisiones corregidos: escape del BOM en la plantilla y en esta bitácora, guarda de recursión mutua y test de `--profile` vía `main()`. Con el código anterior, raíz → subproyecto → raíz llegaba al tope del contador del test (5 vueltas); ahora se corta en la primera. Con la regex del BOM vaciada a `/^/`, el test del proyecto relleno falla

## Notas para la siguiente sesión

Lee AGENTS.md y ejecuta ./init.sh. Las funcionalidades pendientes (feat-004, feat-005) están definidas en feature_list.json con sus dependencias.
