<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '../api.js';
import PublicPageShell from '../components/PublicPageShell.vue';
const route = useRoute();
const post = ref(null);
onMounted(async () => { post.value = await api(`/public/posts/${route.params.slug}`); });
</script>

<template>
  <PublicPageShell>
    <template v-if="post">
      <section class="page-hero"><div class="container text-center"><span class="section-eyebrow text-white-50">{{ post.category }}</span><h1 class="display-5 fw-bold mx-auto" style="max-width:900px">{{ post.title }}</h1><p class="text-white-50">{{ new Date(post.published_at).toLocaleDateString('id-ID',{dateStyle:'long'}) }}</p></div></section>
      <main class="page-main"><div class="container"><img v-if="post.featured_image" :src="post.featured_image" :alt="post.title" class="img-fluid rounded-4 d-block mx-auto mb-5"><article class="content-prose" v-html="post.content"></article><div class="text-center mt-5"><router-link to="/blog" class="btn btn-outline-danger rounded-pill px-4"><i class="bi bi-arrow-left me-2"></i>Kembali ke Blog</router-link></div></div></main>
    </template>
  </PublicPageShell>
</template>
