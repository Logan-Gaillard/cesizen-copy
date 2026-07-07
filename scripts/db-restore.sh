#!/usr/bin/env sh
# Restauration de la base PostgreSQL de CESIZEN a partir d'un dump.
#
# Usage : ./scripts/db-restore.sh backups/cesizen_2026-07-06_030000.sql.gz
#
# ATTENTION : cette operation ECRASE les donnees actuelles de la base. A
# reserver a un rollback en cas d'incident (donnees corrompues, migration
# fautive...). Voir POSTMORTEM.md pour le contexte d'utilisation.

set -eu

DUMP_FILE="${1:-}"
CONTAINER="${CONTAINER:-cesizen-db}"

if [ -z "$DUMP_FILE" ]; then
  echo "Usage: $0 <fichier_de_dump.sql.gz>" >&2
  exit 1
fi

if [ ! -f "$DUMP_FILE" ]; then
  echo "[db-restore] Fichier introuvable : $DUMP_FILE" >&2
  exit 1
fi

echo "[db-restore] ATTENTION : ceci va ECRASER les donnees actuelles de la base '${POSTGRES_DB:-cesizen}'."
printf "Continuer ? (taper 'oui' pour confirmer) : "
read -r CONFIRM
if [ "$CONFIRM" != "oui" ]; then
  echo "[db-restore] Annule."
  exit 1
fi

echo "[db-restore] Restauration depuis ${DUMP_FILE}..."
gunzip -c "$DUMP_FILE" | docker exec -i "$CONTAINER" psql -U "${POSTGRES_USER:-postgres}" "${POSTGRES_DB:-cesizen}"

echo "[db-restore] Restauration terminee. Redemarrez le service app si necessaire :"
echo "  docker compose restart app"
