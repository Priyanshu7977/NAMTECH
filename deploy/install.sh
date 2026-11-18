#!/bin/bash
# First-time setup of the NAMTECH website. Run from the namtech folder (the one holding backend/ and deploy/):
#
#   bash deploy/install.sh               # check the server, prepare folders and settings
#   bash deploy/install.sh --import-db   # also load database/namtech.sql (first install only: replaces the content)
#
# Safe to run more than once.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/backend"

say() { printf '\n\033[1;35m▸ %s\033[0m\n' "$1"; }
fail() { printf '\n\033[1;31m✗ %s\033[0m\n' "$1"; exit 1; }

source "$ROOT/deploy/php.sh"
say "Checking PHP ($PHP)"
command -v "$PHP" >/dev/null || fail "PHP not found. Install PHP 8.3 or newer."
"$PHP" -r 'exit(PHP_VERSION_ID >= 80300 ? 0 : 1);' \
    || fail "PHP 8.3 or newer is needed (found $("$PHP" -r 'echo PHP_VERSION;')). Select PHP 8.3 for the domain, or run with PHP=/path/to/php8.3."
echo "PHP $("$PHP" -r 'echo PHP_VERSION;')"

modules="$("$PHP" -m)"
missing=""
for ext in pdo_mysql mbstring openssl fileinfo gd tokenizer xml ctype curl dom; do
    grep -qix "$ext" <<<"$modules" || missing="$missing $ext"
done
[ -z "$missing" ] || fail "Missing PHP extensions:$missing. cPanel: Select PHP Version → Extensions. Ubuntu: sudo apt install php8.3-mysql php8.3-mbstring php8.3-gd php8.3-xml php8.3-curl"

say "Checking backend/.env"
if [ ! -f .env ]; then
    cp ../deploy/env.example .env
    chmod 640 .env
    fail "Created backend/.env from deploy/env.example.
  Edit it now (APP_URL, DB_*, MAIL_*), then run this script again."
fi
grep -q '^DB_PASSWORD=.\+' .env || fail "DB_PASSWORD is empty in backend/.env. Fill in the database details first."
grep -q '^APP_URL=https://www.example.com' .env && fail "APP_URL in backend/.env is still the example. Set your live address."

if ! grep -q '^APP_KEY=base64:' .env; then
    "$PHP" artisan key:generate --force
fi

say "Preparing storage folders"
mkdir -p storage/app/public storage/app/private storage/framework/cache/data storage/framework/sessions \
    storage/framework/views storage/logs bootstrap/cache
chmod -R ug+rwX storage bootstrap/cache

say "Linking public/storage → storage/app/public (uploaded images)"
if [ -L public/storage ]; then echo "Link already exists."; else "$PHP" artisan storage:link; fi

read_env() { grep -E "^$1=" .env | head -1 | cut -d= -f2- | sed -e 's/^"//' -e 's/"$//'; }
if [ "${1:-}" = "--import-db" ]; then
    [ -f ../database/namtech.sql ] || fail "database/namtech.sql not found."
    command -v mysql >/dev/null || fail "The mysql command is not available. Import database/namtech.sql in phpMyAdmin, then run this script without --import-db."
    say "Importing database/namtech.sql into $(read_env DB_DATABASE)"
    MYSQL_PWD="$(read_env DB_PASSWORD)" mysql -h "$(read_env DB_HOST)" -P "$(read_env DB_PORT)" \
        -u "$(read_env DB_USERNAME)" "$(read_env DB_DATABASE)" < ../database/namtech.sql
fi

say "Running database updates"
"$PHP" artisan migrate --force

say "Optimising"
"$PHP" artisan optimize:clear >/dev/null
"$PHP" artisan optimize

say "Done"
cat <<NEXT
  Open $(read_env APP_URL) and $(read_env APP_URL)/admin
NEXT
