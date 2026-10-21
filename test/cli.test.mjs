import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { scaffoldHarness } from '../src/scaffold.mjs';
import { validateHarness } from '../src/validate.mjs';
import { detectStack, parseArgs, renderTemplate } from '../src/utils.mjs';

async function tempDir() {
  return mkdtemp(path.join(tmpdir(), 'chp-test-'));
}

test('parseArgs separa flags, pares y posicionales', () => {
  const args = parseArgs(['crear', 'mi-app', '--agent-file', 'CLAUDE.md', '--force']);
  assert.deepEqual(args._, ['crear', 'mi-app']);
  assert.equal(args.agentFile, 'CLAUDE.md');
  assert.equal(args.force, true);
});

test('renderTemplate sustituye marcadores y respeta los desconocidos', () => {
  const out = renderTemplate('Hola {{NOMBRE}} {{OTRO}}', { NOMBRE: 'mundo' });
  assert.equal(out, 'Hola mundo {{OTRO}}');
});

test('scaffoldHarness crea los 5 artefactos del arnés', async () => {
  const dir = await tempDir();
  try {
    const result = await scaffoldHarness(dir);
    assert.equal(result.stack, 'generico');
    const agents = await readFile(path.join(dir, 'AGENTS.md'), 'utf8');
    assert.match(agents, /Flujo de arranque/);
    assert.doesNotMatch(agents, /\{\{[A-Z_]+\}\}/, 'no deben quedar marcadores');
    const features = JSON.parse(await readFile(path.join(dir, 'feature_list.json'), 'utf8'));
    assert.equal(features.features.length, 5);
    await readFile(path.join(dir, 'progress.md'), 'utf8');
    await readFile(path.join(dir, 'session-handoff.md'), 'utf8');
    const init = await readFile(path.join(dir, 'init.sh'), 'utf8');
    assert.match(init, /set -e/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('scaffoldHarness detecta stack node y deriva comandos de scripts', async () => {
  const dir = await tempDir();
  try {
    await writeFile(
      path.join(dir, 'package.json'),
      JSON.stringify({ name: 'x', scripts: { test: 'node --test', lint: 'eslint .' } })
    );
    const result = await scaffoldHarness(dir);
    assert.equal(result.stack, 'node');
    assert.ok(result.commands.includes('npm install'));
    assert.ok(result.commands.includes('npm test'));
    assert.ok(result.commands.includes('npm run lint'));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('scaffoldHarness no sobrescribe sin --force', async () => {
  const dir = await tempDir();
  try {
    await writeFile(path.join(dir, 'AGENTS.md'), 'contenido previo');
    const result = await scaffoldHarness(dir);
    const skipped = result.results.find((r) => r.path.endsWith('AGENTS.md'));
    assert.equal(skipped.status, 'omitido');
    assert.equal(await readFile(path.join(dir, 'AGENTS.md'), 'utf8'), 'contenido previo');
    const forced = await scaffoldHarness(dir, { force: true });
    const written = forced.results.find((r) => r.path.endsWith('AGENTS.md'));
    assert.equal(written.status, 'creado');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('validateHarness puntúa alto un arnés recién generado', async () => {
  const dir = await tempDir();
  try {
    await writeFile(
      path.join(dir, 'package.json'),
      JSON.stringify({ name: 'x', scripts: { test: 'node --test' } })
    );
    await scaffoldHarness(dir);
    const report = await validateHarness(dir);
    assert.ok(report.total >= 90, `total ${report.total} debería ser >= 90`);
    for (const [name, score] of Object.entries(report.scores)) {
      assert.ok(score >= 80, `${name} = ${score} debería ser >= 80`);
    }
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('validateHarness puntúa bajo un directorio vacío', async () => {
  const dir = await tempDir();
  try {
    const report = await validateHarness(dir);
    assert.ok(report.total < 30, `total ${report.total} debería ser < 30`);
    assert.ok(report.findings.length >= 3);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('detectStack reconoce python', async () => {
  const dir = await tempDir();
  try {
    await writeFile(path.join(dir, 'pyproject.toml'), '[project]\nname = "x"');
    assert.equal(await detectStack(dir), 'python');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('scaffoldHarness crea el brief PROYECTO.md con marcadores sustituidos', async () => {
  const dir = await tempDir();
  try {
    await scaffoldHarness(dir, { projectName: 'Mi Proyecto', owner: 'Jose' });
    const brief = await readFile(path.join(dir, 'PROYECTO.md'), 'utf8');
    assert.match(brief, /# PROYECTO: Mi Proyecto/);
    assert.match(brief, /\*\*Propietario:\*\* Jose/);
    assert.doesNotMatch(brief, /\{\{[A-Z_]+\}\}/, 'no deben quedar marcadores');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('scaffoldHarness no sobrescribe un PROYECTO.md existente', async () => {
  const dir = await tempDir();
  try {
    await writeFile(path.join(dir, 'PROYECTO.md'), 'brief aprobado');
    await scaffoldHarness(dir);
    assert.equal(await readFile(path.join(dir, 'PROYECTO.md'), 'utf8'), 'brief aprobado');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('scaffoldHarness crea .gitattributes que fija LF para los .sh', async () => {
  const dir = await tempDir();
  try {
    await scaffoldHarness(dir);
    const attributes = await readFile(path.join(dir, '.gitattributes'), 'utf8');
    assert.match(attributes, /^\* text=auto$/m);
    assert.match(attributes, /^\*\.sh text eol=lf$/m);
    const init = await readFile(path.join(dir, 'init.sh'), 'utf8');
    assert.doesNotMatch(init, /\r/, 'init.sh debe salir con LF');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('scaffoldHarness nunca sobrescribe un .gitattributes existente, ni con --force', async () => {
  const dir = await tempDir();
  try {
    const own = '*.psd filter=lfs diff=lfs merge=lfs -text\n';
    await writeFile(path.join(dir, '.gitattributes'), own);
    const result = await scaffoldHarness(dir, { force: true });
    assert.equal(await readFile(path.join(dir, '.gitattributes'), 'utf8'), own);
    const entry = result.results.find((r) => r.path.endsWith('.gitattributes'));
    assert.equal(entry.status, 'omitido');
    assert.match(entry.reason, /\*\.sh text eol=lf/, 'debe avisar de la regla que falta');

    await writeFile(path.join(dir, '.gitattributes'), `${own}*.sh text eol=lf\n`);
    const again = await scaffoldHarness(dir);
    const kept = again.results.find((r) => r.path.endsWith('.gitattributes'));
    assert.equal(kept.reason, 'ya existe');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
