#!/bin/bash
# Apply an update after unzipping a newer package over the old files (keeps backend/.env and uploads).
#
#   bash deploy/update.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/backend"
source "$ROOT/deploy/php.sh"

"$PHP" artisan down --retry=30 || true
trap '"$PHP" artisan up' EXIT

"$PHP" artisan migrate --force
"$PHP" artisan optimize:clear >/dev/null
"$PHP" artisan optimize
"$PHP" artisan cache:clear        # cached pages are rebuilt with the new version
"$PHP" artisan queue:restart
"$PHP" artisan inertia:stop-ssr || true   # Supervisor starts it again with the new version

# Run with sudo on EC2: files created above must stay writable by the web server.
if [ "$(id -u)" -eq 0 ]; then chown -R www-data:www-data storage bootstrap/cache; fi

echo "Update applied. Content still needing attention before launch:"
"$PHP" artisan content:launch-check || true
