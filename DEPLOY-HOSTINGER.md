# Deploy ke Hostinger (Node.js Web App)

Paket ini adalah aplikasi Node.js, bukan situs statis. Extract isi ZIP ke **Application root** pada hPanel, lalu gunakan:

```text
Startup file: server/index.js
Install command: npm install
Build command: npm run build:client
Start command: npm start
Node.js: 24.x (atau versi yang didukung Hostinger dan memenuhi Node >=22.5)
```

Atur Environment Variables di hPanel (jangan upload file `.env`):

```text
NODE_ENV=production
SITE_URL=https://darkslategrey-mule-809841.hostingersite.com
HOST_ALLOWLIST=darkslategrey-mule-809841.hostingersite.com,localhost,127.0.0.1
JWT_SECRET=<random-string-minimal-32-karakter>
ADMIN_EMAIL=admin@startraining.info
ADMIN_PASSWORD=<password-admin-yang-kuat>
SUPERADMIN_RECOVERY_PIN=<pin-rahasia-minimal-6-digit>
```

Setelah aplikasi dijalankan, verifikasi:

```text
https://darkslategrey-mule-809841.hostingersite.com/api/health
```

Endpoint tersebut harus merespons JSON dengan `"ok": true`.
