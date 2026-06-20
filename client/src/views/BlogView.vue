<script setup>
import { onMounted, ref } from 'vue';
import { api } from '../api.js';
import PublicPageShell from '../components/PublicPageShell.vue';
const posts = ref([]);
onMounted(async () => { posts.value = await api('/public/posts'); });
</script>

<template>
  <PublicPageShell>
    <section class="page-hero"><div class="container text-center"><span class="section-eyebrow text-white-50">Blog & Insight</span><h1 class="display-4 fw-bold">Artikel Pengembangan SDM</h1><p class="lead text-white-50">Insight praktis untuk organisasi dan profesional.</p></div></section>
    <main class="page-main"><div class="container">
      <div v-if="posts.length" class="row g-4">
        <div v-for="post in posts" :key="post.id" class="col-md-6 col-lg-4">
          <article class="article-card h-100">
            <div class="article-thumb"><img v-if="post.featured_image" :src="post.featured_image" :alt="post.title"><i v-else class="bi bi-file-earmark-text"></i></div>
            <div class="article-body">
              <div class="article-meta"><span class="article-cat">{{ post.category }}</span><time>{{ new Date(post.published_at).toLocaleDateString('id-ID',{dateStyle:'medium'}) }}</time></div>
              <h2 class="article-title">{{ post.title }}</h2><p class="article-excerpt">{{ post.excerpt }}</p>
              <router-link :to="`/blog/${post.slug}`" class="article-read-more">Baca Selengkapnya <i class="bi bi-arrow-right"></i></router-link>
            </div>
          </article>
        </div>
      </div>
      <div v-else class="empty-state">Belum ada artikel diterbitkan.</div>
    </div></main>
  </PublicPageShell>
</template>
