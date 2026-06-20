# SmartASP Node.js Deploy

Untuk panel seperti di screenshot:

- `Enable Node.JS`: pilih `Enable Node.JS`
- `Application startup file`: `server/index.js`
- `Node.js version`: pilih versi stabil yang tersedia, idealnya `22.x` atau yang paling tinggi di panel
- `App mode`: `Production` jika ada pilihan

Isi environment variable di panel hosting:

```bash
PORT=3100
NODE_ENV=production
JWT_SECRET=isi-dengan-random-string-panjang
ADMIN_EMAIL=admin@startraining.info
ADMIN_PASSWORD=ChangeMe123!
SUPERADMIN_RECOVERY_PIN=262626
SITE_URL=https://demo.itu.biz.id
HOST_ALLOWLIST=demo.itu.biz.id,localhost,127.0.0.1
```

Kalau panel tidak mendukung environment variable, letakkan file `.env` di root aplikasi dengan nilai yang sama.

File yang harus ikut di-upload:

- `server/`
- `dist/`
- `data/`
- `uploads/`
- `node_modules/`
- `package.json`
- `package-lock.json`
- `.env`

Setelah upload dan extract, jika panel punya tombol start manual, gunakan `server/index.js` sebagai startup file.
