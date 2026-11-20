#!/bin/sh
set -e

mkdir -p storage/app/public storage/app/private storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache database
chmod -R 777 storage bootstrap/cache database

if [ ! -f database/database.sqlite ]; then
    touch database/database.sqlite
    chmod 666 database/database.sqlite
fi

if [ ! -f .env ]; then
    cp .env.example .env
fi

if ! grep -q '^APP_KEY=base64:' .env 2>/dev/null; then
    php artisan key:generate --force
fi

if [ -n "$RAILWAY_PUBLIC_DOMAIN" ]; then
    sed -i "s|^APP_URL=.*|APP_URL=https://$RAILWAY_PUBLIC_DOMAIN|" .env
elif [ -n "$RAILWAY_STATIC_URL" ]; then
    sed -i "s|^APP_URL=.*|APP_URL=https://$RAILWAY_STATIC_URL|" .env
fi

php artisan storage:link --force 2>/dev/null || true

echo 'Running database migrations...'
php artisan migrate --force 2>/dev/null || true

TABLE_COUNT=$(php artisan tinker --execute="echo \App\Models\Page::count();" 2>/dev/null || echo "0")
if [ "$TABLE_COUNT" = "0" ] || [ -z "$TABLE_COUNT" ]; then
    echo 'Seeding database...'
    php artisan db:seed --force 2>/dev/null || true
fi

PORT="${PORT:-8080}"
echo "Starting NAMTech application on 0.0.0.0:$PORT..."
export PHP_CLI_SERVER_WORKERS=4
exec php artisan serve --host=0.0.0.0 --port="$PORT"
