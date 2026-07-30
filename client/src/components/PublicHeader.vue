<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({ settings: { type: Object, default: () => ({}) }, navigation: { type: Array, default: () => [] } });
const router = useRouter();
const scrolled = ref(false);
const menuOpen = ref(false);
const brandParts = computed(() => String(props.settings.logo_text || props.settings.site_short_name || 'STAR Training').split(' '));

function onScroll() { scrolled.value = window.scrollY > 50; }
async function goToLandingSection(url) {
  const sectionId = String(url).split('#')[1];
  if (!sectionId) return;
  menuOpen.value = false;
  if (router.currentRoute.value.path !== '/') await router.push('/');
  requestAnimationFrame(() => {
    const section = document.getElementById(sectionId);
    history.pushState({ ...(history.state || {}), landingSection: sectionId, landingOffset: 0 }, '', '/');
    if (section) window.scrollTo({ top: Math.max(0, section.getBoundingClientRect().top + window.scrollY - 72), behavior: 'smooth' });
  });
}
onMounted(() => {
  document.documentElement.dataset.theme = 'light';
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
});
onUnmounted(() => window.removeEventListener('scroll', onScroll));
</script>

<template>
  <nav class="navbar navbar-expand-lg fixed-top" :class="scrolled ? 'scrolled' : 'transparent'">
    <div class="container">
      <router-link class="navbar-brand" to="/">
        <img v-if="settings.logo_url" :src="settings.logo_url" :alt="settings.site_name" class="brand-image">
        <template v-else><span class="brand-star">{{ settings.logo_symbol || '⭐' }}</span> {{ brandParts[0] }}<span style="color:var(--clr-red-light);margin-left:4px">{{ brandParts.slice(1).join(' ') }}</span></template>
      </router-link>
      <button class="mobile-visible-menu" type="button" aria-label="Buka navigasi" @click="menuOpen = !menuOpen">
        <i class="bi bi-list"></i>
      </button>
      <button class="navbar-toggler" style="position:fixed;right:16px;top:16px;z-index:1001" type="button" aria-label="Buka navigasi" @click="menuOpen = !menuOpen">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" :class="{ show: menuOpen }">
        <ul class="navbar-nav mx-auto">
          <li v-for="item in navigation" :key="item.id" class="nav-item">
            <a v-if="item.url.startsWith('/#')" class="nav-link" href="/" @click.prevent="goToLandingSection(item.url)">{{ item.label }}</a>
            <router-link v-else-if="item.url.startsWith('/')" class="nav-link" :to="item.url" @click="menuOpen=false">{{ item.label }}</router-link>
            <a v-else class="nav-link" :href="item.url" :target="item.target" @click="menuOpen=false">{{ item.label }}</a>
          </li>
        </ul>
        <div class="d-flex align-items-center gap-2">
          <router-link class="btn btn-sm header-ghost-btn" to="/login">Admin</router-link>
          <a class="btn btn-sm btn-wa" :href="`https://wa.me/${settings.whatsapp_number}`" target="_blank"><i class="bi bi-whatsapp"></i> WhatsApp</a>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar { background: rgba(255,255,255,.72); border-bottom: 1px solid rgba(255,255,255,.55); backdrop-filter: blur(18px); padding: .45rem 0; }
.navbar .container { display: flex; align-items: center; max-width: 100%; }
.navbar.transparent { background: rgba(255,255,255,.62) !important; }
.navbar.scrolled { background: rgba(255,255,255,.92) !important; border-bottom-color: rgba(196,30,58,.18); box-shadow: 0 8px 30px rgba(15,23,42,.08); }
.navbar-brand { color: #7f1d1d !important; text-shadow: none; display:inline-flex; align-items:center; padding:0; margin:0; line-height:0; min-height:0; }
.brand-image { width:auto; height:42px; max-width:190px; object-fit:contain; object-position:left center; display:block; }
.nav-link { color: #7f1d1d !important; border: 1px solid transparent; border-radius: 999px; font-weight: 700; padding: .42rem .78rem !important; transition: border-color .18s ease, color .18s ease, background .18s ease; }
.nav-link:hover,
.nav-link.router-link-active {
  background: rgba(255,255,255,.72);
  border-color: rgba(196,30,58,.62);
  color: #9f1239 !important;
}
.header-ghost-btn { background:rgba(196,30,58,.08);color:#7f1d1d;border:1px solid rgba(196,30,58,.22);border-radius:8px;padding:7px 11px; }
.header-ghost-btn:hover { background: var(--clr-red, #c41e3a); color: #fff; }
.btn-wa { background:#25d366;color:#fff;border:none;border-radius:8px;padding:7px 13px; }
.navbar-toggler { background: #fff; border: 1px solid rgba(196,30,58,.35); box-shadow: 0 8px 22px rgba(15,23,42,.12); }
.navbar-toggler-icon { filter: none; }
.mobile-visible-menu { display: none; }
@media (max-width: 991.98px) {
  .navbar { padding: .5rem 0; overflow: visible; }
  .navbar > .container { position: relative; }
  .navbar .container { flex-wrap: wrap; padding-left: 1rem; padding-right: 1rem; }
  .navbar-brand {
    min-width: 0;
    min-height: 0;
    max-width: calc(100vw - 86px);
    overflow: hidden;
    white-space: nowrap;
    font-size: 1.05rem;
  }
  .brand-image { height:38px; max-width: calc(100vw - 100px); }
  .mobile-visible-menu {
    display: inline-grid;
    place-items: center;
    width: 42px;
    height: 38px;
    margin-left: .65rem;
    border-radius: 10px;
    background: var(--clr-red, #c41e3a);
    color: #fff;
    box-shadow: 0 10px 24px rgba(196,30,58,.22);
  }
  .navbar-toggler {
    display: inline-flex !important;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    margin-left: auto;
    position: absolute;
    right: 1rem;
    top: .25rem;
    width: 44px;
    height: 40px;
    z-index: 5;
  }
  .navbar-collapse {
    flex-basis: 100%;
    margin-top: .75rem;
    padding: .85rem;
    border-radius: 14px;
    background: rgba(255,255,255,.97);
    border: 1px solid rgba(196,30,58,.16);
    box-shadow: 0 18px 50px rgba(15,23,42,.16);
  }
  .navbar-nav { display: grid; gap: .25rem; margin-bottom: .75rem; }
  .nav-link { color: #7f1d1d !important; padding: .72rem .85rem !important; border-radius: 12px; }
  .navbar-collapse .d-flex { align-items: stretch !important; flex-direction: column; }
  .navbar-collapse .btn { width: 100%; justify-content: center; }
}
</style>
