# STAR Training Dynamic CMS

Landing page Vue.js dengan backend Node.js/Express dan SQLite. Konten awal mengikuti template statis yang tersedia di folder ini.

## Fitur

- Landing page dinamis dengan urutan dan visibilitas section yang dapat diubah
- Branding dinamis: logo, teks logo, warna, font, kontak, sosial media, dan footer
- Style per section: background, warna teks/judul, font, posisi, ukuran desktop/mobile, dan padding responsif
- Margin antar-section desktop/mobile dan divider modern: wave, curve, mountain, organic, tilt, dan zigzag
- Parallax ringan per section dengan fallback statis untuk mobile, perangkat sentuh, dan reduced-motion
- CRUD program, trainer, statistik, klien, keunggulan, testimoni, FAQ, kemitraan, dan navigasi
- Blog dengan halaman daftar dan detail artikel
- Galeri dengan halaman daftar album, detail album, dan banyak foto per album
- Load-more server-side untuk halaman galeri dan testimoni
- Halaman testimoni khusus di `/testimonials`
- Halaman penawaran pembelian website di `/penawaran`
- Mode logo klien marquee otomatis atau grid scroll vertikal
- Bulk JSON testimoni dan artikel dengan contoh format siap digunakan AI asisten
- Spinner pada aksi simpan dan toaster success, info, warning, serta danger
- Upload gambar hingga 25 MB dengan source asli dan konversi WebP kualitas tinggi otomatis
- Upload flyer/PDF yang dapat dipasang sebagai tombol download global atau per program
- Dashboard media dengan jumlah file, ukuran source, ukuran WebP, dan total penggunaan penyimpanan
- Form lead yang tersimpan ke SQLite dan dikelola dari admin
- SuperAdmin dengan cookie autentikasi HTTP-only dan audit log
- SEO dinamis per halaman, Open Graph, Twitter Card, canonical, JSON-LD, sitemap, robots, dan manifest PWA
- Schema.org Organization, LocalBusiness, WebSite, WebPage, SiteNavigationElement, ItemList, FAQPage, Review, dan AggregateRating
- Sitelink setiap section dapat diberi label atau dinonaktifkan dari editor landing
- Token verifikasi Google Search Console, Bing Webmaster Tools, dan Yandex
- Google Analytics, Google Tag Manager, dan custom head HTML

## Menjalankan

Prasyarat: Node.js 22.5 atau lebih baru. Versi yang sudah diverifikasi adalah Node.js 24.

```powershell
npm install
npm run db:seed
npm run dev
```

- Website Vite: `http://localhost:5173`
- API: `http://localhost:3100`
- Admin: `http://localhost:5173/login`

Login awal:

```text
Email: admin@startraining.info
Password: ChangeMe123!
```

Ganti password segera melalui menu **Akun**.

Pemulihan pemilik tersedia di `/superadmin`. PIN dibaca dari
`SUPERADMIN_RECOVERY_PIN` pada `.env`, tidak dikirim ke frontend, dibatasi lima
percobaan salah per 15 menit, dan hanya dapat mereset akun `ADMIN_EMAIL`.

## Produksi

```powershell
npm install
npm run build
$env:NODE_ENV="production"
$env:JWT_SECRET="random-string-minimal-32-karakter"
npm start
```

Express melayani API, upload, dan hasil build Vue dari satu port. Folder yang harus dipertahankan saat deploy:

```text
dist/
server/
uploads/
data/
package.json
package-lock.json
.env
```

Database berada di `data/startc.sqlite`. Backup file tersebut dan folder `uploads/` secara berkala.

Jika website menggunakan HTTPS, set `NODE_ENV=production` agar cookie admin memakai flag `Secure`. Untuk local HTTP gunakan `NODE_ENV=development`.

## SEO dan Webmaster

1. Buka menu **Branding & Umum**, lalu ubah `URL Website Produksi` ke domain final.
2. Buka menu **SEO & Webmaster**, isi title, description, keyword, dan social image.
3. Tambahkan properti domain/URL di Google Search Console atau Bing Webmaster Tools.
4. Salin token meta verification dari layanan tersebut ke kolom yang sesuai.
5. Simpan dan deploy, lalu klik verifikasi di layanan webmaster.
6. Submit `https://domain-anda.com/sitemap.xml`.

Endpoint SEO tersedia otomatis:

- `/sitemap.xml`
- `/robots.txt`
- `/manifest.webmanifest`

Pendaftaran akun/properti webmaster tetap harus dilakukan oleh pemilik akun Google/Microsoft karena memerlukan login dan verifikasi kepemilikan domain.

## Perintah Verifikasi

```powershell
npm run check
npm audit
```
