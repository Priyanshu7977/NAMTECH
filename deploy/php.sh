# Finds PHP 8.3 or newer (cPanel keeps each version under /opt/cpanel). Set PHP=/path/to/php to choose one.
if [ -z "${PHP:-}" ]; then
    PHP=php
    if ! php -r 'exit(PHP_VERSION_ID >= 80300 ? 0 : 1);' 2>/dev/null; then
        for candidate in /opt/cpanel/ea-php83/root/usr/bin/php /opt/cpanel/ea-php84/root/usr/bin/php /opt/cpanel/ea-php85/root/usr/bin/php \
            /usr/local/bin/php83 /usr/bin/php8.3 /usr/bin/php8.4 /usr/bin/php8.5; do
            if [ -x "$candidate" ]; then PHP="$candidate"; break; fi
        done
    fi
fi
