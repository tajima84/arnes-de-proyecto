// Punto de entrada del CLI: subcomandos `crear` (por defecto) y `validar`.
import path from 'node:path';
import { parseArgs } from './utils.mjs';
import { scaffoldHarness } from './scaffold.mjs';
import { validateHarness } from './validate.mjs';

const AYUDA = `create-harnessed-project — crea proyectos con el arnés adecuado (Harness Engineering)

Uso:
  create-harnessed-project [crear] <directorio> [opciones]
  create-harnessed-project validar <directorio>

Opciones de crear:
  --agent-file AGENTS.md|CLAUDE.md   Nombre del archivo de instrucciones (por defecto AGENTS.md)
  --package-manager npm|pnpm|yarn|bun  Fuerza el gestor de paquetes detectado
  --commands "cmd1,cmd2"             Comandos de verificación personalizados
  --purpose "texto"                  Propósito del proyecto para el AGENTS.md
  --project-name "nombre"            Nombre del proyecto para el brief PROYECTO.md
  --owner "nombre"                   Propietario del proyecto para el brief
  --force                            Sobrescribe archivos existentes

Flujo recomendado: antes de crear, realiza la entrevista de descubrimiento
(ver ENTREVISTA.md) y aprueba el brief PROYECTO.md con el propietario.

El arnés generado cubre los 5 subsistemas:
  Instrucciones (AGENTS.md) · Estado (feature_list.json, progress.md) ·
  Verificación (init.sh) · Alcance (dependencias y definición de terminado) ·
  Ciclo de vida (session-handoff.md, rutina de cierre)
`;

export async function main(argv) {
  const args = parseArgs(argv);

  if (args.help || (args._.length === 0 && Object.keys(args).length === 1)) {
    console.log(AYUDA);
    return 0;
  }

  let command = 'crear';
  let rest = args._;
  if (['crear', 'validar', 'create', 'validate'].includes(args._[0])) {
    command = args._[0] === 'validate' ? 'validar' : args._[0] === 'create' ? 'crear' : args._[0];
    rest = args._.slice(1);
  }

  const target = path.resolve(rest[0] || process.cwd());

  if (command === 'validar') {
    const report = await validateHarness(target);
    console.log(`Auditoría del arnés: ${target}\n`);
    for (const [name, score] of Object.entries(report.scores)) {
      const bar = '█'.repeat(Math.round(score / 10)).padEnd(10, '░');
      console.log(`  ${name.padEnd(14)} ${bar} ${score}/100`);
    }
    console.log(`\n  TOTAL: ${report.total}/100`);
    console.log(`  Cuello de botella probable: ${report.lowest.subsystem} (${report.lowest.score}/100)`);
    if (report.findings.length) {
      console.log('\nHallazgos:');
      for (const f of report.findings) console.log(`  - ${f}`);
    }
    return report.total >= 60 ? 0 : 1;
  }

  const result = await scaffoldHarness(target, {
    agentFile: args.agentFile,
    packageManager: args.packageManager,
    commands: args.commands,
    purpose: args.purpose,
    projectName: args.projectName,
    owner: args.owner,
    force: Boolean(args.force)
  });

  console.log(`Arnés creado en ${result.target}`);
  console.log(`Stack detectado: ${result.stack}`);
  console.log('Comandos de verificación:');
  for (const c of result.commands) console.log(`  - ${c}`);
  console.log('');
  for (const r of result.results) {
    console.log(
      `${r.status.toUpperCase()} ${path.relative(result.target, r.path)}${r.reason ? ` (${r.reason})` : ''}`
    );
  }
  console.log('\nSiguiente paso: sustituye los marcadores de feature_list.json por funcionalidades reales.');
  return 0;
}
