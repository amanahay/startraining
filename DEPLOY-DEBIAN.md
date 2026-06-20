# Debian Deploy

1. Copy the release zip to the VPS.
2. Unzip it in a directory, for example `/var/www/starttc`.
3. Set file permissions so the app user can write to `data/` and `uploads/`.
4. Run `./start-debian.sh` or `npm start`.

Required env values:

```bash
PORT=3100
NODE_ENV=production
JWT_SECRET=change-this-to-a-long-random-string
ADMIN_EMAIL=admin@startraining.info
ADMIN_PASSWORD=ChangeMe123!
SUPERADMIN_RECOVERY_PIN=262626
SITE_URL=https://demo.itu.biz.id
HOST_ALLOWLIST=demo.itu.biz.id,localhost,127.0.0.1
```

The package includes:

- `dist/` production frontend
- `data/startc.sqlite` database
- `uploads/` media files
- `node_modules/` runtime dependencies
- `package.json` and `package-lock.json`
