<script setup>
import { onMounted, onUnmounted, ref } from 'vue';

defineProps({ settings: { type: Object, default: () => ({}) } });

const showBackToTop = ref(false);

function onScroll() {
  showBackToTop.value = window.scrollY > 420;
}

function backToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function whatsapp(settings) {
  return `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent('Halo, saya ingin konsultasi mengenai program pelatihan.')}`;
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
});
onUnmounted(() => window.removeEventListener('scroll', onScroll));
</script>

<template>
  <a class="wa-float" :href="whatsapp(settings)" target="_blank" aria-label="Chat WhatsApp"><i class="bi bi-whatsapp"></i></a>
  <button class="scroll-top" :class="{ visible: showBackToTop }" type="button" aria-label="Kembali ke atas" @click="backToTop"><i class="bi bi-arrow-up"></i></button>
</template>
