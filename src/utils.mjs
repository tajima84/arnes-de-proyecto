// Utilidades compartidas: parseo de argumentos, detección de stack y comandos de verificación.
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

export async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

/** Parseo mínimo de argumentos: --clave valor, --flag, y posicionales en `_`. */
export function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (token.startsWith('--')) {
      const key = token
        .slice(2)
        .replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith('--')) {
        args[key] = next;
        i++;
      } else {
        args[key] = true;
      }
    } else {
      args._.push(token);
    }
  }
  return args;
}

/** Detecta el stack del proyecto destino a partir de sus manifiestos. */
export async function detectStack(target) {
  const checks = [
    ['package.json', 'node'],
    ['pyproject.toml', 'python'],
    ['requirements.txt', 'python'],
    ['go.mod', 'go'],
    ['Cargo.toml', 'rust'],
    ['pom.xml', 'java-maven'],
    ['build.gradle', 'java-gradle'],
    ['build.gradle.kts', 'java-gradle']
  ];
  for (const [file, stack] of checks) {
    if (await exists(path.join(target, file))) return stack;
  }
  return 'generico';
}

/** Detecta el gestor de paquetes en proyectos Node. */
export async function detectPackageManager(target, override) {
  if (override) return override;
  if (await exists(path.join(target, 'pnpm-lock.yaml'))) return 'pnpm';
  if (await exists(path.join(target, 'yarn.lock'))) return 'yarn';
  if (
    (await exists(path.join(target, 'bun.lock'))) ||
    (await exists(path.join(target, 'bun.lockb')))
  )
    return 'bun';
  return 'npm';
}

/** Deriva los comandos de verificación según stack y scripts disponibles. */
export async function verificationCommands(target, stack, pm) {
  switch (stack) {
    case 'node': {
      const commands = [`${pm} install`];
      try {
        const pkg = JSON.parse(
          await readFile(path.join(target, 'package.json'), 'utf8')
        );
        const scripts = pkg.scripts || {};
        const run = (name) => (pm === 'npm' ? `npm run ${name}` : `${pm} run ${name}`);
        for (const name of ['check', 'typecheck', 'type-check']) {
          if (scripts[name]) {
            commands.push(run(name));
            break;
          }
        }
        if (scripts.lint) commands.push(run('lint'));
        if (scripts.test) commands.push(pm === 'npm' ? 'npm test' : `${pm} test`);
        if (scripts.build) commands.push(run('build'));
      } catch {
        // package.json ausente o inválido: solo install.
      }
      if (commands.length === 1) commands.push(`${pm} test`);
      return commands;
    }
    case 'python':
      return ['python -m pytest', 'python -m compileall -q .'];
    case 'go':
      return ['go vet ./...', 'go test ./...'];
    case 'rust':
      return ['cargo check', 'cargo test'];
    case 'java-maven':
      return ['mvn test'];
    case 'java-gradle':
      return ['./gradlew test'];
    default:
      return ['echo "Sustituye esta línea por los comandos de verificación del proyecto" && exit 1'];
  }
}

/** Sustituye marcadores {{CLAVE}} en una plantilla. */
export function renderTemplate(content, replacements) {
  return content.replace(/\{\{([A-Z_]+)\}\}/g, (match, key) =>
    key in replacements ? replacements[key] : match
  );
}
