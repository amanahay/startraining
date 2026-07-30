<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '../api.js';
import { useCmsSync } from '../cmsSync.js';
import PublicHeader from './PublicHeader.vue';
import PublicFooter from './PublicFooter.vue';
import SocialProofToast from './SocialProofToast.vue';
import PublicFloatingActions from './PublicFloatingActions.vue';

const route = useRoute();
const site = ref(null);
const hideSocialProof = computed(() => /^\/program\/[^/]+\/?$/.test(route.path));

async function fetchSiteData() {
  try {
    site.value = await api('/public/bootstrap');
  } catch {}
}

onMounted(fetchSiteData);
useCmsSync(fetchSiteData);
</script>

<template>
  <div v-if="!site" class="loading-screen"><div class="spinner-border text-danger"></div></div>
  <div v-else>
    <PublicHeader :settings="site.settings" :navigation="site.content.navigation" />
    <slot :site="site" />
    <PublicFooter :settings="site.settings" :navigation="site.content.navigation" />
    <SocialProofToast v-if="!hideSocialProof" :items="site.content.social_proofs || []" />
    <PublicFloatingActions :settings="site.settings" />
  </div>
</template>
