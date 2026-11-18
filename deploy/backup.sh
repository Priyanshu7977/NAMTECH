#!/bin/bash
# Encrypted archive of the database and uploaded media, kept for 14 days. Runs nightly from cron:
#
#   sudo bash deploy/backup.sh
set -euo pipefail
umask 077

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/namtech}"
KEY_FILE="${KEY_FILE:-/etc/namtech/backup.key}"
ENV_FILE="$ROOT/backend/.env"

read_env() { grep -E "^$1=" "$ENV_FILE" | head -1 | cut -d= -f2- | sed -e 's/^"//' -e 's/"$//'; }

[ -f "$KEY_FILE" ] || { echo "Backup key not found: $KEY_FILE" >&2; exit 1; }
mkdir -p "$BACKUP_DIR"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

MYSQL_PWD="$(read_env DB_PASSWORD)" mysqldump -h "$(read_env DB_HOST)" -P "$(read_env DB_PORT)" -u "$(read_env DB_USERNAME)" \
    --single-transaction --no-tablespaces --set-gtid-purged=OFF "$(read_env DB_DATABASE)" > "$WORK/namtech.sql"

ARCHIVE="$BACKUP_DIR/namtech-$(date +%Y%m%d-%H%M%S).tar.gz.enc"
tar -czf - -C "$WORK" namtech.sql -C "$ROOT/backend/storage" app \
    | openssl enc -aes-256-cbc -pbkdf2 -salt -pass "file:$KEY_FILE" -out "$ARCHIVE"

find "$BACKUP_DIR" -name 'namtech-*.tar.gz.enc' -mtime +14 -delete
echo "Backup saved: $ARCHIVE"
