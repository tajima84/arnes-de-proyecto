#!/bin/bash
set -e

echo "=== Inicialización del arnés ==="

run() {
  echo ""
  echo ">>> $1"
  bash -c "$1"
}

run "npm install"
run "npm run lint"
run "npm test"

echo ""
echo "=== Verificación completada ==="
echo ""
echo "Siguientes pasos:"
echo "1. Lee feature_list.json para conocer el estado de las funcionalidades"
echo "2. Elige UNA funcionalidad pendiente"
echo "3. Implementa solo esa funcionalidad"
echo "4. Vuelve a ejecutar la verificación antes de declarar terminado"
