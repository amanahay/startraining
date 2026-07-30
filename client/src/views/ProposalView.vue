<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '../api.js';
import PublicPageShell from '../components/PublicPageShell.vue';

const route = useRoute();
const data = ref(null);
const submitting = ref(false);
const form = ref({ name: '', whatsapp: '', company: '', message: '' });
const institution = computed(() => data.value?.proposal.institution_name || 'Instansi Anda');
const personalize = (text = '') => String(text).replaceAll('{{NAMA_INSTANSI}}', institution.value);
const heroTitle = computed(() => personalize(data.value?.proposal.hero_title || data.value?.proposal.title || `${data.value?.page.title || 'Penawaran Pelatihan'} untuk {{NAMA_INSTANSI}}`));
const heroSubtitle = computed(() => personalize(data.value?.proposal.hero_subtitle || data.value?.page.subtitle || ''));
function messageFor(pkg = null) {
  return `Halo STAR Training, saya ${form.value.name || 'calon klien'} dari ${form.value.company || institution.value}. Saya tertarik dengan ${pkg?.title || 'penawaran pelatihan'} pada proposal ${institution.value}. ${form.value.message || ''}`.trim();
}
async function choosePackage(pkg) {
  if (!form.value.name || !form.value.whatsapp) {
    document.querySelector('#proposal-contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  await submit(pkg);
}
async function submit(pkg = null) {
  if (submitting.value) return;
  submitting.value = true;
  try {
    await api('/public/leads', { method: 'POST', body: { ...form.value, company: form.value.company || institution.value, program: `Proposal ${institution.value}${pkg ? ` — ${pkg.title}` : ''}`, message: messageFor(pkg) } });
    const wa = String(data.value.settings.whatsapp_number || '').replace(/\D/g, '');
    window.location.href = `https://wa.me/${wa}?text=${encodeURIComponent(messageFor(pkg))}`;
  } catch (error) { alert(error.message || 'Data belum dapat dikirim.'); }
  finally { submitting.value = false; }
}
onMounted(async () => { try { data.value = await api(`/public/proposals/${route.params.slug}`); } catch {} });
</script>

<template>
  <PublicPageShell v-slot="{ site }">
    <main v-if="data" class="proposal-page">
      <section class="proposal-hero">
        <div class="container proposal-hero-inner">
          <p class="proposal-kicker">{{ data.page.eyebrow }}</p>
          <p class="proposal-to">Kepada Yth. <strong>{{ institution }}</strong></p>
          <h1>{{ heroTitle }}</h1>
          <p class="proposal-summary">{{ heroSubtitle }}</p>
          <div class="proposal-meta"><span v-if="data.proposal.valid_until">Berlaku hingga {{ new Intl.DateTimeFormat('id-ID',{dateStyle:'long'}).format(new Date(data.proposal.valid_until)) }}</span><span>Disusun oleh {{ site.settings.site_name }}</span></div>
          <a href="#proposal-package" class="proposal-button">Lihat Pilihan Paket <i class="bi bi-arrow-down"></i></a>
        </div>
      </section>

      <section class="proposal-intro container" v-if="data.proposal.intro_content">
        <div v-html="data.proposal.intro_content"></div>
      </section>

      <section id="proposal-package" class="proposal-packages">
        <div class="container">
          <header class="proposal-heading"><p>{{ personalize(data.page.package_eyebrow) }}</p><h2>{{ personalize(data.page.package_title) }}</h2><span>{{ personalize(data.page.package_subtitle) }}</span></header>
          <div class="proposal-package-grid">
            <article v-for="pkg in data.packages" :key="pkg.id" class="proposal-package" :class="{ featured: pkg.is_featured }">
              <span v-if="pkg.is_featured" class="popular">Paling Direkomendasikan</span>
              <h3>{{ pkg.title }}</h3><p>{{ pkg.description }}</p><strong class="price">{{ pkg.price_label }}</strong>
              <ul><li v-for="feature in pkg.features" :key="feature"><i class="bi bi-check2-circle"></i>{{ feature }}</li></ul>
              <button @click="choosePackage(pkg)">{{ pkg.button_label || 'Pilih Paket' }}</button>
            </article>
          </div>
        </div>
      </section>

      <section id="proposal-contact" class="proposal-contact">
        <div class="container proposal-contact-grid">
          <div><p class="proposal-kicker">Konsultasi Penawaran</p><h2>{{ personalize(data.page.contact_title) }}</h2><p>{{ personalize(data.page.contact_subtitle) }}</p><div class="contact-detail" v-if="site.settings.email"><i class="bi bi-envelope"></i>{{ site.settings.email }}</div><div class="contact-detail" v-if="site.settings.phone"><i class="bi bi-telephone"></i>{{ site.settings.phone }}</div></div>
          <form @submit.prevent="submit()"><label>Nama lengkap<input v-model="form.name" required></label><label>Nomor WhatsApp<input v-model="form.whatsapp" required></label><label>Perusahaan / instansi<input v-model="form.company" :placeholder="institution"></label><label>Pesan<textarea v-model="form.message" rows="3" placeholder="Ceritakan kebutuhan Anda"></textarea></label><button :disabled="submitting">{{ submitting ? 'Mengirim...' : 'Kirim & lanjut ke WhatsApp' }}</button></form>
        </div>
      </section>
    </main>
    <main v-else class="loading-screen"><div class="spinner-border text-danger"></div></main>
  </PublicPageShell>
</template>

<style scoped>
.proposal-page{color:#172033;background:#fff}.proposal-hero{background:radial-gradient(circle at 15% 20%,#f7d8db 0,transparent 30%),linear-gradient(135deg,#681526,#be2441);color:#fff;padding:7rem 0 6rem}.proposal-hero-inner{max-width:900px}.proposal-kicker,.proposal-heading>p{color:#c41e3a;font-size:.78rem;font-weight:900;letter-spacing:.15em;text-transform:uppercase}.proposal-hero .proposal-kicker{color:#ffd9df}.proposal-to{font-size:1.1rem;opacity:.95}.proposal-hero h1{font-size:clamp(2.3rem,6vw,4.8rem);line-height:1.05;font-weight:900;max-width:800px}.proposal-summary{font-size:1.15rem;max-width:720px;opacity:.92}.proposal-meta{display:flex;flex-wrap:wrap;gap:1rem;margin:1.5rem 0 2rem;font-size:.9rem}.proposal-meta span{padding:.45rem .8rem;background:#ffffff18;border:1px solid #ffffff36;border-radius:99px}.proposal-button,.proposal-package button,.proposal-contact button{display:inline-block;border:0;border-radius:9px;background:#c41e3a;color:#fff;padding:.85rem 1.2rem;font-weight:800;text-decoration:none}.proposal-hero .proposal-button{background:#fff;color:#8d1730}.proposal-intro{max-width:900px;padding:4.5rem 1rem;color:#374151;font-size:1.05rem;line-height:1.8}.proposal-intro :deep(h2){color:#172033;font-weight:900}.proposal-packages{background:#faf7f7;padding:5rem 0}.proposal-heading{text-align:center;max-width:720px;margin:0 auto 2.5rem}.proposal-heading h2,.proposal-contact h2{font-size:clamp(2rem,4vw,3rem);font-weight:900;color:#172033}.proposal-heading span,.proposal-contact p{color:#526075}.proposal-package-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.4rem}.proposal-package{background:#fff;border:1px solid #e7e2e3;border-radius:18px;padding:2rem;position:relative;display:flex;flex-direction:column}.proposal-package.featured{border:2px solid #c41e3a;box-shadow:0 16px 38px #7f14251e}.popular{position:absolute;top:-13px;left:1.4rem;background:#c41e3a;color:#fff;border-radius:999px;padding:.3rem .75rem;font-size:.72rem;font-weight:800}.proposal-package h3{font-weight:900;color:#172033}.proposal-package p{color:#526075;min-height:52px}.price{color:#a51733;font-size:1.05rem;margin:.5rem 0 1rem}.proposal-package ul{list-style:none;padding:0;flex:1}.proposal-package li{margin:.65rem 0;color:#374151}.proposal-package li i{color:#c41e3a;margin-right:.5rem}.proposal-package button{width:100%;margin-top:1rem}.proposal-contact{padding:5rem 0;background:#fff0f2}.proposal-contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:start}.contact-detail{margin-top:1rem;color:#374151;font-weight:700}.contact-detail i{color:#c41e3a;margin-right:.6rem}.proposal-contact form{background:#fff;padding:1.5rem;border-radius:16px;box-shadow:0 12px 30px #34101a12}.proposal-contact label{display:block;font-size:.88rem;font-weight:800;color:#263143;margin-bottom:.85rem}.proposal-contact input,.proposal-contact textarea{display:block;width:100%;margin-top:.35rem;border:1px solid #d8dce2;border-radius:8px;padding:.7rem;color:#172033}.proposal-contact button{width:100%}@media(max-width:800px){.proposal-hero{padding:5rem 0 4rem}.proposal-package-grid,.proposal-contact-grid{grid-template-columns:1fr}.proposal-package p{min-height:0}}
</style>
