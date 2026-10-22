#!/bin/bash
# Verificación del arnés de un proyecto documental: no hay código que compilar, así que se
# comprueba la coherencia del registro de trabajo y que no haya datos bajo control de git.
set -e

fail() {
  echo "ERROR: $1" >&2
  exit 1
}

# Antes que nada, porque el resto de comprobaciones lo usan.
command -v node >/dev/null 2>&1 || fail "no se encuentra node: instala Node.js 18 o superior, o añádelo al PATH"

cd "$(dirname "$0")"

# Busca .git en esta carpeta o en una superior, sin depender de que git esté instalado.
dentro_de_git() {
  local dir="$PWD"
  while [ -n "$dir" ]; do
    [ -e "$dir/.git" ] && return 0
    dir="${dir%/*}"
  done
  [ -e /.git ]
}

if dentro_de_git; then
  command -v git >/dev/null 2>&1 || fail "la carpeta está en un repositorio git pero no se encuentra git: instálalo o añádelo al PATH"
fi

echo "=== Verificación del arnés (perfil documental) ==="

echo ""
echo ">>> check 1: ficheros obligatorios"
for f in {{FICHEROS_OBLIGATORIOS}}; do
  [ -f "$f" ] || fail "falta $f"
done
echo "OK"

echo ""
echo ">>> check 2: feature_list.json válido y coherente"
node -e '
const fs = require("fs");
let data;
try {
  data = JSON.parse(fs.readFileSync("feature_list.json", "utf8").replace(/^\uFEFF/, ""));
} catch (e) {
  console.error("feature_list.json no es JSON válido: " + e.message);
  process.exit(1);
}
const features = data && data.features;
if (!Array.isArray(features) || features.length === 0) {
  console.error("feature_list.json no tiene entregables en features");
  process.exit(1);
}
if (features.some((f) => !f || typeof f !== "object")) {
  console.error("feature_list.json tiene entregables que no son objetos");
  process.exit(1);
}
const required = ["id", "name", "description", "dependencies", "status"];
const allowedStatus = ["not-started", "in-progress", "done"];
const byId = new Map();
const errors = [];
for (const f of features) {
  for (const key of required) {
    if (f[key] === undefined || f[key] === null || f[key] === "") errors.push(`${f.id || "?"}: falta ${key}`);
  }
  if (byId.has(f.id)) errors.push(`${f.id}: id duplicado`);
  byId.set(f.id, f);
  if (!Array.isArray(f.dependencies)) errors.push(`${f.id}: dependencies no es una lista`);
  if (!allowedStatus.includes(f.status)) errors.push(`${f.id}: status desconocido "${f.status}"`);
  if (f.status === "done" && !(typeof f.evidence === "string" && f.evidence.trim())) {
    errors.push(`${f.id}: está en done sin evidence`);
  }
}
const deps = (f) => (Array.isArray(f.dependencies) ? f.dependencies : []);
for (const f of features) {
  for (const dep of deps(f)) {
    if (dep === f.id) errors.push(`${f.id}: depende de sí mismo`);
    else if (!byId.has(dep)) errors.push(`${f.id}: depende de ${dep}, que no existe`);
    else if (f.status === "done" && byId.get(dep).status !== "done") {
      errors.push(`${f.id}: está en done, pero su dependencia ${dep} está en ${byId.get(dep).status}`);
    }
  }
}
// Ciclos entre entregables distintos; la autodependencia ya se ha informado arriba.
const state = new Map();
const visit = (id, path) => {
  if (state.get(id) === "hecho") return;
  if (state.get(id) === "visitando") {
    errors.push(`ciclo de dependencias: ${path.slice(path.indexOf(id)).concat(id).join(" -> ")}`);
    return;
  }
  state.set(id, "visitando");
  for (const dep of deps(byId.get(id))) {
    if (dep !== id && byId.has(dep)) visit(dep, path.concat(id));
  }
  state.set(id, "hecho");
};
for (const id of byId.keys()) visit(id, []);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
const done = features.filter((f) => f.status === "done").length;
console.log(`OK: ${features.length} entregables, ${done} terminados`);
' || fail "feature_list.json no pasa la comprobación"

echo ""
echo ">>> check 3: brief aprobado"
node -e '
const brief = require("fs").readFileSync("PROYECTO.md", "utf8");
process.exit(brief.includes("**Estado:** Aprobado") ? 0 : 1);
' || fail "PROYECTO.md no figura como aprobado: falta la línea **Estado:** Aprobado"
echo "OK"

echo ""
echo ">>> check 4: ni datos, ni .env, ni hojas de cálculo bajo control de git"
# Amplía esta lista si el proyecto maneja otros formatos de datos.
PROHIBIDOS=(
  ':(glob)**/data/**'
  ':(glob)**/.env'
  ':(glob)**/.env.*'
  ':(glob,icase)**/*.xlsx'
  ':(glob,icase)**/*.xls'
  ':(glob,icase)**/*.csv'
)
if dentro_de_git; then
  tracked=$(git ls-files -- "${PROHIBIDOS[@]}") || fail "git ls-files ha fallado"
  [ -z "$tracked" ] || fail "hay ficheros prohibidos en git (sácalos con git rm --cached y añádelos a .gitignore):
$tracked"
  echo "OK"
else
  echo "Se omite: la carpeta todavía no es un repositorio git"
fi

echo ""
echo "=== Verificación completada ==="
echo ""
echo "Siguientes pasos:"
echo "1. Lee feature_list.json para conocer el estado de los entregables"
echo "2. Elige UN entregable pendiente"
echo "3. Trabaja solo en ese entregable"
echo "4. Vuelve a ejecutar la verificación antes de declararlo terminado"
