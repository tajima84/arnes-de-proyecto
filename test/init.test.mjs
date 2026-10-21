// Tests que ejecutan el init.sh generado en un bash real.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
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
