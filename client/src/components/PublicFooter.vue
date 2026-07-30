<script setup>
import { useRouter } from 'vue-router';

defineProps({ settings: { type: Object, default: () => ({}) }, navigation: { type: Array, default: () => [] } });
const router = useRouter();

async function goToLandingSection(url) {
  const sectionId = String(url).split('#')[1];
  if (!sectionId) return;
  if (router.currentRoute.value.path !== '/') await router.push('/');
  requestAnimationFrame(() => {
    const section = document.getElementById(sectionId);
    history.pushState({ ...(history.state || {}), landingSection: sectionId, landingOffset: 0 }, '', '/');
    if (section) window.scrollTo({ top: Math.max(0, section.getBoundingClientRect().top + window.scrollY - 72), behavior: 'smooth' });
  });
}
</script>

<template>
  <footer class="footer">
    <div class="container">
      <div class="row g-5">
        <div class="col-lg-5">
          <img v-if="settings.logo_url" :src="settings.logo_url" :alt="settings.site_name" class="footer-brand-logo" loading="lazy">
          <div v-else class="footer-brand-name">{{ settings.logo_symbol || '⭐' }} {{ settings.site_short_name }}</div>
          <div class="footer-tagline">{{ settings.site_tagline }}</div>
          <p class="footer-copy">{{ settings.footer_description }}</p>
          <nav class="footer-social">
            <a v-if="settings.instagram_url" :href="settings.instagram_url" target="_blank" aria-label="Instagram"><i class="bi bi-instagram"></i></a>
            <a v-if="settings.linkedin_url" :href="settings.linkedin_url" target="_blank" aria-label="LinkedIn"><i class="bi bi-linkedin"></i></a>
            <a v-if="settings.youtube_url" :href="settings.youtube_url" target="_blank" aria-label="YouTube"><i class="bi bi-youtube"></i></a>
            <a v-if="settings.facebook_url" :href="settings.facebook_url" target="_blank" aria-label="Facebook"><i class="bi bi-facebook"></i></a>
          </nav>
        </div>
        <div class="col-sm-6 col-lg-3">
          <div class="footer-heading">Navigasi</div>
          <ul class="footer-links">
            <li v-for="item in navigation" :key="item.id"><a v-if="item.url.startsWith('/#')" href="/" @click.prevent="goToLandingSection(item.url)">{{ item.label }}</a><router-link v-else :to="item.url">{{ item.label }}</router-link></li>
          </ul>
        </div>
        <div class="col-sm-6 col-lg-4">
          <div class="footer-heading">Hubungi Kami</div>
          <div class="footer-contact-item"><i class="bi bi-geo-alt-fill footer-contact-icon"></i><span>{{ settings.address }}</span></div>
          <div class="footer-contact-item"><i class="bi bi-telephone-fill footer-contact-icon"></i><a :href="`tel:${settings.phone}`">{{ settings.phone }}</a></div>
          <div class="footer-contact-item"><i class="bi bi-envelope-fill footer-contact-icon"></i><a :href="`mailto:${settings.email}`">{{ settings.email }}</a></div>
        </div>
      </div>
      <hr class="footer-divider">
      <div class="footer-bottom"><span>{{ settings.copyright_text }}</span><div class="d-flex gap-3"><router-link to="/penawaran">Penawaran Website</router-link><router-link to="/login">SuperAdmin</router-link></div></div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background:
    radial-gradient(circle at 12% 16%, rgba(255,94,98,.18), transparent 30%),
    radial-gradient(circle at 82% 12%, rgba(56,189,248,.18), transparent 32%),
    radial-gradient(circle at 70% 82%, rgba(250,204,21,.16), transparent 30%),
    linear-gradient(135deg,#fff8ee 0%,#edf8ff 38%,#fff0f7 72%,#fff9df 100%);
  color:#172033;
  border-top:1px solid rgba(196,30,58,.14);
}
.footer-brand-logo { width:min(320px,100%); max-height:84px; object-fit:contain; object-position:left center; margin-bottom:1rem; }
.footer-copy { font-size:.95rem;color:#475569;line-height:1.75;margin-bottom:1.5rem }
.footer-contact-item a,.footer-contact-item span { color:#334155;text-decoration:none }
:deep(.footer-heading), :deep(.footer-brand-name) { color:#7f1d1d; }
:deep(.footer-tagline), :deep(.footer-links a), :deep(.footer-bottom), :deep(.footer-bottom a) { color:#475569; }
:deep(.footer-social a), :deep(.footer-contact-icon) { background:#fff; color:#b91c1c; border:1px solid rgba(196,30,58,.18); }
:deep(.footer-divider) { border-color:rgba(196,30,58,.18); opacity:1; }
</style>
