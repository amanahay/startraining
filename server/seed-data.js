export const settings = {
  site_name: 'STAR Training & Consulting',
  site_short_name: 'STAR Training',
  site_tagline: 'Lembaga Pelatihan & Pengembangan SDM Profesional',
  site_url: 'https://demo.itu.biz.id',
  logo_url: '/Master-Logo-Star-1-2048x1011.png',
  logo_text: 'STAR Training',
  logo_symbol: '⭐',
  favicon_url: '/favicon.svg',
  flyer_pdf_url: '',
  flyer_button_label: 'Download Flyer',
  primary_color: '#8B0000',
  secondary_color: '#C41E3A',
  accent_color: '#F4A7B9',
  dark_color: '#1A1A2E',
  font_display: 'Manrope',
  font_body: 'Manrope',
  whatsapp_number: '6281111158002',
  phone: '022-2517998',
  email: 'startc.info@gmail.com',
  address: 'Jl. Cigadung Raya Tengah No. 70/A1, Bandung, Indonesia 40191',
  address_jakarta: 'Pondok Pinang Center CR 10, Jakarta 12310',
  maps_url: 'https://maps.google.com/?q=Jl.+Cigadung+Raya+Tengah+No.70/A1+Bandung',
  instagram_url: 'https://www.instagram.com/startraining.id/',
  linkedin_url: 'https://www.linkedin.com/company/star-training-consulting/',
  youtube_url: 'https://www.youtube.com/@startrainingconsulting',
  facebook_url: 'https://www.facebook.com/startrainingconsulting/',
  seo_title: 'STAR Training & Consulting — Lembaga Pelatihan SDM Profesional | Bandung',
  seo_description: 'STAR Training & Consulting — Lembaga pelatihan & pengembangan SDM terpercaya sejak 12 tahun. Outbound, Motivation Session, Sertifikasi BNSP, Leadership Training.',
  seo_keywords: 'pelatihan SDM, training konsultan, sertifikasi BNSP, outbound team building, motivation session, leadership training, Bandung, Indonesia',
  seo_robots: 'index, follow, max-image-preview:large',
  seo_og_image: 'https://startraining.info/wp-content/uploads/2026/02/Compro-STAR-Training-2026-17.6-x-25-cm-721x1024.png',
  google_verification: '',
  bing_verification: '',
  yandex_verification: '',
  google_analytics_id: '',
  google_analytics_snippet: '',
  google_tag_manager_id: '',
  custom_head_html: '',
  footer_description: 'Kami membantu perusahaan dan instansi di seluruh Indonesia mengembangkan kompetensi SDM melalui pelatihan yang aplikatif, interaktif, dan terbukti.',
  copyright_text: '© 2026 STAR Training & Consulting. Hak Cipta Dilindungi.',
  organization_founding_year: '2014',
  organization_latitude: '-6.897',
  organization_longitude: '107.630'
};

const sectionVisualDefaults = {
  clients: { background_color: '#ffffff', aurora_enabled: 0, glow_enabled: 0 },
  programs: { background_color: '#ffffff', aurora_enabled: 0, glow_enabled: 0 },
  trainers: { background_color: '#ffffff', aurora_enabled: 0, glow_enabled: 0 },
  galleries: { background_color: '#ffffff', aurora_enabled: 0, glow_enabled: 0 },
  posts: { background_color: '#ffffff', aurora_enabled: 0, glow_enabled: 0 },
  faqs: { background_color: '#ffffff', aurora_enabled: 0, glow_enabled: 0 },
  cta: { background_color: '#ffffff', aurora_enabled: 1, glow_enabled: 1, glow_color: '#f43f5e' }
};

const brightSectionStyle = (key, index) => ({
  style: {
    aurora_enabled: 1,
    aurora_gradient: index % 2 === 0
      ? 'linear-gradient(135deg,#fff8ee 0%,#edf8ff 38%,#fff0f7 70%,#fff9df 100%)'
      : 'linear-gradient(135deg,#f7fbff 0%,#fff5f7 42%,#fffbe6 100%)',
    glow_enabled: 1,
    glow_color: key === 'hero' ? '#ff6b6b' : '#38bdf8',
    particles_enabled: key === 'hero' ? 1 : 0,
    particle_color: 'rgba(255,255,255,.92)',
    particle_count: key === 'hero' ? 12 : 0,
    divider_type: 'curve',
    divider_position: 'bottom',
    divider_color: '#ffffff',
    divider_height_desktop: 42,
    divider_height_mobile: 24,
    ...(sectionVisualDefaults[key] || {})
  }
});

// Default copy used by the landing page.  These values are stored in each
// section's config_json, so an administrator can change them without a deploy.
export const sectionConfigDefaults = {
  events: { action_button_label: 'Lihat Semua Event', action_button_url: '/event' },
  clients: { display_limit: 12, sort_mode: 'latest', action_button_label: 'Lihat Semua Klien', action_button_url: '/klien' },
  stats: { about_button_label: 'Selengkapnya Tentang Kami', about_button_url: '/about' },
  programs: { action_button_label: 'Lihat Semua Program', action_button_url: '/programs', filter_all_label: 'Semua', card_detail_label: 'Detail', card_inquiry_label: 'Tanya', card_flyer_label: 'Flyer', hero_detail_label: 'Detail Program', hero_inquiry_label: 'Tanya', hero_display_label: 'Tampilkan' },
  features: { action_button_label: 'Konsultasi Gratis', action_button_url: '#kontak' },
  trainers: { previous_label: 'Trainer sebelumnya', next_label: 'Trainer berikutnya' },
  galleries: { action_button_label: 'Lihat Semua Foto', action_button_url: '/gallery' },
  testimonials: { action_button_label: 'Lihat Semua Testimoni', action_button_url: '/testimonials' },
  posts: { action_button_label: 'Semua Artikel', action_button_url: '/blog', read_more_label: 'Baca Selengkapnya' },
  contact: {
    form_title: 'Request Konsultasi', whatsapp_label: 'WhatsApp', phone_label: 'Telepon', email_label: 'Email', address_label: 'Head Office', show_whatsapp: 1, show_phone: 1, show_email: 1, show_address: 1,
    name_label: 'Nama Lengkap *', whatsapp_field_label: 'No. WhatsApp *', company_label: 'Perusahaan / Instansi', position_label: 'Jabatan',
    program_label: 'Kebutuhan Training', program_placeholder: 'Pilih program', participants_label: 'Jumlah Peserta', timeline_label: 'Estimasi Waktu',
    message_label: 'Pesan Tambahan', submit_label: 'Kirim Request Konsultasi', submitting_label: 'Mengirim...',
    participant_options: ['1–20 orang', '21–50 orang', '51–100 orang', '100+ orang'],
    timeline_options: ['Bulan ini', '1–3 bulan ke depan', '3–6 bulan ke depan', 'Masih eksplorasi']
  },
  cta: { button_label: 'Hubungi Kami Sekarang' }
};

export const sections = [
  ['hero', 'Hero', 'Lembaga Pelatihan SDM Profesional', 'Kembangkan SDM Unggul Bersama STAR Training', 'Kami membantu perusahaan dan instansi pemerintahan di seluruh Indonesia meningkatkan kompetensi sumber daya manusia melalui pelatihan yang aplikatif dan terbukti mendorong kinerja.', '', { image_url: 'https://startraining.info/wp-content/uploads/2026/02/Compro-STAR-Training-2026-17.6-x-25-cm-721x1024.png', primary_button: 'Request Proposal', primary_url: '#kontak', secondary_button: 'Konsultasi Gratis', secondary_url: '#kontak' }, 1, 10],
  ['stats', 'Statistik', 'Kepercayaan Klien', 'Angka yang Bicara Sendiri', 'Lebih dari satu dekade STAR Training melayani perusahaan swasta, BUMN, dan instansi pemerintahan di seluruh Indonesia.', '', {}, 1, 20],
  ['clients', 'Logo Klien', '', 'Dipercaya oleh ratusan perusahaan & instansi', '', '', { display_mode: 'masonry', scroll_height: 240, sitelink_enabled: 1, sitelink_label: 'Klien Kami' }, 1, 30],
  ['events', 'Event', 'Agenda Terbaru', 'Event & Kegiatan Mendatang', 'Ikuti agenda pelatihan, seminar, dan kegiatan terbaru kami.', '', {}, 1, 35],
  ['programs', 'Program', 'Program Kami', 'Solusi Pelatihan untuk Setiap Kebutuhan', 'Dari outbound seru hingga sertifikasi BNSP resmi — kami punya program yang tepat untuk tim Anda.', '', {}, 1, 40],
  ['features', 'Keunggulan', 'Keunggulan Kami', 'Mengapa Memilih STAR Training?', 'STAR Training & Consulting membantu perusahaan menghadapi tantangan dunia kerja lewat pelatihan yang aplikatif, interaktif, dan terbukti mendorong kinerja tim.', '', {}, 1, 50],
  ['trainers', 'Trainer', 'Tim Profesional', 'Trainer & Konsultan Kami', 'Dipimpin oleh para ahli bersertifikat dengan rekam jejak nyata di industri.', '', {}, 1, 60],
  ['galleries', 'Galeri', 'Dokumentasi Kegiatan', 'Gallery Event Pelatihan', 'Momen nyata dari ratusan sesi pelatihan yang telah kami jalankan bersama klien terbaik.', '', { sitelink_enabled: 1, sitelink_label: 'Galeri' }, 1, 70],
  ['testimonials', 'Testimoni', 'Kata Mereka', 'Kepercayaan yang Membanggakan', 'Ribuan peserta dari berbagai perusahaan telah merasakan manfaat nyata dari program pelatihan kami.', '', { sitelink_enabled: 1, sitelink_label: 'Testimoni' }, 1, 80],
  ['posts', 'Artikel', 'Blog & Insight', 'Artikel & Tips Pengembangan SDM', '', '', {}, 1, 90],
  ['partners', 'Kemitraan', 'Bergabung Bersama Kami', 'Program Kemitraan & Afiliasi', 'Dapatkan penghasilan tambahan dengan menjadi mitra atau agen referral STAR Training.', '', {}, 1, 100],
  ['contact', 'Kontak', 'Konsultasi Gratis', 'Siap Tingkatkan Kualitas SDM di Perusahaan Anda?', 'Hubungi kami sekarang dan dapatkan konsultasi gratis. Tim kami akan membantu menemukan solusi pelatihan yang tepat untuk organisasi Anda.', '', {}, 1, 110],
  ['faqs', 'FAQ', 'FAQ', 'Pertanyaan yang Sering Ditanyakan', '', '', {}, 1, 120],
  ['cta', 'CTA', '', 'Ada pertanyaan? Konsultasi Gratis Sekarang!', 'Tim kami siap membantu menemukan solusi pelatihan terbaik untuk organisasi Anda.', '', { button_label: 'Chat via WhatsApp', button_url: '#kontak' }, 1, 130]
].map((item, index) => {
  item[6] = { ...brightSectionStyle(item[0], index), ...(sectionConfigDefaults[item[0]] || {}), ...(item[6] || {}), style: { ...brightSectionStyle(item[0], index).style, ...(item[6]?.style || {}) } };
  return item;
});

export const stats = [
  ['Klien Perusahaan & Instansi', 500, '', '+', 'bi-buildings', 10],
  ['Program Pelatihan Selesai', 1200, '', '+', 'bi-calendar-check', 20],
  ['Total Peserta Training', 25000, '', '+', 'bi-people', 30],
  ['Tahun Pengalaman', 12, '', '+', 'bi-award', 40]
];

export const programs = [
  ['Outbound Team Building', 'outbound-team-building', 'outbound', 'Outbound', 'Aktivitas experiential learning yang seru dan komprehensif untuk membangun kekompakan, komunikasi, dan kepercayaan antar anggota tim.', '<h2>Program Outbound yang Terarah</h2><p>Dirancang untuk membangun kolaborasi, komunikasi, leadership, dan problem solving melalui aktivitas experiential learning.</p><ul><li>Pre-assessment kebutuhan tim</li><li>Games bermakna dan fasilitasi refleksi</li><li>Dokumentasi dan laporan rekomendasi</li></ul>', 'bi-tree', '🏕️', 7500000, 6250000, 'STAROUTBOUND', 500000, '', 1, 1, 10],
  ['Motivation Session', 'motivation-session', 'motivasi', 'Motivasi', 'Sesi motivasi intensif yang membentuk mindset positif dan growth mindset — memastikan tim Anda selalu siap menghadapi tantangan dengan penuh percaya diri.', '<h2>Sesi Motivasi yang Menggerakkan</h2><p>Format seminar interaktif untuk menguatkan energi, ownership, budaya kerja positif, dan kesiapan menghadapi target baru.</p>', 'bi-lightning-charge', '🔥', 5000000, 4250000, 'MOTIVASI10', 250000, '', 1, 1, 20],
  ['Leadership Excellence', 'leadership-excellence', 'leadership', 'Leadership', 'Program pengembangan kepemimpinan komprehensif — dari middle management hingga level eksekutif.', '<h2>Leadership untuk Dampak Nyata</h2><p>Materi berfokus pada komunikasi, decision making, coaching, delegation, dan eksekusi target lintas fungsi.</p>', 'bi-person-badge', '👑', 9000000, 7750000, 'LEADSTAR', 500000, '', 1, 1, 30],
  ['Bimtek & Sertifikasi BNSP', 'bimtek-sertifikasi-bnsp', 'sertifikasi', 'Sertifikasi', 'Program Bimbingan Teknis resmi untuk mendapatkan Sertifikasi Kompetensi dari BNSP.', '<h2>Bimtek dan Sertifikasi</h2><p>Peserta dibantu memahami unit kompetensi, menyiapkan portofolio, dan mengikuti proses asesmen dengan pendampingan profesional.</p>', 'bi-patch-check', '🎓', 6500000, 5750000, '', 0, '', 0, 1, 40],
  ['Masa Persiapan Pensiun', 'masa-persiapan-pensiun', 'motivasi', 'MPP', 'Program pelatihan untuk membekali karyawan yang akan memasuki masa pensiun dengan keterampilan, pengetahuan, dan mental siap.', '<h2>Siap Memasuki Fase Baru</h2><p>Program mencakup kesiapan mental, perencanaan finansial, peluang usaha, dan aktivitas produktif pascapensiun.</p>', 'bi-sunrise', '🌅', 7000000, 6200000, 'MPPSTAR', 300000, '', 0, 1, 50],
  ['Custom Training', 'custom-training', 'outbound', 'Custom', 'Program pelatihan yang dirancang 100% sesuai kebutuhan spesifik perusahaan Anda.', '<h2>Training yang Disusun Khusus</h2><p>Tim STAR menyusun modul, simulasi, dan output sesuai tujuan organisasi, profil peserta, durasi, serta budget.</p>', 'bi-sliders', '⚙️', 0, 0, '', 0, '', 0, 1, 60]
];

export const trainers = [
  ['Nama Trainer', 'Senior Trainer & Motivator', 'Pengalaman 15+ tahun di bidang pengembangan SDM, motivasi, dan kepemimpinan organisasi.', ['BNSP Certified', 'Leadership Coach'], 10],
  ['Nama Trainer', 'HR Consultant', 'Spesialis HR Assessment dan Organization Development dengan pengalaman di berbagai BUMN dan perusahaan multinasional.', ['BNSP Certified', 'HR Assessor'], 20],
  ['Nama Trainer', 'Outbound Facilitator', 'Spesialis Outdoor & Experiential Learning dengan metodologi yang seru namun penuh makna pengembangan tim.', ['Certified Facilitator', 'Team Coach'], 30],
  ['Nama Trainer', 'Digital & IT Trainer', 'Pakar Digital Marketing dan IT Infrastructure dengan sertifikasi internasional dan pengalaman enterprise luas.', ['BNSP Certified', 'Digital Expert'], 40]
];

export const features = [
  ['Berpengalaman & Terpercaya', 'Didukung tim profesional berpengalaman lebih dari 12 tahun, menangani ratusan klien perusahaan dan instansi pemerintahan.', 'bi-shield-check', 10],
  ['Materi Relevan & Aplikatif', 'Setiap modul dirancang berdasarkan kebutuhan nyata industri dan langsung dapat diterapkan di tempat kerja.', 'bi-graph-up-arrow', 20],
  ['Disesuaikan dengan Kebutuhan Anda', 'Program fleksibel dan dapat dikustomisasi sesuai tantangan, budaya, dan tujuan organisasi Anda.', 'bi-puzzle', 30],
  ['Trainer Bersertifikasi Nasional', 'Trainer memiliki sertifikasi BNSP, pengalaman industri nyata, dan kemampuan fasilitasi yang teruji.', 'bi-award', 40]
];

export const testimonials = [
  ['Agus Pratama', 'HRD Manager — PT. Nindya Karya', 'Program outbound yang luar biasa! Tim kami benar-benar lebih solid setelah mengikuti pelatihan ini. Fasilitatornya profesional dan materi sangat relevan.', 5, 10],
  ['Sari Dewi', 'Marketing Specialist — PT. BRI', 'Sertifikasi BNSP Digital Marketing dari STAR Training sangat membantu pengembangan karier saya. Materinya lengkap dan prosesnya terpercaya.', 5, 20],
  ['Rizky Firmansyah', 'Direktur SDM — BUMN Bandung', 'Motivation session dari STAR Training benar-benar mengubah mindset tim kami. Antusiasme kerja meningkat drastis.', 5, 30]
];

export const faqs = [
  ['Apakah STAR Training bisa datang ke lokasi perusahaan kami?', 'Ya, kami melayani pelatihan in-house di seluruh Indonesia. Tim kami siap hadir ke kantor, resort, atau venue pilihan Anda.', 10],
  ['Berapa minimum peserta untuk mengadakan pelatihan?', 'Untuk program in-house, minimum 15 peserta. Untuk program publik, peserta bisa mendaftar secara individual.', 20],
  ['Apakah ada sertifikat setelah mengikuti pelatihan?', 'Ya. Semua peserta mendapatkan sertifikat keikutsertaan. Peserta program sertifikasi yang lulus mendapatkan Sertifikat Kompetensi resmi dari BNSP.', 30],
  ['Bagaimana cara menjadi agen referral STAR Training?', 'Daftarkan diri melalui halaman registrasi agen, lengkapi data, dan tunggu verifikasi oleh tim kami.', 40],
  ['Berapa lama durasi program pelatihan?', 'Durasi bervariasi: Motivation Session 4–8 jam, Outbound 1–3 hari, Leadership dan Sertifikasi 2–5 hari.', 50]
];

export const posts = [
  ['5 Kunci Kepemimpinan Efektif di Era Transformasi Digital', 'kepemimpinan-digital', 'Leadership', 'Di tengah perubahan teknologi yang pesat, pemimpin dituntut memiliki kompetensi baru.', '<h2>Kepemimpinan di era digital</h2><p>Pemimpin efektif perlu menggabungkan visi, empati, kemampuan beradaptasi, literasi digital, dan komunikasi yang jelas.</p><h3>1. Visi yang terarah</h3><p>Transformasi digital harus berangkat dari tujuan bisnis dan kebutuhan manusia.</p><h3>2. Budaya belajar</h3><p>Bangun ruang aman bagi tim untuk mencoba, mengevaluasi, dan terus meningkatkan kompetensi.</p>', '2026-06-12', 10],
  ['Mengapa Outbound Training Lebih Efektif dari Pelatihan Konvensional?', 'outbound-training-efektif', 'HR Development', 'Experiential learning membantu peserta memahami materi melalui pengalaman langsung dan refleksi.', '<h2>Belajar melalui pengalaman</h2><p>Outbound yang dirancang dengan baik bukan sekadar permainan. Setiap aktivitas memiliki tujuan, observasi perilaku, dan sesi refleksi.</p><p>Metode ini menguatkan komunikasi, kolaborasi, kepemimpinan, dan pemecahan masalah.</p>', '2026-06-05', 20],
  ['Panduan Lengkap Sertifikasi BNSP 2026: Syarat, Proses & Manfaatnya', 'sertifikasi-bnsp-2026', 'Sertifikasi', 'Sertifikasi kompetensi BNSP semakin dibutuhkan sebagai pengakuan kemampuan profesional.', '<h2>Apa itu sertifikasi BNSP?</h2><p>Sertifikasi BNSP adalah proses pengakuan kompetensi melalui asesmen yang mengacu pada skema kompetensi terkait.</p><h3>Persiapan</h3><p>Pelajari unit kompetensi, siapkan bukti portofolio, dan ikuti bimbingan teknis sebelum asesmen.</p>', '2026-05-28', 30]
];

export const galleries = [
  ['Outbound Team Building', 'outbound-team-building-2026', 'Dokumentasi kegiatan outbound dan pengembangan tim.', '', '2026-05-18', 'Bandung', 10],
  ['Leadership Workshop', 'leadership-workshop-2026', 'Workshop kepemimpinan untuk supervisor dan manajer.', '', '2026-04-24', 'Jakarta', 20],
  ['Sertifikasi BNSP', 'sertifikasi-bnsp-batch-2026', 'Pelaksanaan bimbingan teknis dan asesmen kompetensi.', '', '2026-03-15', 'Bandung', 30],
  ['Motivation Session', 'motivation-session-2026', 'Sesi motivasi dan penguatan budaya kerja.', '', '2026-02-20', 'Bogor', 40],
  ['Custom Corporate Training', 'custom-corporate-training', 'Program khusus yang disusun berdasarkan kebutuhan klien.', '', '2026-01-17', 'Surabaya', 50],
  ['Masa Persiapan Pensiun', 'masa-persiapan-pensiun-2026', 'Program kesiapan finansial, mental, dan aktivitas pascapensiun.', '', '2025-12-10', 'Yogyakarta', 60]
];

export const clients = [
  ['IHC', 'https://startraining.info/wp-content/uploads/2025/07/IHC-1024x395.png', 10],
  ['Kementerian Perindustrian', 'https://startraining.info/wp-content/uploads/2025/07/Kementerian-Perindustrian-1024x538.png', 20],
  ['Universitas Sebelas Maret', 'https://startraining.info/wp-content/uploads/2025/07/UNS-V1-1024x538.png', 30],
  ['Institut Teknologi Bandung', 'https://startraining.info/wp-content/uploads/2025/07/ITB-1024x1024.png', 40],
  ['Bank Rakyat Indonesia', 'https://startraining.info/wp-content/uploads/2026/02/Bank-Rakyat-Indonesia-BRI.png', 50],
  ['PLN', 'https://startraining.info/wp-content/uploads/2025/07/Logo_PLN-748x1024.png', 60],
  ['Kementerian Keuangan', 'https://startraining.info/wp-content/uploads/2025/07/Logo-Kementerian-Keuangan-Indonesia-1024x635.png', 70],
  ['Nindya Karya', 'https://startraining.info/wp-content/uploads/2026/02/Nindya-Karya.png', 80]
];

export const partners = [
  ['Agen Referral', 'Daftarkan diri sebagai agen, bagikan link referral unik Anda, dan dapatkan komisi untuk setiap lead yang berhasil menjadi klien.', 'bi-person-plus', 'Hubungi Kami', '#kontak', 10],
  ['Mitra Korporat', 'Jalin kerjasama strategis untuk program pelatihan korporat, co-branding, atau pengembangan modul bersama.', 'bi-building', 'Hubungi Kami', '#kontak', 20],
  ['Trainer Partner', 'Bergabung sebagai trainer freelance atau konsultan mitra dan dapatkan akses ke jaringan klien korporat.', 'bi-mortarboard', 'Gabung Sekarang', '#kontak', 30]
];

export const aboutPage = {
  slug: 'about',
  hero_eyebrow: 'Tentang Kami',
  hero_title: 'Partner Terpercaya untuk Transformasi SDM Anda',
  hero_subtitle: 'STAR Training & Consulting adalah mitra strategis pengembangan sumber daya manusia yang membantu organisasi meningkatkan kinerja melalui program pelatihan yang aplikatif, interaktif, dan terukur.',
  hero_image_url: 'https://startraining.info/wp-content/uploads/2026/02/Compro-STAR-Training-2026-17.6-x-25-cm-721x1024.png',
  intro_eyebrow: 'Profil Perusahaan',
  intro_title: 'STAR Training & Consulting',
  intro_content: '<p><strong>STAR Training & Consulting</strong> merupakan brand dari CV. Tiga Bhakti Utama yang berdiri sejak tahun 2010. Kami berfokus pada pengembangan sumber daya manusia melalui pelatihan, konsultasi, outbound, motivasi, leadership, dan program sertifikasi.</p><p>Dengan pendekatan yang fleksibel dan berbasis kebutuhan klien, kami membantu perusahaan, instansi pemerintahan, BUMN, lembaga pendidikan, dan organisasi lainnya membangun tim yang kompeten, solid, serta siap menghadapi tantangan kerja modern.</p>',
  values_eyebrow: 'Fondasi Kami',
  values_title: 'Nilai yang Kami Pegang',
  values_subtitle: 'Setiap program dirancang berdasarkan nilai kerja yang menjaga kualitas, relevansi, dan dampak nyata bagi peserta.',
  advantages_eyebrow: 'Mengapa Memilih Kami',
  advantages_title: 'Keunggulan STAR Training',
  advantages_subtitle: 'Kami menggabungkan pengalaman, metode aplikatif, dan fleksibilitas layanan untuk menghasilkan program yang relevan bagi kebutuhan organisasi.',
  cta_title: 'Siap Mengembangkan SDM Organisasi Anda?',
  cta_subtitle: 'Diskusikan kebutuhan pelatihan, konsultasi, atau program custom bersama tim STAR Training.',
  cta_button_label: 'Konsultasi via WhatsApp',
  cta_button_url: '#kontak',
  meta_title: 'Tentang STAR Training & Consulting | Lembaga Pelatihan SDM Profesional',
  meta_description: 'Profil STAR Training & Consulting, brand CV. Tiga Bhakti Utama sejak 2010 yang berfokus pada pelatihan, konsultasi, outbound, motivasi, leadership, dan sertifikasi SDM.',
  meta_keywords: 'tentang STAR Training, profil STAR Training, lembaga training Bandung, training SDM, konsultan pelatihan'
};

export const aboutValues = [
  ['Inovasi', 'Mengembangkan metode pelatihan yang relevan, kreatif, dan sesuai kebutuhan dunia kerja modern.', 'bi-lightbulb', 10],
  ['Fleksibilitas', 'Menyusun program yang dapat disesuaikan dengan kebutuhan, budaya, target, dan kondisi setiap organisasi.', 'bi-sliders', 20],
  ['Profesional', 'Menjaga kualitas layanan melalui fasilitator berpengalaman, materi terstruktur, dan proses kerja yang dapat dipertanggungjawabkan.', 'bi-award', 30],
  ['Kolaborasi', 'Bekerja bersama klien sebagai mitra strategis untuk menghasilkan solusi pengembangan SDM yang berdampak.', 'bi-people', 40]
];

export const aboutAdvantages = [
  ['Tim Berpengalaman', 'Didukung trainer dan konsultan dengan pengalaman luas dalam pengembangan SDM, leadership, motivasi, dan outbound.', 'bi-person-check', 10],
  ['Program Custom', 'Materi, durasi, metode, dan output dapat dirancang sesuai kebutuhan organisasi.', 'bi-puzzle', 20],
  ['Metode Aplikatif', 'Pembelajaran dibuat interaktif, praktis, dan mudah diterapkan di lingkungan kerja.', 'bi-rocket-takeoff', 30],
  ['Jangkauan Nasional', 'Melayani perusahaan, instansi, dan organisasi di berbagai kota di Indonesia.', 'bi-geo-alt', 40],
  ['Dokumentasi & Evaluasi', 'Program dapat dilengkapi dokumentasi kegiatan, evaluasi peserta, dan laporan rekomendasi.', 'bi-clipboard-data', 50],
  ['Layanan Konsultatif', 'Tim kami membantu menganalisis kebutuhan pelatihan sebelum program dijalankan.', 'bi-chat-dots', 60]
];

export const servicePage = {
  slug: 'services',
  hero_eyebrow: 'Layanan Kami',
  hero_title: 'Solusi Pelatihan & Pengembangan SDM yang Fleksibel',
  hero_subtitle: 'STAR Training & Consulting menyediakan layanan training, consulting, outbound, sertifikasi, online course, hingga solusi digital yang dapat dikustomisasi sesuai kebutuhan organisasi.',
  hero_image_url: 'https://startraining.info/wp-content/uploads/2026/02/Compro-STAR-Training-2026-17.6-x-25-cm-721x1024.png',
  intro_eyebrow: 'Customize Program',
  intro_title: 'Layanan dapat disesuaikan dengan kebutuhan perusahaan Anda',
  intro_content: '<p>Kami memahami bahwa setiap organisasi memiliki tantangan, budaya kerja, dan target pengembangan SDM yang berbeda. Karena itu, STAR Training & Consulting menyediakan layanan yang dapat dikustomisasi mulai dari materi, durasi, metode, lokasi, jumlah peserta, hingga output program.</p><p>Tim kami siap membantu menganalisis kebutuhan, menyusun konsep program, dan menjalankan pelatihan yang relevan untuk perusahaan, instansi, BUMN, lembaga pendidikan, maupun komunitas profesional.</p>',
  services_eyebrow: 'Fitur Layanan',
  services_title: 'Layanan Utama STAR Training',
  services_subtitle: 'Pilih layanan yang sesuai dengan kebutuhan organisasi, atau konsultasikan kebutuhan khusus agar tim kami menyusun program custom.',
  programs_eyebrow: 'Program Kami',
  programs_title: 'Semua Program Pelatihan',
  programs_subtitle: 'Daftar program dapat diedit dari dashboard Program dan langsung tampil di halaman layanan.',
  cta_title: 'Butuh layanan yang benar-benar custom?',
  cta_subtitle: 'Diskusikan kebutuhan pelatihan, konsultasi, sertifikasi, outbound, atau solusi digital bersama tim STAR Training.',
  cta_button_label: 'Konsultasi via WhatsApp',
  cta_button_url: '#kontak',
  meta_title: 'Layanan STAR Training & Consulting | Training, Consulting, Outbound & Sertifikasi',
  meta_description: 'Layanan STAR Training & Consulting meliputi training, consulting, outbound, sertifikasi, online course, software product, dan program custom pengembangan SDM.',
  meta_keywords: 'layanan STAR Training, training SDM, consulting SDM, outbound, sertifikasi BNSP, motivation session, online course, software product'
};

export const serviceItems = [
  ['Bimtek & Sertifikasi', 'Program bimbingan teknis dan sertifikasi untuk meningkatkan kompetensi profesional peserta sesuai kebutuhan organisasi.', 'bi-patch-check', '', 'Lihat Program', '/#program', 10],
  ['Motivation Session', 'Sesi motivasi interaktif untuk membangun mindset positif, ownership, semangat kerja, dan kesiapan menghadapi target.', 'bi-lightning-charge', '', 'Detail Program', '/program/motivation-session', 20],
  ['Training', 'Pelatihan SDM untuk leadership, komunikasi, teamwork, service excellence, dan kompetensi kerja lainnya.', 'bi-mortarboard', '', 'Lihat Program', '/#program', 30],
  ['Consulting', 'Pendampingan konsultatif untuk menganalisis kebutuhan pengembangan SDM dan menyusun solusi yang tepat.', 'bi-chat-square-text', '', 'Konsultasi', '#kontak', 40],
  ['Outbound', 'Experiential learning dan team building yang dirancang untuk memperkuat kolaborasi, komunikasi, dan kepercayaan tim.', 'bi-tree', '', 'Detail Outbound', '/program/outbound-team-building', 50],
  ['Software Product', 'Solusi digital dan software untuk mendukung operasional, pembelajaran, dan pengelolaan program organisasi.', 'bi-window-stack', '', 'Konsultasi', '#kontak', 60],
  ['Online Course', 'Pembelajaran online yang fleksibel untuk mendukung pengembangan kompetensi peserta dari berbagai lokasi.', 'bi-play-circle', '', 'Konsultasi', '#kontak', 70]
];

export const programPage = {
  slug: 'programs',
  hero_eyebrow: 'Program Kami',
  hero_title: 'Semua Program Pelatihan',
  hero_subtitle: 'Temukan program training, consulting, outbound, sertifikasi, dan custom training yang sesuai dengan kebutuhan organisasi.',
  list_eyebrow: 'Semua Program',
  list_title: 'Program terbaru',
  list_subtitle: 'Daftar program dapat difilter berdasarkan kategori dan dimuat bertahap dengan load more.',
  meta_title: 'Semua Program Pelatihan | STAR Training & Consulting',
  meta_description: 'Daftar lengkap program pelatihan STAR Training & Consulting, mulai dari outbound, motivation session, leadership, sertifikasi BNSP, hingga custom training.',
  meta_keywords: 'program pelatihan, training SDM, outbound, motivation session, leadership, sertifikasi BNSP, custom training'
};

export const consultationPage = {
  slug: 'request-konsultasi', eyebrow: 'Konsultasi Gratis', title: 'Request Konsultasi Kebutuhan Pelatihan',
  subtitle: 'Ceritakan kebutuhan organisasi Anda. Tim kami akan menghubungi untuk menyusun solusi pelatihan yang tepat.',
  form_title: 'Form Request Konsultasi', form_description: 'Isi data singkat berikut, lalu tim kami akan menghubungi Anda.',
  name_label: 'Nama Lengkap *', whatsapp_label: 'No. WhatsApp *', company_label: 'Perusahaan / Instansi', message_label: 'Kebutuhan atau pesan Anda', submit_label: 'Kirim Request Konsultasi',
  background_color: '#fff8f1', label_color: '#9f1239', title_color: '#172033', description_color: '#475569',
  button_background_color: '#c41e3a', button_text_color: '#ffffff', button_border_color: '#c41e3a',
  label_font: 'Manrope', title_font: 'Manrope', description_font: 'Manrope', button_font: 'Manrope', label_size: 14, title_size: 44, description_size: 18, button_size: 16,
  meta_title: 'Request Konsultasi Pelatihan | STAR Training & Consulting',
  meta_description: 'Ajukan request konsultasi kebutuhan pelatihan, outbound, sertifikasi, leadership, atau program custom bersama STAR Training & Consulting.',
  meta_keywords: 'request konsultasi pelatihan, konsultasi training SDM, training custom, outbound perusahaan'
};
export const clientPage = { slug: 'klien', eyebrow: 'Kepercayaan Klien', title: 'Klien & Mitra Kami', subtitle: 'Dipercaya oleh perusahaan, instansi, dan organisasi dari berbagai sektor di Indonesia.', meta_title: 'Klien & Mitra STAR Training | Pelatihan SDM Profesional', meta_description: 'Daftar klien dan mitra yang mempercayakan kebutuhan pelatihan dan pengembangan SDM kepada STAR Training & Consulting.', meta_keywords: 'klien STAR Training, mitra pelatihan SDM, perusahaan training' };
export const eventPage = { slug: 'event', eyebrow: 'Agenda STAR Training', title: 'Event & Kegiatan Kami', subtitle: 'Informasi event yang akan datang, sedang berlangsung, dan telah diselenggarakan.', meta_title: 'Event STAR Training & Consulting', meta_description: 'Daftar event, seminar, pelatihan, dan kegiatan STAR Training & Consulting.', meta_keywords: 'event training, seminar SDM, kegiatan STAR Training' };
export const proposalPage = { slug: 'proposal', eyebrow: 'Penawaran Khusus', title: 'Solusi Pelatihan untuk Organisasi Anda', subtitle: 'Penawaran dapat disesuaikan dengan kebutuhan, jumlah peserta, dan target organisasi.', package_eyebrow: 'Pilihan Paket', package_title: 'Pilih Paket yang Tepat', package_subtitle: 'Pilih paket awal atau hubungi kami untuk rancangan pelatihan yang lebih spesifik.', contact_title: 'Kontak Kami', contact_subtitle: 'Tinggalkan data Anda. Tim kami akan mencatat permintaan dan mengarahkan Anda ke WhatsApp admin.', meta_title: 'Penawaran Pelatihan | STAR Training & Consulting', meta_description: 'Penawaran program pelatihan yang dapat disesuaikan untuk kebutuhan organisasi.', meta_keywords: 'penawaran pelatihan, proposal training, training perusahaan' };
export const proposalPackages = [
  ['Paket Essential', 'Pilihan praktis untuk kebutuhan pelatihan dasar organisasi.', 'Mulai dari Rp 5.000.000', JSON.stringify(['Konsultasi kebutuhan', 'Materi dapat disesuaikan', 'Trainer profesional']), 'Pilih Paket', 0, 1, 10],
  ['Paket Professional', 'Paket populer untuk program yang membutuhkan rancangan lebih lengkap.', 'Hubungi kami untuk penawaran', JSON.stringify(['Semua fasilitas Essential', 'Pre-assessment kebutuhan', 'Dokumentasi dan evaluasi']), 'Pilih Paket Ini', 1, 1, 20],
  ['Paket Custom', 'Rancang solusi pelatihan yang sesuai dengan target organisasi Anda.', 'Harga menyesuaikan kebutuhan', JSON.stringify(['Rancangan program custom', 'Pilihan metode dan lokasi', 'Pendampingan tim konsultasi']), 'Diskusikan Paket', 0, 1, 30]
];

export const navigation = [
  ['Home', '/#hero', 10], ['Tentang', '/#tentang', 20], ['Program', '/#program', 30],
  ['Gallery', '/gallery', 40], ['Testimoni', '/testimonials', 50], ['Artikel', '/blog', 60],
  ['Partnership', '/#partnership', 70], ['Contact', '/#kontak', 80]
];

export const paymentAccounts = [
  ['BCA', '0000000000', 'STAR Training & Consulting', 'Bandung', 'Gunakan kode unik transfer agar pembayaran lebih mudah diverifikasi.', 10],
  ['Mandiri', '1111111111', 'STAR Training & Consulting', 'Jakarta', 'Upload bukti transfer setelah pembayaran.', 20]
];

export const confirmationContacts = [
  ['Sdr. Yusuf', '0812-2202-1262', 'Konfirmasi Bukti Pembayaran', 10]
];

export const socialProofs = [
  ['Rina HRD', 'telah membeli paket layanan pelatihan', 'bimtek-sertifikasi-bnsp', '', '-2 hours', 4, 10],
  ['Bapak Andi', 'baru saja booking program', 'motivation-session', '', '-6 hours', 4, 20],
  ['PT Maju Bersama', 'mengajukan penawaran untuk', 'outbound-team-building', '', '-1 day', 5, 30],
  ['Ibu Sari', 'telah berkonsultasi tentang', 'leadership-excellence', '', '-2 days', 4, 40],
  ['Tim HR', 'meminta jadwal untuk', 'custom-training', '', '-3 days', 5, 50]
];
