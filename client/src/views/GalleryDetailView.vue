<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '../api.js';
import PublicPageShell from '../components/PublicPageShell.vue';
const route = useRoute();
const gallery = ref(null);
const lightbox = ref('');
onMounted(async () => { gallery.value = await api(`/public/galleries/${route.params.slug}`); });
</script>

<template>
  <PublicPageShell>
    <template v-if="gallery">
      <section class="page-hero"><div class="container text-center"><span class="section-eyebrow text-white-50">Galeri Kegiatan</span><h1 class="display-5 fw-bold">{{ gallery.title }}</h1><p class="text-white-50">{{ gallery.event_date }} <span v-if="gallery.location">· {{ gallery.location }}</span></p></div></section>
      <main class="page-main"><div class="container"><p class="lead text-center mx-auto mb-5" style="max-width:760px">{{ gallery.description }}</p>
        <div v-if="gallery.images?.length" class="gallery-detail-grid"><button v-for="image in gallery.images" :key="image.id" @click="lightbox=image.image_url"><img :src="image.image_url" :alt="image.alt_text || gallery.title" loading="lazy"></button></div>
        <div v-else class="empty-state"><i class="bi bi-images fs-1 d-block mb-3"></i>Album sudah tersedia. Foto dapat ditambahkan dari panel SuperAdmin.</div>
        <div class="text-center mt-5"><router-link to="/gallery" class="btn btn-outline-danger rounded-pill px-4"><i class="bi bi-arrow-left me-2"></i>Semua Galeri</router-link></div>
      </div></main>
      <div v-if="lightbox" class="lightbox-global" @click="lightbox=''"><img :src="lightbox" alt=""></div>
    </template>
  </PublicPageShell>
</template>

<style scoped>
.lightbox-global{position:fixed;inset:0;background:rgba(0,0,0,.94);z-index:9999;display:grid;place-items:center;padding:1rem}.lightbox-global img{max-width:95vw;max-height:94vh;border-radius:12px}
</style>
