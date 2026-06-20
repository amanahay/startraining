<script setup>
import { computed, ref } from 'vue';
import PublicPageShell from '../components/PublicPageShell.vue';

const whatsapp = '6283164970454';
const danaNumber = '085795136171';
const copied = ref('');
const confirm = ref({ name: '', package: 'Paket Hosting Sendiri', amount: '', method: 'DANA', reference: '' });

const packages = [
  {
    name: 'Hosting Sendiri 1 Tahun',
    price: 'Rp750.000',
    description: 'Setup akun hosting personal small atas nama pembeli, memakai email pembeli, sampai website running dan siap pakai. Sudah termasuk domain.',
    featured: false,
    items: ['Setup akun hosting personal small', 'Pakai email pembeli', 'Domain sudah termasuk', 'Website diset sampai running', 'Konfigurasi dasar selesai beres', 'Serah terima siap pakai']
  },
  {
    name: 'Numpang Hosting 1 Tahun',
    price: 'Rp600.000',
    description: 'Website disimpan dan dikelola penuh di akun hosting kami, paket personal small, sudah termasuk domain.',
    featured: true,
    items: ['Kelola penuh di hosting kami', 'Paket personal small', 'Domain sudah termasuk', 'Setup sampai running', 'Lebih murah dan praktis', 'Cocok untuk serah terima beres']
  }
];

const features = [
  ['CMS Landing Dinamis', 'Ubah struktur, urutan, visibilitas, judul, isi, logo, warna, font, ukuran, posisi, margin, dan padding setiap section.'],
  ['Desain Modern Responsif', 'Mobile-first, wave/curve/mountain/organic divider, dark mode, serta parallax ringan dengan fallback mobile.'],
  ['Blog & SEO Artikel', 'Blog, detail artikel, featured image WebP, meta title, description, keyword, canonical, dan bulk JSON dari AI.'],
  ['Galeri Profesional', 'Album galeri, banyak foto, halaman detail, lightbox, dan load-more server-side.'],
  ['Testimoni Skala Besar', 'Landing preview, halaman testimoni khusus, load-more, rating, avatar, serta bulk JSON.'],
  ['Media Optimizer', 'Source gambar tetap disimpan dan versi WebP kualitas tinggi dibuat otomatis untuk performa website.'],
  ['Flyer & Dokumen PDF', 'Upload PDF, tombol download flyer global atau per program, dan dashboard penggunaan penyimpanan.'],
  ['Lead Management', 'Form konsultasi masuk ke dashboard SuperAdmin dengan status, referral, catatan, dan audit aktivitas.'],
  ['SEO Teknis Lengkap', 'Sitemap, robots, Open Graph, Twitter Card, JSON-LD, sitelink section, FAQ, review, dan aggregate rating.'],
  ['Webmaster & Analytics', 'Google Search Console, Bing, Yandex, Google Analytics, Google Tag Manager, dan custom head.'],
  ['SuperAdmin Aman', 'Login cookie HTTP-only, role SuperAdmin, ganti password, CRUD, spinner, toast, dan audit log.'],
  ['Teknologi Siap Pakai', 'Vue.js, Node.js, Express, SQLite, build production, upload media, dan dokumentasi deployment.']
];

const virtualAccounts = [
  ['BCA', '3901085795136171'],
  ['Mandiri', '89508085795136171'],
  ['BRI', '88810085795136171'],
  ['BNI', '8881085795136171'],
  ['CIMB Niaga', '8059085795136171'],
  ['Permata Bank', '8528085795136171'],
  ['Panin Bank', '8100085795136171'],
  ['BTPN / Jenius', '80000085795136171']
];

async function copy(value, label) {
  await navigator.clipboard.writeText(value);
  copied.value = label;
  window.setTimeout(() => { if (copied.value === label) copied.value = ''; }, 2200);
}

function negotiate(packageName = '') {
  const message = `Halo, saya tertarik membeli website STAR Training Dynamic CMS${packageName ? ` dengan pilihan ${packageName}` : ''}. Saya ingin diskusi harga dan detail penawaran.`;
  window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
}

const confirmationUrl = computed(() => {
  const message = [
    'Halo, saya sudah melakukan transfer pembelian website.',
    `Nama: ${confirm.value.name || '-'}`,
    `Paket: ${confirm.value.package}`,
    `Nominal: ${confirm.value.amount || '-'}`,
    `Metode: ${confirm.value.method}`,
    `Referensi transfer: ${confirm.value.reference || '-'}`,
    'Mohon konfirmasi pembayaran saya.'
  ].join('\n');
  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;
});
</script>

<template>
  <PublicPageShell>
    <main class="offer-page">
      <section class="offer-hero">
        <div class="container position-relative">
          <div class="offer-kicker">PENAWARAN WEBSITE SIAP PAKAI</div>
          <h1>Miliki Website Company Profile dengan <span>CMS Dinamis Lengkap</span></h1>
          <p>Sistem modern untuk bisnis training, konsultan, agensi, lembaga pendidikan, atau perusahaan yang ingin mengelola landing page, blog, galeri, testimoni, lead, dan SEO dari satu dashboard.</p>
          <div class="d-flex flex-wrap gap-3 justify-content-center">
            <button class="btn offer-wa-btn btn-lg" @click="negotiate()"><i class="bi bi-whatsapp me-2"></i>Negosiasi via WhatsApp</button>
            <a href="#fitur" class="btn btn-outline-light btn-lg rounded-pill px-4">Lihat Semua Fitur</a>
          </div>
          <div class="offer-negotiable"><strong>HARGA BISA NEGO</strong><span>Diskusikan kebutuhan, hosting, domain, dan penyesuaian langsung melalui WhatsApp.</span></div>
        </div>
      </section>

      <section class="offer-section">
        <div class="container">
          <div class="offer-heading"><span>PILIHAN PAKET</span><h2>Pilih Hosting yang Sesuai</h2><p>Harga berikut adalah harga mulai dan masih dapat dinegosiasikan.</p></div>
          <div class="offer-pricing-grid">
            <article v-for="item in packages" :key="item.name" class="offer-price-card" :class="{ featured: item.featured }">
              <div v-if="item.featured" class="offer-popular">PALING PRAKTIS</div>
              <h3>{{ item.name }}</h3><div class="offer-price">{{ item.price }}</div><p>{{ item.description }}</p>
              <ul><li v-for="feature in item.items" :key="feature"><i class="bi bi-check-circle-fill"></i>{{ feature }}</li></ul>
              <button class="btn w-100 rounded-pill py-3" :class="item.featured ? 'btn-danger' : 'btn-outline-danger'" @click="negotiate(item.name)">Nego Paket Ini</button>
            </article>
          </div>
          <p class="text-center mt-4 text-muted small">Keduanya sudah termasuk domain dan dikerjakan sampai beres. Diskusi final bisa langsung via WhatsApp.</p>
        </div>
      </section>

      <section id="fitur" class="offer-section offer-features-section">
        <div class="container">
          <div class="offer-heading"><span>FITUR YANG DIDAPATKAN</span><h2>Bukan Hanya Landing Page</h2><p>Sistem lengkap yang dapat langsung digunakan dan dikembangkan.</p></div>
          <div class="offer-feature-grid">
            <article v-for="(feature,index) in features" :key="feature[0]"><div class="offer-feature-number">{{ String(index + 1).padStart(2,'0') }}</div><h3>{{ feature[0] }}</h3><p>{{ feature[1] }}</p></article>
          </div>
        </div>
      </section>

      <section class="offer-section payment-section">
        <div class="container">
          <div class="offer-heading"><span>PEMBAYARAN</span><h2>Transfer dengan Mudah</h2><p>Pastikan harga dan paket sudah disepakati melalui WhatsApp sebelum melakukan transfer.</p></div>
          <div class="payment-layout">
            <div class="payment-card dana-card">
              <div class="dana-logo">DANA</div><small>Nomor DANA</small><strong>{{ danaNumber }}</strong>
              <button class="copy-button" @click="copy(danaNumber,'DANA')"><i class="bi" :class="copied==='DANA' ? 'bi-check-lg' : 'bi-copy'"></i>{{ copied==='DANA' ? 'Tersalin' : 'Salin Nomor' }}</button>
            </div>
            <div class="payment-card">
              <h3>Virtual Account DANA</h3><p class="text-muted">Pilih bank, lalu salin nomor virtual account.</p>
              <div class="va-list">
                <div v-for="account in virtualAccounts" :key="account[0]" class="va-item"><div><small>{{ account[0] }}</small><strong>{{ account[1] }}</strong></div><button @click="copy(account[1],account[0])"><i class="bi" :class="copied===account[0] ? 'bi-check-lg' : 'bi-copy'"></i>{{ copied===account[0] ? 'Tersalin' : 'Salin' }}</button></div>
              </div>
            </div>
          </div>
          <div class="payment-warning"><i class="bi bi-shield-exclamation"></i><div><strong>Konfirmasi dahulu sebelum transfer</strong><p>Hubungi WhatsApp <button @click="copy('083164970454','WhatsApp')">083164970454 <i class="bi bi-copy"></i></button> untuk menyepakati harga, paket, domain, hosting, dan jadwal pengerjaan. Setelah transfer, kirim bukti pembayaran melalui WhatsApp tersebut.</p></div></div>
        </div>
      </section>

      <section class="offer-section confirmation-section">
        <div class="container">
          <div class="offer-confirm-card">
            <div><span class="offer-kicker">SUDAH TRANSFER?</span><h2>Konfirmasi Pembayaran</h2><p>Lengkapi informasi singkat berikut. Tombol konfirmasi akan membuka WhatsApp dengan pesan yang sudah tersusun.</p></div>
            <div class="confirmation-form">
              <label><span>Nama</span><input v-model="confirm.name" class="form-control" placeholder="Nama pembeli"></label>
              <label><span>Paket</span><select v-model="confirm.package" class="form-select"><option>Paket Hosting Sendiri</option><option>Paket Numpang Hosting 1 Tahun</option><option>Paket Custom / Hasil Negosiasi</option></select></label>
              <label><span>Nominal Transfer</span><input v-model="confirm.amount" class="form-control" placeholder="Contoh: Rp4.500.000"></label>
              <label><span>Metode Pembayaran</span><select v-model="confirm.method" class="form-select"><option>DANA</option><option v-for="account in virtualAccounts" :key="account[0]">{{ account[0] }}</option></select></label>
              <label class="full"><span>Nomor Referensi / Catatan</span><input v-model="confirm.reference" class="form-control" placeholder="Opsional"></label>
              <a :href="confirmationUrl" target="_blank" class="offer-wa-btn btn btn-lg full"><i class="bi bi-whatsapp me-2"></i>Konfirmasi Transfer via WhatsApp</a>
            </div>
          </div>
        </div>
      </section>
    </main>
  </PublicPageShell>
</template>

<style scoped>
.offer-page{background:#f8fafc;color:#172033}.offer-hero{padding:10rem 0 6rem;text-align:center;color:#fff;background:radial-gradient(circle at 20% 20%,rgba(220,38,38,.35),transparent 28%),radial-gradient(circle at 80% 60%,rgba(244,63,94,.25),transparent 30%),linear-gradient(135deg,#111827,#350817 60%,#6b071f)}.offer-kicker,.offer-heading>span{display:inline-block;font-size:.76rem;letter-spacing:.18em;font-weight:800;color:#fda4af;margin-bottom:1rem}.offer-hero h1{font-size:clamp(2.25rem,6vw,4.8rem);font-weight:900;max-width:1050px;margin:0 auto 1.5rem;line-height:1.05}.offer-hero h1 span{color:#fb7185}.offer-hero>div>p{font-size:clamp(1rem,2vw,1.25rem);max-width:800px;margin:0 auto 2rem;color:rgba(255,255,255,.75);line-height:1.8}.offer-wa-btn{background:#22c55e!important;color:#fff!important;border:0!important;border-radius:999px!important;font-weight:800;padding:.8rem 1.5rem!important}.offer-wa-btn:hover{background:#16a34a!important}.offer-negotiable{display:flex;flex-direction:column;gap:.3rem;max-width:640px;margin:2.5rem auto 0;padding:1rem 1.25rem;border:1px solid rgba(255,255,255,.18);border-radius:16px;background:rgba(255,255,255,.08)}.offer-negotiable strong{color:#fde047}.offer-negotiable span{font-size:.88rem;color:rgba(255,255,255,.7)}.offer-section{padding:5rem 0}.offer-heading{text-align:center;max-width:720px;margin:0 auto 3rem}.offer-heading h2{font-size:clamp(2rem,4vw,3rem);font-weight:900}.offer-heading p{color:#64748b;font-size:1.05rem}.offer-pricing-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1.5rem;max-width:980px;margin:auto}.offer-price-card{position:relative;background:#fff;border:1px solid #e2e8f0;border-radius:24px;padding:2rem;box-shadow:0 15px 45px rgba(15,23,42,.07)}.offer-price-card.featured{border:2px solid #be123c;transform:translateY(-8px)}.offer-popular{position:absolute;right:1.2rem;top:1.2rem;font-size:.68rem;font-weight:900;color:#fff;background:#be123c;border-radius:999px;padding:.38rem .7rem}.offer-price-card h3{font-size:1.35rem;font-weight:800}.offer-price{font-size:2.2rem;font-weight:900;color:#9f1239;margin:.8rem 0}.offer-price-card>p{color:#64748b;min-height:52px}.offer-price-card ul{list-style:none;padding:0;margin:1.5rem 0;display:grid;gap:.8rem}.offer-price-card li{display:flex;gap:.7rem}.offer-price-card li i{color:#16a34a}.offer-features-section{background:#111827;color:#fff}.offer-features-section .offer-heading p{color:#94a3b8}.offer-feature-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem}.offer-feature-grid article{border:1px solid #293548;background:#182235;border-radius:18px;padding:1.4rem}.offer-feature-number{font:800 .75rem monospace;color:#fb7185;margin-bottom:1rem}.offer-feature-grid h3{font-size:1.05rem;font-weight:800}.offer-feature-grid p{color:#94a3b8;font-size:.9rem;line-height:1.7;margin:0}.payment-layout{display:grid;grid-template-columns:.8fr 1.2fr;gap:1.5rem;max-width:1000px;margin:auto}.payment-card{background:#fff;border:1px solid #e2e8f0;border-radius:22px;padding:1.5rem}.dana-card{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;background:linear-gradient(145deg,#eef8ff,#fff)}.dana-logo{font-size:2rem;font-weight:900;font-style:italic;color:#108ee9;margin-bottom:1.5rem}.dana-card small{color:#64748b}.dana-card strong{font-size:1.7rem;letter-spacing:.08em;margin:.4rem 0 1.5rem}.copy-button,.va-item button{border:0;border-radius:10px;background:#e0f2fe;color:#0369a1;padding:.65rem 1rem;font-weight:700}.va-list{display:grid;gap:.6rem}.va-item{display:flex;justify-content:space-between;align-items:center;gap:1rem;padding:.75rem;border:1px solid #e2e8f0;border-radius:12px}.va-item div{display:grid}.va-item small{color:#64748b}.va-item strong{word-break:break-all}.payment-warning{max-width:1000px;margin:1.5rem auto 0;display:flex;gap:1rem;padding:1rem 1.2rem;border-radius:14px;background:#fff7ed;border:1px solid #fdba74;color:#9a3412}.payment-warning>i{font-size:1.5rem}.payment-warning p{margin:.25rem 0 0}.payment-warning button{border:0;background:transparent;color:#9a3412;font-weight:800}.confirmation-section{background:#2b0712}.offer-confirm-card{display:grid;grid-template-columns:.8fr 1.2fr;gap:2rem;align-items:center;background:#fff;border-radius:24px;padding:2rem}.offer-confirm-card h2{font-weight:900}.confirmation-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}.confirmation-form label{display:grid;gap:.35rem}.confirmation-form label>span{font-size:.8rem;font-weight:800;color:#475569}.confirmation-form .form-control,.confirmation-form .form-select{background:#f8fafc!important;color:#111827!important;border:1px solid #94a3b8!important}.full{grid-column:1/-1}
@media(max-width:900px){.offer-feature-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.offer-confirm-card{grid-template-columns:1fr}.payment-layout{grid-template-columns:1fr}}@media(max-width:650px){.offer-hero{padding:8rem 0 4rem}.offer-section{padding:3.5rem 0}.offer-pricing-grid,.offer-feature-grid{grid-template-columns:1fr}.offer-price-card.featured{transform:none}.confirmation-form{grid-template-columns:1fr}.full{grid-column:auto}.offer-confirm-card,.offer-price-card{padding:1.3rem}.va-item{align-items:flex-start;flex-direction:column}.va-item button{width:100%}}
</style>
