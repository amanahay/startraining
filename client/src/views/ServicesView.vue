<script setup>
import { onMounted, ref } from 'vue';
import { api } from '../api.js';
import PublicPageShell from '../components/PublicPageShell.vue';

const services = ref(null);

function whatsapp(settings) {
  const message = 'Halo STAR Training, saya ingin konsultasi layanan/program yang bisa dikustomisasi.';
  return `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(message)}`;
}

function serviceUrl(item, settings) {
  if (!item.button_url || item.button_url === '#kontak') return whatsapp(settings);
  return item.button_url;
}

onMounted(async () => {
  services.value = await api('/public/services');
});
</script>

<template>
  <PublicPageShell v-slot="{ site }">
    <div v-if="!services" class="loading-screen"><div class="spinner-border text-danger"></div></div>
    <template v-else>
      <section class="services-hero">
        <div class="container">
          <div class="services-hero-grid">
            <div>
              <span class="section-eyebrow">{{ services.page.hero_eyebrow }}</span>
              <h1>{{ services.page.hero_title }}</h1>
              <p>{{ services.page.hero_subtitle }}</p>
              <div class="services-hero-actions">
                <a :href="whatsapp(site.settings)" target="_blank" class="btn btn-danger btn-lg rounded-pill px-4"><i class="bi bi-whatsapp me-2"></i>Konsultasi Layanan</a>
                <a href="#layanan" class="btn btn-outline-danger btn-lg rounded-pill px-4">Lihat Layanan</a>
              </div>
            </div>
            <div class="services-hero-media">
              <img v-if="services.page.hero_image_url" :src="services.page.hero_image_url" :alt="services.page.hero_title">
            </div>
          </div>
        </div>
      </section>

      <main class="services-main">
        <section class="services-section">
          <div class="container">
            <div class="services-intro">
              <span class="section-eyebrow">{{ services.page.intro_eyebrow }}</span>
              <h2 class="section-title">{{ services.page.intro_title }}</h2>
              <article class="content-prose services-copy" v-html="services.page.intro_content"></article>
            </div>
          </div>
        </section>

        <section id="layanan" class="services-section services-list-section">
          <div class="container">
            <div class="text-center mb-5">
              <span class="section-eyebrow">{{ services.page.services_eyebrow }}</span>
              <h2 class="section-title">{{ services.page.services_title }}</h2>
              <p class="section-lead mx-auto mt-3">{{ services.page.services_subtitle }}</p>
            </div>
            <div class="services-card-grid">
              <article v-for="item in services.services" :key="item.id" class="service-card">
                <img v-if="item.image_url" :src="item.image_url" :alt="item.title" loading="lazy">
                <div v-else class="service-card-icon"><i class="bi" :class="item.icon"></i></div>
                <h3>{{ item.title }}</h3>
                <p>{{ item.description }}</p>
                <a :href="serviceUrl(item, site.settings)" :target="item.button_url?.startsWith('http') || item.button_url === '#kontak' ? '_blank' : undefined" class="btn btn-outline-danger rounded-pill px-3">
                  {{ item.button_label || 'Konsultasi' }} <i class="bi bi-arrow-right ms-1"></i>
                </a>
              </article>
            </div>
          </div>
        </section>

        <section class="services-cta">
          <div class="container">
            <div class="services-cta-box">
              <div>
                <span class="section-eyebrow">Custom Program</span>
                <h2>{{ services.page.cta_title }}</h2>
                <p>{{ services.page.cta_subtitle }}</p>
              </div>
              <a :href="services.page.cta_button_url === '#kontak' ? whatsapp(site.settings) : services.page.cta_button_url" target="_blank" class="btn btn-danger btn-lg rounded-pill px-4">
                <i class="bi bi-whatsapp me-2"></i>{{ services.page.cta_button_label }}
              </a>
            </div>
          </div>
        </section>
      </main>
    </template>
  </PublicPageShell>
</template>
