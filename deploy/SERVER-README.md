# NAMTECH website: AWS EC2 package (PHP 8.3)

```
namtech/
├── backend/     the website (Laravel, PHP). The web root is backend/public
├── frontend/    React source, only needed to change and rebuild the design
├── deploy/      setup-ec2.sh, install.sh, update.sh, backup.sh, restore.sh, supervisor.conf, env.example
├── database/    namtech.sql: all website content
└── README.md
```

Everything is built: PHP packages are in `backend/vendor` and the design is compiled in `backend/public/build`.
The setup script installs everything the server runs: Nginx, PHP 8.3, MySQL 8, Node.js 22 and Supervisor.

## 1. Create the server (AWS console → EC2)

| Setting | Value |
|---|---|
| Image | **Ubuntu Server 24.04 LTS** (x86 or Arm) |
| Instance type | `t3.small` or larger |
| Storage | 20 GB or more, gp3 |
| Key pair | Create one and keep the `.pem` file safe |

**Security group (inbound rules):**

| Port | Source | Purpose |
|---|---|---|
| 22 (SSH) | My IP | Server access |
| 80 (HTTP) | Anywhere | Website, HTTPS certificate |
| 443 (HTTPS) | Anywhere | Website |

Do not open port 3306: the database is only used from inside the server.

## 2. Point the domain at the server

1. EC2 → **Elastic IPs** → *Allocate*, then *Associate* it with the instance, so the address never changes.
2. At your DNS provider (or Route 53), add two `A` records pointing to the Elastic IP: `yourdomain.com` and `www.yourdomain.com`.
3. Wait until `ping yourdomain.com` shows the Elastic IP. HTTPS setup fails until it does.

## 3. Upload and install

Run this on **your own computer**, in the folder holding the zip and the key. Replace the key name and address:

```bash
scp -i your-key.pem namtech-aws-ec2-php83.zip ubuntu@YOUR_ELASTIC_IP:/tmp/
```

```bash
ssh -i your-key.pem ubuntu@YOUR_ELASTIC_IP
```

Then **on the server** (after `ssh`), replacing the domain and email:

```bash
sudo apt-get update && sudo apt-get install -y unzip
sudo mkdir -p /var/www && cd /var/www && sudo unzip -q /tmp/namtech-aws-ec2-php83.zip
cd /var/www/namtech && sudo bash deploy/setup-ec2.sh yourdomain.com you@yourdomain.com
```

The script installs the server software, creates the database with a random password, loads the content,
starts two queue workers and the page renderer under Supervisor, schedules jobs and nightly backups, and
turns on HTTPS. The email is for certificate expiry notices.

## 4. Set up email

Enquiry notifications need an SMTP account. EC2 blocks outgoing port 25, so use port 465 or 587:
**Amazon SES** (SES → *SMTP settings*; new accounts start in a sandbox until you request production access)
or your existing mail provider.

```bash
sudo nano /var/www/namtech/backend/.env
```

Set `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM_ADDRESS` (for port 587, set `MAIL_SCHEME=smtp`) and
`NAMTECH_ENQUIRY_RECIPIENTS`, then:

```bash
cd /var/www/namtech && sudo bash deploy/update.sh
```

## 5. Check

- `https://yourdomain.com` shows the homepage with images.
- `https://yourdomain.com/admin` shows the CMS sign-in.
- Send a test enquiry from the Contact page and check that the email arrives.

## 6. Secure the CMS

The database contains the CMS accounts from the development site. Sign in at `/admin`, set up two-factor
sign-in (scan the QR code with an authenticator app), create the real accounts under *Administrators*,
then delete the development accounts (e.g. `admin@namtech.test`).

## Backups

An encrypted backup of the database and uploaded images runs every night at 02:30 (server time) and is kept
for 14 days in `/var/backups/namtech`. **Copy `/etc/namtech/backup.key` somewhere safe**: backups can't be restored without it.

These backups are on the same disk as the website, so also turn on daily disk snapshots: EC2 → *Lifecycle Manager* →
*Create lifecycle policy* for the instance's volume.

To restore: `sudo bash deploy/restore.sh /var/backups/namtech/BACKUP_FILE`

## Updating later

Upload the newer zip to `/tmp` as in step 3, then on the server:

```bash
cd /var/www && sudo unzip -oq /tmp/namtech-aws-ec2-php83.zip && cd namtech && sudo bash deploy/update.sh
```

This keeps `backend/.env`, the database content and uploaded images. Database updates run automatically, the
workers and page renderer restart, and it finishes with `content:launch-check`, which lists content still to finish.

## Behind a load balancer or CloudFront

Set `TRUSTED_PROXIES=*` in `backend/.env`, then run `sudo bash deploy/update.sh`.
Do this only if the instance can't be reached directly from the internet (limit ports 80 and 443 to the load balancer).

## Troubleshooting

| Problem | Fix |
|---|---|
| "HTTPS could not be set up" | DNS isn't pointing to the Elastic IP yet, or ports 80/443 are closed. Fix it and run the `setup-ec2.sh` command again. |
| "500 Server Error" | Read the newest file in `backend/storage/logs/`. After editing `.env`, run `sudo bash deploy/update.sh`. |
| "Permission denied" | `sudo chown -R www-data:www-data backend/storage backend/bootstrap/cache` |
| Images missing | `sudo bash deploy/install.sh`, then the `chown` command above. |
| Emails not arriving, uploads stay "processing" | Check the mail settings and `sudo supervisorctl status` (all should say RUNNING). Logs: `/var/log/supervisor/`. |
| Pages work but "View source" shows no content | The page renderer is down: `sudo supervisorctl restart namtech-ssr` |
| "419 Page expired" at sign-in | `APP_URL` must match the browser address exactly (https, with or without www). |
