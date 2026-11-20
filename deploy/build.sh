#!/bin/bash
set -euo pipefail
ORIGINALS=(--exclude '/storage/app/private/media-originals/*' --exclude '/database/seeders/assets')
for arg in "$@"; do
    case "$arg" in
        --with-originals) ORIGINALS=() ;;
        *) echo "Unknown option: $arg" >&2; exit 1 ;;
    esac
done
PKG="$(cd "$(dirname "$0")" && pwd)"
PROJECT="$(dirname "$PKG")"
PHP83=/opt/homebrew/opt/php@8.3/bin/php
OUT="$PROJECT/namtech-bluehost.zip"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
STAGE="$WORK/namtech"
mkdir -p "$STAGE/database"

LIVE_ENV="${BLUEHOST_ENV:-$PKG/bluehost.env}"
[ -f "$LIVE_ENV" ] || { cp "$PKG/bluehost/env.template" "$LIVE_ENV"; chmod 600 "$LIVE_ENV"; }
grep -q '^APP_KEY=base64:' "$LIVE_ENV" || { echo "APP_KEY is missing in deploy/bluehost.env." >&2; exit 1; }
missing=""
grep -q '^APP_URL=https://www.example.com' "$LIVE_ENV" && missing="$missing APP_URL"
grep -q '^DB_DATABASE=fill_in' "$LIVE_ENV" && missing="$missing DB_DATABASE"
grep -q '^DB_USERNAME=fill_in' "$LIVE_ENV" && missing="$missing DB_USERNAME"
grep -q '^DB_PASSWORD=.' "$LIVE_ENV" || missing="$missing DB_PASSWORD"
LIVE_ENV_NAME=.env
if [ -n "$missing" ]; then
    LIVE_ENV_NAME=.env.live
    echo "  Note:$missing not filled in deploy/bluehost.env: fill them in backend/.env on the server after the first upload."
fi
KEEP_LIVE=(enquiries job_applications newsletter_subscribers)

echo "▸ Building the design"
(cd "$PROJECT/frontend" && npm run build >/dev/null 2>&1)

echo "▸ Copying files"
rsync -a --exclude node_modules --exclude .DS_Store --exclude dist "$PROJECT/frontend/" "$STAGE/frontend/"
rsync -a --exclude .env --exclude '.env.*.local' --exclude .env.testing --exclude vendor --exclude node_modules \
    --exclude .DS_Store --exclude .phpunit.result.cache --exclude .phpunit.cache \
    --exclude '/storage/logs/*.log' --exclude '/storage/framework/cache/data/*' --exclude '/storage/framework/sessions/*' \
    --exclude '/storage/framework/views/*' --exclude '/bootstrap/cache/*.php' --exclude '/public/storage' --exclude '/public/hot' \
    --exclude '*.map' \
    --exclude '/storage/app/private/livewire-tmp' --exclude '/storage/framework/testing' \
    ${ORIGINALS[@]+"${ORIGINALS[@]}"} "$PROJECT/backend/" "$STAGE/backend/"

echo "▸ Installing production PHP packages with PHP 8.3"
(cd "$STAGE/backend" && "$PHP83" "$(command -v composer)" install --no-dev --optimize-autoloader --no-interaction --quiet)

echo "▸ Exporting the database"
env_get() { grep -E "^$1=" "$PROJECT/backend/.env" | head -1 | cut -d= -f2- | sed -e 's/^"//' -e 's/"$//'; }
DB="$(env_get DB_DATABASE)"
export MYSQL_PWD="$(env_get DB_PASSWORD)"
CONN=(-h "$(env_get DB_HOST)" -P "$(env_get DB_PORT)" -u "$(env_get DB_USERNAME)")
SKIP=(cache cache_locks sessions jobs job_batches failed_jobs password_reset_tokens)
IGNORE=(); for t in "${SKIP[@]}" ${KEEP_LIVE[@]+"${KEEP_LIVE[@]}"}; do IGNORE+=("--ignore-table=$DB.$t"); done
SQL="$STAGE/database/namtech.sql"
EXIST=(); for t in "${SKIP[@]}"; do
    if mysql "${CONN[@]}" -N -e "SHOW TABLES LIKE '$t'" "$DB" | grep -q .; then EXIST+=("$t"); fi
done
{
    echo 'SET NAMES utf8mb4; SET FOREIGN_KEY_CHECKS=0;'
    mysqldump "${CONN[@]}" --single-transaction --set-gtid-purged=OFF --no-tablespaces --skip-comments --skip-add-locks --default-character-set=utf8mb4 "${IGNORE[@]}" "$DB"
    mysqldump "${CONN[@]}" --single-transaction --set-gtid-purged=OFF --no-data --no-tablespaces --skip-comments --skip-add-locks --default-character-set=utf8mb4 "$DB" "${EXIST[@]}"
    if [ ${#KEEP_LIVE[@]} -gt 0 ]; then
        mysqldump "${CONN[@]}" --single-transaction --set-gtid-purged=OFF --no-data --no-tablespaces --skip-comments --skip-add-drop-table --default-character-set=utf8mb4 "$DB" "${KEEP_LIVE[@]}" \
            | sed 's/^CREATE TABLE `/CREATE TABLE IF NOT EXISTS `/'
    fi
    echo 'SET FOREIGN_KEY_CHECKS=1;'
} > "$SQL"
sed -i '' -E "s#/\*!800[0-9]{2} DEFAULT ENCRYPTION='N' \*/##g" "$SQL"
unset MYSQL_PWD

echo "▸ Removing old build files"
python3 -I - "$STAGE/backend/public/build" <<'PY'
import json, os, sys
build = sys.argv[1]
keep = set()
for entry in json.load(open(f'{build}/manifest.json')).values():
    keep.add(entry['file'])
    keep.update(entry.get('css', []))
    keep.update(entry.get('assets', []))
for name in os.listdir(f'{build}/assets'):
    if f'assets/{name}' not in keep:
        os.remove(f'{build}/assets/{name}')
PY

echo "▸ Preparing for Bluehost (extracted straight into public_html)"
cp "$LIVE_ENV" "$STAGE/backend/$LIVE_ENV_NAME"
cp "$PKG/bluehost/htaccess" "$STAGE/.htaccess"
cp "$PKG/bluehost/README.md" "$STAGE/README-BLUEHOST.md"
rm -rf "$STAGE/backend/bootstrap/ssr"
date -u +%Y%m%d-%H%M%S > "$STAGE/backend/release.txt"

echo "▸ Zipping"
rm -f "$OUT"
(cd "$STAGE" && zip -qry -9 "$OUT" .)
ls -lh "$OUT"
