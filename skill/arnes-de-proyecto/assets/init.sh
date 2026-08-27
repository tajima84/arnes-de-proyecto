#!/usr/bin/env bash
# Ruta estándar de arranque y verificación del proyecto.
# Todo lo que haya que comprobar antes de dar algo por terminado va aquí.
set -euo pipefail

echo "=== Verificación del proyecto ==="

# SUSTITUYE estas líneas por los comandos reales del proyecto.
# Ejemplos según el stack:
#   Node:   npm install && npm run lint && npm test
#   Python: pip install -r requirements.txt && ruff check . && pytest
#   Go:     go build ./... && go vet ./... && go test ./...
echo "AVISO: init.sh todavía no tiene comandos de verificación reales." >&2
echo "Escríbelos aquí antes de declarar nada terminado." >&2
exit 1

echo ""
echo "=== Verificación completada ==="
echo ""
echo "Siguientes pasos:"
echo "1. Lee feature_list.json para conocer el estado de las funcionalidades"
echo "2. Elige UNA funcionalidad pendiente"
echo "3. Implementa solo esa funcionalidad"
echo "4. Vuelve a ejecutar la verificación antes de declarar terminado"
