<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';
import { api } from '../api.js';
import { useCmsSync } from '../cmsSync.js';
import PublicHeader from '../components/PublicHeader.vue';
import PublicFooter from '../components/PublicFooter.vue';
import SectionDecor from '../components/SectionDecor.vue';
import SocialProofToast from '../components/SocialProofToast.vue';
import PublicFloatingActions from '../components/PublicFloatingActions.vue';

const loading = ref(true);
const data = ref({ settings: {}, sections: [], content: {} });
const activeProgram = ref('all');
const openFaq = ref(null);
const lightbox = ref('');
const notice = ref('');
const sending = ref(false);
const activeHeroProgram = ref(0);
const heroVideoOpen = ref(false);
const trainerTrack = ref(null);
const touchStartX = ref(0);
let heroTimer = null;
let trainerTimer = null;
let scrollSaveTimer = null;
const landingScrollKey = 'startc:landing-scroll-position';
const lead = ref({ name: '', whatsapp: '', company: '', position: '', program: '', participants: '1–20 orang', timeline: 'Masih eksplorasi', message: '', ref_code: new URLSearchParams(location.search).get('ref') || '' });

const settings = computed(() => data.value.settings || {});
const content = computed(() => data.value.content || {});
const sections = computed(() => data.value.sections || []);
const programCategories = computed(() => ['all', ...new Set((content.value.programs || []).map((x) => x.category))]);
const newestPrograms = computed(() => [...(content.value.programs || [])].sort((a, b) => new Date(b.created_at || b.updated_at || 0) - new Date(a.created_at || a.updated_at || 0)));
const filteredPrograms = computed(() => {
  const items = activeProgram.value === 'all' ? newestPrograms.value : newestPrograms.value.filter((x) => x.category === activeProgram.value);
  return items.slice(0, 6);
});
const heroPrograms = computed(() => (content.value.programs || []).filter((program) => Number(program.hero_featured || program.is_featured || 0)).slice(0, 6));
const currentHeroProgram = computed(() => heroPrograms.value[activeHeroProgram.value % Math.max(1, heroPrograms.value.length)]);
function landingClients(section) { const items = [...(content.value.clients || [])]; const mode = section.config?.sort_mode || 'latest'; if (mode === 'random') items.sort(() => Math.random() - .5); else if (mode === 'latest') items.sort((a,b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)); return items.slice(0, Math.max(1, Number(section.config?.display_limit || 12))); }

function sectionClass(section) {
  const key = section.section_key;
  const base = {
    hero: 'hero-section', stats: 'stats-section', clients: 'marquee-section', programs: 'programs-section',
    events: 'events-section',
    features: 'why-section', trainers: 'trainer-section', galleries: 'gallery-section',
    testimonials: 'testimonials-section', posts: 'articles-section', partners: 'partner-section',
    contact: 'lead-section', faqs: 'faq-section', cta: 'cta-section'
  }[key] || '';
  const style = section.config?.style || {};
  return [base, 'dynamic-section', {
    'has-aurora': style.aurora_enabled !== 0,
    'has-glow': style.glow_enabled !== 0,
    'has-particles': section.section_key === 'hero' ? style.particles_enabled !== 0 : Boolean(style.particles_enabled),
    'has-custom-align': Boolean(style.text_align),
    'has-custom-eyebrow-color': Boolean(style.eyebrow_color),
    'has-custom-eyebrow-font': Boolean(style.eyebrow_font_family),
    'has-custom-eyebrow-size-desktop': Boolean(style.eyebrow_size_desktop),
    'has-custom-eyebrow-size-mobile': Boolean(style.eyebrow_size_mobile),
    'has-custom-heading-color': Boolean(style.heading_color),
    'has-custom-title-font': Boolean(style.title_font_family),
    'has-custom-title-size-desktop': Boolean(style.title_size_desktop),
    'has-custom-title-size-mobile': Boolean(style.title_size_mobile),
    'has-custom-subtitle-color': Boolean(style.text_color),
    'has-custom-subtitle-font': Boolean(style.subtitle_font_family),
    'has-custom-text-size-desktop': Boolean(style.text_size_desktop),
    'has-custom-text-size-mobile': Boolean(style.text_size_mobile),
    'has-custom-action-button': Boolean(style.button_variant || style.button_background_color || style.button_text_color || style.button_border_color || style.button_font_family || style.button_font_size_desktop || style.button_font_size_mobile),
    'has-button-solid': style.button_variant === 'solid',
    'has-button-outline': style.button_variant === 'outline',
    'has-padding-desktop': style.padding_desktop !== '' && style.padding_desktop != null,
    'has-padding-mobile': style.padding_mobile !== '' && style.padding_mobile != null,
    'has-parallax': Boolean(style.parallax_enabled && style.parallax_image_url)
    ,'has-eyebrow-spacing': ['eyebrow_margin_desktop','eyebrow_margin_mobile','eyebrow_padding_desktop','eyebrow_padding_mobile'].some((key) => style[key] !== '' && style[key] != null)
    ,'has-title-spacing': ['title_margin_desktop','title_margin_mobile','title_padding_desktop','title_padding_mobile'].some((key) => style[key] !== '' && style[key] != null)
    ,'has-subtitle-spacing': ['subtitle_margin_desktop','subtitle_margin_mobile','subtitle_padding_desktop','subtitle_padding_mobile'].some((key) => style[key] !== '' && style[key] != null)
  }];
}

function rgba(hex = '#000000', opacity = 0) {
  const value = String(hex).replace('#', '');
  const normalized = value.length === 3 ? value.split('').map((x) => x + x).join('') : value.padEnd(6, '0').slice(0, 6);
  const number = Number.parseInt(normalized, 16);
  return `rgba(${(number >> 16) & 255},${(number >> 8) & 255},${number & 255},${Math.max(0, Math.min(100, Number(opacity || 0))) / 100})`;
}

function sectionStyle(section) {
  const style = section.config?.style || {};
  const css = {};

  if (style.background_color) css.background = style.background_color;
  if (style.font_family) css['--section-font-family'] = `"${style.font_family}", sans-serif`;
  if (style.text_align) css['--section-text-align'] = style.text_align;

  // Eyebrow overrides
  if (style.eyebrow_color) css['--section-eyebrow-color'] = style.eyebrow_color;
  if (style.eyebrow_font_family) css['--section-eyebrow-font'] = `"${style.eyebrow_font_family}", sans-serif`;
  if (style.eyebrow_size_desktop) css['--section-eyebrow-size-desktop'] = `${style.eyebrow_size_desktop}px`;
  if (style.eyebrow_size_mobile) css['--section-eyebrow-size-mobile'] = `${style.eyebrow_size_mobile}px`;

  // Title / Heading overrides
  if (style.heading_color) css['--section-heading-color'] = style.heading_color;
  if (style.title_font_family) css['--section-title-font'] = `"${style.title_font_family}", sans-serif`;
  if (style.title_size_desktop) css['--section-title-desktop'] = `${style.title_size_desktop}px`;
  if (style.title_size_mobile) css['--section-title-mobile'] = `${style.title_size_mobile}px`;

  // Subtitle / Text overrides
  if (style.text_color) css['--section-subtitle-color'] = style.text_color;
  if (style.subtitle_font_family) css['--section-subtitle-font'] = `"${style.subtitle_font_family}", sans-serif`;
  if (style.text_size_desktop) css['--section-text-desktop'] = `${style.text_size_desktop}px`;
  if (style.text_size_mobile) css['--section-text-mobile'] = `${style.text_size_mobile}px`;

  // Per-field vertical spacing (label, title, description)
  for (const field of ['eyebrow', 'title', 'subtitle']) {
    for (const device of ['desktop', 'mobile']) {
      const margin = style[`${field}_margin_${device}`];
      const padding = style[`${field}_padding_${device}`];
      if (margin !== '' && margin != null) css[`--section-${field}-margin-${device}`] = `${margin}px`;
      if (padding !== '' && padding != null) css[`--section-${field}-padding-${device}`] = `${padding}px`;
    }
  }

  // Section action button overrides
  if (style.button_background_color) css['--section-button-bg'] = style.button_background_color;
  if (style.button_text_color) css['--section-button-text'] = style.button_text_color;
  if (style.button_border_color) css['--section-button-border'] = style.button_border_color;
  if (style.button_font_family) css['--section-button-font'] = `"${style.button_font_family}", sans-serif`;
  if (style.button_font_size_desktop) css['--section-button-size-desktop'] = `${style.button_font_size_desktop}px`;
  if (style.button_font_size_mobile) css['--section-button-size-mobile'] = `${style.button_font_size_mobile}px`;

  // Padding & Margin
  if (style.padding_desktop !== '' && style.padding_desktop != null) css['--section-padding-desktop'] = `${style.padding_desktop}px`;
  if (style.padding_mobile !== '' && style.padding_mobile != null) css['--section-padding-mobile'] = `${style.padding_mobile}px`;
  if (style.margin_top_desktop !== '' && style.margin_top_desktop != null) css['--section-margin-top-desktop'] = `${style.margin_top_desktop}px`;
  if (style.margin_bottom_desktop !== '' && style.margin_bottom_desktop != null) css['--section-margin-bottom-desktop'] = `${style.margin_bottom_desktop}px`;
  if (style.margin_top_mobile !== '' && style.margin_top_mobile != null) css['--section-margin-top-mobile'] = `${style.margin_top_mobile}px`;
  if (style.margin_bottom_mobile !== '' && style.margin_bottom_mobile != null) css['--section-margin-bottom-mobile'] = `${style.margin_bottom_mobile}px`;

  // Effects & Dividers
  if (style.aurora_gradient) css['--section-aurora'] = style.aurora_gradient;
  if (style.glow_color) css['--section-glow-color'] = style.glow_color;
  if (style.particle_color) css['--section-particle-color'] = style.particle_color;
  if (style.divider_color) css['--section-divider-color'] = style.divider_color;
  if (style.divider_height_desktop) css['--section-divider-height-desktop'] = `${style.divider_height_desktop}px`;
  if (style.divider_height_mobile) css['--section-divider-height-mobile'] = `${style.divider_height_mobile}px`;
  if (style.parallax_enabled && style.parallax_image_url) {
    css.backgroundImage = `linear-gradient(${rgba(style.parallax_overlay_color, style.parallax_overlay_opacity)},${rgba(style.parallax_overlay_color, style.parallax_overlay_opacity)}),url("${style.parallax_image_url.replaceAll('"', '%22')}")`;
  }
  return css;
}

function particleCount(section) {
  const style = section.config?.style || {};
  const enabled = section.section_key === 'hero' ? style.particles_enabled !== 0 : Boolean(style.particles_enabled);
  if (!enabled) return 0;
  return Math.max(0, Math.min(40, Number(style.particle_count || (section.section_key === 'hero' ? 24 : 12))));
}

function sectionId(key) {
  return { stats: 'tentang', programs: 'program', galleries: 'gallery', testimonials: 'testimoni', posts: 'artikel', partners: 'partnership', contact: 'kontak' }[key] || key;
}

function whatsapp(message = 'Halo, saya ingin konsultasi mengenai program pelatihan.') {
  return `https://wa.me/${settings.value.whatsapp_number}?text=${encodeURIComponent(message)}`;
}

function formatPrice(value) {
  const number = Number(value || 0);
  return number ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number) : 'Hubungi Kami';
}

function youtubeId(url) {
  const match = String(url || '').match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  return match?.[1] || '';
}

function selectHeroProgram(index) {
  activeHeroProgram.value = index;
  heroVideoOpen.value = false;
}

function nextHeroProgram() {
  if (!heroPrograms.value.length) return;
  selectHeroProgram((activeHeroProgram.value + 1) % heroPrograms.value.length);
}

function prevHeroProgram() {
  if (!heroPrograms.value.length) return;
  selectHeroProgram((activeHeroProgram.value - 1 + heroPrograms.value.length) % heroPrograms.value.length);
}

function handleTouchStart(event) {
  touchStartX.value = event.changedTouches?.[0]?.clientX || 0;
}

function handleHeroTouchEnd(event) {
  const endX = event.changedTouches?.[0]?.clientX || 0;
  const delta = endX - touchStartX.value;
  if (Math.abs(delta) < 42) return;
  if (delta < 0) nextHeroProgram();
  else prevHeroProgram();
}

function scrollTrainers(direction = 1) {
  const el = trainerTrack.value;
  if (!el) return;
  const card = el.querySelector('.trainer-slide');
  const distance = card ? card.getBoundingClientRect().width + 16 : el.clientWidth * 0.85;
  if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 12 && direction > 0) {
    el.scrollTo({ left: 0, behavior: 'smooth' });
    return;
  }
  el.scrollBy({ left: distance * direction, behavior: 'smooth' });
}

function saveLandingScroll() {
  window.clearTimeout(scrollSaveTimer);
  scrollSaveTimer = window.setTimeout(() => {
    const scrollY = window.scrollY;
    const visibleSection = [...document.querySelectorAll('.public-main .dynamic-section[id]')]
      .filter((element) => element.getBoundingClientRect().top <= 80)
      .at(-1);
    const sectionTop = visibleSection ? visibleSection.getBoundingClientRect().top + scrollY : 0;
    const saved = {
      y: scrollY,
      sectionId: visibleSection?.id || '',
      offset: visibleSection ? Math.max(0, scrollY - sectionTop) : 0
    };
    sessionStorage.setItem(landingScrollKey, JSON.stringify(saved));
    history.replaceState({ ...(history.state || {}), landingSection: saved.sectionId, landingOffset: saved.offset }, '', `${location.pathname}${location.search}`);
  }, 120);
}

function restoreLandingScroll() {
  // A URL anchor remains the explicit navigation choice; otherwise restore the
  // reader's exact position from this browser tab after a reload.
  if (location.hash) return;
  try {
    const stored = JSON.parse(sessionStorage.getItem(landingScrollKey) || 'null');
    const saved = history.state?.landingSection
      ? { sectionId: history.state.landingSection, offset: history.state.landingOffset || 0, y: stored?.y || 0 }
      : stored;
    if (!saved || (!saved.sectionId && !Number.isFinite(saved.y))) return;
    const section = saved.sectionId ? document.getElementById(saved.sectionId) : null;
    const top = section
      ? section.getBoundingClientRect().top + window.scrollY + Number(saved.offset || 0)
      : Number(saved.y || 0);
    window.scrollTo({ top, behavior: 'auto' });
  } catch {}
}

async function submitLead() {
  sending.value = true;
  notice.value = '';
  try {
    const result = await api('/public/leads', { method: 'POST', body: lead.value });
    notice.value = result.message;
    lead.value = { name: '', whatsapp: '', company: '', position: '', program: '', participants: '1–20 orang', timeline: 'Masih eksplorasi', message: '', ref_code: lead.value.ref_code };
  } catch (error) {
    notice.value = error.message;
  } finally {
    sending.value = false;
  }
}

async function loadContentData() {
  try {
    const res = await api('/public/bootstrap');
    data.value = res;
    const s = settings.value;
    document.documentElement.style.setProperty('--clr-red-dark', s.primary_color || '#8B0000');
    document.documentElement.style.setProperty('--clr-red', s.secondary_color || '#C41E3A');
    document.documentElement.style.setProperty('--clr-red-light', s.accent_color || '#F4A7B9');
    document.documentElement.style.setProperty('--clr-navy', s.dark_color || '#1A1A2E');
    document.documentElement.style.setProperty('--font-display', `"${s.font_display || 'Manrope'}", system-ui, sans-serif`);
    document.documentElement.style.setProperty('--font-body', `"${s.font_body || 'Manrope'}", system-ui, sans-serif`);
  } catch {}
}

onMounted(async () => {
  await loadContentData();
  loading.value = false;
  await nextTick();
  requestAnimationFrame(() => requestAnimationFrame(restoreLandingScroll));
  window.addEventListener('scroll', saveLandingScroll, { passive: true });
  window.addEventListener('popstate', restoreLandingScroll);
  heroTimer = window.setInterval(nextHeroProgram, 6500);
  trainerTimer = window.setInterval(() => scrollTrainers(1), 5200);
});
useCmsSync(loadContentData);
onUnmounted(() => {
  if (heroTimer) window.clearInterval(heroTimer);
  if (trainerTimer) window.clearInterval(trainerTimer);
  window.clearTimeout(scrollSaveTimer);
  window.removeEventListener('scroll', saveLandingScroll);
  window.removeEventListener('popstate', restoreLandingScroll);
});
</script>

<template>
  <div v-if="loading" class="loading-screen"><div class="spinner-border text-danger" role="status"></div></div>
  <div v-else class="public-main">
    <PublicHeader :settings="settings" :navigation="content.navigation" />

    <template v-for="section in sections" :key="section.id">
      <section v-if="section.section_key === 'hero'" :id="sectionId(section.section_key)" :class="sectionClass(section)" :style="sectionStyle(section)">
        <SectionDecor :section="section" />
        <div v-if="particleCount(section)" class="particle-field" aria-hidden="true">
          <span v-for="index in particleCount(section)" :key="index" class="particle-dot" :style="{ '--i': index }"></span>
        </div>
        <div class="container position-relative" style="z-index:2">
          <div class="row align-items-center min-vh-100 py-5">
            <div class="col-lg-7 col-xl-6">
              <div class="hero-badge"><i class="bi bi-patch-check-fill"></i> {{ section.eyebrow }}</div>
              <h1 class="hero-title">{{ section.title }}</h1>
              <p class="hero-subtitle">{{ section.subtitle }}</p>
              <div class="hero-cta-group">
                <a :href="section.config.primary_url" class="btn btn-lg hero-primary">{{ section.config.primary_button }}</a>
                <a :href="whatsapp()" target="_blank" class="btn btn-lg hero-secondary"><i class="bi bi-whatsapp me-2"></i>{{ section.config.secondary_button }}</a>
                <a v-if="settings.flyer_pdf_url" :href="settings.flyer_pdf_url" target="_blank" class="btn btn-lg hero-secondary"><i class="bi bi-file-earmark-pdf me-2"></i>{{ settings.flyer_button_label || 'Buka Flyer' }}</a>
              </div>
              <router-link v-if="currentHeroProgram" :to="`/program/${currentHeroProgram.slug}`" class="hero-program-mobile-card">
                <img v-if="currentHeroProgram.image_url" :src="currentHeroProgram.image_url" :alt="currentHeroProgram.title">
                <span>{{ currentHeroProgram.badge || currentHeroProgram.category }}</span>
                <strong>{{ currentHeroProgram.title }}</strong>
                <small>{{ formatPrice(currentHeroProgram.price_discount || currentHeroProgram.price_regular) }}</small>
              </router-link>
              <div class="hero-metrics">
                <div v-for="stat in content.stats" :key="stat.id">
                  <div class="hero-metric-value">{{ stat.prefix }}{{ Number(stat.value).toLocaleString('id-ID') }}{{ stat.suffix }}</div>
                  <div class="hero-metric-label">{{ stat.label }}</div>
                </div>
              </div>
            </div>
            <div class="col-lg-5 col-xl-6 hero-image-wrap">
              <article v-if="currentHeroProgram" class="hero-program-slider" @touchstart.passive="handleTouchStart" @touchend.passive="handleHeroTouchEnd">
                <div class="hero-program-media">
                  <button v-if="youtubeId(currentHeroProgram.youtube_url) && !heroVideoOpen" type="button" class="hero-youtube-poster shimmer" @click="heroVideoOpen = true">
                    <img :src="currentHeroProgram.image_url || `https://img.youtube.com/vi/${youtubeId(currentHeroProgram.youtube_url)}/hqdefault.jpg`" :alt="currentHeroProgram.title">
                    <span><i class="bi bi-play-fill"></i></span>
                  </button>
                  <iframe v-else-if="youtubeId(currentHeroProgram.youtube_url) && heroVideoOpen" :src="`https://www.youtube.com/embed/${youtubeId(currentHeroProgram.youtube_url)}?autoplay=1&rel=0&modestbranding=1`" :title="currentHeroProgram.title" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
                  <img v-else-if="currentHeroProgram.image_url" :src="currentHeroProgram.image_url" :alt="currentHeroProgram.title">
                  <div v-else class="program-placeholder">{{ currentHeroProgram.emoji || '✦' }}</div>
                </div>
                <div class="hero-program-body">
                  <span>{{ currentHeroProgram.badge || currentHeroProgram.category }}</span>
                  <h2>{{ currentHeroProgram.title }}</h2>
                  <p>{{ currentHeroProgram.description }}</p>
                  <div class="hero-program-price">
                    <small v-if="currentHeroProgram.price_regular">{{ formatPrice(currentHeroProgram.price_regular) }}</small>
                    <strong>{{ formatPrice(currentHeroProgram.price_discount || currentHeroProgram.price_regular) }}</strong>
                  </div>
                  <div class="hero-program-actions">
                    <router-link :to="`/program/${currentHeroProgram.slug}`" class="btn btn-danger rounded-pill px-4">{{ section.config.hero_detail_label || 'Detail Program' }}</router-link>
                    <a :href="whatsapp(`Halo, saya ingin info program ${currentHeroProgram.title}.`)" target="_blank" class="btn btn-outline-danger rounded-pill px-4">{{ section.config.hero_inquiry_label || 'Tanya via WhatsApp' }}</a>
                  </div>
                </div>
                <div v-if="heroPrograms.length > 1" class="hero-program-dots">
                  <button v-for="(program, index) in heroPrograms" :key="program.id" type="button" :class="{ active: index === activeHeroProgram }" :aria-label="`${section.config.hero_display_label} ${program.title}`" @click="selectHeroProgram(index)"></button>
                </div>
              </article>
              <img v-else-if="section.config.image_url" :src="section.config.image_url" :alt="section.title" class="hero-main-image">
            </div>
          </div>
        </div>
      </section>

      <section v-else-if="section.section_key === 'stats'" :id="sectionId(section.section_key)" :class="sectionClass(section)" :style="sectionStyle(section)">
        <SectionDecor :section="section" />
        <div v-if="particleCount(section)" class="particle-field" aria-hidden="true">
          <span v-for="index in particleCount(section)" :key="index" class="particle-dot" :style="{ '--i': index }"></span>
        </div>
        <div class="container">
          <div class="text-center mb-5">
            <span class="section-eyebrow">{{ section.eyebrow }}</span>
            <h2 class="section-title">{{ section.title }}</h2>
            <p class="section-lead mx-auto mt-3">{{ section.subtitle }}</p>
          </div>
          <div class="row g-4">
            <div v-for="stat in content.stats" :key="stat.id" class="col-6 col-lg-3">
              <div class="stat-card">
                <div class="stat-icon"><i class="bi" :class="stat.icon"></i></div>
                <span class="stat-number">{{ stat.prefix }}{{ Number(stat.value).toLocaleString('id-ID') }}{{ stat.suffix }}</span>
                <div class="stat-label">{{ stat.label }}</div>
              </div>
            </div>
          </div>
          <div class="section-action">
            <router-link :to="section.config.about_button_url" class="btn btn-outline-danger rounded-pill px-4 section-action-button">{{ section.config.about_button_label }} <i class="bi bi-arrow-right ms-2"></i></router-link>
          </div>
        </div>
      </section>

      <section v-else-if="section.section_key === 'clients'" :id="sectionId(section.section_key)" :class="sectionClass(section)" :style="sectionStyle(section)">
        <SectionDecor :section="section" />
        <div class="container text-center mb-4">
          <span v-if="section.eyebrow" class="section-eyebrow">{{ section.eyebrow }}</span>
          <p class="marquee-label mb-1">{{ section.title }}</p>
          <p v-if="section.subtitle" class="section-lead mx-auto">{{ section.subtitle }}</p>
        </div>
        <div class="container">
          <div class="client-logo-grid" :style="{ '--client-scroll-height': `${section.config.scroll_height || 240}px` }">
            <a v-for="client in landingClients(section)" :key="client.id" :href="client.website_url || undefined" :target="client.website_url ? '_blank' : undefined" class="client-logo-item">
              <img :src="client.logo_url" :alt="client.name" loading="lazy">
            </a>
          </div>
          <div class="section-action"><router-link class="btn btn-outline-danger rounded-pill px-4 section-action-button" :to="section.config.action_button_url">{{ section.config.action_button_label }} <i class="bi bi-arrow-right ms-2"></i></router-link></div>
        </div>
      </section>

      <section v-else-if="section.section_key === 'programs'" :id="sectionId(section.section_key)" :class="sectionClass(section)" :style="sectionStyle(section)">
        <SectionDecor :section="section" />
        <div v-if="particleCount(section)" class="particle-field" aria-hidden="true">
          <span v-for="index in particleCount(section)" :key="index" class="particle-dot" :style="{ '--i': index }"></span>
        </div>
        <div class="container">
          <div class="row align-items-end mb-5">
            <div class="col-lg-7">
              <span class="section-eyebrow">{{ section.eyebrow }}</span>
              <h2 class="section-title">{{ section.title }}</h2>
              <p class="section-lead mt-3">{{ section.subtitle }}</p>
            </div>
            <div class="col-lg-5">
              <div class="filter-bar justify-content-lg-end">
                <button v-for="category in programCategories" :key="category" class="filter-btn text-capitalize" :class="{ active: activeProgram === category }" @click="activeProgram = category">{{ category === 'all' ? section.config.filter_all_label : category }}</button>
              </div>
            </div>
          </div>
          <div class="row g-4">
            <div v-for="program in filteredPrograms" :key="program.id" class="col-md-6 col-xl-4 program-card-wrap">
              <article class="program-card h-100">
                <div class="program-card-thumb">
                  <img v-if="program.image_url" :src="program.image_url" :alt="program.title" loading="lazy">
                  <div v-else class="program-placeholder">{{ program.emoji || '✦' }}</div>
                  <span class="program-badge">{{ program.badge }}</span>
                </div>
                <div class="program-card-body">
                  <div class="program-card-icon"><i class="bi" :class="program.icon"></i></div>
                  <h3 class="program-card-title">{{ program.title }}</h3>
                  <p class="program-card-desc">{{ program.description }}</p>
                  <div class="program-card-price">
                    <small v-if="program.price_regular">{{ formatPrice(program.price_regular) }}</small>
                    <strong>{{ formatPrice(program.price_discount || program.price_regular) }}</strong>
                    <span v-if="program.voucher_code">{{ program.voucher_code }}</span>
                  </div>
                  <div class="program-card-actions">
                    <router-link :to="`/program/${program.slug}`" class="btn btn-sm btn-danger rounded-pill px-3">{{ section.config.card_detail_label }}</router-link>
                    <a :href="whatsapp(`Halo, saya ingin info program ${program.title}.`)" target="_blank" class="btn btn-sm btn-success rounded-pill px-3"><i class="bi bi-whatsapp"></i> {{ section.config.card_inquiry_label }}</a>
                    <a v-if="program.flyer_pdf_url" :href="program.flyer_pdf_url" target="_blank" class="btn btn-sm btn-outline-danger rounded-pill px-3"><i class="bi bi-file-earmark-pdf"></i> {{ section.config.card_flyer_label || 'Buka Flyer' }}</a>
                  </div>
                </div>
              </article>
            </div>
          </div>
          <div class="section-action">
            <router-link :to="section.config.action_button_url" class="btn btn-outline-danger rounded-pill px-5 section-action-button">{{ section.config.action_button_label }} <i class="bi bi-arrow-right ms-2"></i></router-link>
          </div>
        </div>
      </section>
      <section v-else-if="section.section_key === 'events'" :id="sectionId(section.section_key)" :class="sectionClass(section)" :style="sectionStyle(section)"><SectionDecor :section="section"/><div class="container"><div class="text-center mb-4"><span class="section-eyebrow">{{section.eyebrow}}</span><h2 class="section-title">{{section.title}}</h2><p class="section-lead mx-auto">{{section.subtitle}}</p></div><div class="row g-4"><div v-for="event in content.events" :key="event.id" class="col-md-6 col-lg-4"><router-link :to="`/event/${event.slug}`" class="event-slide"><img v-if="event.image_url" :src="event.image_url" :alt="event.title"><strong>{{event.title}}</strong><small>{{event.location}}</small></router-link></div></div><div class="section-action"><router-link :to="section.config.action_button_url" class="btn btn-outline-danger rounded-pill section-action-button">{{section.config.action_button_label}}</router-link></div></div></section>

      <section v-else-if="section.section_key === 'features'" :id="sectionId(section.section_key)" :class="sectionClass(section)" :style="sectionStyle(section)">
        <SectionDecor :section="section" />
        <div v-if="particleCount(section)" class="particle-field" aria-hidden="true">
          <span v-for="index in particleCount(section)" :key="index" class="particle-dot" :style="{ '--i': index }"></span>
        </div>
        <div class="container">
          <div class="row align-items-center g-5">
            <div class="col-lg-5">
              <span class="section-eyebrow">{{ section.eyebrow }}</span>
              <h2 class="section-title">{{ section.title }}</h2>
              <p class="section-lead mt-3">{{ section.subtitle }}</p>
              <a :href="section.config.action_button_url" class="btn btn-danger rounded-pill mt-4 px-4 section-action-button">{{ section.config.action_button_label }} <i class="bi bi-arrow-right ms-2"></i></a>
            </div>
            <div class="col-lg-7">
              <div class="row g-3">
                <div v-for="item in content.features" :key="item.id" class="col-12">
                  <div class="why-item">
                    <div class="why-icon"><i class="bi" :class="item.icon"></i></div>
                    <div><div class="why-title">{{ item.title }}</div><div class="why-desc">{{ item.description }}</div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section v-else-if="section.section_key === 'trainers'" :id="sectionId(section.section_key)" :class="sectionClass(section)" :style="sectionStyle(section)">
        <SectionDecor :section="section" />
        <div class="container">
          <div class="text-center mb-5">
            <span class="section-eyebrow">{{ section.eyebrow }}</span>
            <h2 class="section-title">{{ section.title }}</h2>
            <p class="section-lead mx-auto mt-3">{{ section.subtitle }}</p>
          </div>
          <div class="trainer-carousel-shell">
            <button type="button" class="slider-nav slider-prev" :aria-label="section.config.previous_label" @click="scrollTrainers(-1)"><i class="bi bi-chevron-left"></i></button>
            <div ref="trainerTrack" class="trainer-carousel-track">
              <div v-for="trainer in content.trainers" :key="trainer.id" class="trainer-slide">
                <div class="trainer-card">
                  <img v-if="trainer.image_url" class="trainer-photo" :src="trainer.image_url" :alt="trainer.name" loading="lazy">
                  <div v-else class="trainer-img-placeholder"><i class="bi bi-person"></i></div>
                  <div class="trainer-body">
                    <div class="trainer-name">{{ trainer.name }}</div>
                    <div class="trainer-role">{{ trainer.role }}</div>
                    <div class="trainer-bio">{{ trainer.bio }}</div>
                    <div class="trainer-certs"><span v-for="cert in trainer.certifications" :key="cert" class="trainer-cert">{{ cert }}</span></div>
                  </div>
                </div>
              </div>
            </div>
            <button type="button" class="slider-nav slider-next" :aria-label="section.config.next_label" @click="scrollTrainers(1)"><i class="bi bi-chevron-right"></i></button>
          </div>
        </div>
      </section>

      <section v-else-if="section.section_key === 'galleries'" :id="sectionId(section.section_key)" :class="sectionClass(section)" :style="sectionStyle(section)">
        <SectionDecor :section="section" />
        <div class="container">
          <div class="text-center mb-5">
            <span class="section-eyebrow">{{ section.eyebrow }}</span>
            <h2 class="section-title">{{ section.title }}</h2>
            <p class="section-lead mx-auto mt-3">{{ section.subtitle }}</p>
          </div>
          <div class="gallery-grid">
            <router-link v-for="gallery in content.galleries.slice(0,6)" :key="gallery.id" :to="`/gallery/${gallery.slug}`" class="gallery-item">
              <img v-if="gallery.cover_url" :src="gallery.cover_url" :alt="gallery.title" loading="lazy">
              <div v-else class="gallery-placeholder"><i class="bi bi-images"></i><small>{{ gallery.title }}</small></div>
            </router-link>
          </div>
          <div class="section-action"><router-link class="btn btn-outline-danger rounded-pill px-4 section-action-button" :to="section.config.action_button_url">{{ section.config.action_button_label }} <i class="bi bi-arrow-right ms-2"></i></router-link></div>
        </div>
      </section>

      <section v-else-if="section.section_key === 'testimonials'" :id="sectionId(section.section_key)" :class="sectionClass(section)" :style="sectionStyle(section)">
        <SectionDecor :section="section" />
        <div v-if="particleCount(section)" class="particle-field" aria-hidden="true">
          <span v-for="index in particleCount(section)" :key="index" class="particle-dot" :style="{ '--i': index }"></span>
        </div>
        <div class="container">
          <div class="text-center mb-5">
            <span class="section-eyebrow">{{ section.eyebrow }}</span>
            <h2 class="section-title">{{ section.title }}</h2>
            <p class="section-lead">{{ section.subtitle }}</p>
          </div>
          <div class="testimonials-track">
            <article v-for="item in content.testimonials" :key="item.id" class="testimonial-card">
              <div class="testimonial-stars">{{ '★'.repeat(item.rating) }}</div>
              <p class="testimonial-text">“{{ item.quote }}”</p>
              <div class="testimonial-author">
                <img v-if="item.avatar_url" class="testimonial-avatar" :src="item.avatar_url" :alt="item.name">
                <div v-else class="testimonial-avatar">{{ item.name.charAt(0) }}</div>
                <div><div class="testimonial-name">{{ item.name }}</div><div class="testimonial-org">{{ item.organization }}</div></div>
              </div>
            </article>
          </div>
          <div class="section-action"><router-link class="btn btn-outline-light rounded-pill px-4 section-action-button" :to="section.config.action_button_url">{{ section.config.action_button_label }} <i class="bi bi-arrow-right ms-2"></i></router-link></div>
        </div>
      </section>

      <section v-else-if="section.section_key === 'posts'" :id="sectionId(section.section_key)" :class="sectionClass(section)" :style="sectionStyle(section)">
        <SectionDecor :section="section" />
        <div class="container">
          <div class="row align-items-end mb-5">
            <div class="col-lg-8"><span class="section-eyebrow">{{ section.eyebrow }}</span><h2 class="section-title">{{ section.title }}</h2><p v-if="section.subtitle" class="section-lead mt-3 mb-0">{{ section.subtitle }}</p></div>
            <div class="col-lg-4 text-lg-end"><router-link :to="section.config.action_button_url" class="btn btn-outline-danger rounded-pill px-4 section-action-button">{{ section.config.action_button_label }} <i class="bi bi-arrow-right"></i></router-link></div>
          </div>
          <div class="row g-4">
            <div v-for="post in content.posts.slice(0,3)" :key="post.id" class="col-md-6 col-lg-4">
              <article class="article-card">
                <div class="article-thumb"><img v-if="post.featured_image" :src="post.featured_image" :alt="post.title" loading="lazy"><i v-else class="bi bi-file-earmark-text"></i></div>
                <div class="article-body">
                  <div class="article-meta"><span class="article-cat">{{ post.category }}</span><time class="article-date">{{ new Date(post.published_at).toLocaleDateString('id-ID',{dateStyle:'medium'}) }}</time></div>
                  <h3 class="article-title">{{ post.title }}</h3>
                  <p class="article-excerpt">{{ post.excerpt }}</p>
                  <router-link :to="`/blog/${post.slug}`" class="article-read-more">{{ section.config.read_more_label }} <i class="bi bi-arrow-right"></i></router-link>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section v-else-if="section.section_key === 'partners'" :id="sectionId(section.section_key)" :class="sectionClass(section)" :style="sectionStyle(section)">
        <SectionDecor :section="section" />
        <div class="container">
          <div class="text-center mb-5"><span class="section-eyebrow">{{ section.eyebrow }}</span><h2 class="section-title">{{ section.title }}</h2><p class="section-lead mx-auto mt-3">{{ section.subtitle }}</p></div>
          <div class="row g-4">
            <div v-for="partner in content.partners" :key="partner.id" class="col-md-4">
              <div class="partner-card">
                <span class="partner-icon"><i class="bi" :class="partner.icon"></i></span>
                <div class="partner-title">{{ partner.title }}</div>
                <p class="partner-desc">{{ partner.description }}</p>
                <a :href="partner.button_url" class="btn btn-sm btn-danger rounded-pill mt-3 px-3">{{ partner.button_label }}</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section v-else-if="section.section_key === 'contact'" :id="sectionId(section.section_key)" :class="sectionClass(section)" :style="sectionStyle(section)">
        <SectionDecor :section="section" />
        <div v-if="particleCount(section)" class="particle-field" aria-hidden="true">
          <span v-for="index in particleCount(section)" :key="index" class="particle-dot" :style="{ '--i': index }"></span>
        </div>
        <div class="container position-relative" style="z-index:2">
          <div class="row align-items-center g-5">
            <div class="col-lg-5">
              <span class="section-eyebrow">{{ section.eyebrow }}</span>
              <h2 class="section-title">{{ section.title }}</h2>
              <p class="section-lead mt-3">{{ section.subtitle }}</p>
              <div class="contact-list">
                <a v-if="section.config.show_whatsapp !== 0" :href="whatsapp()" target="_blank"><i class="bi bi-whatsapp"></i><span><small>{{ section.config.whatsapp_label }}</small>{{ settings.whatsapp_number }}</span></a>
                <a v-if="section.config.show_phone !== 0" :href="`tel:${settings.phone}`"><i class="bi bi-telephone"></i><span><small>{{ section.config.phone_label }}</small>{{ settings.phone }}</span></a>
                <a v-if="section.config.show_email !== 0" :href="`mailto:${settings.email}`"><i class="bi bi-envelope"></i><span><small>{{ section.config.email_label }}</small>{{ settings.email }}</span></a>
                <a v-if="section.config.show_address !== 0" :href="settings.maps_url" target="_blank"><i class="bi bi-geo-alt"></i><span><small>{{ section.config.address_label }}</small>{{ settings.address }}</span></a>
              </div>
            </div>
            <div class="col-lg-7">
              <div class="lead-form-card">
                <h3 class="mb-4">{{ section.config.form_title }}</h3>
                <form @submit.prevent="submitLead">
                  <div class="row g-3">
                    <div class="col-md-6"><label class="form-label">{{ section.config.name_label }}</label><input v-model="lead.name" required class="form-control"></div>
                    <div class="col-md-6"><label class="form-label">{{ section.config.whatsapp_field_label }}</label><input v-model="lead.whatsapp" required class="form-control"></div>
                    <div class="col-md-6"><label class="form-label">{{ section.config.company_label }}</label><input v-model="lead.company" class="form-control"></div>
                    <div class="col-md-6"><label class="form-label">{{ section.config.position_label }}</label><input v-model="lead.position" class="form-control"></div>
                    <div class="col-12"><label class="form-label">{{ section.config.program_label }}</label><select v-model="lead.program" class="form-select"><option value="">{{ section.config.program_placeholder }}</option><option v-for="program in content.programs" :key="program.id">{{ program.title }}</option></select></div>
                    <div class="col-md-6"><label class="form-label">{{ section.config.participants_label }}</label><select v-model="lead.participants" class="form-select"><option v-for="option in section.config.participant_options" :key="option">{{ option }}</option></select></div>
                    <div class="col-md-6"><label class="form-label">{{ section.config.timeline_label }}</label><select v-model="lead.timeline" class="form-select"><option v-for="option in section.config.timeline_options" :key="option">{{ option }}</option></select></div>
                    <div class="col-12"><label class="form-label">{{ section.config.message_label }}</label><textarea v-model="lead.message" class="form-control" rows="3"></textarea></div>
                    <div v-if="notice" class="col-12"><div class="alert alert-light mb-0">{{ notice }}</div></div>
                    <div class="col-12"><button :disabled="sending" class="btn btn-danger w-100 rounded-pill py-3"><i class="bi bi-send me-2"></i>{{ sending ? section.config.submitting_label : section.config.submit_label }}</button></div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section v-else-if="section.section_key === 'faqs'" :id="sectionId(section.section_key)" :class="sectionClass(section)" :style="sectionStyle(section)">
        <SectionDecor :section="section" />
        <div class="container">
          <div class="row justify-content-center"><div class="col-lg-8">
            <div class="text-center mb-5"><span class="section-eyebrow">{{ section.eyebrow }}</span><h2 class="section-title">{{ section.title }}</h2><p v-if="section.subtitle" class="section-lead mx-auto mt-3">{{ section.subtitle }}</p></div>
            <div v-for="faq in content.faqs" :key="faq.id" class="faq-item">
              <button class="faq-question" :class="{ open: openFaq === faq.id }" @click="openFaq = openFaq === faq.id ? null : faq.id"><span>{{ faq.question }}</span><i class="bi" :class="openFaq === faq.id ? 'bi-dash' : 'bi-plus'"></i></button>
              <div class="faq-answer" :class="{ open: openFaq === faq.id }">{{ faq.answer }}</div>
            </div>
          </div></div>
        </div>
      </section>

      <section v-else-if="section.section_key === 'cta'" :id="sectionId(section.section_key)" :class="sectionClass(section)" :style="sectionStyle(section)">
        <SectionDecor :section="section" />
        <div class="container position-relative text-center" style="z-index:2">
          <span v-if="section.eyebrow" class="section-eyebrow">{{ section.eyebrow }}</span>
          <h2 class="section-title display-6 fw-bold">{{ section.title }}</h2>
          <p class="section-lead fs-5 mx-auto mb-4" style="max-width:600px">{{ section.subtitle }}</p>
          <a :href="whatsapp()" target="_blank" class="btn btn-light btn-lg rounded-pill px-5 section-action-button"><i class="bi bi-whatsapp me-2"></i>{{ section.config.button_label }}</a>
        </div>
      </section>
    </template>

    <PublicFooter :settings="settings" :navigation="content.navigation" />
    <SocialProofToast :items="content.social_proofs || []" />
    <PublicFloatingActions :settings="settings" />
    <div v-if="lightbox" class="lightbox" @click="lightbox=''"><img :src="lightbox" alt=""></div>
  </div>
</template>

<style scoped>
.hero-primary{background:var(--grad-red);color:#fff;border:0;border-radius:50px;padding:14px 32px;font-weight:600}
.hero-secondary{background:rgba(255,255,255,.76);color:#9f1239;border:1px solid rgba(196,30,58,.24);border-radius:50px;padding:14px 32px}
.hero-main-image{max-height:80vh;max-width:100%;border-radius:24px;box-shadow:0 40px 80px rgba(139,0,0,.4);object-fit:contain}
.hero-image-wrap{padding-top:5.25rem}
.hero-program-slider{width:min(100%,520px);background:rgba(255,255,255,.78);border:1px solid rgba(255,255,255,.78);border-radius:24px;box-shadow:0 30px 90px rgba(196,30,58,.20);overflow:hidden;backdrop-filter:blur(14px)}
.hero-program-media{position:relative;aspect-ratio:16/10;background:#e2e8f0;overflow:hidden}
.hero-program-media img,.hero-program-media iframe,.hero-youtube-poster{width:100%;height:100%;display:block;border:0}
.hero-program-media img{object-fit:cover}
.hero-youtube-poster{position:relative;padding:0;background:#e2e8f0}
.hero-youtube-poster span{position:absolute;inset:0;margin:auto;width:64px;height:64px;border-radius:999px;background:var(--grad-red);color:#fff;display:grid;place-items:center;font-size:2.2rem;box-shadow:0 16px 40px rgba(196,30,58,.35)}
.hero-program-body{padding:1.25rem}
.hero-program-body>span{color:#b91c1c;font-weight:800;text-transform:uppercase;font-size:.76rem;letter-spacing:.06em}
.hero-program-body h2{font-size:1.55rem;color:#172033;margin:.3rem 0 .45rem}
.hero-program-body p{color:#475569;font-size:.94rem;line-height:1.55;margin-bottom:.85rem}
.hero-program-price{display:flex;align-items:baseline;gap:.6rem;margin-bottom:1rem}
.hero-program-price small{text-decoration:line-through;color:#94a3b8;font-weight:800}
.hero-program-price strong{color:#b91c1c;font-size:1.3rem}
.hero-program-actions{display:flex;flex-wrap:wrap;gap:.65rem}
.hero-program-dots{display:flex;gap:.4rem;padding:0 1.25rem 1.2rem}
.hero-program-dots button{width:9px;height:9px;border-radius:999px;background:#fecdd3;border:0;transition:width .2s ease,background .2s ease}
.hero-program-dots button.active{width:28px;background:#c41e3a}
.hero-program-mobile-card{display:none}
.program-card-price{display:flex;flex-wrap:wrap;align-items:center;gap:.45rem;margin-bottom:1rem}
.program-card-price small{text-decoration:line-through;color:#94a3b8;font-weight:700}
.program-card-price strong{color:#b91c1c}
.program-card-price span{font-size:.7rem;font-weight:800;color:#9f1239;background:#fff1f2;border:1px dashed #fb7185;border-radius:999px;padding:.18rem .5rem}
.program-placeholder{width:100%;height:100%;display:grid;place-items:center;font-size:4rem;background:linear-gradient(135deg,#1a1a2e,#3d0015)}
.gallery-placeholder{display:grid;place-items:center;align-content:center;gap:.5rem;width:100%;height:100%;font-size:2rem}.gallery-placeholder small{font-size:.72rem;padding:0 .5rem;text-align:center}
.client-scroll-grid{max-height:var(--client-scroll-height);overflow-y:auto;overscroll-behavior:contain;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1rem;padding:.5rem;scrollbar-width:thin}.client-scroll-item{min-height:110px;border:1px solid rgba(148,163,184,.28);border-radius:14px;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.55rem;padding:1rem;color:#475569;text-decoration:none;text-align:center;font-size:.78rem}.client-scroll-item img{max-width:130px;max-height:58px;object-fit:contain}@media(max-width:768px){.client-scroll-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:420px){.client-scroll-grid{grid-template-columns:1fr}}
.trainer-carousel-shell{position:relative}
.trainer-carousel-track{display:flex;gap:1rem;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:thin;padding:.35rem .25rem 1rem;overscroll-behavior-x:contain}
.trainer-slide{flex:0 0 min(300px,82vw);scroll-snap-align:start}
.trainer-slide .trainer-card{height:100%}
.slider-nav{position:absolute;top:50%;transform:translateY(-50%);z-index:5;width:44px;height:44px;border-radius:999px;background:#fff;color:#b91c1c;border:2px solid rgba(196,30,58,.35);box-shadow:0 14px 34px rgba(15,23,42,.12);display:grid;place-items:center}
.slider-nav:hover{background:#c41e3a;color:#fff;border-color:#c41e3a}
.slider-prev{left:-.75rem}
.slider-next{right:-.75rem}
.text-rose{color:var(--clr-rose-light,#f8b4c2)!important}
.contact-list{display:grid;gap:1rem;margin-top:2rem}.contact-list a{display:flex;align-items:center;gap:1rem;color:#172033;text-decoration:none}.contact-list i{width:44px;height:44px;border-radius:10px;background:rgba(196,30,58,.12);display:grid;place-items:center;color:#b91c1c}.contact-list span{display:grid}.contact-list small{color:#64748b}
.lightbox{position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:9999;display:grid;place-items:center;padding:1rem}.lightbox img{max-width:94vw;max-height:92vh;border-radius:12px}
.dynamic-section {
  margin-top: var(--section-margin-top-desktop, 0);
  margin-bottom: var(--section-margin-bottom-desktop, 0);
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  contain: paint;
}
.dynamic-section.has-aurora {
  background: var(--section-aurora, linear-gradient(135deg,#fff8f1 0%,#eef7ff 34%,#fff0f7 66%,#fff7df 100%));
}
.dynamic-section.has-aurora::before,
.dynamic-section.has-glow::after {
  content: '';
  position: absolute;
  inset: -25%;
  pointer-events: none;
  z-index: 0;
}
.dynamic-section.has-aurora::before {
  background:
    radial-gradient(circle at 18% 18%, rgba(255,94,98,.22), transparent 28%),
    radial-gradient(circle at 78% 16%, rgba(56,189,248,.20), transparent 30%),
    radial-gradient(circle at 70% 76%, rgba(250,204,21,.20), transparent 28%),
    radial-gradient(circle at 25% 82%, rgba(244,114,182,.16), transparent 28%);
  filter: blur(4px);
}
.dynamic-section.has-glow::after {
  background: radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--section-glow-color, #ff6b6b) 22%, transparent), transparent 42%);
  filter: blur(14px);
}
.particle-field {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 1;
}
.particle-dot {
  --size: calc(4px + (var(--i) % 5) * 1px);
  position: absolute;
  left: calc((var(--i) * 37) % 100 * 1%);
  top: calc((var(--i) * 53) % 100 * 1%);
  width: var(--size);
  height: var(--size);
  border-radius: 999px;
  background: var(--section-particle-color, rgba(255,255,255,.9));
  box-shadow: 0 0 18px var(--section-particle-color, rgba(255,255,255,.95));
  animation: particle-drift calc(7s + (var(--i) % 8) * 1s) ease-in-out infinite alternate;
  opacity: .86;
}
@keyframes particle-drift {
  from { transform: translate3d(-12px, 10px, 0) scale(.8); }
  to { transform: translate3d(18px, -24px, 0) scale(1.3); }
}
.dynamic-section > *:not(.section-divider) {
  position: relative;
  z-index: 2;
}
.dynamic-section.has-parallax {
  background-attachment: scroll;
  background-position: center center;
}
.dynamic-section.has-title-size-desktop .section-title,
.dynamic-section.has-title-size-desktop .hero-title,
.dynamic-section.has-title-size-desktop > .container > h2 {
  font-size: var(--section-title-desktop) !important;
}
.dynamic-section.has-text-size-desktop p,
.dynamic-section.has-text-size-desktop .section-lead,
.dynamic-section.has-text-size-desktop .hero-subtitle {
  font-size: var(--section-text-desktop);
}
.dynamic-section.has-padding-desktop {
  padding-top: var(--section-padding-desktop);
  padding-bottom: var(--section-padding-desktop);
}
.dynamic-section.has-custom-align,
.dynamic-section.has-custom-align .text-center,
.dynamic-section.has-custom-align .text-lg-end {
  text-align: var(--section-text-align) !important;
}
.dynamic-section.has-custom-text-color *:not(.bi):not(.btn) {
  color: var(--section-text-color) !important;
}
.dynamic-section.has-custom-heading-color h1,
.dynamic-section.has-custom-heading-color h2,
.dynamic-section.has-custom-heading-color h3 {
  color: var(--section-heading-color) !important;
}
.dynamic-section.has-custom-font *:not(.bi) {
  font-family: var(--section-font-family) !important;
}
.dynamic-section.has-eyebrow-spacing .section-eyebrow,
.dynamic-section.has-eyebrow-spacing .hero-badge { margin-top:var(--section-eyebrow-margin-desktop, initial); margin-bottom:var(--section-eyebrow-margin-desktop, initial); padding-block:var(--section-eyebrow-padding-desktop, 0); }
.dynamic-section.has-title-spacing .section-title,
.dynamic-section.has-title-spacing .hero-title { margin-top:var(--section-title-margin-desktop, initial); margin-bottom:var(--section-title-margin-desktop, initial); padding-block:var(--section-title-padding-desktop, 0); }
.dynamic-section.has-subtitle-spacing .section-lead,
.dynamic-section.has-subtitle-spacing .hero-subtitle { margin-top:var(--section-subtitle-margin-desktop, initial); margin-bottom:var(--section-subtitle-margin-desktop, initial); padding-block:var(--section-subtitle-padding-desktop, 0); }
.dynamic-section :deep(.section-divider) {
  position: absolute;
  left: -1%;
  width: 102%;
  height: var(--section-divider-height-desktop, 56px);
  display: block;
  background: transparent;
  fill: var(--section-divider-color, #fff);
  pointer-events: none;
  z-index: 1;
}
.dynamic-section :deep(.section-divider-top) { top: -1px; transform: rotate(180deg); }
.dynamic-section :deep(.section-divider-bottom) { bottom: -1px; }
@media (max-width: 900px) {
  .hero-section,
  .hero-section .container,
  .hero-section .row,
  .hero-section [class*="col-"] {
    width: 100%;
    max-width: 100vw;
    min-width: 0;
    overflow-x: hidden;
  }
  .hero-section .row {
    margin-left: 0;
    margin-right: 0;
    min-height: auto !important;
    padding-top: 5.4rem !important;
    padding-bottom: 2.4rem !important;
    gap: 1.2rem;
  }
  .dynamic-section.has-title-size-mobile .hero-title,
  .hero-title {
    width: 100%;
    max-width: calc(100vw - 3.5rem);
    font-size: 30px !important;
    white-space: normal !important;
    overflow-wrap: anywhere;
    line-height: 1.08;
  }
  .hero-subtitle,
  .hero-badge,
  .hero-metrics {
    max-width: calc(100vw - 3.5rem);
  }
  .hero-cta-group,
  .hero-cta-group.d-flex {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr);
    width: 100%;
    max-width: calc(100vw - 3.5rem);
    gap: .9rem !important;
  }
  .hero-cta-group .btn {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    justify-content: center;
    white-space: normal;
  }
  .hero-metrics {
    display: none;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.2rem .75rem;
  }
  .hero-metrics > div {
    min-width: 0;
  }
  .hero-metric-label {
    font-size: .78rem;
    overflow-wrap: anywhere;
  }
  .hero-image-wrap {
    display: block;
    padding-top: 0;
    max-width: calc(100vw - 2rem);
    overflow: visible;
  }
  .hero-program-slider {
    width: 100%;
    max-width: calc(100vw - 2rem);
    border-radius: 18px;
    margin: .25rem auto 0;
    touch-action: pan-y;
  }
  .hero-program-body h2 {
    font-size: 1.2rem;
  }
  .hero-program-actions {
    display: grid;
  }
  .hero-program-actions .btn {
    width: 100%;
    justify-content: center;
  }
  .hero-program-mobile-card {
    display: none;
    grid-template-columns: 92px minmax(0, 1fr);
    gap: .35rem .85rem;
    align-items: center;
    max-width: calc(100vw - 3.5rem);
    margin-top: 1rem;
    padding: .75rem;
    border-radius: 18px;
    background: rgba(255,255,255,.82);
    border: 1px solid rgba(196,30,58,.14);
    box-shadow: 0 14px 36px rgba(15,23,42,.08);
    color: #172033;
  }
  .hero-program-mobile-card img {
    grid-row: span 3;
    width: 92px;
    aspect-ratio: 1;
    border-radius: 14px;
    object-fit: cover;
  }
  .hero-program-mobile-card span {
    color: #b91c1c;
    font-size: .7rem;
    font-weight: 800;
    text-transform: uppercase;
  }
  .hero-program-mobile-card strong {
    line-height: 1.2;
  }
  .hero-program-mobile-card small {
    color: #b91c1c;
    font-weight: 800;
  }
  .hero-badge {
    white-space: normal;
    font-size: .74rem;
  }
  .hero-section .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  .hero-title {
    margin-top: .8rem;
  }
  .slider-nav {
    display: none;
  }
  .trainer-carousel-track {
    padding-inline: 1rem;
    margin-inline: -1rem;
  }
  .dynamic-section {
    margin-top: var(--section-margin-top-mobile, 0);
    margin-bottom: var(--section-margin-bottom-mobile, 0);
  }
  .dynamic-section.has-padding-mobile {
    padding-top: var(--section-padding-mobile);
    padding-bottom: var(--section-padding-mobile);
  }
  .dynamic-section.has-title-size-mobile .section-title,
  .dynamic-section.has-title-size-mobile .hero-title,
  .dynamic-section.has-title-size-mobile > .container > h2 {
    font-size: var(--section-title-mobile) !important;
  }
  .dynamic-section.has-text-size-mobile p,
  .dynamic-section.has-text-size-mobile .section-lead,
  .dynamic-section.has-text-size-mobile .hero-subtitle {
    font-size: var(--section-text-mobile);
  }
  .dynamic-section.has-eyebrow-spacing .section-eyebrow,.dynamic-section.has-eyebrow-spacing .hero-badge { margin-top:var(--section-eyebrow-margin-mobile, var(--section-eyebrow-margin-desktop, initial)); margin-bottom:var(--section-eyebrow-margin-mobile, var(--section-eyebrow-margin-desktop, initial)); padding-block:var(--section-eyebrow-padding-mobile, var(--section-eyebrow-padding-desktop, 0)); }
  .dynamic-section.has-title-spacing .section-title,.dynamic-section.has-title-spacing .hero-title { margin-top:var(--section-title-margin-mobile, var(--section-title-margin-desktop, initial)); margin-bottom:var(--section-title-margin-mobile, var(--section-title-margin-desktop, initial)); padding-block:var(--section-title-padding-mobile, var(--section-title-padding-desktop, 0)); }
  .dynamic-section.has-subtitle-spacing .section-lead,.dynamic-section.has-subtitle-spacing .hero-subtitle { margin-top:var(--section-subtitle-margin-mobile, var(--section-subtitle-margin-desktop, initial)); margin-bottom:var(--section-subtitle-margin-mobile, var(--section-subtitle-margin-desktop, initial)); padding-block:var(--section-subtitle-padding-mobile, var(--section-subtitle-padding-desktop, 0)); }
  .dynamic-section :deep(.section-divider) {
    height: var(--section-divider-height-mobile, 28px);
  }
}
@media (max-width: 900px), (hover: none), (pointer: coarse) {
  .dynamic-section.has-parallax {
    background-attachment: scroll;
    background-position: center;
  }
}
@media (prefers-reduced-motion: reduce) {
  .dynamic-section.has-parallax {
    background-attachment: scroll;
  }
}
</style>
