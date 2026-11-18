#!/bin/bash
# Builds namtech-aws-ec2-php83.zip in the project root, on a Mac with PHP 8.3 from Homebrew. Includes a fresh
# database export and the website's image sizes and PDFs:
#
#   bash deploy/build.sh                    # smaller zip (recommended)
#   bash deploy/build.sh --with-originals   # also the full-size original of every uploaded image
#
# The originals (storage/app/private/media-originals) are only read once, when an image is uploaded, to make the
# sizes the site shows, so the site works without them; they stay on this Mac. The seeder images
# (database/seeders/assets) are only for building a demo database and are never used on the server.
set -euo pipefail
ORIGINALS=(--exclude '/storage/app/private/media-originals/*' --exclude '/database/seeders/assets')
[ "${1:-}" = "--with-originals" ] && ORIGINALS=()
PKG="$(cd "$(dirname "$0")" && pwd)"
PROJECT="$(dirname "$PKG")"
PHP83=/opt/homebrew/opt/php@8.3/bin/php
OUT="$PROJECT/namtech-aws-ec2-php83.zip"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
STAGE="$WORK/namtech"
mkdir -p "$STAGE/database" "$STAGE/deploy"

echo "▸ Building the design"
(cd "$PROJECT/frontend" && npm run build >/dev/null 2>&1)

echo "▸ Copying files"
rsync -a --exclude node_modules --exclude .DS_Store --exclude dist "$PROJECT/frontend/" "$STAGE/frontend/"
rsync -a --exclude .env --exclude '.env.*.local' --exclude .env.testing --exclude vendor --exclude node_modules \
    --exclude .DS_Store --exclude .phpunit.result.cache --exclude .phpunit.cache --exclude '.claude' --exclude CLAUDE.md --exclude AGENTS.md --exclude boost.json \
    --exclude '/storage/logs/*.log' --exclude '/storage/framework/cache/data/*' --exclude '/storage/framework/sessions/*' \
    --exclude '/storage/framework/views/*' --exclude '/bootstrap/cache/*.php' --exclude '/public/storage' --exclude '/public/hot' \
    --exclude '*.map' \
    --exclude '/storage/app/private/livewire-tmp' --exclude '/storage/framework/testing' \
    ${ORIGINALS[@]+"${ORIGINALS[@]}"} "$PROJECT/backend/" "$STAGE/backend/"
rsync -a --exclude build.sh --exclude SERVER-README.md --exclude .DS_Store "$PKG/" "$STAGE/deploy/"
cp "$PKG/SERVER-README.md" "$STAGE/README.md"

echo "▸ Installing production PHP packages with PHP 8.3"
(cd "$STAGE/backend" && "$PHP83" "$(command -v composer)" install --no-dev --optimize-autoloader --no-interaction --quiet)

echo "▸ Exporting the database"
env_get() { grep -E "^$1=" "$PROJECT/backend/.env" | head -1 | cut -d= -f2- | sed -e 's/^"//' -e 's/"$//'; }
DB="$(env_get DB_DATABASE)"
export MYSQL_PWD="$(env_get DB_PASSWORD)"
CONN=(-h "$(env_get DB_HOST)" -P "$(env_get DB_PORT)" -u "$(env_get DB_USERNAME)")
SKIP=(cache cache_locks sessions jobs job_batches failed_jobs password_reset_tokens)
IGNORE=(); for t in "${SKIP[@]}"; do IGNORE+=("--ignore-table=$DB.$t"); done
SQL="$STAGE/database/namtech.sql"
EXIST=(); for t in "${SKIP[@]}"; do
    if mysql "${CONN[@]}" -N -e "SHOW TABLES LIKE '$t'" "$DB" | grep -q .; then EXIST+=("$t"); fi
done
{
    echo 'SET NAMES utf8mb4; SET FOREIGN_KEY_CHECKS=0;'
    mysqldump "${CONN[@]}" --single-transaction --set-gtid-purged=OFF --no-tablespaces --skip-comments --default-character-set=utf8mb4 "${IGNORE[@]}" "$DB"
    mysqldump "${CONN[@]}" --single-transaction --set-gtid-purged=OFF --no-data --no-tablespaces --skip-comments --default-character-set=utf8mb4 "$DB" "${EXIST[@]}"
    echo 'SET FOREIGN_KEY_CHECKS=1;'
} > "$SQL"
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

echo "▸ Compressing images (lossless: the pictures look exactly the same)"
if command -v jpegtran >/dev/null; then
    BEFORE=$(du -sk "$STAGE/backend/storage/app/public" | cut -f1)
    find "$STAGE/backend/storage/app/public" -type f -name '*.jpg' -print0 | xargs -0 -P 8 -n 20 sh -c '
        for f; do
            jpegtran -optimize -progressive -copy none "$f" > "$f.min" 2>/dev/null \
                && [ -s "$f.min" ] && [ "$(stat -f%z "$f.min")" -lt "$(stat -f%z "$f")" ] && mv "$f.min" "$f" || rm -f "$f.min"
        done' sh
    echo "  media: $((BEFORE / 1024)) MB → $(( $(du -sk "$STAGE/backend/storage/app/public" | cut -f1) / 1024 )) MB"
else
    echo "  skipped: install jpegtran with 'brew install jpeg-turbo'"
fi

echo "▸ Zipping"
rm -f "$OUT"
(cd "$WORK" && zip -qry -9 "$OUT" namtech)
ls -lh "$OUT"
