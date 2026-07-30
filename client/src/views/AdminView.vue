<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../api.js';
import { notifyCmsChange } from '../cmsSync.js';

const router = useRouter();
const user = ref({});
const active = ref('dashboard');
const mobileMenu = ref(false);
const loading = ref(false);
const notice = ref({ type: '', text: '' });
const toasts = ref([]);
const savingRecord = ref(false);
const savingSettings = ref(false);
const savingSections = ref(new Set());
const openSectionId = ref(null);
const bulkOpen = ref(false);
const bulkJson = ref('');
const bulkSaving = ref(false);
const accountSaving = ref('');
const dashboard = ref({ counts: {}, recent_leads: [], recent_logs: [] });
const settings = ref({});
const sections = ref([]);
const records = ref([]);
const editing = ref(null);
const printOrder = ref(null);
const uploadUrl = ref('');
const uploadResult = ref(null);
const mediaData = ref({ summary: {}, files: [] });
const galleryOptions = ref([]);
const selectedGalleryId = ref('');
const proposalOverview = ref([]);
const previewProposalSlug = ref('');
const proposalJson = ref('');

const nav = [
  ['dashboard', 'bi-speedometer2', 'Dashboard'],
  ['sections', 'bi-layout-text-window-reverse', 'Struktur Landing'],
  ['about_pages', 'bi-info-circle', 'Halaman Tentang'],
  ['about_values', 'bi-gem', 'Nilai Tentang'],
  ['about_advantages', 'bi-check2-circle', 'Keunggulan'],
  ['service_pages', 'bi-grid-1x2', 'Halaman Layanan'],
  ['program_pages', 'bi-card-list', 'Halaman Program'],
  ['consultation_pages', 'bi-chat-square-text', 'Halaman Konsultasi'],
  ['client_pages', 'bi-building', 'Halaman Klien'],
  ['events', 'bi-calendar-event', 'Event'], ['event_pages', 'bi-calendar-week', 'Halaman Event'],
  ['proposal_pages', 'bi-file-earmark-richtext', 'Proposal'],
  ['programs', 'bi-journal-check', 'Program'],
  ['trainers', 'bi-people', 'Trainer'],
  ['galleries', 'bi-images', 'Album Galeri'],
  ['posts', 'bi-newspaper', 'Blog'],
  ['testimonials', 'bi-chat-quote', 'Testimoni'],
  ['faqs', 'bi-question-circle', 'FAQ'],
  ['features', 'bi-stars', 'Keunggulan'],
  ['partners', 'bi-diagram-3', 'Kemitraan'],
  ['stats', 'bi-bar-chart', 'Statistik'],
  ['navigation', 'bi-list', 'Navigasi'],
  ['social_proofs', 'bi-bell', 'Social Proof'],
  ['leads', 'bi-inbox', 'Lead Masuk'],
  ['payment_accounts', 'bi-bank', 'Rekening Transfer'],
  ['confirmation_contacts', 'bi-whatsapp', 'Kontak Konfirmasi'],
  ['program_orders', 'bi-receipt', 'Order Program'],
  ['settings', 'bi-gear', 'Branding & Umum'],
  ['seo', 'bi-search', 'SEO & Webmaster'],
  ['media', 'bi-cloud-upload', 'Media Upload'],
  ['account', 'bi-person-gear', 'Akun']
];

const schemas = {
  programs: {
    title: 'Program', fields: {
      title: ['Judul', 'text', true], slug: ['Slug URL', 'text'], category: ['Kategori', 'text'], badge: ['Badge', 'text'],
      description: ['Deskripsi Ringkas', 'textarea'], content: ['Konten Detail', 'wysiwyg'], icon: ['Bootstrap Icon', 'text'],
      emoji: ['Emoji', 'text'], image_url: ['URL Gambar', 'image'], flyer_pdf_url: ['Flyer PDF', 'file'], cta_url: ['URL CTA', 'text'],
      price_regular: ['Harga Coret', 'number'], price_discount: ['Harga Diskon', 'number'], voucher_code: ['Kode Voucher', 'text'],
      voucher_discount: ['Potongan Voucher', 'number'], youtube_url: ['Link Video YouTube', 'url'],
      enable_order_form: ['Aktifkan Formulir Order', 'boolean'], enable_whatsapp_cta: ['Aktifkan CTA WhatsApp', 'boolean'],
      hero_featured: ['Tampil di Hero Slider', 'boolean'], is_featured: ['Unggulan', 'boolean'],
      is_published: ['Tayang', 'boolean'], sort_order: ['Urutan', 'number']
    }
  },
  trainers: {
    title: 'Trainer', fields: {
      name: ['Nama', 'text', true], role: ['Posisi', 'text'], bio: ['Biografi', 'textarea'], certifications: ['Sertifikasi (pisahkan koma)', 'text'],
      image_url: ['Foto', 'image'], is_published: ['Tayang', 'boolean'], sort_order: ['Urutan', 'number']
    }
  },
  galleries: {
    title: 'Album Galeri', fields: {
      title: ['Judul Album', 'text', true], slug: ['Slug URL', 'text'], description: ['Deskripsi', 'textarea'], cover_url: ['Cover', 'image'],
      event_date: ['Tanggal Kegiatan', 'date'], location: ['Lokasi', 'text'], is_published: ['Tayang', 'boolean'], sort_order: ['Urutan', 'number']
    }
  },
  gallery_images: {
    title: 'Foto Galeri', fields: {
      gallery_id: ['Pilih Album', 'gallery-select', true], image_url: ['File Gambar', 'image', true], alt_text: ['Alt Text SEO', 'text'],
      caption: ['Caption', 'textarea'], sort_order: ['Urutan', 'number']
    }
  },
  posts: {
    title: 'Artikel Blog', fields: {
      title: ['Judul', 'text', true], slug: ['Slug URL', 'text'], category: ['Kategori', 'text'], excerpt: ['Ringkasan', 'textarea'],
      content: ['Isi Artikel', 'wysiwyg'], featured_image: ['Featured Image', 'image'], meta_title: ['Meta Title', 'text'],
      meta_description: ['Meta Description', 'textarea'], keywords: ['Keywords', 'text'], canonical_url: ['Canonical URL', 'text'],
      is_published: ['Tayang', 'boolean'], is_featured: ['Unggulan', 'boolean'], published_at: ['Tanggal Publikasi', 'date'],
      sort_order: ['Urutan', 'number']
    }
  },
  testimonials: {
    title: 'Testimoni', fields: {
      name: ['Nama', 'text', true], organization: ['Organisasi / Jabatan', 'text'], quote: ['Testimoni', 'textarea', true],
      rating: ['Rating 1-5', 'number'], avatar_url: ['Avatar', 'image'], is_published: ['Tayang', 'boolean'], sort_order: ['Urutan', 'number']
    }
  },
  faqs: { title: 'FAQ', fields: { question: ['Pertanyaan', 'text', true], answer: ['Jawaban', 'textarea', true], is_published: ['Tayang', 'boolean'], sort_order: ['Urutan', 'number'] } },
  clients: { title: 'Logo Klien', fields: { name: ['Nama Klien', 'text', true], logo_url: ['Logo', 'image'], website_url: ['Website', 'text'], is_published: ['Tayang', 'boolean'], sort_order: ['Urutan', 'number'] } },
  features: { title: 'Keunggulan', fields: { title: ['Judul', 'text', true], description: ['Deskripsi', 'textarea'], icon: ['Bootstrap Icon', 'text'], is_published: ['Tayang', 'boolean'], sort_order: ['Urutan', 'number'] } },
  partners: {
    title: 'Kemitraan', fields: {
      title: ['Judul', 'text', true], description: ['Deskripsi', 'textarea'], icon: ['Bootstrap Icon', 'text'], button_label: ['Label Tombol', 'text'],
      button_url: ['URL Tombol', 'text'], is_published: ['Tayang', 'boolean'], sort_order: ['Urutan', 'number']
    }
  },
  about_pages: {
    title: 'Halaman Tentang', fields: {
      hero_eyebrow: ['Label Hero', 'text'], hero_title: ['Judul Hero', 'text', true],
      hero_subtitle: ['Subjudul Hero', 'textarea'], hero_image_url: ['Gambar Hero', 'image'],
      intro_eyebrow: ['Label Profil', 'text'], intro_title: ['Judul Profil', 'text'], intro_content: ['Isi Profil', 'wysiwyg'],
      values_eyebrow: ['Label Nilai', 'text'], values_title: ['Judul Nilai', 'text'], values_subtitle: ['Subjudul Nilai', 'textarea'],
      advantages_eyebrow: ['Label Keunggulan', 'text'], advantages_title: ['Judul Keunggulan', 'text'], advantages_subtitle: ['Subjudul Keunggulan', 'textarea'],
      cta_title: ['Judul CTA', 'text'], cta_subtitle: ['Subjudul CTA', 'textarea'], cta_button_label: ['Label Tombol CTA', 'text'], cta_button_url: ['URL Tombol CTA', 'text'],
      meta_title: ['SEO Title About', 'text'], meta_description: ['SEO Description About', 'textarea'], meta_keywords: ['SEO Keywords About', 'textarea'],
      is_published: ['Tayang', 'boolean']
    }
  },
  about_values: {
    title: 'Nilai Tentang', fields: {
      title: ['Judul', 'text', true], description: ['Deskripsi', 'textarea'], icon: ['Bootstrap Icon', 'text'],
      is_published: ['Tayang', 'boolean'], sort_order: ['Urutan', 'number']
    }
  },
  about_advantages: {
    title: 'Keunggulan Tentang', fields: {
      title: ['Judul', 'text', true], description: ['Deskripsi', 'textarea'], icon: ['Bootstrap Icon', 'text'],
      is_published: ['Tayang', 'boolean'], sort_order: ['Urutan', 'number']
    }
  },
  service_pages: {
    title: 'Halaman Layanan', fields: {
      hero_eyebrow: ['Label Hero', 'text'], hero_title: ['Judul Hero', 'text', true],
      hero_subtitle: ['Subjudul Hero', 'textarea'], hero_image_url: ['Gambar Hero', 'image'],
      intro_eyebrow: ['Label Intro', 'text'], intro_title: ['Judul Intro', 'text'], intro_content: ['Isi Intro', 'wysiwyg'],
      services_eyebrow: ['Label Layanan', 'text'], services_title: ['Judul Layanan', 'text'], services_subtitle: ['Subjudul Layanan', 'textarea'],
      programs_eyebrow: ['Label Program', 'text'], programs_title: ['Judul Program', 'text'], programs_subtitle: ['Subjudul Program', 'textarea'],
      cta_title: ['Judul CTA', 'text'], cta_subtitle: ['Subjudul CTA', 'textarea'], cta_button_label: ['Label Tombol CTA', 'text'], cta_button_url: ['URL Tombol CTA', 'text'],
      meta_title: ['SEO Title Layanan', 'text'], meta_description: ['SEO Description Layanan', 'textarea'], meta_keywords: ['SEO Keywords Layanan', 'textarea'],
      is_published: ['Tayang', 'boolean']
    }
  },
  service_items: {
    title: 'Item Layanan', fields: {
      title: ['Judul', 'text', true], description: ['Deskripsi', 'textarea'], icon: ['Bootstrap Icon', 'text'], image_url: ['Cover Gambar', 'image'],
      button_label: ['Label Tombol', 'text'], button_url: ['URL Tombol', 'text'], is_published: ['Tayang', 'boolean'], sort_order: ['Urutan', 'number']
    }
  },
  program_pages: {
    title: 'Halaman Program', fields: {
      hero_eyebrow: ['Label Hero', 'text'], hero_title: ['Judul Hero', 'text', true], hero_subtitle: ['Subjudul Hero', 'textarea'],
      list_eyebrow: ['Label Daftar', 'text'], list_title: ['Judul Daftar', 'text'], list_subtitle: ['Subjudul Daftar', 'textarea'],
      meta_title: ['SEO Title Program', 'text'], meta_description: ['SEO Description Program', 'textarea'], meta_keywords: ['SEO Keywords Program', 'textarea'],
      is_published: ['Tayang', 'boolean']
    }
  },
  consultation_pages: {
    title: 'Halaman Request Konsultasi', fields: {
      eyebrow: ['Label', 'text'], title: ['Judul', 'text', true], subtitle: ['Deskripsi', 'textarea'], form_title: ['Judul Form', 'text'], form_description: ['Deskripsi Form', 'textarea'],
      name_label: ['Label Nama', 'text'], whatsapp_label: ['Label WhatsApp', 'text'], company_label: ['Label Perusahaan', 'text'], message_label: ['Label Pesan', 'text'], submit_label: ['Label Tombol', 'text'],
      background_color: ['Warna Background', 'text'], label_color: ['Warna Label', 'text'], title_color: ['Warna Judul', 'text'], description_color: ['Warna Deskripsi', 'text'],
      button_background_color: ['Warna Latar Tombol', 'text'], button_text_color: ['Warna Teks Tombol', 'text'], button_border_color: ['Warna Border Tombol', 'text'],
      label_font: ['Font Label', 'text'], title_font: ['Font Judul', 'text'], description_font: ['Font Deskripsi', 'text'], button_font: ['Font Tombol', 'text'],
      label_size: ['Ukuran Label px', 'number'], title_size: ['Ukuran Judul px', 'number'], description_size: ['Ukuran Deskripsi px', 'number'], button_size: ['Ukuran Tombol px', 'number'],
      meta_title: ['SEO Title', 'text'], meta_description: ['SEO Description', 'textarea'], meta_keywords: ['SEO Keywords', 'textarea'], is_published: ['Tayang', 'boolean']
    }
  },
  client_pages: { title: 'Halaman Klien', fields: { eyebrow: ['Label', 'text'], title: ['Judul', 'text', true], subtitle: ['Deskripsi', 'textarea'], meta_title: ['SEO Title', 'text'], meta_description: ['SEO Description', 'textarea'], meta_keywords: ['SEO Keywords', 'textarea'], is_published: ['Tayang', 'boolean'] } },
  events: { title: 'Event', fields: { title:['Judul','text',true],slug:['Slug','text',true],description:['Ringkasan','textarea'],content:['Detail Event','wysiwyg'],image_url:['Gambar','image'],location:['Lokasi','text'],starts_at:['Mulai WIB','datetime-local'],ends_at:['Selesai WIB','datetime-local'],reservation_enabled:['Reservasi WhatsApp','boolean'],reservation_label:['Label Reservasi','text'],is_featured:['Tampil di Landing','boolean'],is_published:['Tayang','boolean'],sort_order:['Urutan Slider','number'] } },
  event_pages: { title:'Halaman Event', fields:{ eyebrow:['Label','text'],title:['Judul','text',true],subtitle:['Deskripsi','textarea'],meta_title:['SEO Title','text'],meta_description:['SEO Description','textarea'],meta_keywords:['SEO Keywords','textarea'],is_published:['Tayang','boolean'] } },
  proposal_pages: { title:'Halaman Proposal', fields:{ eyebrow:['Label Hero','text'],title:['Judul Default','text',true],subtitle:['Deskripsi Default','textarea'],package_eyebrow:['Label Paket','text'],package_title:['Judul Paket','text'],package_subtitle:['Deskripsi Paket','textarea'],contact_title:['Judul Kontak','text'],contact_subtitle:['Deskripsi Kontak','textarea'],meta_title:['SEO Title','text'],meta_description:['SEO Description','textarea'],meta_keywords:['SEO Keywords','textarea'],is_published:['Tayang','boolean'] } },
  proposals: { title:'Penawaran Proposal', fields:{ institution_name:['Nama Instansi','text',true],contact_name:['Nama PIC','text'],contact_whatsapp:['WhatsApp PIC','text'],title:['Judul Proposal','text'],slug:['Slug URL','text',true],hero_title:['Judul Hero Khusus','text'],hero_subtitle:['Deskripsi Hero Khusus','textarea'],intro_content:['Isi Pengantar Proposal','wysiwyg'],valid_until:['Berlaku Sampai','date'],is_published:['Tayang','boolean'] } },
  proposal_packages: { title:'Paket Proposal', fields:{ title:['Nama Paket','text',true],description:['Deskripsi Paket','textarea'],price_label:['Label Harga','text'],features:['Fitur Paket (satu per baris)','textarea'],button_label:['Label Tombol','text'],is_featured:['Paket Unggulan','boolean'],is_published:['Tayang','boolean'],sort_order:['Urutan','number'] } },
  stats: { title: 'Statistik Homepage', fields: { label: ['Label', 'text', true], value: ['Nilai Angka', 'number'], prefix: ['Awalan', 'text'], suffix: ['Akhiran', 'text'], icon: ['Bootstrap Icon', 'text'], is_published: ['Tayang', 'boolean'], sort_order: ['Urutan', 'number'] } },
  navigation: {
    title: 'Navigasi', fields: {
      label: ['Label', 'text', true], url: ['URL', 'text', true], location: ['Lokasi', 'select', false, ['header', 'footer']], target: ['Target', 'select', false, ['_self', '_blank']],
      is_published: ['Tayang', 'boolean'], sort_order: ['Urutan', 'number']
    }
  },
  social_proofs: {
    title: 'Social Proof Notification', fields: {
      customer_name: ['Nama / Perusahaan', 'text', true], action_text: ['Teks Aksi', 'text'],
      program_id: ['ID Program Terkait', 'number'], program_title: ['Judul Program/Layanan', 'text'],
      message_text: ['Kalimat Custom', 'textarea'], occurred_at: ['Waktu Kejadian', 'datetime-local'],
      display_seconds: ['Durasi Tampil (3-5 detik)', 'number'], is_published: ['Aktif', 'boolean'], sort_order: ['Urutan', 'number']
    }
  },
  leads: {
    title: 'Lead Masuk', fields: {
      name: ['Nama', 'text'], whatsapp: ['WhatsApp', 'text'], company: ['Perusahaan', 'text'], position: ['Jabatan', 'text'], program: ['Program', 'text'],
      participants: ['Peserta', 'text'], timeline: ['Waktu', 'text'], message: ['Pesan', 'textarea'], ref_code: ['Referral', 'text'],
      status: ['Status', 'select', false, ['new', 'contacted', 'qualified', 'won', 'lost']], notes: ['Catatan Admin', 'textarea']
    }
  },
  payment_accounts: {
    title: 'Rekening Transfer', fields: {
      bank_name: ['Nama Bank / E-wallet', 'text', true], account_number: ['Nomor Rekening', 'text', true], account_name: ['Nama Rekening', 'text', true],
      branch_name: ['Cabang / Keterangan', 'text'], instructions: ['Instruksi Transfer', 'textarea'], is_published: ['Aktif', 'boolean'], sort_order: ['Urutan', 'number']
    }
  },
  confirmation_contacts: {
    title: 'Kontak Konfirmasi', fields: {
      name: ['Nama Admin', 'text', true], whatsapp: ['Nomor WhatsApp', 'text', true], role: ['Keterangan Tugas', 'text'],
      is_published: ['Aktif', 'boolean'], sort_order: ['Urutan', 'number']
    }
  },
  program_orders: {
    title: 'Order Program', fields: {
      status: ['Status', 'select', false, ['pending', 'paid', 'verified', 'contacted', 'cancelled', 'refunded']],
      admin_notes: ['Catatan Admin', 'textarea']
    }
  }
};

const generalSettingGroups = [
  ['Identitas', [
    ['site_name', 'Nama Website', 'text'], ['site_short_name', 'Nama Pendek', 'text'], ['site_tagline', 'Tagline', 'text'],
    ['site_url', 'URL Website Produksi', 'url'], ['logo_url', 'URL Logo', 'image'], ['logo_text', 'Teks Logo', 'text'],
    ['logo_symbol', 'Simbol Logo', 'text'], ['favicon_url', 'URL Favicon', 'image'],
    ['flyer_pdf_url', 'Flyer Utama PDF', 'file'], ['flyer_button_label', 'Label Tombol Flyer', 'text']
  ]],
  ['Warna & Tipografi', [
    ['primary_color', 'Warna Utama', 'color'], ['secondary_color', 'Warna Sekunder', 'color'], ['accent_color', 'Warna Aksen', 'color'],
    ['dark_color', 'Warna Gelap', 'color'], ['font_display', 'Font Judul', 'text'], ['font_body', 'Font Isi', 'text']
  ]],
  ['Kontak', [
    ['whatsapp_number', 'Nomor WhatsApp', 'text'], ['phone', 'Telepon', 'text'], ['email', 'Email', 'email'], ['address', 'Alamat Bandung', 'textarea'],
    ['address_jakarta', 'Alamat Jakarta', 'textarea'], ['maps_url', 'Google Maps URL', 'url']
  ]],
  ['Media Sosial & Footer', [
    ['instagram_url', 'Instagram', 'url'], ['linkedin_url', 'LinkedIn', 'url'], ['youtube_url', 'YouTube', 'url'], ['facebook_url', 'Facebook', 'url'],
    ['footer_description', 'Deskripsi Footer', 'textarea'], ['copyright_text', 'Copyright', 'text']
  ]]
];

const seoSettingGroups = [
  ['SEO Utama', [
    ['seo_title', 'Default Meta Title', 'text'], ['seo_description', 'Default Meta Description', 'textarea'],
    ['seo_keywords', 'Keywords', 'textarea'], ['seo_robots', 'Robots', 'text'], ['seo_og_image', 'Default Social Image', 'image']
  ]],
  ['Webmaster Tools', [
    ['google_verification', 'Google Search Console Verification', 'text'], ['bing_verification', 'Bing Webmaster Verification', 'text'],
    ['yandex_verification', 'Yandex Verification', 'text']
  ]],
  ['Analytics & Kode', [
    ['google_analytics_id', 'Google Analytics ID (G-XXXX)', 'text'], ['google_tag_manager_id', 'Google Tag Manager ID', 'text'],
    ['google_analytics_snippet', 'Google Analytics Snippet / Script', 'textarea'],
    ['custom_head_html', 'Custom Head HTML', 'textarea']
  ]],
  ['Structured Data Organisasi', [
    ['organization_founding_year', 'Tahun Berdiri', 'text'], ['organization_latitude', 'Latitude', 'text'], ['organization_longitude', 'Longitude', 'text']
  ]]
];

const activeLabel = computed(() => nav.find((x) => x[0] === active.value)?.[2] || 'Admin');
const currentSchema = computed(() => schemas[active.value]);

function showNotice(text, type = 'success') {
  const normalized = type === 'error' ? 'danger' : type;
  const toast = { id: Date.now() + Math.random(), text, type: normalized };
  toasts.value.push(toast);
  window.setTimeout(() => { toasts.value = toasts.value.filter((item) => item.id !== toast.id); }, 4500);
}

const bulkExamples = {
  testimonials: JSON.stringify([
    { name: 'Nama Peserta', organization: 'HR Manager - PT Contoh', quote: 'Program sangat relevan dan aplikatif.', rating: 5, avatar_url: '', is_published: 1, sort_order: 10 }
  ], null, 2),
  posts: JSON.stringify([
    { title: 'Judul Artikel SEO', slug: 'judul-artikel-seo', category: 'Leadership', excerpt: 'Ringkasan artikel maksimal sekitar 160 karakter.', content: '<h2>Subjudul</h2><p>Isi artikel lengkap dalam HTML.</p>', featured_image: '', meta_title: 'Judul SEO', meta_description: 'Deskripsi SEO artikel.', keywords: 'leadership, training', canonical_url: '', is_published: 1, is_featured: 0, published_at: '2026-06-14', sort_order: 10 }
  ], null, 2),
  stats: JSON.stringify([
    { label: 'Klien Perusahaan & Instansi', value: 500, prefix: '', suffix: '+', icon: 'bi-buildings', is_published: 1, sort_order: 10 },
    { label: 'Program Pelatihan Selesai', value: 1200, prefix: '', suffix: '+', icon: 'bi-calendar-check', is_published: 1, sort_order: 20 },
    { label: 'Total Peserta Training', value: 25000, prefix: '', suffix: '+', icon: 'bi-people', is_published: 1, sort_order: 30 },
    { label: 'Tahun Pengalaman', value: 12, prefix: '', suffix: '+', icon: 'bi-award', is_published: 1, sort_order: 40 }
  ], null, 2),
  proposals: JSON.stringify([
    { institution_name: 'PT Contoh Indonesia', contact_name: 'Bapak Andi', contact_whatsapp: '081234567890', title: 'Proposal Pelatihan untuk {{NAMA_INSTANSI}}', slug: 'pt-contoh-indonesia', hero_title: 'Penawaran Program Pelatihan untuk {{NAMA_INSTANSI}}', hero_subtitle: 'Solusi pelatihan yang disesuaikan dengan kebutuhan organisasi.', intro_content: '<h2>Salam</h2><p>Terima kasih atas kesempatan yang diberikan.</p>', valid_until: '2026-12-31', is_published: 1 },
    { institution_name: 'Dinas Contoh Kota', contact_name: 'Ibu Sari', contact_whatsapp: '081298765432', title: 'Proposal untuk {{NAMA_INSTANSI}}', hero_title: 'Rancangan Pelatihan untuk {{NAMA_INSTANSI}}', hero_subtitle: 'Program yang fleksibel dan terukur.', intro_content: '<p>Isi pengantar proposal.</p>', valid_until: '2026-12-31', is_published: 1 }
  ], null, 2),
  proposal_packages: JSON.stringify([
    { title: 'Paket Essential', description: 'Paket awal untuk kebutuhan pelatihan organisasi.', price_label: 'Mulai dari Rp 5.000.000', features: ['Konsultasi kebutuhan', 'Materi dapat disesuaikan', 'Trainer profesional'], button_label: 'Pilih Paket', is_featured: 0, is_published: 1, sort_order: 10 },
    { title: 'Paket Professional', description: 'Pilihan lengkap untuk program yang membutuhkan rancangan lebih detail.', price_label: 'Hubungi kami untuk penawaran', features: ['Semua fasilitas Essential', 'Pre-assessment kebutuhan', 'Dokumentasi dan evaluasi'], button_label: 'Pilih Paket Ini', is_featured: 1, is_published: 1, sort_order: 20 }
  ], null, 2),
  clients: JSON.stringify([
    { name: 'PT Contoh Indonesia', logo_url: 'https://contoh.com/logo-pt-contoh.webp', website_url: 'https://contoh.com', is_published: 1, sort_order: 10 },
    { name: 'Dinas Contoh Kota', logo_url: 'https://contoh.com/logo-dinas-contoh.webp', website_url: '', is_published: 1, sort_order: 20 }
  ], null, 2)
};

function openBulk() {
  bulkJson.value = bulkExamples[active.value] || '[]';
  bulkOpen.value = true;
}

async function importBulk() {
  bulkSaving.value = true;
  try {
    const payload = JSON.parse(bulkJson.value);
    const result = await api(`/admin/bulk/${active.value}`, { method: 'POST', body: payload });
    showNotice(result.message, 'success');
    notifyCmsChange(active.value);
    bulkOpen.value = false;
    await selectPage(active.value);
  } catch (error) {
    showNotice(error instanceof SyntaxError ? 'JSON tidak valid. Periksa koma, tanda kutip, dan kurung.' : error.message, 'danger');
  } finally { bulkSaving.value = false; }
}

async function copyBulkExample() {
  await navigator.clipboard.writeText(bulkJson.value);
  showNotice('Contoh JSON disalin. Kirimkan ke AI asisten sebagai format output.', 'info');
}

async function selectPage(page) {
  active.value = page;
  mobileMenu.value = false;
  notice.value.text = '';
  loading.value = true;
  try {
    if (page === 'dashboard') dashboard.value = await api('/admin/dashboard');
    else if (page === 'sections') sections.value = await api('/admin/sections');
    else if (page === 'settings' || page === 'seo') settings.value = await api('/admin/settings');
    else if (page === 'media') mediaData.value = await api('/admin/media');
    else if (schemas[page]) records.value = await api(`/admin/${page}`);
    if (page === 'proposal_pages') {
      proposalOverview.value = await api('/admin/proposals');
      previewProposalSlug.value = previewProposalSlug.value || proposalOverview.value[0]?.slug || '';
    }
    if (['galleries', 'gallery_images'].includes(page)) galleryOptions.value = await api('/admin/galleries');
    if (page === 'sections') {
      sections.value = sections.value.map((section) => ({
        ...section,
        config: {
          ...(section.config || {}),
          display_mode: section.section_key === 'clients' ? (section.config?.display_mode || 'masonry') : section.config?.display_mode,
          scroll_height: section.config?.scroll_height || 240,
          sitelink_enabled: section.config?.sitelink_enabled ?? 1,
          sitelink_label: section.config?.sitelink_label || section.title || section.name,
          about_button_label: section.config?.about_button_label || 'Selengkapnya Tentang Kami',
          about_button_url: section.config?.about_button_url || '/about',
          action_button_label: section.config?.action_button_label || '',
          action_button_url: section.config?.action_button_url || '',
          form_title: section.config?.form_title || 'Request Konsultasi',
          button_label: section.config?.button_label || 'Hubungi Kami Sekarang',
          style: {
            background_color: '',
            eyebrow_color: '',
            eyebrow_font_family: '',
            eyebrow_size_desktop: 12,
            eyebrow_size_mobile: 11,
            heading_color: '',
            title_font_family: '',
            title_size_desktop: section.section_key === 'hero' ? 64 : 44,
            title_size_mobile: section.section_key === 'hero' ? 30 : 32,
            text_color: '',
            subtitle_font_family: '',
            text_size_desktop: 18,
            text_size_mobile: 16,
            font_family: '',
            text_align: '',
            padding_desktop: 96,
            padding_mobile: 64,
            margin_top_desktop: 0,
            margin_bottom_desktop: 0,
            margin_top_mobile: 0,
            margin_bottom_mobile: 0,
            divider_type: 'curve',
            divider_position: 'bottom',
            divider_color: '',
            divider_height_desktop: 42,
            divider_height_mobile: 24,
            parallax_enabled: 0,
            parallax_image_url: '',
            parallax_overlay_color: '#000000',
            parallax_overlay_opacity: 35,
            aurora_enabled: 1,
            aurora_gradient: '',
            glow_enabled: 1,
            glow_color: '#ff6b6b',
            particles_enabled: section.section_key === 'hero' ? 1 : 0,
            particle_color: 'rgba(255,255,255,.92)',
            particle_count: section.section_key === 'hero' ? 12 : 0,
            button_variant: '',
            button_background_color: '',
            button_text_color: '',
            button_border_color: '',
            button_font_family: '',
            button_font_size_desktop: 16,
            button_font_size_mobile: 15,
            eyebrow_margin_desktop: 0, eyebrow_margin_mobile: 0, eyebrow_padding_desktop: 0, eyebrow_padding_mobile: 0,
            title_margin_desktop: 0, title_margin_mobile: 0, title_padding_desktop: 0, title_padding_mobile: 0,
            subtitle_margin_desktop: 0, subtitle_margin_mobile: 0, subtitle_padding_desktop: 0, subtitle_padding_mobile: 0,
            ...(section.config?.style || {})
          }
        }
      }));
      openSectionId.value = sections.value[0]?.id || null;
    }
  } catch (error) {
    showNotice(error.message, 'error');
  } finally {
    loading.value = false;
  }
}

function toggleSection(sectionId) {
  openSectionId.value = openSectionId.value === sectionId ? null : sectionId;
}

function blankRecord() {
  const item = {};
  for (const [field, config] of Object.entries(currentSchema.value.fields)) {
    item[field] = config[1] === 'boolean' ? 1 : config[1] === 'number' ? 0 : '';
  }
  if ('is_published' in item) item.is_published = 1;
  if ('rating' in item) item.rating = 5;
  if ('location' in item) item.location = 'header';
  if ('target' in item) item.target = '_self';
  if (active.value === 'stats') {
    item.suffix = '+';
    item.icon = 'bi-bar-chart';
  }
  if (active.value === 'social_proofs') {
    item.action_text = 'telah membeli paket layanan pelatihan';
    item.display_seconds = 4;
    item.occurred_at = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString().slice(0, 16);
  }
  if (active.value === 'gallery_images' && selectedGalleryId.value) item.gallery_id = Number(selectedGalleryId.value);
  return item;
}

function proposalJsonExample() {
  return active.value === 'proposal_packages'
    ? JSON.stringify({ title: 'Paket Professional', description: 'Paket pelatihan untuk kebutuhan organisasi.', price_label: 'Mulai dari Rp 10.000.000', features: ['Konsultasi kebutuhan', 'Materi custom', 'Trainer profesional', 'Dokumentasi kegiatan'], button_label: 'Pilih Paket Ini', is_featured: 1, is_published: 1, sort_order: 20 }, null, 2)
    : JSON.stringify({ institution_name: 'PT Contoh Indonesia', contact_name: 'Bapak/Ibu PIC', contact_whatsapp: '081234567890', title: 'Proposal Pelatihan untuk {{NAMA_INSTANSI}}', slug: 'pt-contoh-indonesia', hero_title: 'Penawaran Program Pelatihan untuk {{NAMA_INSTANSI}}', hero_subtitle: 'Solusi pelatihan yang dirancang sesuai kebutuhan organisasi Anda.', intro_content: '<h2>Salam</h2><p>Terima kasih atas kesempatan yang diberikan kepada STAR Training & Consulting.</p>', valid_until: '2026-12-31', is_published: 1 }, null, 2);
}
function openCreate() { editing.value = blankRecord(); proposalJson.value = ['proposals', 'proposal_packages'].includes(active.value) ? proposalJsonExample() : ''; }
function applyProposalJson() {
  try {
    const payload = JSON.parse(proposalJson.value);
    if (!payload || Array.isArray(payload)) throw new Error('Gunakan satu objek JSON, bukan array.');
    const allowed = Object.keys(currentSchema.value.fields);
    for (const field of allowed) if (payload[field] !== undefined) editing.value[field] = field === 'features' && Array.isArray(payload[field]) ? payload[field].join('\n') : payload[field];
    if (payload.slug === undefined) eventSlugFromTitle();
    showNotice('JSON berhasil diterapkan ke formulir. Periksa lalu klik Simpan.', 'success');
  } catch (error) { showNotice(`JSON tidak valid: ${error.message}`, 'danger'); }
}
async function openGalleryImages(galleryId = '') {
  await selectPage('gallery_images');
  selectedGalleryId.value = galleryId ? String(galleryId) : '';
}
function eventSlugFromTitle() {
  if (!['events', 'proposals'].includes(active.value) || editing.value?.id) return;
  const source = active.value === 'proposals' ? editing.value.institution_name : editing.value.title;
  const base = String(source || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || (active.value === 'proposals' ? 'proposal' : 'event');
  const used = new Set(records.value.map((item) => item.slug));
  let slug = base; let index = 2;
  while (used.has(slug)) slug = `${base}-${index++}`;
  editing.value.slug = slug;
}
function proposalUrl(slug) { return `${window.location.origin}/proposal/${slug}`; }
function proposalQr(slug) { return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(proposalUrl(slug))}`; }
function openEdit(item) {
  editing.value = { ...item };
  if (active.value === 'trainers') {
    try { editing.value.certifications = JSON.parse(editing.value.certifications || '[]').join(', '); } catch {}
  }
  if (active.value === 'proposal_packages') {
    try { editing.value.features = JSON.parse(editing.value.features || '[]').join('\n'); } catch {}
  }
}

function updateRichText(field, event) {
  editing.value[field] = event.currentTarget.innerHTML;
}

function richCommand(command, value = null) {
  document.execCommand(command, false, value);
}

function richLink() {
  const url = prompt('Masukkan URL link');
  if (url) richCommand('createLink', url);
}

async function saveRecord() {
  if (savingRecord.value) return;
  savingRecord.value = true;
  try {
    const isExisting = Boolean(editing.value.id);
    await api(`/admin/${active.value}${isExisting ? `/${editing.value.id}` : ''}`, { method: isExisting ? 'PUT' : 'POST', body: editing.value });
    editing.value = null;
    showNotice('Data berhasil disimpan.');
    notifyCmsChange(active.value);
    await selectPage(active.value);
  } catch (error) { showNotice(error.message, 'danger'); }
  finally { savingRecord.value = false; }
}

async function removeRecord(item) {
  if (!confirm(`Hapus "${item.title || item.name || item.question || item.label}"?`)) return;
  try {
    await api(`/admin/${active.value}/${item.id}`, { method: 'DELETE' });
    showNotice('Data berhasil dihapus.');
    notifyCmsChange(active.value);
    await selectPage(active.value);
  } catch (error) { showNotice(error.message, 'error'); }
}

const navPresets = [
  { label: 'Home', url: '/#hero', location: 'header', sort_order: 10 },
  { label: 'Tentang', url: '/about', location: 'header', sort_order: 20 },
  { label: 'Layanan', url: '/services', location: 'header', sort_order: 30 },
  { label: 'Program', url: '/programs', location: 'header', sort_order: 40 },
  { label: 'Galeri', url: '/gallery', location: 'header', sort_order: 50 },
  { label: 'Testimoni', url: '/testimonials', location: 'header', sort_order: 60 },
  { label: 'Blog / Artikel', url: '/blog', location: 'header', sort_order: 70 },
  { label: 'Penawaran', url: '/penawaran', location: 'header', sort_order: 80 }
];

async function togglePublish(item) {
  const nextValue = item.is_published ? 0 : 1;
  item.is_published = nextValue;
  try {
    await api(`/admin/navigation/${item.id}`, { method: 'PUT', body: item });
    showNotice(`Menu "${item.label}" ${nextValue ? 'ditayangkan (On)' : 'disembunyikan (Off)'}.`);
    notifyCmsChange('navigation');
  } catch (error) {
    item.is_published = nextValue ? 0 : 1;
    showNotice(error.message, 'danger');
  }
}

async function addPresetNav(preset) {
  try {
    await api('/admin/navigation', {
      method: 'POST',
      body: { ...preset, target: '_self', is_published: 1 }
    });
    showNotice(`Menu "${preset.label}" (${preset.url}) berhasil ditambahkan.`);
    notifyCmsChange('navigation');
    await selectPage('navigation');
  } catch (error) {
    showNotice(error.message, 'danger');
  }
}

async function saveSection(section) {
  if (savingSections.value.has(section.id)) return;
  savingSections.value = new Set([...savingSections.value, section.id]);
  try {
    await api(`/admin/sections/${section.id}`, { method: 'PUT', body: section });
    showNotice(`Section ${section.name} disimpan.`);
    notifyCmsChange('sections');
  } catch (error) { showNotice(error.message, 'danger'); }
  finally {
    const next = new Set(savingSections.value);
    next.delete(section.id);
    savingSections.value = next;
  }
}

async function saveSettings() {
  if (savingSettings.value) return;
  savingSettings.value = true;
  try {
    await api('/admin/settings', { method: 'PUT', body: settings.value });
    showNotice('Pengaturan berhasil disimpan.');
    notifyCmsChange('settings');
  } catch (error) { showNotice(error.message, 'danger'); }
  finally { savingSettings.value = false; }
}

async function uploadFile(event, target = null, field = '') {
  const file = event.target.files?.[0];
  if (!file) return;
  const body = new FormData();
  body.append('file', file);
  try {
    const result = await api('/admin/upload', { method: 'POST', body });
    uploadUrl.value = result.url;
    uploadResult.value = result;
    if (target && field) target[field] = result.url;
    showNotice(result.type === 'document' ? 'PDF berhasil diunggah.' : 'Gambar dan source berhasil diunggah.');
    if (active.value === 'media') mediaData.value = await api('/admin/media');
  } catch (error) { showNotice(error.message, 'error'); }
  event.target.value = '';
}

async function removeMedia(file) {
  if (!confirm(`Hapus media "${file.original_name}" beserta source-nya?`)) return;
  try {
    await api(`/admin/media/${file.id}`, { method: 'DELETE' });
    mediaData.value = await api('/admin/media');
    if (uploadResult.value?.id === file.id) uploadResult.value = null;
    showNotice('Media dan source berhasil dihapus.');
  } catch (error) { showNotice(error.message, 'error'); }
}

function formatBytes(bytes = 0) {
  const value = Number(bytes || 0);
  if (!value) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  return `${(value / (1024 ** index)).toFixed(index ? 2 : 0)} ${units[index]}`;
}

function formatCurrency(value) {
  const number = Number(value || 0);
  return number ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number) : '-';
}

function formatDate(value) {
  if (!value) return '-';
  const text = String(value);
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: text.includes('T') || text.includes(':') ? 'short' : undefined }).format(date);
}

function openPrintOrder(item) {
  printOrder.value = { ...item };
}

function printCurrentOrder() {
  window.print();
}

async function logout() {
  await api('/auth/logout', { method: 'POST' });
  router.replace('/login');
}

const profile = ref({ name: '', email: '', current_password: '', new_password: '' });
async function saveProfile() {
  accountSaving.value = 'profile';
  try {
    await api('/auth/profile', { method: 'PUT', body: { name: profile.value.name, email: profile.value.email } });
    user.value.name = profile.value.name; user.value.email = profile.value.email;
    showNotice('Profil berhasil disimpan.');
  } catch (error) { showNotice(error.message, 'danger'); }
  finally { accountSaving.value = ''; }
}
async function changePassword() {
  accountSaving.value = 'password';
  try {
    await api('/auth/password', { method: 'PUT', body: profile.value });
    alert('Password berhasil diubah. Silakan login kembali.');
    router.replace('/login');
  } catch (error) { showNotice(error.message, 'danger'); accountSaving.value = ''; }
}

onMounted(async () => {
  const me = await api('/auth/me');
  user.value = me.user;
  profile.value.name = user.value.name;
  profile.value.email = user.value.email;
  await selectPage('dashboard');
});
</script>

<template>
  <div class="admin-shell">
    <aside class="admin-sidebar" :class="{ open: mobileMenu }">
      <div class="admin-brand">⭐ STAR CMS <small class="d-block text-white-50 mt-1">SuperAdmin</small></div>
      <nav class="admin-nav">
        <button v-for="item in nav" :key="item[0]" :class="{ active: active === item[0] }" @click="selectPage(item[0])"><i class="bi me-2" :class="item[1]"></i>{{ item[2] }}</button>
      </nav>
    </aside>

    <div class="admin-content">
      <header class="admin-topbar">
        <div class="d-flex align-items-center gap-2"><button class="btn btn-light mobile-admin-toggle" @click="mobileMenu=!mobileMenu"><i class="bi bi-list"></i></button><div><strong>{{ activeLabel }}</strong><small class="d-block text-muted">{{ user.name }}</small></div></div>
        <div class="d-flex gap-2"><a href="/" target="_blank" class="btn btn-outline-secondary btn-sm"><i class="bi bi-box-arrow-up-right me-1"></i>Lihat Website</a><button class="btn btn-outline-danger btn-sm" @click="logout">Keluar</button></div>
      </header>

      <main class="admin-main">
        <div v-if="loading" class="py-5 text-center"><div class="spinner-border text-danger"></div></div>

        <template v-else-if="active === 'dashboard'">
          <div class="admin-stats mb-4">
            <div v-for="(value,key) in dashboard.counts" :key="key" class="admin-card admin-stat"><small class="text-muted text-uppercase">{{ key.replaceAll('_',' ') }}</small><strong>{{ value }}</strong></div>
          </div>
          <div class="row g-4">
            <div class="col-xl-7"><div class="admin-card"><h2 class="h5">Lead Terbaru</h2><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Nama</th><th>Perusahaan</th><th>Program</th><th>Status</th></tr></thead><tbody><tr v-for="lead in dashboard.recent_leads" :key="lead.id"><td>{{ lead.name }}<small class="d-block text-muted">{{ lead.whatsapp }}</small></td><td>{{ lead.company || '-' }}</td><td>{{ lead.program || '-' }}</td><td><span class="badge text-bg-warning">{{ lead.status }}</span></td></tr></tbody></table></div></div></div>
            <div class="col-xl-5"><div class="admin-card"><h2 class="h5">Aktivitas Terbaru</h2><div v-for="log in dashboard.recent_logs" :key="log.id" class="border-bottom py-2 small"><strong>{{ log.user_name || 'System' }}</strong> {{ log.action }} {{ log.entity }}<small class="d-block text-muted">{{ log.created_at }}</small></div></div></div>
          </div>
        </template>

        <template v-else-if="active === 'sections'">
          <div class="mb-3"><p class="text-muted mb-0">Atur judul, isi, visibilitas, dan urutan section landing page. Urutan kecil tampil lebih dahulu.</p></div>
          <div class="d-grid gap-3">
            <div v-for="section in sections" :key="section.id" class="admin-card section-accordion-card" :class="{ 'is-open': openSectionId === section.id }">
              <div class="section-accordion-header">
                <button type="button" class="section-accordion-toggle" :aria-expanded="openSectionId === section.id" @click="toggleSection(section.id)">
                  <span><strong>{{ section.name }}</strong> <code>{{ section.section_key }}</code><small>{{ section.title || 'Belum ada judul' }}</small></span>
                  <i class="bi" :class="openSectionId === section.id ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
                </button>
                <div class="form-check form-switch mb-0"><input v-model="section.is_visible" :true-value="1" :false-value="0" class="form-check-input" type="checkbox" @click.stop><label class="form-check-label">Tayang</label></div>
              </div>
              <div v-if="openSectionId === section.id" class="section-accordion-content">
              <div class="admin-form-grid">
                <label><span class="admin-label admin-label-with-settings">Eyebrow <details class="field-style-settings"><summary title="Atur font, warna, ukuran, margin dan padding label"><i class="bi bi-sliders"></i></summary><div class="field-style-panel"><label>Warna<div class="color-control"><input type="color" :value="section.config.style.eyebrow_color || '#c41e3a'" @input="section.config.style.eyebrow_color=$event.target.value"><input v-model="section.config.style.eyebrow_color" class="admin-input"><button type="button" class="btn btn-light btn-sm" @click="section.config.style.eyebrow_color=''">Reset</button></div></label><label>Font<select v-model="section.config.style.eyebrow_font_family" class="admin-input"><option value="">Bawaan template</option><option>Manrope</option><option>Inter</option><option>Outfit</option><option>Poppins</option><option>Montserrat</option><option>Roboto</option><option>Playfair Display</option></select></label><label>Ukuran desktop<input v-model.number="section.config.style.eyebrow_size_desktop" type="number" min="10" max="32" class="admin-input"></label><label>Ukuran mobile<input v-model.number="section.config.style.eyebrow_size_mobile" type="number" min="10" max="24" class="admin-input"></label><label>Margin desktop (atas/bawah)<input v-model.number="section.config.style.eyebrow_margin_desktop" type="number" min="0" max="160" class="admin-input"></label><label>Margin mobile (atas/bawah)<input v-model.number="section.config.style.eyebrow_margin_mobile" type="number" min="0" max="120" class="admin-input"></label><label>Padding desktop (atas/bawah)<input v-model.number="section.config.style.eyebrow_padding_desktop" type="number" min="0" max="160" class="admin-input"></label><label>Padding mobile (atas/bawah)<input v-model.number="section.config.style.eyebrow_padding_mobile" type="number" min="0" max="120" class="admin-input"></label><div class="field-style-save"><button type="button" class="btn btn-danger btn-sm" :disabled="savingSections.has(section.id)" @click="saveSection(section)"><i class="bi bi-check2 me-1"></i>Simpan pengaturan</button></div></div></details></span><input v-model="section.eyebrow" class="admin-input"></label>
                <label><span class="admin-label">Urutan</span><input v-model.number="section.sort_order" type="number" class="admin-input"></label>
                <label class="full"><span class="admin-label admin-label-with-settings">Judul <details class="field-style-settings"><summary title="Atur font, warna, ukuran, margin dan padding judul"><i class="bi bi-sliders"></i></summary><div class="field-style-panel"><label>Warna<div class="color-control"><input type="color" :value="section.config.style.heading_color || '#111827'" @input="section.config.style.heading_color=$event.target.value"><input v-model="section.config.style.heading_color" class="admin-input"><button type="button" class="btn btn-light btn-sm" @click="section.config.style.heading_color=''">Reset</button></div></label><label>Font<select v-model="section.config.style.title_font_family" class="admin-input"><option value="">Bawaan template</option><option>Manrope</option><option>Inter</option><option>Outfit</option><option>Poppins</option><option>Montserrat</option><option>Roboto</option><option>Playfair Display</option></select></label><label>Ukuran desktop<input v-model.number="section.config.style.title_size_desktop" type="number" min="18" max="100" class="admin-input"></label><label>Ukuran mobile<input v-model.number="section.config.style.title_size_mobile" type="number" min="18" max="64" class="admin-input"></label><label>Margin desktop (atas/bawah)<input v-model.number="section.config.style.title_margin_desktop" type="number" min="0" max="160" class="admin-input"></label><label>Margin mobile (atas/bawah)<input v-model.number="section.config.style.title_margin_mobile" type="number" min="0" max="120" class="admin-input"></label><label>Padding desktop (atas/bawah)<input v-model.number="section.config.style.title_padding_desktop" type="number" min="0" max="160" class="admin-input"></label><label>Padding mobile (atas/bawah)<input v-model.number="section.config.style.title_padding_mobile" type="number" min="0" max="120" class="admin-input"></label><div class="field-style-save"><button type="button" class="btn btn-danger btn-sm" :disabled="savingSections.has(section.id)" @click="saveSection(section)"><i class="bi bi-check2 me-1"></i>Simpan pengaturan</button></div></div></details></span><input v-model="section.title" class="admin-input"></label>
                <label class="full"><span class="admin-label admin-label-with-settings">Subtitle / Deskripsi <details class="field-style-settings"><summary title="Atur font, warna, ukuran, margin dan padding deskripsi"><i class="bi bi-sliders"></i></summary><div class="field-style-panel"><label>Warna<div class="color-control"><input type="color" :value="section.config.style.text_color || '#475569'" @input="section.config.style.text_color=$event.target.value"><input v-model="section.config.style.text_color" class="admin-input"><button type="button" class="btn btn-light btn-sm" @click="section.config.style.text_color=''">Reset</button></div></label><label>Font<select v-model="section.config.style.subtitle_font_family" class="admin-input"><option value="">Bawaan template</option><option>Manrope</option><option>Inter</option><option>Outfit</option><option>Poppins</option><option>Montserrat</option><option>Roboto</option><option>Playfair Display</option></select></label><label>Ukuran desktop<input v-model.number="section.config.style.text_size_desktop" type="number" min="12" max="32" class="admin-input"></label><label>Ukuran mobile<input v-model.number="section.config.style.text_size_mobile" type="number" min="12" max="28" class="admin-input"></label><label>Margin desktop (atas/bawah)<input v-model.number="section.config.style.subtitle_margin_desktop" type="number" min="0" max="160" class="admin-input"></label><label>Margin mobile (atas/bawah)<input v-model.number="section.config.style.subtitle_margin_mobile" type="number" min="0" max="120" class="admin-input"></label><label>Padding desktop (atas/bawah)<input v-model.number="section.config.style.subtitle_padding_desktop" type="number" min="0" max="160" class="admin-input"></label><label>Padding mobile (atas/bawah)<input v-model.number="section.config.style.subtitle_padding_mobile" type="number" min="0" max="120" class="admin-input"></label><div class="field-style-save"><button type="button" class="btn btn-danger btn-sm" :disabled="savingSections.has(section.id)" @click="saveSection(section)"><i class="bi bi-check2 me-1"></i>Simpan pengaturan</button></div></div></details></span><textarea v-model="section.subtitle" class="admin-input"></textarea></label>
                <template v-if="section.section_key === 'hero'">
                  <label class="full"><span class="admin-label">Gambar Hero</span><input v-model="section.config.image_url" class="admin-input"><span class="quick-upload mt-2"><i class="bi bi-cloud-arrow-up"></i> Upload & konversi WebP<input type="file" accept="image/*" @change="uploadFile($event, section.config, 'image_url')"></span></label>
                  <label><span class="admin-label">Tombol Utama</span><input v-model="section.config.primary_button" class="admin-input"></label>
                  <label><span class="admin-label">URL Tombol Utama</span><input v-model="section.config.primary_url" class="admin-input"></label>
                  <label><span class="admin-label">Tombol Kedua</span><input v-model="section.config.secondary_button" class="admin-input"></label>
                </template>
                <template v-if="section.section_key === 'clients'">
                  <label><span class="admin-label">Mode Tampilan Logo</span><select v-model="section.config.display_mode" class="admin-input"><option value="masonry">Masonry Responsive</option><option value="scroll">Slider Mobile</option></select></label>
                  <label><span class="admin-label">Tinggi Slider Mobile (px)</span><input v-model.number="section.config.scroll_height" type="number" min="160" max="420" class="admin-input"></label>
                  <label><span class="admin-label">Jumlah Logo di Landing</span><input v-model.number="section.config.display_limit" type="number" min="1" max="100" class="admin-input"></label>
                  <label><span class="admin-label">Urutan Logo</span><select v-model="section.config.sort_mode" class="admin-input"><option value="latest">Terbaru diupload</option><option value="order">Urutan admin</option><option value="random">Acak setiap muat</option></select></label>
                  <label><span class="admin-label">Teks Tombol Halaman Klien</span><input v-model="section.config.action_button_label" class="admin-input"></label>
                  <label><span class="admin-label">URL Halaman Klien</span><input v-model="section.config.action_button_url" class="admin-input"></label>
                </template>
                <label><span class="admin-label">Label Sitelink</span><input v-model="section.config.sitelink_label" class="admin-input" :placeholder="section.name"></label>
                <label><span class="admin-label">Aktifkan Sitelink Schema</span><span class="form-check form-switch pt-2"><input v-model="section.config.sitelink_enabled" :true-value="1" :false-value="0" class="form-check-input" type="checkbox"></span></label>
              </div>
              <details class="section-style-editor mt-4">
                <summary><i class="bi bi-type me-2"></i>Pengaturan Tipografi Lengkap (opsional)</summary>
                <p class="small fw-semibold text-muted mt-3 mb-2">Label / Eyebrow</p>
                <div class="admin-form-grid">
                  <label><span class="admin-label">Warna Label</span><div class="color-control"><input type="color" :value="section.config.style.eyebrow_color || '#c41e3a'" @input="section.config.style.eyebrow_color=$event.target.value"><input v-model="section.config.style.eyebrow_color" class="admin-input" placeholder="Kosong = bawaan"><button type="button" class="btn btn-light btn-sm" @click="section.config.style.eyebrow_color=''">Reset</button></div></label>
                  <label><span class="admin-label">Font Label</span><select v-model="section.config.style.eyebrow_font_family" class="admin-input"><option value="">Bawaan template</option><option>Manrope</option><option>Inter</option><option>Outfit</option><option>Poppins</option><option>Raleway</option><option>Montserrat</option><option>Oswald</option><option>Lato</option><option>Open Sans</option><option>Roboto</option><option>Georgia</option><option>Playfair Display</option></select></label>
                  <label><span class="admin-label">Ukuran Label Desktop (px)</span><input v-model.number="section.config.style.eyebrow_size_desktop" type="number" min="10" max="32" class="admin-input" placeholder="Bawaan (12)"></label>
                  <label><span class="admin-label">Ukuran Label Mobile (px)</span><input v-model.number="section.config.style.eyebrow_size_mobile" type="number" min="10" max="24" class="admin-input" placeholder="Bawaan (11)"></label>
                </div>
                <p class="small fw-semibold text-muted mt-3 mb-2">Judul (Heading)</p>
                <div class="admin-form-grid">
                  <label><span class="admin-label">Warna Judul</span><div class="color-control"><input type="color" :value="section.config.style.heading_color || '#111827'" @input="section.config.style.heading_color=$event.target.value"><input v-model="section.config.style.heading_color" class="admin-input" placeholder="Kosong = bawaan"><button type="button" class="btn btn-light btn-sm" @click="section.config.style.heading_color=''">Reset</button></div></label>
                  <label><span class="admin-label">Font Judul</span><select v-model="section.config.style.title_font_family" class="admin-input"><option value="">Bawaan template</option><option>Manrope</option><option>Inter</option><option>Outfit</option><option>Poppins</option><option>Raleway</option><option>Montserrat</option><option>Oswald</option><option>Lato</option><option>Open Sans</option><option>Roboto</option><option>Georgia</option><option>Playfair Display</option></select></label>
                  <label><span class="admin-label">Ukuran Judul Desktop (px)</span><input v-model.number="section.config.style.title_size_desktop" type="number" min="18" max="100" class="admin-input" placeholder="Bawaan"></label>
                  <label><span class="admin-label">Ukuran Judul Mobile (px)</span><input v-model.number="section.config.style.title_size_mobile" type="number" min="18" max="64" class="admin-input" placeholder="Bawaan"></label>
                </div>
                <p class="small fw-semibold text-muted mt-3 mb-2">Deskripsi / Subtitle</p>
                <div class="admin-form-grid">
                  <label><span class="admin-label">Warna Deskripsi</span><div class="color-control"><input type="color" :value="section.config.style.text_color || '#475569'" @input="section.config.style.text_color=$event.target.value"><input v-model="section.config.style.text_color" class="admin-input" placeholder="Kosong = bawaan"><button type="button" class="btn btn-light btn-sm" @click="section.config.style.text_color=''">Reset</button></div></label>
                  <label><span class="admin-label">Font Deskripsi</span><select v-model="section.config.style.subtitle_font_family" class="admin-input"><option value="">Bawaan template</option><option>Manrope</option><option>Inter</option><option>Outfit</option><option>Poppins</option><option>Raleway</option><option>Montserrat</option><option>Lato</option><option>Open Sans</option><option>Roboto</option><option>Georgia</option><option>Playfair Display</option></select></label>
                  <label><span class="admin-label">Ukuran Deskripsi Desktop (px)</span><input v-model.number="section.config.style.text_size_desktop" type="number" min="12" max="32" class="admin-input" placeholder="Bawaan"></label>
                  <label><span class="admin-label">Ukuran Deskripsi Mobile (px)</span><input v-model.number="section.config.style.text_size_mobile" type="number" min="12" max="28" class="admin-input" placeholder="Bawaan"></label>
                </div>
                <p class="small fw-semibold text-muted mt-3 mb-2">Global Section (override semua elemen)</p>
                <div class="admin-form-grid">
                  <label><span class="admin-label">Warna Background</span><div class="color-control"><input type="color" :value="section.config.style.background_color || '#ffffff'" @input="section.config.style.background_color=$event.target.value"><input v-model="section.config.style.background_color" class="admin-input" placeholder="Kosong = bawaan template"><button type="button" class="btn btn-light btn-sm" @click="section.config.style.background_color=''">Reset</button></div></label>
                  <label><span class="admin-label">Font Global Section</span><select v-model="section.config.style.font_family" class="admin-input"><option value="">Bawaan template</option><option>Manrope</option><option>Inter</option><option>Outfit</option><option>Poppins</option><option>Raleway</option><option>Montserrat</option><option>Lato</option><option>Open Sans</option><option>Roboto</option><option>Georgia</option><option>Playfair Display</option></select></label>
                  <label><span class="admin-label">Posisi Teks</span><select v-model="section.config.style.text_align" class="admin-input"><option value="">Bawaan template</option><option value="left">Kiri</option><option value="center">Tengah</option><option value="right">Kanan</option></select></label>
                  <label><span class="admin-label">Padding Atas/Bawah Desktop (px)</span><input v-model.number="section.config.style.padding_desktop" type="number" min="0" max="300" class="admin-input" placeholder="Bawaan"></label>
                  <label><span class="admin-label">Padding Atas/Bawah Mobile (px)</span><input v-model.number="section.config.style.padding_mobile" type="number" min="0" max="200" class="admin-input" placeholder="Bawaan"></label>
                </div>
                <p class="small text-muted mt-3 mb-0">Nilai kosong mempertahankan desain template. Eyebrow = teks kecil di atas judul. Font per-elemen lebih prioritas dari Font Global.</p>
              </details>
              <details class="section-style-editor mt-4">
                <summary><i class="bi bi-palette me-2"></i>Tampilan Tombol Aksi</summary>
                <p class="small text-muted mt-3 mb-2">Berlaku untuk tombol aksi utama pada section ini. Nilai kosong mempertahankan tampilan bawaan.</p>
                <div class="admin-form-grid">
                  <label><span class="admin-label">Varian Tombol</span><select v-model="section.config.style.button_variant" class="admin-input"><option value="">Bawaan template</option><option value="outline">Outline</option><option value="solid">Solid / Berisi</option></select></label>
                  <label><span class="admin-label">Warna Latar</span><div class="color-control"><input type="color" :value="section.config.style.button_background_color || '#c41e3a'" @input="section.config.style.button_background_color=$event.target.value"><input v-model="section.config.style.button_background_color" class="admin-input" placeholder="Kosong = bawaan"><button type="button" class="btn btn-light btn-sm" @click="section.config.style.button_background_color=''">Reset</button></div></label>
                  <label><span class="admin-label">Warna Teks</span><div class="color-control"><input type="color" :value="section.config.style.button_text_color || '#c41e3a'" @input="section.config.style.button_text_color=$event.target.value"><input v-model="section.config.style.button_text_color" class="admin-input" placeholder="Kosong = bawaan"><button type="button" class="btn btn-light btn-sm" @click="section.config.style.button_text_color=''">Reset</button></div></label>
                  <label><span class="admin-label">Warna Border</span><div class="color-control"><input type="color" :value="section.config.style.button_border_color || '#c41e3a'" @input="section.config.style.button_border_color=$event.target.value"><input v-model="section.config.style.button_border_color" class="admin-input" placeholder="Kosong = bawaan"><button type="button" class="btn btn-light btn-sm" @click="section.config.style.button_border_color=''">Reset</button></div></label>
                  <label><span class="admin-label">Font Tombol</span><select v-model="section.config.style.button_font_family" class="admin-input"><option value="">Bawaan template</option><option>Manrope</option><option>Inter</option><option>Outfit</option><option>Poppins</option><option>Raleway</option><option>Montserrat</option><option>Oswald</option><option>Lato</option><option>Open Sans</option><option>Roboto</option><option>Georgia</option><option>Playfair Display</option></select></label>
                  <label><span class="admin-label">Ukuran Tombol Desktop (px)</span><input v-model.number="section.config.style.button_font_size_desktop" type="number" min="10" max="32" class="admin-input" placeholder="Bawaan"></label>
                  <label><span class="admin-label">Ukuran Tombol Mobile (px)</span><input v-model.number="section.config.style.button_font_size_mobile" type="number" min="10" max="28" class="admin-input" placeholder="Bawaan"></label>
                </div>
              </details>
              <details class="section-style-editor mt-4">
                <summary><i class="bi bi-cursor me-2"></i>Tombol Aksi Section</summary>
                <div class="admin-form-grid mt-3">
                  <template v-if="['stats'].includes(section.section_key)">
                    <label class="full"><span class="admin-label">Label Tombol</span><input v-model="section.config.about_button_label" class="admin-input" placeholder="Selengkapnya Tentang Kami"></label>
                    <label class="full"><span class="admin-label">URL Tombol</span><input v-model="section.config.about_button_url" class="admin-input" placeholder="/about"></label>
                  </template>
                  <template v-else-if="['contact'].includes(section.section_key)">
                    <label class="full"><span class="admin-label">Judul Form Konsultasi</span><input v-model="section.config.form_title" class="admin-input" placeholder="Request Konsultasi"></label>
                    <label><span class="admin-label">Label WhatsApp</span><input v-model="section.config.whatsapp_label" class="admin-input"></label>
                    <label><span class="admin-label">Label Telepon</span><input v-model="section.config.phone_label" class="admin-input"></label>
                    <label><span class="admin-label">Label Email</span><input v-model="section.config.email_label" class="admin-input"></label>
                    <label><span class="admin-label">Label Alamat</span><input v-model="section.config.address_label" class="admin-input"></label>
                    <label><span class="admin-label">Tampilkan WhatsApp</span><span class="form-check form-switch pt-2"><input v-model="section.config.show_whatsapp" :true-value="1" :false-value="0" class="form-check-input" type="checkbox"></span></label>
                    <label><span class="admin-label">Tampilkan Telepon</span><span class="form-check form-switch pt-2"><input v-model="section.config.show_phone" :true-value="1" :false-value="0" class="form-check-input" type="checkbox"></span></label>
                    <label><span class="admin-label">Tampilkan Email</span><span class="form-check form-switch pt-2"><input v-model="section.config.show_email" :true-value="1" :false-value="0" class="form-check-input" type="checkbox"></span></label>
                    <label><span class="admin-label">Tampilkan Alamat</span><span class="form-check form-switch pt-2"><input v-model="section.config.show_address" :true-value="1" :false-value="0" class="form-check-input" type="checkbox"></span></label>
                    <label><span class="admin-label">Label Nama</span><input v-model="section.config.name_label" class="admin-input"></label>
                    <label><span class="admin-label">Label No. WhatsApp</span><input v-model="section.config.whatsapp_field_label" class="admin-input"></label>
                    <label><span class="admin-label">Label Perusahaan</span><input v-model="section.config.company_label" class="admin-input"></label>
                    <label><span class="admin-label">Label Jabatan</span><input v-model="section.config.position_label" class="admin-input"></label>
                    <label><span class="admin-label">Label Kebutuhan Training</span><input v-model="section.config.program_label" class="admin-input"></label>
                    <label><span class="admin-label">Placeholder Program</span><input v-model="section.config.program_placeholder" class="admin-input"></label>
                    <label><span class="admin-label">Label Jumlah Peserta</span><input v-model="section.config.participants_label" class="admin-input"></label>
                    <label><span class="admin-label">Label Estimasi Waktu</span><input v-model="section.config.timeline_label" class="admin-input"></label>
                    <label><span class="admin-label">Label Pesan</span><input v-model="section.config.message_label" class="admin-input"></label>
                    <label><span class="admin-label">Teks Tombol Kirim</span><input v-model="section.config.submit_label" class="admin-input"></label>
                    <label><span class="admin-label">Teks Saat Mengirim</span><input v-model="section.config.submitting_label" class="admin-input"></label>
                    <label class="full"><span class="admin-label">Pilihan Jumlah Peserta</span><textarea :value="section.config.participant_options?.join('\n')" class="admin-input" @input="section.config.participant_options=$event.target.value.split('\n').map(x=>x.trim()).filter(Boolean)"></textarea><small class="text-muted">Satu pilihan per baris.</small></label>
                    <label class="full"><span class="admin-label">Pilihan Estimasi Waktu</span><textarea :value="section.config.timeline_options?.join('\n')" class="admin-input" @input="section.config.timeline_options=$event.target.value.split('\n').map(x=>x.trim()).filter(Boolean)"></textarea><small class="text-muted">Satu pilihan per baris.</small></label>
                  </template>
                  <template v-else-if="['cta'].includes(section.section_key)">
                    <label class="full"><span class="admin-label">Label Tombol CTA</span><input v-model="section.config.button_label" class="admin-input" placeholder="Hubungi Kami Sekarang"></label>
                  </template>
                  <template v-else-if="['features'].includes(section.section_key)">
                    <label class="full"><span class="admin-label">Label Tombol</span><input v-model="section.config.action_button_label" class="admin-input" placeholder="Konsultasi Gratis"></label>
                    <label class="full"><span class="admin-label">URL / Anchor Tombol</span><input v-model="section.config.action_button_url" class="admin-input" placeholder="#kontak"></label>
                  </template>
                  <template v-else-if="['programs','galleries','testimonials','posts'].includes(section.section_key)">
                    <label class="full"><span class="admin-label">Label Tombol</span><input v-model="section.config.action_button_label" class="admin-input" :placeholder="{ programs: 'Lihat Semua Program', galleries: 'Lihat Semua Foto', testimonials: 'Lihat Semua Testimoni', posts: 'Semua Artikel' }[section.section_key]"></label>
                    <label class="full"><span class="admin-label">URL Tombol</span><input v-model="section.config.action_button_url" class="admin-input" :placeholder="{ programs: '/programs', galleries: '/gallery', testimonials: '/testimonials', posts: '/blog' }[section.section_key]"></label>
                  </template>
                  <template v-if="section.section_key === 'programs'">
                    <label><span class="admin-label">Filter Semua</span><input v-model="section.config.filter_all_label" class="admin-input"></label>
                    <label><span class="admin-label">Tombol Detail Kartu</span><input v-model="section.config.card_detail_label" class="admin-input"></label>
                    <label><span class="admin-label">Tombol Tanya Kartu</span><input v-model="section.config.card_inquiry_label" class="admin-input"></label>
                    <label><span class="admin-label">Tombol Flyer Kartu</span><input v-model="section.config.card_flyer_label" class="admin-input"></label>
                    <label><span class="admin-label">Tombol Detail Hero</span><input v-model="section.config.hero_detail_label" class="admin-input"></label>
                    <label><span class="admin-label">Tombol Tanya Hero</span><input v-model="section.config.hero_inquiry_label" class="admin-input"></label>
                    <label><span class="admin-label">Aksi Slider Hero</span><input v-model="section.config.hero_display_label" class="admin-input"></label>
                  </template>
                  <template v-if="section.section_key === 'posts'">
                    <label><span class="admin-label">Tautan Baca Artikel</span><input v-model="section.config.read_more_label" class="admin-input"></label>
                  </template>
                  <template v-if="section.section_key === 'trainers'">
                    <label><span class="admin-label">Label Navigasi Sebelumnya</span><input v-model="section.config.previous_label" class="admin-input"></label>
                    <label><span class="admin-label">Label Navigasi Berikutnya</span><input v-model="section.config.next_label" class="admin-input"></label>
                  </template>
                  <template v-else>
                    <p class="small text-muted mb-0">Section ini tidak memiliki tombol aksi terpisah yang bisa dikonfigurasi.</p>
                  </template>
                </div>
              </details>
              <details class="section-style-editor mt-4">
                <summary><i class="bi bi-arrows-expand me-2"></i>Jarak Antar Section & Divider Modern</summary>
                <div class="admin-form-grid mt-3">
                  <label><span class="admin-label">Margin Atas Desktop (px)</span><input v-model.number="section.config.style.margin_top_desktop" type="number" min="0" max="240" class="admin-input" placeholder="0"></label>
                  <label><span class="admin-label">Margin Bawah Desktop (px)</span><input v-model.number="section.config.style.margin_bottom_desktop" type="number" min="0" max="240" class="admin-input" placeholder="0"></label>
                  <label><span class="admin-label">Margin Atas Mobile (px)</span><input v-model.number="section.config.style.margin_top_mobile" type="number" min="0" max="160" class="admin-input" placeholder="0"></label>
                  <label><span class="admin-label">Margin Bawah Mobile (px)</span><input v-model.number="section.config.style.margin_bottom_mobile" type="number" min="0" max="160" class="admin-input" placeholder="0"></label>
                  <label><span class="admin-label">Bentuk Divider</span><select v-model="section.config.style.divider_type" class="admin-input"><option value="">Tanpa divider</option><option value="wave">Wave</option><option value="curve">Curve</option><option value="mountain">Mountain</option><option value="organic">Organic</option><option value="tilt">Diagonal Tilt</option><option value="zigzag">Zigzag</option></select></label>
                  <label><span class="admin-label">Posisi Divider</span><select v-model="section.config.style.divider_position" class="admin-input"><option value="bottom">Bawah</option><option value="top">Atas</option><option value="both">Atas & Bawah</option></select></label>
                  <label><span class="admin-label">Warna Divider</span><div class="color-control"><input type="color" :value="section.config.style.divider_color || '#ffffff'" @input="section.config.style.divider_color=$event.target.value"><input v-model="section.config.style.divider_color" class="admin-input" placeholder="#ffffff"><button type="button" class="btn btn-light btn-sm" @click="section.config.style.divider_color=''">Reset</button></div></label>
                  <label><span class="admin-label">Tinggi Divider Desktop (px)</span><input v-model.number="section.config.style.divider_height_desktop" type="number" min="16" max="160" class="admin-input"></label>
                  <label><span class="admin-label">Tinggi Divider Mobile (px)</span><input v-model.number="section.config.style.divider_height_mobile" type="number" min="12" max="90" class="admin-input"></label>
                </div>
                <p class="small text-muted mt-3 mb-0">Margin memberi ruang kosong di luar section. Divider berada di tepi section dan tidak menutupi konten.</p>
              </details>
              <details class="section-style-editor mt-4">
                <summary><i class="bi bi-layers me-2"></i>Parallax Ringan</summary>
                <div class="admin-form-grid mt-3">
                  <label><span class="admin-label">Aktifkan Parallax</span><span class="form-check form-switch pt-2"><input v-model="section.config.style.parallax_enabled" :true-value="1" :false-value="0" class="form-check-input" type="checkbox"><span class="form-check-label">{{ section.config.style.parallax_enabled ? 'Aktif' : 'Nonaktif' }}</span></span></label>
                  <label class="full"><span class="admin-label">Background Parallax</span><input v-model="section.config.style.parallax_image_url" class="admin-input" placeholder="Upload gambar WebP"><span class="quick-upload mt-2"><i class="bi bi-cloud-arrow-up"></i> Upload & konversi WebP<input type="file" accept="image/*" @change="uploadFile($event, section.config.style, 'parallax_image_url')"></span></label>
                  <label><span class="admin-label">Warna Overlay</span><div class="color-control"><input type="color" :value="section.config.style.parallax_overlay_color || '#000000'" @input="section.config.style.parallax_overlay_color=$event.target.value"><input v-model="section.config.style.parallax_overlay_color" class="admin-input"></div></label>
                  <label><span class="admin-label">Kekuatan Overlay (%)</span><input v-model.number="section.config.style.parallax_overlay_opacity" type="range" min="0" max="85" step="5" class="form-range"><small>{{ section.config.style.parallax_overlay_opacity }}%</small></label>
                </div>
                <p class="small text-muted mt-3 mb-0">Parallax hanya aktif di desktop. Mobile, perangkat sentuh, dan pengguna reduced-motion otomatis memakai background statis.</p>
              </details>
              <details class="section-style-editor mt-4">
                <summary><i class="bi bi-stars me-2"></i>Aurora, Particles & Glow</summary>
                <div class="admin-form-grid mt-3">
                  <label><span class="admin-label">Aktifkan Aurora Gradient</span><span class="form-check form-switch pt-2"><input v-model="section.config.style.aurora_enabled" :true-value="1" :false-value="0" class="form-check-input" type="checkbox"><span class="form-check-label">{{ section.config.style.aurora_enabled ? 'Aktif' : 'Nonaktif' }}</span></span></label>
                  <label class="full"><span class="admin-label">CSS Aurora Gradient</span><input v-model="section.config.style.aurora_gradient" class="admin-input" placeholder="Kosong = gradient cerah bawaan"></label>
                  <label><span class="admin-label">Aktifkan Glow</span><span class="form-check form-switch pt-2"><input v-model="section.config.style.glow_enabled" :true-value="1" :false-value="0" class="form-check-input" type="checkbox"><span class="form-check-label">{{ section.config.style.glow_enabled ? 'Aktif' : 'Nonaktif' }}</span></span></label>
                  <label><span class="admin-label">Warna Glow</span><div class="color-control"><input type="color" :value="section.config.style.glow_color || '#ff6b6b'" @input="section.config.style.glow_color=$event.target.value"><input v-model="section.config.style.glow_color" class="admin-input" placeholder="#ff6b6b"></div></label>
                  <label><span class="admin-label">Aktifkan Particles</span><span class="form-check form-switch pt-2"><input v-model="section.config.style.particles_enabled" :true-value="1" :false-value="0" class="form-check-input" type="checkbox"><span class="form-check-label">{{ section.config.style.particles_enabled ? 'Aktif' : 'Nonaktif' }}</span></span></label>
                  <label><span class="admin-label">Jumlah Particles</span><input v-model.number="section.config.style.particle_count" type="number" min="0" max="40" class="admin-input"></label>
                  <label class="full"><span class="admin-label">Warna Particles</span><input v-model="section.config.style.particle_color" class="admin-input" placeholder="rgba(255,255,255,.92) atau #ffffff"></label>
                </div>
                <p class="small text-muted mt-3 mb-0">Hero otomatis memakai particles jika nilai section masih bawaan. Section lain bisa diaktifkan manual dari sini.</p>
              </details>
              <div class="text-end mt-3"><button class="btn btn-danger" :disabled="savingSections.has(section.id)" @click="saveSection(section)"><span v-if="savingSections.has(section.id)" class="spinner-border spinner-border-sm me-2"></span>{{ savingSections.has(section.id) ? 'Menyimpan...' : 'Simpan Section' }}</button></div>
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="active === 'navigation'">
          <div class="admin-card mb-4">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
              <div>
                <h2 class="h5 mb-1"><i class="bi bi-compass me-2 text-danger"></i>Struktur Menu Navigasi Header Publik</h2>
                <p class="text-muted small mb-0">
                  Daftar tautan navigasi yang tampil pada header dan footer website publik. Gunakan sakelar <strong>On/Off Tayang</strong> untuk mengaktifkan atau menyembunyikan menu secara langsung tanpa membuka modal edit.
                </p>
              </div>
              <button class="btn btn-danger" @click="openCreate"><i class="bi bi-plus-lg me-1"></i>Tambah Menu Custom</button>
            </div>

            <div class="p-3 bg-light rounded-3 border mb-3">
              <small class="d-block text-muted fw-bold mb-2"><i class="bi bi-magic me-1"></i>Tambah Cepat Preset Menu Halaman Utama:</small>
              <div class="d-flex flex-wrap gap-2">
                <button
                  v-for="preset in navPresets"
                  :key="preset.url"
                  type="button"
                  class="btn btn-sm"
                  :class="records.some(r => r.url === preset.url) ? 'btn-outline-secondary disabled' : 'btn-outline-primary'"
                  :disabled="records.some(r => r.url === preset.url)"
                  @click="addPresetNav(preset)"
                >
                  <i class="bi" :class="records.some(r => r.url === preset.url) ? 'bi-check2' : 'bi-plus-circle'"></i>
                  {{ preset.label }} (<code>{{ preset.url }}</code>)
                </button>
              </div>
            </div>

            <div class="admin-table-wrap">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th style="width: 70px;">Urutan</th>
                    <th>Label Menu</th>
                    <th>URL & Preview Halaman</th>
                    <th>Lokasi</th>
                    <th style="width: 150px;">Status Tayang</th>
                    <th class="text-end" style="width: 120px;">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in records" :key="item.id">
                    <td>
                      <span class="badge text-bg-light border">{{ item.sort_order }}</span>
                    </td>
                    <td>
                      <strong>{{ item.label }}</strong>
                      <small v-if="item.target === '_blank'" class="d-block text-muted">Buka di tab baru</small>
                    </td>
                    <td>
                      <code class="me-2">{{ item.url }}</code>
                      <a
                        :href="item.url"
                        target="_blank"
                        class="btn btn-sm btn-light border text-primary"
                        title="Buka & lihat halaman ini di tab baru"
                      >
                        <i class="bi bi-box-arrow-up-right me-1"></i>Buka Halaman
                      </a>
                    </td>
                    <td>
                      <span class="badge" :class="item.location === 'header' ? 'text-bg-danger' : 'text-bg-dark'">
                        {{ item.location || 'header' }}
                      </span>
                    </td>
                    <td>
                      <div class="form-check form-switch pt-1">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          role="switch"
                          :checked="Boolean(item.is_published)"
                          @change="togglePublish(item)"
                        >
                        <label class="form-check-label fw-bold ms-1" :class="item.is_published ? 'text-success' : 'text-muted'">
                          {{ item.is_published ? 'Tayang' : 'Off' }}
                        </label>
                      </div>
                    </td>
                    <td class="text-end">
                      <button class="btn btn-sm btn-outline-primary me-1" @click="openEdit(item)"><i class="bi bi-pencil"></i></button>
                      <button class="btn btn-sm btn-outline-danger" @click="removeRecord(item)"><i class="bi bi-trash"></i></button>
                    </td>
                  </tr>
                  <tr v-if="!records.length">
                    <td colspan="6" class="text-center text-muted py-5">Belum ada item navigasi. Silakan klik preset di atas atau tambah manual.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </template>

        <template v-else-if="currentSchema">
          <div v-if="active === 'stats'" class="alert alert-info">
            <strong>Statistik homepage:</strong> data di sini tampil di hero dan section "Angka yang Bicara Sendiri". Ubah nilai, label, suffix, ikon, status tayang, lalu simpan.
          </div>
          <div v-if="active === 'program_orders'" class="alert alert-info">
            <strong>Order program:</strong> klik Cetak untuk membuat bukti formulir pendaftaran yang bisa diberikan ke HRD, manajer, atau bagian finance.
          </div>
          <div v-if="active === 'service_items'" class="alert alert-info">
            <strong>Cover layanan:</strong> upload gambar di field Cover Gambar. Sistem otomatis menyimpan source asli dan versi WebP teroptimasi quality 80 untuk tampilan website.
          </div>
          <div v-if="active === 'service_pages'" class="alert alert-info d-flex flex-wrap align-items-center justify-content-between gap-3">
            <span><strong>Konten halaman layanan:</strong> atur judul, deskripsi, dan SEO di sini. Untuk menambah atau mengubah kartu layanan yang tampil di halaman publik, buka pengelolaan Item Layanan.</span>
            <button class="btn btn-danger btn-sm text-nowrap" @click="selectPage('service_items')"><i class="bi bi-briefcase me-1"></i>Kelola Item Layanan</button>
          </div>
          <div v-if="active === 'client_pages'" class="alert alert-info d-flex flex-wrap align-items-center justify-content-between gap-3">
            <span><strong>Halaman Klien:</strong> atur judul dan SEO halaman di sini. Logo klien juga dikelola dari halaman ini agar navigasi Dashboard tetap sederhana.</span>
            <button class="btn btn-danger btn-sm text-nowrap" @click="selectPage('clients')"><i class="bi bi-building me-1"></i>Kelola Logo Klien</button>
          </div>
          <div v-if="active === 'clients'" class="alert alert-info d-flex flex-wrap align-items-center justify-content-between gap-3">
            <span><strong>Logo Klien:</strong> kelola logo yang tampil di halaman publik. Gunakan Bulk JSON bila ingin menambahkan banyak logo dari hasil susunan AI.</span>
            <button class="btn btn-outline-secondary btn-sm" @click="selectPage('client_pages')"><i class="bi bi-arrow-left me-1"></i>Kembali ke Halaman Klien</button>
          </div>
          <div v-if="active === 'galleries'" class="alert alert-info d-flex flex-wrap align-items-center justify-content-between gap-3">
            <span><strong>Album Galeri:</strong> buat album terlebih dahulu, lalu klik <em>Foto</em> pada album yang dipilih untuk upload dan mengelola isi album. File foto yang dihapus dari album akan dihapus permanen dari penyimpanan.</span>
            <button class="btn btn-danger btn-sm text-nowrap" @click="openGalleryImages()"><i class="bi bi-images me-1"></i>Kelola Semua Foto</button>
          </div>
          <div v-if="active === 'gallery_images'" class="alert alert-info d-flex flex-wrap align-items-center justify-content-between gap-3">
            <span><strong>Foto Galeri:</strong> pilih nama album pada formulir, bukan ID. Hapus foto akan menghapus data dan file fisik upload terkait.</span>
            <select v-model="selectedGalleryId" class="form-select form-select-sm" style="max-width:260px"><option value="">Semua album</option><option v-for="album in galleryOptions" :key="album.id" :value="String(album.id)">{{ album.title }}</option></select>
            <button class="btn btn-outline-secondary btn-sm text-nowrap" @click="selectPage('galleries')"><i class="bi bi-arrow-left me-1"></i>Kembali ke Album</button>
          </div>
          <div v-if="active === 'proposal_pages'" class="alert alert-info d-flex flex-wrap align-items-center justify-content-between gap-3">
            <span><strong>Pusat Proposal:</strong> atur teks dan SEO template di sini, buat proposal per instansi, lalu atur paket yang muncul pada proposal. Semua dikelola dari satu menu sidebar.</span>
            <div class="d-flex flex-wrap gap-2"><button class="btn btn-danger btn-sm" @click="selectPage('proposals')"><i class="bi bi-file-earmark-plus me-1"></i>Daftar Proposal</button><button class="btn btn-outline-danger btn-sm" @click="selectPage('proposal_packages')"><i class="bi bi-box-seam me-1"></i>Paket Proposal</button></div>
          </div>
          <div v-if="active === 'proposal_pages'" class="admin-card mb-4">
            <div class="d-flex justify-content-between align-items-center gap-2 flex-wrap mb-3"><div><h2 class="h5 mb-1">Preview Proposal</h2><p class="text-muted small mb-0">Preview mengambil tampilan proposal sebenarnya, termasuk header, footer, CTA, dan paket aktif.</p></div><a v-if="previewProposalSlug" :href="proposalUrl(previewProposalSlug)" target="_blank" class="btn btn-outline-primary btn-sm"><i class="bi bi-box-arrow-up-right me-1"></i>Buka tab baru</a></div>
            <template v-if="proposalOverview.length"><select v-model="previewProposalSlug" class="admin-input mb-3"><option v-for="proposal in proposalOverview" :key="proposal.id" :value="proposal.slug">{{ proposal.institution_name }} — {{ proposal.slug }}</option></select><iframe :key="previewProposalSlug" :src="proposalUrl(previewProposalSlug)" title="Preview proposal" class="proposal-preview-frame"></iframe></template>
            <p v-else class="text-muted mb-0">Belum ada proposal. Buat proposal pertama melalui tombol <strong>Daftar Proposal</strong> agar preview dapat ditampilkan.</p>
          </div>
          <div v-if="active === 'proposals'" class="alert alert-info d-flex flex-wrap align-items-center justify-content-between gap-3">
            <span><strong>Proposal berbasis slug:</strong> setiap proposal memiliki URL share sendiri dan QR code. Nama Instansi otomatis menjadi slug saat membuat proposal baru; ubah jika diperlukan.</span>
            <button class="btn btn-outline-secondary btn-sm" @click="selectPage('proposal_pages')"><i class="bi bi-arrow-left me-1"></i>Kembali ke Proposal</button>
          </div>
          <div v-if="active === 'proposal_packages'" class="alert alert-info d-flex flex-wrap align-items-center justify-content-between gap-3">
            <span>Paket di sini tampil dinamis pada seluruh proposal yang tayang. Isi fitur dengan satu baris untuk setiap poin.</span>
            <button class="btn btn-outline-secondary btn-sm" @click="selectPage('proposal_pages')"><i class="bi bi-arrow-left me-1"></i>Kembali ke Proposal</button>
          </div>
          <div v-if="active === 'social_proofs'" class="alert alert-info">
            <strong>Template:</strong> isi Nama, Teks Aksi, dan Judul Program/Layanan untuk format seperti "Rina HRD telah membeli paket layanan pelatihan Bimtek & Sertifikasi". Jika Kalimat Custom diisi, kalimat itu yang ditampilkan.
          </div>
          <div class="d-flex justify-content-between align-items-center gap-2 mb-3"><p class="text-muted mb-0">Kelola {{ currentSchema.title.toLowerCase() }} yang tampil di website.</p><div class="d-flex gap-2"><button v-if="['testimonials','posts','stats','proposals','proposal_packages','clients'].includes(active)" class="btn btn-outline-primary" @click="openBulk"><i class="bi bi-braces me-1"></i>Bulk JSON</button><button v-if="!['leads','program_orders','about_pages','service_pages','program_pages','consultation_pages','proposal_pages'].includes(active)" class="btn btn-danger" @click="openCreate"><i class="bi bi-plus-lg me-1"></i>Tambah</button></div></div>
          <div class="admin-card admin-table-wrap">
            <table class="admin-table">
              <thead><tr><th>ID</th><th>Nama / Judul</th><th>Status / Info</th><th>Dibuat</th><th class="text-end">Aksi</th></tr></thead>
              <tbody>
                <tr v-for="item in (active === 'gallery_images' && selectedGalleryId ? records.filter((image) => Number(image.gallery_id) === Number(selectedGalleryId)) : records)" :key="item.id">
                  <td>{{ item.id }}</td>
                  <td><strong>{{ item.title || item.name || item.question || item.label || item.hero_title || item.order_code || item.customer_name || `#${item.id}` }}</strong><small v-if="active === 'stats'" class="d-block text-danger fw-bold">{{ item.prefix }}{{ Number(item.value || 0).toLocaleString('id-ID') }}{{ item.suffix }}</small><small v-if="item.slug || item.whatsapp || item.program_title" class="d-block text-muted">{{ item.slug || item.whatsapp || item.program_title }}</small><small v-if="item.button_url" class="d-block text-muted">{{ item.button_url }}</small><small v-if="item.company || item.confirmation_contact_name" class="d-block text-muted">{{ item.company || item.confirmation_contact_name }}</small><small v-if="item.total_transfer" class="d-block text-danger fw-bold">Transfer: {{ formatCurrency(item.total_transfer) }}</small><a v-if="item.proof_webp_url" :href="item.proof_webp_url" target="_blank" class="small">Bukti transfer</a></td>
                  <td><span v-if="'is_published' in item" class="badge" :class="item.is_published ? 'text-bg-success' : 'text-bg-secondary'">{{ item.is_published ? 'Tayang' : 'Draft' }}</span><span v-else-if="item.status" class="badge text-bg-warning">{{ item.status }}</span><span v-else>{{ item.category || item.location || '-' }}</span></td>
                  <td>{{ item.created_at || '-' }}</td>
                  <td class="text-end"><button v-if="active === 'galleries'" class="btn btn-sm btn-outline-dark me-2" @click="openGalleryImages(item.id)"><i class="bi bi-images me-1"></i>Foto</button><a v-if="active === 'proposals'" :href="proposalUrl(item.slug)" target="_blank" class="btn btn-sm btn-outline-secondary me-2" title="Buka proposal"><i class="bi bi-box-arrow-up-right"></i></a><a v-if="active === 'proposals'" :href="proposalQr(item.slug)" target="_blank" class="btn btn-sm btn-outline-dark me-2" title="Buka QR Code"><i class="bi bi-qr-code"></i></a><button v-if="active === 'program_orders'" class="btn btn-sm btn-outline-danger me-2" @click="openPrintOrder(item)"><i class="bi bi-printer me-1"></i>Cetak</button><button class="btn btn-sm btn-outline-primary me-2" @click="openEdit(item)">Edit</button><button v-if="!['leads','program_orders','about_pages','service_pages','program_pages','consultation_pages','proposal_pages'].includes(active)" class="btn btn-sm btn-outline-danger" @click="removeRecord(item)">Hapus</button></td>
                </tr>
                <tr v-if="!records.length"><td colspan="5" class="text-center text-muted py-5">Belum ada data.</td></tr>
              </tbody>
            </table>
          </div>
        </template>

        <template v-else-if="active === 'settings' || active === 'seo'">
          <div v-if="active === 'seo'" class="alert alert-info"><strong>Webmaster:</strong> masukkan token verifikasi dari Google Search Console/Bing/Yandex, simpan, lalu deploy. Sitemap tersedia otomatis di <code>/sitemap.xml</code> dan robots di <code>/robots.txt</code>.</div>
          <form @submit.prevent="saveSettings">
            <div v-for="group in (active === 'seo' ? seoSettingGroups : generalSettingGroups)" :key="group[0]" class="admin-card mb-3">
              <h2 class="h5 mb-3">{{ group[0] }}</h2>
              <div class="admin-form-grid">
                <label v-for="field in group[1]" :key="field[0]" :class="{ full: field[2] === 'textarea' || field[2] === 'image' }">
                  <span class="admin-label">{{ field[1] }}</span>
                  <textarea v-if="field[2] === 'textarea'" v-model="settings[field[0]]" class="admin-input"></textarea>
                  <div v-else-if="field[2] === 'image'"><input v-model="settings[field[0]]" class="admin-input"><span class="quick-upload mt-2"><i class="bi bi-cloud-arrow-up"></i> Upload & konversi WebP<input type="file" accept="image/*" @change="uploadFile($event, settings, field[0])"></span><img v-if="settings[field[0]]" :src="settings[field[0]]" class="img-thumbnail mt-2" style="max-height:100px" alt=""></div>
                  <div v-else-if="field[2] === 'file'"><input v-model="settings[field[0]]" class="admin-input"><span class="quick-upload mt-2"><i class="bi bi-file-earmark-pdf"></i> Upload / ganti PDF<input type="file" accept="application/pdf,.pdf" @change="uploadFile($event, settings, field[0])"></span><a v-if="settings[field[0]]" :href="settings[field[0]]" target="_blank" class="btn btn-sm btn-outline-danger mt-2"><i class="bi bi-download me-1"></i>Download PDF</a></div>
                  <input v-else v-model="settings[field[0]]" :type="field[2]" class="admin-input">
                </label>
              </div>
            </div>
            <div class="text-end"><button class="btn btn-danger btn-lg" :disabled="savingSettings"><span v-if="savingSettings" class="spinner-border spinner-border-sm me-2"></span>{{ savingSettings ? 'Menyimpan...' : 'Simpan Pengaturan' }}</button></div>
          </form>
        </template>

        <template v-else-if="active === 'media'">
          <div class="admin-stats mb-4">
            <div class="admin-card admin-stat"><small class="text-muted text-uppercase">Jumlah File</small><strong>{{ mediaData.summary.file_count || 0 }}</strong></div>
            <div class="admin-card admin-stat"><small class="text-muted text-uppercase">Total Penyimpanan</small><strong class="media-size">{{ formatBytes(mediaData.summary.total_size) }}</strong></div>
            <div class="admin-card admin-stat"><small class="text-muted text-uppercase">Total Source</small><strong class="media-size">{{ formatBytes(mediaData.summary.source_size) }}</strong></div>
            <div class="admin-card admin-stat"><small class="text-muted text-uppercase">Total WebP</small><strong class="media-size">{{ formatBytes(mediaData.summary.optimized_size) }}</strong></div>
          </div>
          <div class="row g-4 mb-4">
            <div class="col-lg-6"><div class="admin-card h-100">
              <h2 class="h5">Upload Gambar</h2><p class="text-muted">Source asli disimpan. Versi WebP kualitas tinggi dibuat otomatis untuk website. Maksimal 25 MB.</p>
              <span class="quick-upload quick-upload-large"><i class="bi bi-images"></i> Pilih Gambar<input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/tiff" @change="uploadFile"></span>
            </div></div>
            <div class="col-lg-6"><div class="admin-card h-100">
              <h2 class="h5">Upload Flyer / PDF</h2><p class="text-muted">PDF disimpan sebagai dokumen dan dapat digunakan sebagai link download.</p>
              <span class="quick-upload quick-upload-large"><i class="bi bi-file-earmark-pdf"></i> Pilih PDF<input type="file" accept="application/pdf,.pdf" @change="uploadFile"></span>
            </div></div>
          </div>
          <div v-if="uploadResult" class="admin-card mb-4">
            <h2 class="h5">Upload Terakhir</h2>
            <img v-if="uploadResult.type === 'image'" :src="uploadResult.url" class="img-thumbnail d-block mb-3" style="max-height:240px" alt="">
            <div class="admin-form-grid">
              <label><span class="admin-label">URL untuk Website</span><input :value="uploadResult.url" readonly class="admin-input" @focus="$event.target.select()"></label>
              <label v-if="uploadResult.source_url"><span class="admin-label">URL Source Asli</span><input :value="uploadResult.source_url" readonly class="admin-input" @focus="$event.target.select()"></label>
            </div>
          </div>
          <div class="admin-card admin-table-wrap">
            <h2 class="h5">Daftar Media</h2>
            <table class="admin-table">
              <thead><tr><th>File</th><th>Tipe</th><th>Source</th><th>WebP</th><th>Upload</th><th>Aksi</th></tr></thead>
              <tbody>
                <tr v-for="file in mediaData.files" :key="file.id">
                  <td><strong>{{ file.original_name }}</strong><small v-if="file.width" class="d-block text-muted">{{ file.width }} × {{ file.height }} px</small></td>
                  <td><span class="badge" :class="file.media_type === 'document' ? 'text-bg-danger' : 'text-bg-info'">{{ file.media_type }}</span></td>
                  <td>{{ formatBytes(file.source_size) }}</td><td>{{ file.optimized_size ? formatBytes(file.optimized_size) : '-' }}</td><td>{{ file.created_at }}</td>
                  <td><a :href="file.optimized_url || file.source_url" target="_blank" class="btn btn-sm btn-outline-primary me-1">Buka</a><a :href="file.source_url" download class="btn btn-sm btn-outline-secondary me-1">Source</a><button class="btn btn-sm btn-outline-danger" @click="removeMedia(file)">Hapus</button></td>
                </tr>
                <tr v-if="!mediaData.files.length"><td colspan="6" class="text-center text-muted py-5">Belum ada media yang diunggah.</td></tr>
              </tbody>
            </table>
          </div>
        </template>

        <template v-else-if="active === 'account'">
          <div class="row g-4">
            <div class="col-lg-6"><form class="admin-card" @submit.prevent="saveProfile"><h2 class="h5 mb-3">Profil SuperAdmin</h2><label class="d-block mb-3"><span class="admin-label">Nama</span><input v-model="profile.name" class="admin-input" required></label><label class="d-block mb-3"><span class="admin-label">Email</span><input v-model="profile.email" type="email" class="admin-input" required></label><button class="btn btn-danger" :disabled="accountSaving==='profile'"><span v-if="accountSaving==='profile'" class="spinner-border spinner-border-sm me-2"></span>{{ accountSaving==='profile' ? 'Menyimpan...' : 'Simpan Profil' }}</button></form></div>
            <div class="col-lg-6"><form class="admin-card" @submit.prevent="changePassword"><h2 class="h5 mb-3">Ganti Password</h2><label class="d-block mb-3"><span class="admin-label">Password Saat Ini</span><input v-model="profile.current_password" type="password" class="admin-input" required></label><label class="d-block mb-3"><span class="admin-label">Password Baru (min. 10 karakter)</span><input v-model="profile.new_password" type="password" minlength="10" class="admin-input" required></label><button class="btn btn-danger" :disabled="accountSaving==='password'"><span v-if="accountSaving==='password'" class="spinner-border spinner-border-sm me-2"></span>{{ accountSaving==='password' ? 'Memproses...' : 'Ganti Password' }}</button></form></div>
          </div>
        </template>
      </main>
    </div>

    <div v-if="editing" class="admin-modal" @click.self="editing=null">
      <form class="admin-modal-card" @submit.prevent="saveRecord">
        <div class="d-flex justify-content-between align-items-center mb-4"><h2 class="h4 mb-0">{{ editing.id ? 'Edit' : 'Tambah' }} {{ currentSchema.title }}</h2><button type="button" class="btn-close" @click="editing=null"></button></div>
        <div class="admin-form-grid">
          <label v-for="(config,field) in currentSchema.fields" :key="field" :class="{ full: ['textarea','image','wysiwyg'].includes(config[1]) }">
            <span class="admin-label">{{ config[0] }}</span>
            <textarea v-if="config[1] === 'textarea'" v-model="editing[field]" class="admin-input" :required="config[2]"></textarea>
            <div v-else-if="config[1] === 'wysiwyg'" class="wysiwyg-wrap">
              <div class="wysiwyg-toolbar">
                <button type="button" title="Bold" @click="richCommand('bold')"><i class="bi bi-type-bold"></i></button>
                <button type="button" title="Italic" @click="richCommand('italic')"><i class="bi bi-type-italic"></i></button>
                <button type="button" title="Heading" @click="richCommand('formatBlock','h2')"><i class="bi bi-type-h2"></i></button>
                <button type="button" title="List" @click="richCommand('insertUnorderedList')"><i class="bi bi-list-ul"></i></button>
                <button type="button" title="Numbered List" @click="richCommand('insertOrderedList')"><i class="bi bi-list-ol"></i></button>
                <button type="button" title="Link" @click="richLink"><i class="bi bi-link-45deg"></i></button>
                <button type="button" title="Quote" @click="richCommand('formatBlock','blockquote')"><i class="bi bi-quote"></i></button>
              </div>
              <div class="wysiwyg-editor" contenteditable="true" v-html="editing[field]" @input="updateRichText(field, $event)"></div>
            </div>
            <select v-else-if="config[1] === 'select'" v-model="editing[field]" class="admin-input"><option v-for="option in config[3]" :key="option" :value="option">{{ option }}</option></select>
            <select v-else-if="config[1] === 'gallery-select'" v-model="editing[field]" class="admin-input" :required="config[2]"><option value="" disabled>Pilih album galeri</option><option v-for="album in galleryOptions" :key="album.id" :value="album.id">{{ album.title }}</option></select>
            <div v-else-if="config[1] === 'boolean'" class="form-check form-switch pt-2"><input v-model="editing[field]" :true-value="1" :false-value="0" class="form-check-input" type="checkbox"><label class="form-check-label">{{ editing[field] ? 'Ya' : 'Tidak' }}</label></div>
            <div v-else-if="config[1] === 'image'"><input v-model="editing[field]" class="admin-input" :required="config[2]"><span class="quick-upload mt-2"><i class="bi bi-cloud-arrow-up"></i> Upload & konversi WebP<input type="file" accept="image/*" @change="uploadFile($event, editing, field)"></span><img v-if="editing[field]" :src="editing[field]" class="img-thumbnail mt-2" style="max-height:130px" alt=""></div>
            <div v-else-if="config[1] === 'file'"><input v-model="editing[field]" class="admin-input"><span class="quick-upload mt-2"><i class="bi bi-file-earmark-pdf"></i> Upload / ganti PDF<input type="file" accept="application/pdf,.pdf" @change="uploadFile($event, editing, field)"></span><a v-if="editing[field]" :href="editing[field]" target="_blank" class="btn btn-sm btn-outline-danger mt-2"><i class="bi bi-download me-1"></i>Download PDF</a></div>
            <input v-else v-model="editing[field]" :type="config[1]" class="admin-input" :required="config[2]" @input="((active === 'events' && field === 'title') || (active === 'proposals' && field === 'institution_name')) && eventSlugFromTitle()">
          </label>
        </div>
        <details v-if="['proposals','proposal_packages'].includes(active)" class="section-style-editor mt-4">
          <summary><i class="bi bi-braces me-2"></i>Isi cepat dari JSON (untuk AI)</summary>
          <p class="small text-muted mt-3">Salin format berikut ke AI, minta AI mengisi nilainya, lalu tempel JSON hasilnya di sini. Klik Terapkan agar data masuk ke form di atas, kemudian periksa dan simpan.</p>
          <textarea v-model="proposalJson" class="admin-input json-assistant-input" rows="15" spellcheck="false"></textarea>
          <div class="d-flex flex-wrap gap-2 mt-2"><button type="button" class="btn btn-outline-secondary btn-sm" @click="proposalJson=proposalJsonExample()"><i class="bi bi-arrow-counterclockwise me-1"></i>Muat Contoh</button><button type="button" class="btn btn-danger btn-sm" @click="applyProposalJson"><i class="bi bi-play-fill me-1"></i>Terapkan JSON ke Form</button></div>
        </details>
        <div class="d-flex justify-content-end gap-2 mt-4"><button type="button" class="btn btn-light" :disabled="savingRecord" @click="editing=null">Batal</button><button class="btn btn-danger" :disabled="savingRecord"><span v-if="savingRecord" class="spinner-border spinner-border-sm me-2"></span>{{ savingRecord ? 'Menyimpan...' : 'Simpan' }}</button></div>
      </form>
    </div>

    <div v-if="printOrder" class="admin-modal print-order-modal" @click.self="printOrder=null">
      <div class="admin-modal-card print-order-card">
        <div class="d-flex justify-content-between align-items-center mb-4 no-print">
          <div>
            <h2 class="h4 mb-1">Cetak Formulir Order</h2>
            <p class="text-muted small mb-0">{{ printOrder.order_code }} - {{ printOrder.program_title }}</p>
          </div>
          <button type="button" class="btn-close" @click="printOrder=null"></button>
        </div>
        <article class="print-document">
          <header class="print-header">
            <div>
              <small>STAR Training & Consulting</small>
              <h1>Formulir Pendaftaran Program</h1>
            </div>
            <div class="print-code">
              <span>Kode Order</span>
              <strong>{{ printOrder.order_code }}</strong>
            </div>
          </header>

          <section class="print-section">
            <h2>Data Pemesan</h2>
            <div class="print-grid">
              <div><span>Nama</span><strong>{{ printOrder.customer_name || '-' }}</strong></div>
              <div><span>WhatsApp</span><strong>{{ printOrder.whatsapp || '-' }}</strong></div>
              <div><span>Email</span><strong>{{ printOrder.email || '-' }}</strong></div>
              <div><span>Perusahaan / Instansi</span><strong>{{ printOrder.company || '-' }}</strong></div>
              <div><span>Jabatan / Bagian</span><strong>{{ printOrder.position || '-' }}</strong></div>
              <div><span>Alamat Instansi</span><strong>{{ printOrder.company_address || '-' }}</strong></div>
            </div>
          </section>

          <section class="print-section">
            <h2>Detail Program</h2>
            <div class="print-grid">
              <div><span>Program</span><strong>{{ printOrder.program_title || '-' }}</strong></div>
              <div><span>Tanggal Training</span><strong>{{ formatDate(printOrder.training_date) }}</strong></div>
              <div><span>Jumlah Peserta</span><strong>{{ printOrder.participants || 1 }}</strong></div>
              <div><span>Kode Referral</span><strong>{{ printOrder.ref_code || '-' }}</strong></div>
              <div class="full"><span>Nama Peserta</span><strong>{{ printOrder.participant_names || '-' }}</strong></div>
              <div class="full"><span>Catatan Pemesan</span><strong>{{ printOrder.notes || '-' }}</strong></div>
            </div>
          </section>

          <section class="print-section">
            <h2>Pembayaran & Konfirmasi</h2>
            <div class="print-grid">
              <div><span>Harga Satuan</span><strong>{{ formatCurrency(printOrder.base_amount) }}</strong></div>
              <div><span>Voucher</span><strong>{{ printOrder.voucher_code || '-' }} {{ Number(printOrder.voucher_discount || 0) ? `(-${formatCurrency(printOrder.voucher_discount)})` : '' }}</strong></div>
              <div><span>Kode Unik</span><strong>{{ printOrder.unique_code || 0 }}</strong></div>
              <div><span>Total Transfer</span><strong>{{ formatCurrency(printOrder.total_transfer) }}</strong></div>
              <div><span>Rekening</span><strong>{{ printOrder.payment_bank_name || '-' }} {{ printOrder.payment_account_number || '' }}</strong></div>
              <div><span>Atas Nama</span><strong>{{ printOrder.payment_account_name || '-' }}</strong></div>
              <div><span>Admin Konfirmasi</span><strong>{{ printOrder.confirmation_contact_name || '-' }}</strong></div>
              <div><span>WA Admin</span><strong>{{ printOrder.confirmation_contact_whatsapp || '-' }}</strong></div>
              <div><span>Status</span><strong>{{ printOrder.status || '-' }}</strong></div>
              <div><span>Dibuat</span><strong>{{ formatDate(printOrder.created_at) }}</strong></div>
              <div class="full"><span>Catatan Admin</span><strong>{{ printOrder.admin_notes || '-' }}</strong></div>
              <div v-if="printOrder.proof_webp_url || printOrder.proof_source_url" class="full no-print">
                <span>Bukti Transfer</span>
                <a :href="printOrder.proof_webp_url || printOrder.proof_source_url" target="_blank">Buka bukti transfer</a>
              </div>
            </div>
          </section>

          <footer class="print-signature">
            <div><span>Pemesan / HRD</span></div>
            <div><span>Admin STAR Training</span></div>
          </footer>
        </article>
        <div class="d-flex justify-content-end gap-2 mt-4 no-print">
          <button type="button" class="btn btn-light" @click="printOrder=null">Tutup</button>
          <button type="button" class="btn btn-danger" @click="printCurrentOrder"><i class="bi bi-printer me-1"></i>Cetak</button>
        </div>
      </div>
    </div>

    <div v-if="bulkOpen" class="admin-modal" @click.self="bulkOpen=false">
      <form class="admin-modal-card" @submit.prevent="importBulk">
        <div class="d-flex justify-content-between align-items-center mb-3"><div><h2 class="h4 mb-1">Bulk JSON {{ currentSchema.title }}</h2><p class="text-muted small mb-0">Salin contoh ini ke AI asisten, minta AI menghasilkan array JSON dengan struktur yang sama, lalu tempel kembali di sini.</p></div><button type="button" class="btn-close" @click="bulkOpen=false"></button></div>
        <div class="alert alert-info small">Maksimal 200 item sekali impor. Seluruh data divalidasi dan disimpan dalam satu transaksi.</div>
        <textarea v-model="bulkJson" class="admin-input bulk-json-editor" spellcheck="false"></textarea>
        <div class="d-flex justify-content-between gap-2 mt-3"><div><button type="button" class="btn btn-outline-secondary me-2" @click="bulkJson=bulkExamples[active]">Reset Contoh</button><button type="button" class="btn btn-outline-info" @click="copyBulkExample"><i class="bi bi-clipboard me-1"></i>Salin untuk AI</button></div><div><button type="button" class="btn btn-light me-2" @click="bulkOpen=false">Batal</button><button class="btn btn-primary" :disabled="bulkSaving"><span v-if="bulkSaving" class="spinner-border spinner-border-sm me-2"></span>{{ bulkSaving ? 'Mengimpor...' : 'Validasi & Import' }}</button></div></div>
      </form>
    </div>

    <div class="admin-toast-stack" aria-live="polite">
      <div v-for="toast in toasts" :key="toast.id" class="admin-toast" :class="`toast-${toast.type}`">
        <i class="bi" :class="{ 'bi-check-circle-fill': toast.type==='success', 'bi-info-circle-fill': toast.type==='info', 'bi-exclamation-triangle-fill': toast.type==='warning', 'bi-x-circle-fill': toast.type==='danger' }"></i>
        <span>{{ toast.text }}</span><button type="button" @click="toasts=toasts.filter(item=>item.id!==toast.id)">×</button>
      </div>
    </div>
  </div>
</template>
