#!/bin/bash
set -euo pipefail
PKG="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$PKG/bluehost.env"
[ -f "$ENV_FILE" ] || { cp "$PKG/bluehost/env.template" "$ENV_FILE"; chmod 600 "$ENV_FILE"; }

current() { grep -E "^$1=" "$ENV_FILE" | head -1 | cut -d= -f2-; }

read -r -p "Live address, e.g. https://www.namtech.ac [$(current APP_URL)]: " APP_URL_IN
read -r -p "Database name, e.g. abcd_namtech [$(current DB_DATABASE)]: " DB_DATABASE_IN
read -r -p "Database user, e.g. abcd_namtech [$(current DB_USERNAME)]: " DB_USERNAME_IN
read -r -s -p "Database password (hidden; Enter keeps the saved one): " DB_PASSWORD_IN
echo

export APP_URL_IN DB_DATABASE_IN DB_USERNAME_IN DB_PASSWORD_IN
python3 -I - "$ENV_FILE" <<'PY'
import os, re, sys
path = sys.argv[1]
values = {
    'APP_URL': os.environ['APP_URL_IN'].strip().rstrip('/'),
    'DB_DATABASE': os.environ['DB_DATABASE_IN'].strip(),
    'DB_USERNAME': os.environ['DB_USERNAME_IN'].strip(),
    'DB_PASSWORD': os.environ['DB_PASSWORD_IN'],
}
if values['APP_URL'] and not values['APP_URL'].startswith('https://'):
    sys.exit('The live address must start with https://')
text = open(path).read()
for key, value in values.items():
    if not value:
        continue
    if key == 'DB_PASSWORD':
        value = '"' + value.replace('\\', '\\\\').replace('"', '\\"') + '"'
    text = re.sub(rf'^{key}=.*$', lambda m: f'{key}={value}', text, count=1, flags=re.M)
open(path, 'w').write(text)
print('Saved deploy/bluehost.env')
PY
unset DB_PASSWORD_IN

bash "$PKG/build.sh"
