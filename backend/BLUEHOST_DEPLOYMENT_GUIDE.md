# NAMTECH Website - Bluehost / cPanel Deployment Guide

This package contains the fully upgraded, production-ready website with:
- All React frontend assets pre-compiled in `public/build/`
- All 104 image variants (AVIF, WebP, JPG) in `public/storage/media/`
- Full database with all 46 pages, 295 sections, 34 faculty members, and programs pre-loaded in `database/database.sqlite` (and `database/namtech_mysql.sql`)
- Production PHP vendor dependencies pre-installed in `vendor/`

---

## Method 1: Easiest 2-Minute Deployment (Zero Configuration)

Bluehost and cPanel support PHP 8.2 / 8.3 with SQLite enabled by default. You can deploy in 3 steps:

1. **Log into Bluehost cPanel** → Open **File Manager**.
2. Navigate to your website folder (usually `public_html/` or a subdomain folder like `public_html/namtech/`).
3. Click **Upload** → upload this ZIP file → right click on the uploaded zip and click **Extract**.
4. In your browser, open your website URL (e.g. `https://yourdomain.com`).
   - The website will load immediately with all pages, images, and animations!
   - CMS Admin login is at `https://yourdomain.com/admin`.

---

## Method 2: If Using MySQL Database via cPanel / phpMyAdmin

If you prefer to use a standard MySQL database instead of SQLite:

1. **Create Database in Bluehost cPanel**:
   - Go to **MySQL Databases** → Create a new database (e.g. `yourcpanel_namtech`).
   - Create a user (e.g. `yourcpanel_dbuser`) with a password.
   - Add the user to the database with **All Privileges**.
2. **Import SQL**:
   - Go to **phpMyAdmin** → Select `yourcpanel_namtech` → Click **Import**.
   - Choose `database/namtech_mysql.sql` from this package and click **Go**.
3. **Update `.env`**:
   - Open File Manager → edit `.env`:
   ```ini
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=yourcpanel_namtech
   DB_USERNAME=yourcpanel_dbuser
   DB_PASSWORD=your_db_password
   ```
4. Save the file. Your site is now running on MySQL!

---

## Important Settings in `.env`

- `APP_URL=https://yourdomain.com` (Set this to your live domain)
- `APP_DEBUG=false` (Keep false in production for speed and security)
- `QUEUE_CONNECTION=sync` (Already configured for shared hosting)

---

## Admin CMS Credentials

- **URL:** `https://yourdomain.com/admin`
- Default administrator accounts are included in the database.
