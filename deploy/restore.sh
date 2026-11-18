#!/bin/bash
# Restores a backup made by deploy/backup.sh. This replaces the current database and uploaded media:
#
#   sudo bash deploy/restore.sh /var/backups/namtech/namtech-20261102-023000.tar.gz.enc
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
KEY_FILE="${KEY_FILE:-/etc/namtech/backup.key}"
ENV_FILE="$ROOT/backend/.env"
ARCHIVE="${1:-}"

read_env() { grep -E "^$1=" "$ENV_FILE" | head -1 | cut -d= -f2- | sed -e 's/^"//' -e 's/"$//'; }

[ -f "$ARCHIVE" ] || { echo "Usage: sudo bash deploy/restore.sh /path/to/backup.tar.gz.enc" >&2; exit 1; }
if [ "${FORCE:-}" != yes ]; then
    read -r -p "This replaces the live database and uploaded media. Type yes to continue: " answer
    [ "$answer" = yes ] || exit 1
fi

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
openssl enc -d -aes-256-cbc -pbkdf2 -pass "file:$KEY_FILE" -in "$ARCHIVE" | tar -xzf - -C "$WORK"

MYSQL_PWD="$(read_env DB_PASSWORD)" mysql -h "$(read_env DB_HOST)" -P "$(read_env DB_PORT)" -u "$(read_env DB_USERNAME)" \
    "$(read_env DB_DATABASE)" < "$WORK/namtech.sql"
rm -rf "$ROOT/backend/storage/app"
mv "$WORK/app" "$ROOT/backend/storage/app"

bash "$ROOT/deploy/update.sh"
echo "Restored from $ARCHIVE"
