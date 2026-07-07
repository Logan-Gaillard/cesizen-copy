#!/usr/bin/env sh
# Sauvegarde quotidienne de la base PostgreSQL de CESIZEN.
#
# Usage : ./scripts/db-backup.sh
# A programmer en cron (ex: tous les jours a 3h) sur le serveur de production :
#   0 3 * * * cd /chemin/vers/cesizen && ./scripts/db-backup.sh >> /var/log/cesizen-backup.log 2>&1
#
# Complement aux snapshots Proxmox (qui sauvegardent toute la VM) : ce dump
# cible uniquement la base de donnees, permet une restauration plus rapide et
# plus frequente sans dependre d'un rollback complet de VM.

set -eu

BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
CONTAINER="${CONTAINER:-cesizen-db}"
DATE=$(date +%Y-%m-%d_%H%M%S)
FILENAME="cesizen_${DATE}.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "[db-backup] Dump de la base via le conteneur ${CONTAINER}..."
docker exec "$CONTAINER" pg_dump -U "${POSTGRES_USER:-postgres}" "${POSTGRES_DB:-cesizen}" \
  | gzip > "${BACKUP_DIR}/${FILENAME}"

echo "[db-backup] Sauvegarde ecrite : ${BACKUP_DIR}/${FILENAME} ($(du -h "${BACKUP_DIR}/${FILENAME}" | cut -f1))"

echo "[db-backup] Nettoyage des sauvegardes de plus de ${RETENTION_DAYS} jours..."
find "$BACKUP_DIR" -name "cesizen_*.sql.gz" -type f -mtime "+${RETENTION_DAYS}" -print -delete

echo "[db-backup] Termine."
