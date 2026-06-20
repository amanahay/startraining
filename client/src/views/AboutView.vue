<script setup>
import { onMounted, ref } from 'vue';
import { api } from '../api.js';
import PublicPageShell from '../components/PublicPageShell.vue';

const about = ref(null);

function whatsapp(settings) {
  const message = 'Halo STAR Training, saya ingin konsultasi kebutuhan pelatihan dan pengembangan SDM.';
  return `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(message)}`;
}

onMounted(async () => {
  about.value = await api('/public/about');
});
</script>

<template>
  <PublicPageShell v-slot="{ site }">
    <div v-if="!about" class="loading-screen"><div class="spinner-border text-danger"></div></div>
    <template v-else>
      <section class="about-hero">
        <div class="container">
          <div class="about-hero-grid">
            <div>
              <span class="section-eyebrow">{{ about.page.hero_eyebrow }}</span>
              <h1>{{ about.page.hero_title }}</h1>
              <p>{{ about.page.hero_subtitle }}</p>
              <div class="about-hero-actions">
                <a :href="whatsapp(site.settings)" target="_blank" class="btn btn-danger btn-lg rounded-pill px-4"><i class="bi bi-whatsapp me-2"></i>Konsultasi Sekarang</a>
                <a href="#profil" class="btn btn-outline-danger btn-lg rounded-pill px-4">Lihat Profil</a>
              </div>
            </div>
            <div class="about-hero-media">
              <img v-if="about.page.hero_image_url" :src="about.page.hero_image_url" :alt="about.page.hero_title">
            </div>
          </div>
        </div>
      </section>

      <main class="about-main">
        <section id="profil" class="about-section">
          <div class="container">
            <div class="about-profile-grid">
              <div>
                <span class="section-eyebrow">{{ about.page.intro_eyebrow }}</span>
                <h2 class="section-title">{{ about.page.intro_title }}</h2>
              </div>
              <article class="content-prose about-copy" v-html="about.page.intro_content"></article>
            </div>
          </div>
        </section>

        <section class="about-section about-stats">
          <div class="container">
            <div class="row g-4">
              <div v-for="stat in about.stats" :key="stat.id" class="col-6 col-lg-3">
                <div class="stat-card">
                  <div class="stat-icon"><i class="bi" :class="stat.icon"></i></div>
                  <span class="stat-number">{{ stat.prefix }}{{ Number(stat.value).toLocaleString('id-ID') }}{{ stat.suffix }}</span>
                  <div class="stat-label">{{ stat.label }}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="about-section">
          <div class="container">
            <div class="text-center mb-5">
              <span class="section-eyebrow">{{ about.page.values_eyebrow }}</span>
              <h2 class="section-title">{{ about.page.values_title }}</h2>
              <p class="section-lead mx-auto mt-3">{{ about.page.values_subtitle }}</p>
            </div>
            <div class="row g-4">
              <div v-for="item in about.values" :key="item.id" class="col-md-6 col-xl-3">
                <article class="about-card h-100">
                  <div class="about-card-icon"><i class="bi" :class="item.icon"></i></div>
                  <h3>{{ item.title }}</h3>
                  <p>{{ item.description }}</p>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section class="about-section about-advantages">
          <div class="container">
            <div class="row align-items-end mb-5">
              <div class="col-lg-8">
                <span class="section-eyebrow">{{ about.page.advantages_eyebrow }}</span>
                <h2 class="section-title">{{ about.page.advantages_title }}</h2>
                <p class="section-lead mt-3">{{ about.page.advantages_subtitle }}</p>
              </div>
            </div>
            <div class="about-advantage-grid">
              <article v-for="item in about.advantages" :key="item.id" class="about-advantage-item">
                <i class="bi" :class="item.icon"></i>
                <div>
                  <h3>{{ item.title }}</h3>
                  <p>{{ item.description }}</p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section class="about-cta">
          <div class="container">
            <div class="about-cta-box">
              <div>
                <span class="section-eyebrow">Konsultasi</span>
                <h2>{{ about.page.cta_title }}</h2>
                <p>{{ about.page.cta_subtitle }}</p>
              </div>
              <a :href="about.page.cta_button_url === '#kontak' ? whatsapp(site.settings) : about.page.cta_button_url" target="_blank" class="btn btn-danger btn-lg rounded-pill px-4">
                <i class="bi bi-whatsapp me-2"></i>{{ about.page.cta_button_label }}
              </a>
            </div>
          </div>
        </section>
      </main>
    </template>
  </PublicPageShell>
</template>
