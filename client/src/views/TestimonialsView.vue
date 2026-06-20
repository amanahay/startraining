<script setup>
import { onMounted, ref } from 'vue';
import { api } from '../api.js';
import PublicPageShell from '../components/PublicPageShell.vue';

const testimonials = ref([]);
const page = ref(0);
const hasMore = ref(true);
const loading = ref(false);
const error = ref('');

async function loadMore() {
  if (loading.value || !hasMore.value) return;
  loading.value = true;
  error.value = '';
  try {
    const result = await api(`/public/testimonials?page=${page.value + 1}&limit=9`);
    testimonials.value.push(...result.items.filter((item) => !testimonials.value.some((existing) => existing.id === item.id)));
    page.value = result.pagination.page;
    hasMore.value = result.pagination.has_more;
  } catch (exception) {
    error.value = exception.message;
  } finally { loading.value = false; }
}
onMounted(loadMore);
</script>

<template>
  <PublicPageShell>
    <section class="page-hero"><div class="container text-center"><span class="section-eyebrow text-white-50">Kata Mereka</span><h1 class="display-4 fw-bold">Testimoni Klien & Peserta</h1><p class="lead text-white-50">Pengalaman nyata dari peserta program STAR Training.</p></div></section>
    <main class="page-main"><div class="container">
      <div v-if="testimonials.length" class="testimonial-page-grid">
        <article v-for="item in testimonials" :key="item.id" class="testimonial-page-card">
          <div class="testimonial-stars">{{ '★'.repeat(item.rating) }}</div>
          <p class="fs-5">“{{ item.quote }}”</p>
          <div class="d-flex align-items-center gap-3 mt-4">
            <img v-if="item.avatar_url" :src="item.avatar_url" :alt="item.name" class="testimonial-page-avatar">
            <div v-else class="testimonial-page-avatar placeholder-avatar">{{ item.name.charAt(0) }}</div>
            <div><strong>{{ item.name }}</strong><small class="d-block text-muted">{{ item.organization }}</small></div>
          </div>
        </article>
      </div>
      <div v-else-if="!loading" class="empty-state">Belum ada testimoni diterbitkan.</div>
      <div v-if="error" class="alert alert-danger text-center mt-4">{{ error }}</div>
      <div v-if="hasMore || loading" class="text-center mt-5"><button class="btn btn-outline-danger rounded-pill px-5" :disabled="loading" @click="loadMore"><span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>{{ loading ? 'Memuat...' : 'Load More' }}</button></div>
    </div></main>
  </PublicPageShell>
</template>

<style scoped>
.testimonial-page-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1.25rem}.testimonial-page-card{background:#fff;border:1px solid #e5e7eb;border-radius:18px;padding:1.5rem;box-shadow:0 10px 30px rgba(15,23,42,.06)}.testimonial-page-avatar{width:52px;height:52px;border-radius:50%;object-fit:cover}.placeholder-avatar{display:grid;place-items:center;background:#8b0000;color:#fff;font-weight:800}.testimonial-stars{color:#f59e0b;letter-spacing:2px}@media(max-width:900px){.testimonial-page-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:576px){.testimonial-page-grid{grid-template-columns:1fr}.testimonial-page-card{padding:1.2rem}}
</style>
