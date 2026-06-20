<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '../api.js';
import PublicPageShell from '../components/PublicPageShell.vue';

const route = useRoute();
const program = ref(null);
const videoReady = ref(false);
const submitting = ref(false);
const orderNotice = ref('');
const createdOrder = ref(null);
const proofFile = ref(null);
const order = ref({
  customer_name: '',
  whatsapp: '',
  email: '',
  company: '',
  position: '',
  company_address: '',
  training_date: '',
  participant_names: '',
  participants: 1,
  voucher_code: '',
  payment_account_id: '',
  confirmation_contact_id: '',
  notes: '',
  ref_code: new URLSearchParams(location.search).get('ref') || ''
});

const youtubeId = computed(() => extractYoutubeId(program.value?.youtube_url || ''));
const youtubeThumb = computed(() => youtubeId.value ? `https://img.youtube.com/vi/${youtubeId.value}/hqdefault.jpg` : '');
const youtubeEmbed = computed(() => youtubeId.value ? `https://www.youtube.com/embed/${youtubeId.value}?autoplay=1&rel=0&modestbranding=1` : '');
const selectedAccount = computed(() => (program.value?.payment_accounts || []).find((item) => Number(item.id) === Number(order.value.payment_account_id)) || program.value?.payment_accounts?.[0]);
const selectedConfirmationContact = computed(() => (program.value?.confirmation_contacts || []).find((item) => Number(item.id) === Number(order.value.confirmation_contact_id)) || program.value?.confirmation_contacts?.[0]);
const baseAmount = computed(() => Number(program.value?.price_discount || program.value?.price_regular || 0));
const voucherDiscount = computed(() => {
  if (!program.value?.voucher_code || !order.value.voucher_code) return 0;
  return order.value.voucher_code.toLowerCase() === String(program.value.voucher_code).toLowerCase() ? Number(program.value.voucher_discount || 0) : 0;
});
const estimatedTotal = computed(() => Math.max(0, (baseAmount.value * Math.max(1, Number(order.value.participants || 1))) - voucherDiscount.value));

function extractYoutubeId(url) {
  const value = String(url || '').trim();
  if (!value) return '';
  const match = value.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  return match?.[1] || '';
}

function formatPrice(value) {
  const number = Number(value || 0);
  return number ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number) : 'Hubungi Kami';
}

function whatsapp(settings) {
  const message = `Halo, saya ingin info detail program ${program.value?.title || 'STAR Training'}.`;
  return `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(message)}`;
}

function normalizeWhatsapp(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('0')) return `62${digits.slice(1)}`;
  if (digits.startsWith('62')) return digits;
  return digits;
}

function confirmationWhatsappUrl(contact = selectedConfirmationContact.value) {
  if (!contact) return '#';
  const message = createdOrder.value
    ? `Halo ${contact.name}, saya ingin konfirmasi bukti pembayaran untuk order ${createdOrder.value.order_code} program ${program.value?.title || ''}.`
    : `Halo ${contact.name}, saya ingin konfirmasi pembayaran untuk program ${program.value?.title || ''}.`;
  return `https://wa.me/${normalizeWhatsapp(contact.whatsapp)}?text=${encodeURIComponent(message)}`;
}

function onProofChange(event) {
  proofFile.value = event.target.files?.[0] || null;
}

async function submitOrder() {
  submitting.value = true;
  orderNotice.value = '';
  createdOrder.value = null;
  try {
    const body = new FormData();
    body.append('program_id', program.value.id);
    for (const [key, value] of Object.entries(order.value)) body.append(key, value ?? '');
    if (!order.value.payment_account_id && selectedAccount.value) body.set('payment_account_id', selectedAccount.value.id);
    if (proofFile.value) body.append('proof', proofFile.value);
    const result = await api('/public/program-orders', { method: 'POST', body });
    createdOrder.value = result.order;
    orderNotice.value = result.message;
  } catch (error) {
    orderNotice.value = error.message;
  } finally {
    submitting.value = false;
  }
}

onMounted(async () => {
  program.value = await api(`/public/programs/${route.params.slug}`);
  order.value.payment_account_id = program.value.payment_accounts?.[0]?.id || '';
  order.value.confirmation_contact_id = program.value.confirmation_contacts?.[0]?.id || '';
});
</script>

<template>
  <PublicPageShell v-slot="{ site }">
    <template v-if="program">
      <section class="program-detail-hero">
        <div class="container">
          <div class="program-detail-grid">
            <div>
              <span class="program-detail-badge">{{ program.badge || program.category }}</span>
              <h1>{{ program.title }}</h1>
              <p class="program-detail-desc">{{ program.description }}</p>
              <div class="program-detail-price">
                <span v-if="program.price_regular" class="price-regular">{{ formatPrice(program.price_regular) }}</span>
                <strong>{{ formatPrice(program.price_discount || program.price_regular) }}</strong>
                <span v-if="program.voucher_code" class="voucher-chip"><i class="bi bi-ticket-perforated"></i>{{ program.voucher_code }} - Hemat {{ formatPrice(program.voucher_discount) }}</span>
              </div>
              <div class="program-detail-actions">
                <a v-if="program.enable_whatsapp_cta !== 0" :href="whatsapp(site.settings)" target="_blank" class="btn btn-danger btn-lg rounded-pill px-4"><i class="bi bi-whatsapp me-2"></i>Konsultasi Program</a>
                <a v-if="program.flyer_pdf_url" :href="program.flyer_pdf_url" target="_blank" class="btn btn-outline-danger btn-lg rounded-pill px-4"><i class="bi bi-file-earmark-pdf me-2"></i>Download Flyer</a>
              </div>
            </div>
            <div class="program-detail-media">
              <div v-if="youtubeId" class="youtube-frame" :class="{ playing: videoReady }">
                <button v-if="!videoReady" type="button" class="youtube-poster shimmer" @click="videoReady = true">
                  <img :src="youtubeThumb" :alt="program.title">
                  <span class="youtube-play"><i class="bi bi-play-fill"></i></span>
                </button>
                <iframe v-else :src="youtubeEmbed" :title="program.title" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
              </div>
              <img v-else-if="program.image_url" :src="program.image_url" :alt="program.title" class="program-detail-image">
            </div>
          </div>
        </div>
      </section>

      <main class="page-main program-detail-main">
        <div class="container">
          <div class="program-detail-content">
            <article class="content-prose" v-html="program.content || `<p>${program.description}</p>`"></article>
            <aside class="program-detail-side">
              <h2>Ringkasan Program</h2>
              <ul>
                <li><i class="bi bi-check-circle-fill"></i>Kategori: {{ program.category }}</li>
                <li><i class="bi bi-check-circle-fill"></i>Materi bisa disesuaikan kebutuhan</li>
                <li><i class="bi bi-check-circle-fill"></i>Format in-house atau public training</li>
              </ul>
              <a v-if="program.enable_whatsapp_cta !== 0" :href="whatsapp(site.settings)" target="_blank" class="btn btn-danger w-100 rounded-pill">Tanya Jadwal</a>
            </aside>
          </div>

          <section v-if="program.enable_order_form !== 0" class="program-order-section">
            <div>
              <span class="section-eyebrow">Daftar Program</span>
              <h2>Formulir Pendaftaran & Pembayaran</h2>
              <p>Isi data peserta, pilih rekening transfer, lalu upload bukti pembayaran. Sistem akan membuat kode unik transfer otomatis untuk tracking pembayaran.</p>
              <div v-if="selectedAccount" class="payment-account-card">
                <small>Transfer ke</small>
                <strong>{{ selectedAccount.bank_name }} - {{ selectedAccount.account_number }}</strong>
                <span>{{ selectedAccount.account_name }}</span>
                <p v-if="selectedAccount.instructions">{{ selectedAccount.instructions }}</p>
              </div>
            </div>

            <form class="program-order-form" @submit.prevent="submitOrder">
              <div class="order-grid">
                <label><span>Nama Lengkap *</span><input v-model="order.customer_name" required></label>
                <label><span>WhatsApp *</span><input v-model="order.whatsapp" required></label>
                <label><span>Email</span><input v-model="order.email" type="email"></label>
                <label><span>Perusahaan / Instansi</span><input v-model="order.company"></label>
                <label><span>Jabatan / Bagian</span><input v-model="order.position" placeholder="HRD, Manager, Procurement"></label>
                <label><span>Rencana Tanggal Training</span><input v-model="order.training_date" type="date"></label>
                <label class="full"><span>Alamat Perusahaan / Instansi</span><textarea v-model="order.company_address" rows="2" placeholder="Alamat lengkap untuk kebutuhan administrasi"></textarea></label>
                <label><span>Jumlah Peserta</span><input v-model.number="order.participants" type="number" min="1"></label>
                <label><span>Kode Voucher</span><input v-model="order.voucher_code" :placeholder="program.voucher_code || 'Opsional'"></label>
                <label class="full"><span>Pilih Rekening Transfer</span><select v-model="order.payment_account_id" required><option v-for="account in program.payment_accounts" :key="account.id" :value="account.id">{{ account.bank_name }} - {{ account.account_number }} - {{ account.account_name }}</option></select></label>
                <label v-if="program.confirmation_contacts?.length" class="full"><span>Admin Konfirmasi Bukti Pembayaran</span><select v-model="order.confirmation_contact_id" required><option v-for="contact in program.confirmation_contacts" :key="contact.id" :value="contact.id">{{ contact.name }} - {{ contact.whatsapp }}{{ contact.role ? ` (${contact.role})` : '' }}</option></select><small v-if="selectedConfirmationContact">Nomor ini bisa diedit/ditambah dari dashboard.</small></label>
                <label class="full"><span>Nama Peserta</span><textarea v-model="order.participant_names" rows="3" placeholder="Tulis nama peserta jika sudah tersedia. Bisa juga dikosongkan dulu."></textarea></label>
                <label class="full"><span>Catatan</span><textarea v-model="order.notes" rows="3" placeholder="Contoh: kebutuhan khusus, paket in-house/public training, informasi invoice"></textarea></label>
                <label class="full"><span>Bukti Transfer</span><input type="file" accept="image/*" @change="onProofChange"><small>Opsional saat daftar. Jika diupload, sistem menyimpan source dan WebP kecil.</small></label>
              </div>
              <div class="order-summary">
                <div><span>Harga</span><strong>{{ formatPrice(baseAmount) }}</strong></div>
                <div><span>Peserta</span><strong>{{ order.participants || 1 }}</strong></div>
                <div v-if="voucherDiscount"><span>Voucher</span><strong>-{{ formatPrice(voucherDiscount) }}</strong></div>
                <div><span>Estimasi sebelum kode unik</span><strong>{{ formatPrice(estimatedTotal) }}</strong></div>
              </div>
              <div v-if="orderNotice" class="order-notice" :class="{ success: createdOrder }">{{ orderNotice }}</div>
              <div v-if="createdOrder" class="created-order-card">
                <span>Kode Order</span><strong>{{ createdOrder.order_code }}</strong>
                <span>Total Transfer</span><strong>{{ formatPrice(createdOrder.total_transfer) }}</strong>
                <small>Kode unik: {{ createdOrder.unique_code }}. Transfer ke {{ createdOrder.payment_account.bank_name }} {{ createdOrder.payment_account.account_number }} a.n. {{ createdOrder.payment_account.account_name }}.</small>
                <a v-if="createdOrder.confirmation_contact" :href="confirmationWhatsappUrl(createdOrder.confirmation_contact)" target="_blank" class="btn btn-success rounded-pill mt-3"><i class="bi bi-whatsapp me-2"></i>Konfirmasi ke {{ createdOrder.confirmation_contact.name }}</a>
              </div>
              <button class="btn btn-danger w-100 rounded-pill py-3" :disabled="submitting"><span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>{{ submitting ? 'Memproses...' : 'Buat Order Program' }}</button>
            </form>
          </section>

          <section v-if="program.related?.length" class="related-programs">
            <h2>Program Terkait</h2>
            <div class="row g-4">
              <div v-for="item in program.related" :key="item.id" class="col-md-4">
                <router-link :to="`/program/${item.slug}`" class="related-program-card">
                  <img v-if="item.image_url" :src="item.image_url" :alt="item.title">
                  <span>{{ item.badge || item.category }}</span>
                  <strong>{{ item.title }}</strong>
                  <small>{{ formatPrice(item.price_discount || item.price_regular) }}</small>
                </router-link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </template>
  </PublicPageShell>
</template>
