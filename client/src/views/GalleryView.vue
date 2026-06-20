<script setup>
import { onMounted, ref } from 'vue';
import { api } from '../api.js';
import PublicPageShell from '../components/PublicPageShell.vue';
const galleries = ref([]);
const page = ref(0);
const hasMore = ref(true);
const loading = ref(false);
const error = ref('');
async function loadMore() {
  if (loading.value || !hasMore.value) return;
  loading.value = true;
  error.value = '';
  try {
    const result = await api(`/public/galleries?page=${page.value + 1}&limit=9`);
    galleries.value.push(...result.items.filter((item) => !galleries.value.some((existing) => existing.id === item.id)));
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
    <section class="page-hero"><div class="container text-center"><span class="section-eyebrow text-white-50">Dokumentasi</span><h1 class="display-4 fw-bold">Galeri Kegiatan</h1><p class="lead text-white-50">Momen dari program pelatihan bersama para klien.</p></div></section>
    <main class="page-main"><div class="container">
      <div v-if="galleries.length" class="row g-4">
        <div v-for="gallery in galleries" :key="gallery.id" class="col-md-6 col-lg-4">
          <router-link :to="`/gallery/${gallery.slug}`" class="text-decoration-none text-body">
            <div class="gallery-cover"><img v-if="gallery.cover_url" :src="gallery.cover_url" :alt="gallery.title"><i v-else class="bi bi-images"></i></div>
            <h2 class="h5 mt-3 mb-1">{{ gallery.title }}</h2>
            <p class="text-muted small mb-1"><i class="bi bi-calendar3 me-1"></i>{{ gallery.event_date || 'Tanggal belum diisi' }} <span v-if="gallery.location">· {{ gallery.location }}</span></p>
            <p class="text-muted">{{ gallery.description }}</p>
          </router-link>
        </div>
      </div>
      <div v-else class="empty-state">Belum ada album galeri diterbitkan.</div>
      <div v-if="error" class="alert alert-danger text-center mt-4">{{ error }}</div>
      <div v-if="hasMore || loading" class="text-center mt-5"><button class="btn btn-outline-danger rounded-pill px-5" :disabled="loading" @click="loadMore"><span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>{{ loading ? 'Memuat...' : 'Load More' }}</button></div>
    </div></main>
  </PublicPageShell>
</template>
