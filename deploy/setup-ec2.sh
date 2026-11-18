#!/bin/bash
# One-time setup of the NAMTECH website on a new AWS EC2 instance running Ubuntu 24.04.
# Point the domain's DNS at the instance first, then run from the unzipped namtech folder:
#
#   sudo bash deploy/setup-ec2.sh yourdomain.com you@yourdomain.com
#
# Installs Nginx, PHP 8.3, MySQL, Node.js and Supervisor, creates the database, loads the website
# content, starts the background processes, schedules backups and turns on HTTPS.
# Safe to run again: existing settings are kept and the content is only imported the first time.
set -euo pipefail

say() { printf '\n\033[1;35m▸ %s\033[0m\n' "$1"; }
fail() { printf '\n\033[1;31m✗ %s\033[0m\n' "$1"; exit 1; }

DOMAIN="${1:-}"
EMAIL="${2:-}"
[ -n "$DOMAIN" ] && [ -n "$EMAIL" ] || fail "Usage: sudo bash deploy/setup-ec2.sh yourdomain.com you@yourdomain.com"
[[ "$DOMAIN" =~ ^[A-Za-z0-9.-]+\.[A-Za-z]{2,}$ ]] || fail "Enter only the domain, without https:// (for example namtech.ac)."
[ "$(id -u)" -eq 0 ] || fail "Run with sudo."
. /etc/os-release
[ "${ID:-}" = ubuntu ] && [ "${VERSION_ID:-}" = 24.04 ] || fail "This script is for Ubuntu 24.04 (found ${PRETTY_NAME:-unknown})."

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/backend/.env"
PUBLIC_DIR="$ROOT/backend/public"
case "$DOMAIN" in
    www.*) OTHER_HOST="${DOMAIN#www.}" ;;
    *) OTHER_HOST="www.$DOMAIN" ;;
esac

set_env() { # key value: replaces the line in .env
    local value="${2//&/\\&}"
    sed -i "s|^$1=.*|$1=$value|" "$ENV_FILE"
}

# Small instances run out of memory with MySQL on the same machine.
memory_mb="$(awk '/MemTotal/ {print int($2 / 1024)}' /proc/meminfo)"
if [ "$memory_mb" -lt 3500 ] && ! swapon --show | grep -q .; then
    say "Adding 2 GB of swap"
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile >/dev/null
    swapon /swapfile
    grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

say "Installing Nginx, PHP 8.3, MySQL, Node.js and Supervisor"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq curl ca-certificates >/dev/null
# Ubuntu 24.04 ships Node.js 18; the page renderer needs 22 or newer.
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 22 ]; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - >/dev/null
fi
apt-get install -y -qq nginx mysql-server supervisor nodejs unzip certbot python3-certbot-nginx \
    php8.3-fpm php8.3-cli php8.3-mysql php8.3-mbstring php8.3-xml php8.3-curl php8.3-gd php8.3-intl php8.3-zip >/dev/null
systemctl enable --now mysql nginx php8.3-fpm supervisor >/dev/null

# Must allow the CMS upload limit (MEDIA_MAX_UPLOAD_KB in .env).
cat > /etc/php/8.3/fpm/conf.d/99-namtech.ini <<'INI'
upload_max_filesize = 12M
post_max_size = 14M
memory_limit = 256M
expose_php = Off
INI
systemctl restart php8.3-fpm

if [ ! -f "$ENV_FILE" ]; then
    say "Creating the database and backend/.env"
    db_password="$(openssl rand -hex 24)"
    cp "$ROOT/deploy/env.example" "$ENV_FILE"
    set_env DB_PASSWORD "$db_password"
    mysql <<SQL
CREATE DATABASE IF NOT EXISTS namtech CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'namtech'@'localhost' IDENTIFIED BY '$db_password';
ALTER USER 'namtech'@'localhost' IDENTIFIED BY '$db_password';
GRANT ALL PRIVILEGES ON namtech.* TO 'namtech'@'localhost';
FLUSH PRIVILEGES;
SQL
fi
set_env APP_URL "https://$DOMAIN"
chown root:www-data "$ENV_FILE"
chmod 640 "$ENV_FILE"

say "Installing the website"
# The content is only loaded into an empty database, so running this again never overwrites live edits.
if mysql -N -e 'SELECT 1 FROM namtech.pages LIMIT 1' >/dev/null 2>&1; then
    bash "$ROOT/deploy/install.sh"
else
    bash "$ROOT/deploy/install.sh" --import-db
fi
chown -R www-data:www-data "$ROOT/backend/storage" "$ROOT/backend/bootstrap/cache"

say "Configuring Nginx"
# Certbot adds the HTTPS parts to this file, so it is only written once.
SITE=/etc/nginx/sites-available/namtech
if [ ! -f "$SITE" ]; then
    cat > "$SITE" <<NGINX
server {
    listen 80;
    server_name $DOMAIN $OTHER_HOST;
    root $PUBLIC_DIR;
    index index.php;
    client_max_body_size 20m;

    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }
    location ~ \.php\$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
    }
    location ~ /\.(?!well-known) {
        deny all;
    }
}
NGINX
    ln -sf "$SITE" /etc/nginx/sites-enabled/namtech
    rm -f /etc/nginx/sites-enabled/default
fi
nginx -t
systemctl reload nginx

say "Starting queue workers and page rendering"
sed "s|__ROOT__|$ROOT|g" "$ROOT/deploy/supervisor.conf" > /etc/supervisor/conf.d/namtech.conf
supervisorctl reread >/dev/null
supervisorctl update >/dev/null
supervisorctl restart 'namtech-queue:*' namtech-ssr >/dev/null
systemctl restart php8.3-fpm

say "Scheduling background jobs and nightly backups"
echo "* * * * * cd $ROOT/backend && php artisan schedule:run >> /dev/null 2>&1" | crontab -u www-data -
mkdir -p /etc/namtech
if [ ! -f /etc/namtech/backup.key ]; then
    (umask 077 && openssl rand -hex 32 > /etc/namtech/backup.key)
fi
echo "30 2 * * * root bash $ROOT/deploy/backup.sh >> /var/log/namtech-backup.log 2>&1" > /etc/cron.d/namtech-backup

say "Turning on HTTPS"
hosts=(-d "$DOMAIN")
if getent hosts "$OTHER_HOST" >/dev/null; then hosts+=(-d "$OTHER_HOST"); fi
if ! certbot --nginx --non-interactive --agree-tos --redirect --email "$EMAIL" "${hosts[@]}"; then
    fail "HTTPS could not be set up. Check that $DOMAIN points to this server and ports 80 and 443 are open in the security group, then run this command again."
fi

say "Done"
cat <<NEXT
  Website:  https://$DOMAIN
  CMS:      https://$DOMAIN/admin

Still to do (see README.md):
  1. Add the mail settings (MAIL_*) to $ENV_FILE, then run: sudo bash deploy/update.sh
  2. Replace the development CMS accounts.
  3. Copy /etc/namtech/backup.key somewhere safe: backups can't be restored without it.
NEXT
