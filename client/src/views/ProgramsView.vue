<script setup>
import { computed, onMounted, ref } from 'vue';
import { api } from '../api.js';
import PublicPageShell from '../components/PublicPageShell.vue';

const programs = ref([]);
const pageContent = ref({
  hero_eyebrow: 'Program Kami',
  hero_title: 'Semua Program Pelatihan',
  hero_subtitle: 'Temukan program training, consulting, outbound, sertifikasi, dan custom training yang sesuai dengan kebutuhan organisasi.',
  list_eyebrow: 'Semua Program',
  list_title: 'Program terbaru',
  list_subtitle: ''
});
const categories = ref(['all']);
const activeCategory = ref('all');
const page = ref(0);
const hasMore = ref(true);
const loading = ref(false);
const error = ref('');

const categoryLabel = computed(() => activeCategory.value === 'all' ? 'Semua Program' : activeCategory.value);

function formatPrice(program) {
  const value = Number(program.price_discount || program.price_regular || 0);
  return value ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value) : 'Custom';
}

function whatsapp(settings, program) {
  const message = `Halo, saya ingin info program ${program.title}.`;
  return `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(message)}`;
}

async function loadCategories() {
  const allPrograms = await api('/public/programs');
  categories.value = ['all', ...new Set(allPrograms.map((item) => item.category).filter(Boolean))];
}

async function loadMore() {
  if (loading.value || !hasMore.value) return;
  loading.value = true;
  error.value = '';
  try {
    const result = await api(`/public/programs?page=${page.value + 1}&limit=6&category=${encodeURIComponent(activeCategory.value)}`);
    programs.value.push(...result.items.filter((item) => !programs.value.some((existing) => existing.id === item.id)));
    page.value = result.pagination.page;
    hasMore.value = result.pagination.has_more;
  } catch (exception) {
    error.value = exception.message;
  } finally {
    loading.value = false;
  }
}

async function selectCategory(category) {
  activeCategory.value = category;
  programs.value = [];
  page.value = 0;
  hasMore.value = true;
  await loadMore();
}

onMounted(async () => {
  const page = await api('/public/programs-page');
  pageContent.value = { ...pageContent.value, ...(page.page || {}) };
  await loadCategories();
  await loadMore();
});
</script>

<template>
  <PublicPageShell v-slot="{ site }">
    <section class="page-hero programs-page-hero">
      <div class="container text-center">
        <span class="section-eyebrow text-white-50">{{ pageContent.hero_eyebrow }}</span>
        <h1 class="display-4 fw-bold">{{ pageContent.hero_title }}</h1>
        <p class="lead text-white-50">{{ pageContent.hero_subtitle }}</p>
      </div>
    </section>
    <main class="page-main">
      <div class="container">
        <div class="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
          <div>
            <span class="section-eyebrow">{{ activeCategory === 'all' ? pageContent.list_eyebrow : categoryLabel }}</span>
            <h2 class="section-title mb-0">{{ pageContent.list_title }}</h2>
            <p v-if="pageContent.list_subtitle" class="section-lead mt-2 mb-0">{{ pageContent.list_subtitle }}</p>
          </div>
          <div class="filter-bar">
            <button v-for="category in categories" :key="category" class="filter-btn text-capitalize" :class="{ active: activeCategory === category }" @click="selectCategory(category)">
              {{ category === 'all' ? 'Semua' : category }}
            </button>
          </div>
        </div>

        <div v-if="programs.length" class="row g-4">
          <div v-for="program in programs" :key="program.id" class="col-md-6 col-xl-4 program-card-wrap">
            <article class="program-card h-100">
              <div class="program-card-thumb">
                <img v-if="program.image_url" :src="program.image_url" :alt="program.title" loading="lazy">
                <div v-else class="program-placeholder">{{ program.emoji || '✦' }}</div>
                <span class="program-badge">{{ program.badge || program.category }}</span>
              </div>
              <div class="program-card-body">
                <div class="program-card-icon"><i class="bi" :class="program.icon"></i></div>
                <h3 class="program-card-title">{{ program.title }}</h3>
                <p class="program-card-desc">{{ program.description }}</p>
                <div class="program-card-price">
                  <small v-if="program.price_regular">{{ formatPrice({ price_discount: 0, price_regular: program.price_regular }) }}</small>
                  <strong>{{ formatPrice(program) }}</strong>
                  <span v-if="program.voucher_code">{{ program.voucher_code }}</span>
                </div>
                <div class="program-card-actions">
                  <router-link :to="`/program/${program.slug}`" class="btn btn-sm btn-danger rounded-pill px-3">Detail</router-link>
                  <a :href="whatsapp(site.settings, program)" target="_blank" class="btn btn-sm btn-success rounded-pill px-3"><i class="bi bi-whatsapp"></i> Tanya</a>
                  <a v-if="program.flyer_pdf_url" :href="program.flyer_pdf_url" target="_blank" download class="btn btn-sm btn-outline-danger rounded-pill px-3"><i class="bi bi-file-earmark-pdf"></i> Flyer</a>
                </div>
              </div>
            </article>
          </div>
        </div>
        <div v-else-if="!loading" class="empty-state">Belum ada program pada kategori ini.</div>
        <div v-if="error" class="alert alert-danger text-center mt-4">{{ error }}</div>
        <div v-if="hasMore || loading" class="text-center mt-5">
          <button class="btn btn-outline-danger rounded-pill px-5" :disabled="loading" @click="loadMore">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>{{ loading ? 'Memuat...' : 'Load More' }}
          </button>
        </div>
      </div>
    </main>
  </PublicPageShell>
</template>
