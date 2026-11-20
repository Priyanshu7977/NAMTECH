# NAMTECH website on Bluehost

The zip holds everything: the website (`backend/`, with its settings in `backend/.env`, PHP packages and the built
design), the website content (`database/namtech.sql`), the uploaded images, and the design source (`frontend/`).
It is extracted straight into `public_html`; `public_html/.htaccess` serves the site from `backend/public` and keeps
every other file private.

## First time (once)

1. **Database.** cPanel → *MySQL Databases*: create a database and a user, and add the user to the database with
   *ALL PRIVILEGES*. Either put the names, password and live address in `deploy/bluehost.env` on the Mac before
   building (`bash deploy/bluehost/configure.sh` asks for them), or, if the zip was built without them, open
   `public_html/backend/.env` in File Manager after the first upload, fill in `APP_URL`, `DB_DATABASE`,
   `DB_USERNAME` and `DB_PASSWORD`, save and reload the site. Later uploads keep that file.
2. **PHP 8.3.** cPanel → *MultiPHP Manager*: set the domain to **PHP 8.3**.
   cPanel → *Select PHP Version* → *Extensions* (if shown): `pdo_mysql`, `mbstring`, `gd`, `fileinfo`, `intl`, `zip` on.
3. **HTTPS.** cPanel → *SSL/TLS Status*: the domain should have a certificate (Bluehost issues one for free).
4. **Clear public_html.** Move anything already in `public_html` (old site, `index.html`) into a backup folder.

## Every release (and the first one)

1. On the Mac: `bash deploy/build.sh` → `namtech-bluehost.zip` in the project folder.
2. cPanel → *File Manager* → `public_html` → *Upload* the zip.
3. Select the zip → *Extract* → into `/public_html`, overwriting existing files. Then delete the zip.
4. Open the website. The first visit applies the release: it loads the content from `database/namtech.sql`, updates
   the database and clears the caches (10–60 seconds; visitors meanwhile see "The website is being updated").

The content in the zip **replaces** the live content. Make CMS changes on the Mac's site, not on the live `/admin`,
or they are lost at the next release. Enquiries, job applications and newsletter sign-ups made on the live site are
kept.

## Optional: scheduled publishing

Posts with a future publish date go live by themselves only with a cron job. cPanel → *Cron Jobs* → *Once Per
Minute*, command (replace `USERNAME` with the cPanel user name):

```
cd /home/USERNAME/public_html/backend && /opt/cpanel/ea-php83/root/usr/bin/php artisan schedule:run >/dev/null 2>&1
```

## Troubleshooting

| Problem | Fix |
|---|---|
| "The update could not be applied" | Read `public_html/backend/storage/logs/deploy.log`. Usually the database details in `backend/.env`. Fix them in File Manager (*Edit*) and reload. |
| "500 Server Error" | The newest file in `public_html/backend/storage/logs/`. |
| Blank page or a PHP version error | MultiPHP Manager: PHP 8.3 again. |
| "419 Page expired" at sign-in | `APP_URL` must match the address in the browser exactly (https, with or without www). |
| Images missing | Delete `public_html/backend/storage/app/deployed-release` and reload: the release is applied again. |
