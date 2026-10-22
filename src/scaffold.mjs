// Crea el arnés en el proyecto destino a partir de las plantillas.
import { chmod, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  detectPackageManager,
  detectStack,
  exists,
  renderTemplate,
  verificationCommands
} from './utils.mjs';

const TEMPLATES_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'templates'
);

const PROFILES = ['codigo', 'documental'];

// Lo que comprueba el init.sh del perfil documental, tal como se lista en AGENTS.md.
const DOCUMENT_CHECKS = [
  'Ficheros obligatorios del arnés presentes',
  '`feature_list.json` coherente: ids únicos, dependencias existentes y sin ciclos, `done` solo con sus dependencias en `done` y con `evidence`',
  '`PROYECTO.md` con la línea `**Estado:** Aprobado`',
  'Dentro de git: ninguna carpeta `data/`, ningún `.env` ni ficheros xlsx, xls o csv versionados'
];

const DOCUMENT_REQUIRED_FILES = [
  'PROYECTO.md',
  'feature_list.json',
  'progress.md',
  'session-handoff.md',
  '.gitattributes'
];

// Detecta una llamada al init.sh de la raíz (`init.sh`, `./init.sh`, `.\init.sh`), con o sin
// comillas. No detecta `sub/init.sh`: el de otro proyecto del monorepo es legítimo.
const CALLS_OWN_INIT = /(?:^|[\s;&|()'"`=])(?:\.[\\/])*init\.sh(?=$|[\s;&|()'"`])/;

function parseCommands(raw) {
  const commands = String(raw)
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean);
  const recursive = commands.find((c) => CALLS_OWN_INIT.test(c));
  if (recursive) {
    throw new Error(
      `el comando de verificación "${recursive}" ejecuta init.sh, que se llamaría a sí mismo en bucle. Quítalo de --commands.`
    );
  }
  return commands;
}

function buildInitScript(commands) {
  const lines = commands.map((c) => `run "${c.replace(/"/g, '\\"')}"`).join('\n');
  return `#!/bin/bash
set -e

# Si un comando de verificación vuelve a lanzar este init.sh, se corta en vez de entrar en bucle.
ARNES_INIT_SCRIPT="$(cd "$(dirname "$0")" && pwd)/$(basename "$0")"
if [ "$ARNES_INIT_ACTIVO" = "$ARNES_INIT_SCRIPT" ]; then
  echo "ERROR: init.sh se ha llamado a sí mismo; quita de la verificación el comando que lo ejecuta" >&2
  exit 1
fi
export ARNES_INIT_ACTIVO="$ARNES_INIT_SCRIPT"

echo "=== Inicialización del arnés ==="

run() {
  echo ""
  echo ">>> $1"
  bash -c "$1"
}

${lines}

echo ""
echo "=== Verificación completada ==="
echo ""
echo "Siguientes pasos:"
echo "1. Lee feature_list.json para conocer el estado de las funcionalidades"
echo "2. Elige UNA funcionalidad pendiente"
echo "3. Implementa solo esa funcionalidad"
echo "4. Vuelve a ejecutar la verificación antes de declarar terminado"
`;
}

async function writeIfAllowed(dest, content, force, results, mode) {
  if (!force && (await exists(dest))) {
    results.push({ path: dest, status: 'omitido', reason: 'ya existe' });
    return;
  }
  await writeFile(dest, content, 'utf8');
  if (mode) await chmod(dest, mode).catch(() => {});
  results.push({ path: dest, status: 'creado' });
}

// Un .gitattributes existente puede llevar reglas propias (LFS, binarios): nunca se sobrescribe,
// ni con --force. Si no fija LF para los .sh, se avisa porque init.sh se rompería con CRLF.
async function writeGitattributes(dest, content, results) {
  if (!(await exists(dest))) {
    await writeIfAllowed(dest, content, false, results);
    return;
  }
  const current = await readFile(dest, 'utf8');
  const keepsShellLf = /^(\*|\*\.sh)\s.*\beol=lf\b/m.test(current);
  results.push({
    path: dest,
    status: 'omitido',
    reason: keepsShellLf ? 'ya existe' : 'ya existe; añádele a mano: *.sh text eol=lf'
  });
}

function defaultPurpose(profile, stack) {
  if (profile === 'documental') return 'Arnés del proyecto documental para trabajo fiable asistido por agentes.';
  if (stack === 'generico') return 'Arnés del proyecto para desarrollo fiable asistido por agentes.';
  return `Arnés del proyecto para desarrollo fiable asistido por agentes en una base de código ${stack}.`;
}

/** Lista de ficheros para un `for` de bash; entrecomilla solo los nombres que lo necesitan. */
function shellWords(names) {
  return names
    .map((n) => (/^[\w.-]+$/.test(n) ? n : `'${n.replace(/'/g, `'\\''`)}'`))
    .join(' ');
}

/**
 * Crea el arnés completo en `target`.
 * @returns {Promise<{target:string, profile:string, stack:string|null, commands:string[], checks:string[], results:Array}>}
 */
export async function scaffoldHarness(target, options = {}) {
  const agentFile = options.agentFile || 'AGENTS.md';
  const force = Boolean(options.force);
  const profile = String(options.profile || 'codigo');
  if (!PROFILES.includes(profile)) {
    throw new Error(`perfil desconocido "${profile}": usa ${PROFILES.join(' o ')}`);
  }
  const documental = profile === 'documental';
  if (documental && options.commands) {
    throw new Error('--commands no aplica al perfil documental: añade tus comprobaciones al final de init.sh');
  }
  const customCommands = options.commands ? parseCommands(options.commands) : null;

  await mkdir(target, { recursive: true });

  // El perfil documental no ejecuta comandos de build: no hay stack que detectar.
  const stack = documental ? null : await detectStack(target);
  const pm = documental ? null : await detectPackageManager(target, options.packageManager);
  const commands = documental ? [] : customCommands || (await verificationCommands(target, stack, pm));
  const checks = documental ? DOCUMENT_CHECKS : commands.map((c) => `\`${c}\``);

  const replacements = {
    AGENT_FILE_NAME: agentFile,
    PROJECT_PURPOSE: options.purpose || defaultPurpose(profile, stack),
    PRIMARY_VERIFICATION_COMMAND: './init.sh',
    VERIFICATION_COMMANDS: checks.map((c) => `- ${c}`).join('\n')
  };

  const results = [];
  // Las plantillas pueden llegar con CRLF si el generador se clonó con core.autocrlf=true.
  const template = async (name) =>
    (await readFile(path.join(TEMPLATES_DIR, name), 'utf8')).replace(/\r\n/g, '\n');

  await writeIfAllowed(
    path.join(target, agentFile),
    renderTemplate(await template('AGENTS.md'), replacements),
    force,
    results
  );
  await writeIfAllowed(
    path.join(target, 'feature_list.json'),
    await template('feature_list.json'),
    force,
    results
  );
  await writeIfAllowed(
    path.join(target, 'progress.md'),
    await template('progress.md'),
    force,
    results
  );
  await writeIfAllowed(
    path.join(target, 'session-handoff.md'),
    await template('session-handoff.md'),
    force,
    results
  );
  const fecha = new Date().toISOString().slice(0, 10);
  await writeIfAllowed(
    path.join(target, 'PROYECTO.md'),
    renderTemplate(await template('PROYECTO.md'), {
      NOMBRE_PROYECTO: options.projectName || path.basename(target),
      FECHA: fecha,
      PROPIETARIO: options.owner || '[pendiente]'
    }),
    force,
    results
  );
  const initScript = documental
    ? renderTemplate(await template('init-documental.sh'), {
        FICHEROS_OBLIGATORIOS: shellWords([agentFile, ...DOCUMENT_REQUIRED_FILES])
      })
    : buildInitScript(commands);
  await writeIfAllowed(path.join(target, 'init.sh'), initScript, force, results, 0o755);
  await writeGitattributes(path.join(target, '.gitattributes'), await template('gitattributes'), results);

  return { target, profile, stack, commands, checks, results };
}
