// Tests que ejecutan el init.sh generado en un bash real.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { scaffoldHarness } from '../src/scaffold.mjs';

// En Windows, el `bash` del PATH puede ser el de WSL; init.sh está pensado para Git Bash.
function findBash() {
  if (process.platform !== 'win32') return 'bash';
  const gitExecPath = spawnSync('git', ['--exec-path'], { encoding: 'utf8' });
  if (gitExecPath.status === 0) {
    // <Git>/mingw64/libexec/git-core → <Git>/bin/bash.exe
    const candidate = path.resolve(gitExecPath.stdout.trim(), '..', '..', '..', 'bin', 'bash.exe');
    if (existsSync(candidate)) return candidate;
  }
  return 'bash';
}

const BASH = findBash();
const NO_BASH =
  spawnSync(BASH, ['-c', 'command -v node && command -v git'], { encoding: 'utf8' }).status === 0
    ? false
    : 'hace falta bash con node y git en el PATH';

function sh(script, cwd) {
  return spawnSync(BASH, ['-c', script], { cwd, encoding: 'utf8', timeout: 30000 });
}

async function tempDir() {
  return mkdtemp(path.join(tmpdir(), 'chp-init-'));
}

test('init.sh se corta si un comando de verificación vuelve a lanzarlo', { skip: NO_BASH }, async () => {
  const dir = await tempDir();
  try {
    await scaffoldHarness(dir, { commands: 'bash verificar.sh' });
    // verificar.sh relanza init.sh; el contador limita el bucle si la protección fallara.
    await writeFile(
      path.join(dir, 'verificar.sh'),
      'n=$(cat contador 2>/dev/null || echo 0); n=$((n + 1)); echo "$n" > contador\n' +
        '[ "$n" -lt 5 ] || exit 3\n' +
        'bash init.sh\n'
    );
    const run = sh('bash init.sh', dir);
    assert.equal(run.status, 1, run.stdout + run.stderr);
    assert.match(run.stderr, /init\.sh se ha llamado a sí mismo/);
    assert.equal((await readFile(path.join(dir, 'contador'), 'utf8')).trim(), '1');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

async function approveBrief(dir) {
  const briefPath = path.join(dir, 'PROYECTO.md');
  const brief = await readFile(briefPath, 'utf8');
  await writeFile(briefPath, brief.replace('**Estado:** Borrador | Aprobado', '**Estado:** Aprobado'));
}

async function writeFeatures(dir, features) {
  await writeFile(path.join(dir, 'feature_list.json'), JSON.stringify({ features }, null, 2));
}

const feature = (id, status, dependencies = [], evidence = '') => ({
  id,
  name: `Entregable ${id}`,
  description: `Descripción del entregable ${id}`,
  dependencies,
  status,
  evidence
});

test('perfil documental: init.sh falla mientras el brief no está aprobado', { skip: NO_BASH }, async () => {
  const dir = await tempDir();
  try {
    await scaffoldHarness(dir, { profile: 'documental' });
    const run = sh('bash init.sh', dir);
    assert.equal(run.status, 1, run.stdout + run.stderr);
    assert.match(run.stdout, /OK: 5 entregables, 0 terminados/);
    assert.match(run.stderr, /PROYECTO\.md no figura como aprobado/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('perfil documental: init.sh pasa en un proyecto relleno dentro de git', { skip: NO_BASH }, async () => {
  const dir = await tempDir();
  try {
    await scaffoldHarness(dir, { profile: 'documental', agentFile: 'CLAUDE.md' });
    await approveBrief(dir);
    await writeFeatures(dir, [
      feature('ent-001', 'done', [], 'Informe entregado y validado por el cliente'),
      feature('ent-002', 'in-progress', ['ent-001'])
    ]);
    await mkdir(path.join(dir, 'docs', 'database'), { recursive: true });
    await writeFile(path.join(dir, 'docs', 'database', 'notas.md'), 'no es una carpeta data/');
    assert.equal(sh('git init -q && git add -A', dir).status, 0);
    const run = sh('bash init.sh', dir);
    assert.equal(run.status, 0, run.stdout + run.stderr);
    assert.match(run.stdout, /OK: 2 entregables, 1 terminados/);
    assert.match(run.stdout, /Verificación completada/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('perfil documental: init.sh detecta incoherencias de feature_list.json', { skip: NO_BASH }, async () => {
  const dir = await tempDir();
  try {
    await scaffoldHarness(dir, { profile: 'documental' });
    await approveBrief(dir);
    await writeFeatures(dir, [
      feature('a', 'done', ['b'], 'hecho'),
      feature('b', 'not-started', ['b']),
      feature('c', 'not-started', ['d']),
      feature('d', 'not-started', ['c']),
      feature('e', 'not-started', ['zzz']),
      feature('e', 'not-started'),
      feature('f', 'done', [], '  ')
    ]);
    const run = sh('bash init.sh', dir);
    assert.equal(run.status, 1, run.stdout + run.stderr);
    for (const error of [
      'a: está en done, pero su dependencia b está en not-started',
      'b: depende de sí mismo',
      'ciclo de dependencias: c -> d -> c',
      'e: depende de zzz, que no existe',
      'e: id duplicado',
      'f: está en done sin evidence'
    ]) {
      assert.ok(run.stderr.includes(error), `falta el error "${error}" en:\n${run.stderr}`);
    }
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('perfil documental: init.sh detecta datos, .env y hojas de cálculo versionados', { skip: NO_BASH }, async () => {
  const dir = await tempDir();
  try {
    await scaffoldHarness(dir, { profile: 'documental' });
    await approveBrief(dir);
    const forbidden = ['entregables/anexos/data/ventas.txt', 'config/.env', 'docs/Informe.XLSX', 'docs/tabla.csv'];
    for (const file of forbidden) {
      await mkdir(path.dirname(path.join(dir, file)), { recursive: true });
      await writeFile(path.join(dir, file), 'x');
    }
    assert.equal(sh('git init -q && git add -A', dir).status, 0);
    const run = sh('bash init.sh', dir);
    assert.equal(run.status, 1, run.stdout + run.stderr);
    assert.match(run.stderr, /hay ficheros prohibidos en git/);
    for (const file of forbidden) assert.ok(run.stderr.includes(file), `no señala ${file}`);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('perfil documental: init.sh avisa con claridad si falta node', { skip: NO_BASH }, async () => {
  const dir = await tempDir();
  try {
    await scaffoldHarness(dir, { profile: 'documental' });
    const run = sh('PATH=/no-existe "$BASH" init.sh', dir);
    assert.equal(run.status, 1, run.stdout + run.stderr);
    assert.match(run.stderr, /no se encuentra node/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('perfil documental: init.sh avisa con claridad si falta git dentro de un repositorio', { skip: NO_BASH }, async () => {
  const dir = await tempDir();
  try {
    await scaffoldHarness(dir, { profile: 'documental' });
    // PATH con node y dirname, pero sin git.
    const script =
      'git init -q && mkdir herramientas && ' +
      'for t in node dirname; do ' +
      `printf '#!/bin/sh\\nexec "%s" "$@"\\n' "$(command -v $t)" > herramientas/$t; chmod +x herramientas/$t; ` +
      'done && PATH="$PWD/herramientas" "$BASH" init.sh';
    const run = sh(script, dir);
    assert.equal(run.status, 1, run.stdout + run.stderr);
    assert.match(run.stderr, /está en un repositorio git pero no se encuentra git/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
