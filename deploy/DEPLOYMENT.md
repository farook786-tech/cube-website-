# Deploying the CUBE website on the CUBE server

The website and the admin panel are **one Node.js application** on one server.
Everything the admin changes, and every form a visitor submits (contact,
CEL enquiry, job application with CV), is saved on the server and shows up on
the other side within about 1–3 seconds, without reloading.

## 1. Server requirements

| Item | Requirement |
|---|---|
| Server | Linux VPS or dedicated server with SSH and sudo (Ubuntu 22.04/24.04 recommended) |
| Node.js | 20 LTS or newer (`node -v`) |
| Memory / disk | 2 GB RAM minimum, 10 GB free disk |
| Software | git, nginx, certbot, PM2 (`sudo npm i -g pm2`) |
| Domain | `cubeiitm.org` DNS pointing at the server's IP |

> Shared web hosting that only serves PHP/HTML (cPanel without Node.js) **cannot**
> run this site. It needs a server where a Node.js process can run permanently.

## 2. Install

```bash
sudo mkdir -p /var/www && cd /var/www
sudo git clone https://github.com/farook786-tech/cube-website- cube
sudo chown -R $USER:$USER cube && cd cube
npm ci
```

Create `/var/www/cube/.env.local`:

```bash
# Unique per server. Generate with:
#   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ADMIN_JWT_SECRET=<paste generated value>
# Signs the audit log. Generate a second, different value the same way.
# Keep a copy with your backups and never change it.
AUDIT_LOG_KEY=<paste another generated value>
NEXT_PUBLIC_SITE_URL=https://cubeiitm.org
# Used only if no data-store/ exists yet (first start creates this admin).
DEFAULT_ADMIN_EMAIL=admin@cubeiitm.org
DEFAULT_ADMIN_PASSWORD=<strong password, change it after first login>
```

Do **not** set `PUBLISH_TO_GITHUB` or the Supabase keys on this server.

## 3. Bring the current content over

Copy these two folders from the computer where the admin runs today into
`/var/www/cube/` (they are not in GitHub on purpose: they contain admin
accounts, enquiries and applicant CVs):

- `data-store/`  – all content, admin accounts, enquiries, applications, CVs
- `public/uploads/` – images uploaded in the admin

```bash
# example, run from the old computer
scp -r data-store public/uploads user@server:/var/www/cube/
```

## 4. Build and start

```bash
npm run build
mkdir -p logs
pm2 start deploy/ecosystem.config.cjs
pm2 save && pm2 startup     # follow the printed command: restarts after reboot
curl http://127.0.0.1:3000/api/health    # -> {"status":"ok",...}
```

Run **one** instance only (already set in the PM2 file).

## 5. nginx + HTTPS

```bash
sudo cp deploy/nginx-cubeiitm.org.conf /etc/nginx/sites-available/cubeiitm.org
sudo ln -s /etc/nginx/sites-available/cubeiitm.org /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d cubeiitm.org -d www.cubeiitm.org
```

The config already handles the live-update stream (no buffering), 10 MB
uploads/CVs, and HTTPS headers the admin login needs.

## 6. Backups (daily)

```bash
chmod +x deploy/backup.sh
crontab -e
# add:
30 2 * * * /var/www/cube/deploy/backup.sh >> /var/www/cube/logs/backup.log 2>&1
```

Keeps 30 days in `/var/www/cube/backups/`. Also copy that folder off the server
regularly (another machine or cloud storage).

## 7. Audit log protection

The admin's Security & Audit Logs page records every sign-in, failed attempt,
content change and publish. Three layers make tampering detectable:

1. **Signed entries** – each entry is signed with `AUDIT_LOG_KEY` (kept in
   `.env.local`, not with the data). The page shows "Integrity verified".
2. **Append-only archive** – every entry is also appended to
   `data-store/audit-trail/audit-YYYY-MM.jsonl` and kept forever (the admin
   page shows the newest 5,000). Make the archive append-only at the OS level
   so even a server user cannot rewrite it without first removing the flag
   (which itself requires root):

   ```bash
   sudo chattr +a /var/www/cube/data-store/audit-trail/*.jsonl
   # new monthly files: run again at the start of each month, e.g. cron:
   # 5 0 1 * * chattr +a /var/www/cube/data-store/audit-trail/*.jsonl
   ```

3. **Off-server checkpoints** – on the audit page, click **Checkpoint**
   (e.g. weekly) and store the file somewhere other than the server (email,
   cloud drive). **Verify checkpoint** later proves the history up to that
   point is unchanged.

The nightly backup (`deploy/backup.sh`) includes the archive because it is
inside `data-store/`.

## 8. After going live

1. Open `https://cubeiitm.org/admin`, sign in, and change the password
   (Settings → Change Your Password).
2. Submit the contact form on the website and check it appears in
   Admin → Enquiries within a few seconds.
3. Add an uptime monitor on `https://cubeiitm.org/api/health`.

## Updating the site later

```bash
cd /var/www/cube
git pull
npm ci
npm run build
pm2 reload cube
```

`data-store/` and `public/uploads/` are never touched by updates.

## Troubleshooting

| Symptom | Check |
|---|---|
| Site down | `pm2 status`, `pm2 logs cube`, `curl 127.0.0.1:3000/api/health` |
| Admin login does nothing | Site must be opened over **https**; `ADMIN_JWT_SECRET` set in `.env.local` |
| Admin shows "Server misconfiguration" | `ADMIN_JWT_SECRET` missing or shorter than 32 characters |
| Changes appear only after reload | nginx must use the `/api/public/live` block from the provided config |
| Upload fails | `client_max_body_size 12m` in nginx; disk space |
