# Deploy Hostinger Node.js App

Project ini memakai pola gabungan:

- `client/` = source Vue.js
- `dist/` = hasil build Vue yang disajikan oleh Express
- `server/index.js` = backend Express, API, upload, admin auth, dan static server untuk `dist/`
- `data/startc.sqlite` = database SQLite

Catatan: contoh Hostinger biasanya memakai `client/dist`. Di project ini output build sengaja diarahkan ke `dist/` root lewat `client/vite.config.js`, dan `server/index.js` sudah serve folder tersebut.

## Setting hPanel

Gunakan **Node.js Web App**, bukan static deployment saja.

```text
Application root:
folder hasil extract ZIP

Startup file / Entry point:
server/index.js

Install command:
npm install

Build command:
npm run build:client

Start command:
npm start

Node version:
24.x
```

## Environment Variables

Untuk domain preview Hostinger dan subdomain final:

```text
NODE_ENV=production
SITE_URL=https://try.startraining.info
HOST_ALLOWLIST=try.startraining.info,www.try.startraining.info,peachpuff-leopard-624193.hostingersite.com,localhost,127.0.0.1
JWT_SECRET=ganti-dengan-random-string-panjang
ADMIN_EMAIL=admin@startraining.info
ADMIN_PASSWORD=ChangeMe123!
SUPERADMIN_RECOVERY_PIN=262626
```

Jika masih memakai domain preview, `SITE_URL` boleh sementara diganti ke:

```text
https://peachpuff-leopard-624193.hostingersite.com
```

Setelah domain final aktif, kembalikan ke:

```text
https://try.startraining.info
```

## Cek Setelah Deploy

Buka endpoint ini:

```text
https://domain-anda/api/health
```

Jika Express aktif, hasilnya JSON seperti:

```json
{"ok":true,"database":"sqlite"}
```

Jika `/api/health` 404, berarti Hostinger masih menyajikan static Vue saja dan Node.js Web App belum menjalankan `server/index.js`.
