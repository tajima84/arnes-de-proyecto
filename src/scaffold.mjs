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

function buildInitScript(commands) {
  const lines = commands.map((c) => `run "${c.replace(/"/g, '\\"')}"`).join('\n');
  return `#!/bin/bash
set -e

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

/**
 * Crea el arnés completo en `target`.
 * @returns {Promise<{target:string, stack:string, commands:string[], results:Array}>}
 */
export async function scaffoldHarness(target, options = {}) {
  const agentFile = options.agentFile || 'AGENTS.md';
  const force = Boolean(options.force);

  await mkdir(target, { recursive: true });

  const stack = await detectStack(target);
  const pm = await detectPackageManager(target, options.packageManager);
  const commands = options.commands
    ? String(options.commands)
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean)
    : await verificationCommands(target, stack, pm);

  const purpose =
    options.purpose ||
    (stack === 'generico'
      ? 'Arnés del proyecto para desarrollo fiable asistido por agentes.'
      : `Arnés del proyecto para desarrollo fiable asistido por agentes en una base de código ${stack}.`);

  const replacements = {
    AGENT_FILE_NAME: agentFile,
    PROJECT_PURPOSE: purpose,
    PRIMARY_VERIFICATION_COMMAND: './init.sh',
    VERIFICATION_COMMANDS: commands.map((c) => `- \`${c}\``).join('\n')
  };

  const results = [];
  const template = async (name) =>
    readFile(path.join(TEMPLATES_DIR, name), 'utf8');

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
  await writeIfAllowed(
    path.join(target, 'init.sh'),
    buildInitScript(commands),
    force,
    results,
    0o755
  );

  return { target, stack, commands, results };
}
