// Audita el arnés de un proyecto: puntúa los 5 subsistemas de Harness Engineering.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { exists } from './utils.mjs';

async function readIfExists(p) {
  try {
    return await readFile(p, 'utf8');
  } catch {
    return null;
  }
}

/**
 * Valida el arnés en `target` y devuelve puntuaciones 0-100 por subsistema.
 */
export async function validateHarness(target) {
  const agentsPath = (await exists(path.join(target, 'AGENTS.md')))
    ? path.join(target, 'AGENTS.md')
    : path.join(target, 'CLAUDE.md');
  const agents = await readIfExists(agentsPath);
  const featureListRaw = await readIfExists(path.join(target, 'feature_list.json'));
  const progress = await readIfExists(path.join(target, 'progress.md'));
  const initSh = await readIfExists(path.join(target, 'init.sh'));
  const handoff = await readIfExists(path.join(target, 'session-handoff.md'));

  const scores = {};
  const findings = [];

  // 1. Instrucciones
  let s = 0;
  if (agents) {
    s += 40;
    if (/init\.sh|verificaci|verification/i.test(agents)) s += 20;
    if (/feature_list\.json/.test(agents)) s += 20;
    if (/terminado|definition of done|hecho/i.test(agents)) s += 20;
  } else {
    findings.push('Falta AGENTS.md o CLAUDE.md (subsistema de instrucciones).');
  }
  scores.instrucciones = s;

  // 2. Estado
  s = 0;
  let features = null;
  if (featureListRaw) {
    s += 30;
    try {
      const parsed = JSON.parse(featureListRaw);
      features = Array.isArray(parsed.features) ? parsed.features : null;
      if (features && features.length > 0) s += 30;
      if (features && features.every((f) => f.id && f.status !== undefined)) s += 20;
    } catch {
      findings.push('feature_list.json no es JSON válido.');
    }
  } else {
    findings.push('Falta feature_list.json (subsistema de estado).');
  }
  if (progress) s += 20;
  else findings.push('Falta progress.md (continuidad entre sesiones).');
  scores.estado = Math.min(s, 100);

  // 3. Verificación
  s = 0;
  if (initSh) {
    s += 50;
    if (/set -e/.test(initSh)) s += 20;
    if (/test|lint|check|compileall|vet/i.test(initSh)) s += 30;
  } else {
    findings.push('Falta init.sh (subsistema de verificación).');
  }
  scores.verificacion = s;

  // 4. Alcance
  s = 0;
  if (features) {
    if (features.some((f) => Array.isArray(f.dependencies))) s += 40;
    if (features.every((f) => f.description && f.description.length > 10)) s += 30;
    if ('evidence' in (features[0] || {})) s += 30;
  } else {
    findings.push('Sin funcionalidades legibles no hay control de alcance.');
  }
  scores.alcance = s;

  // 5. Ciclo de vida
  s = 0;
  if (handoff) s += 50;
  else findings.push('Falta session-handoff.md (traspaso entre sesiones).');
  if (agents && /cierre de sesi|end of session/i.test(agents)) s += 50;
  scores.cicloDeVida = s;

  const values = Object.values(scores);
  const total = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  const lowest = Object.entries(scores).sort((a, b) => a[1] - b[1])[0];

  return { scores, total, lowest: { subsystem: lowest[0], score: lowest[1] }, findings };
}
