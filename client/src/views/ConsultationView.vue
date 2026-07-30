<script setup>
import { computed, onMounted, ref } from 'vue';
import { api } from '../api.js';
import PublicPageShell from '../components/PublicPageShell.vue';

const data = ref(null);
const sending = ref(false);
const notice = ref('');
const form = ref({ name: '', whatsapp: '', company: '', message: '' });
const page = computed(() => data.value?.page || {});
const style = computed(() => ({
  '--consultation-bg': page.value.background_color, '--consultation-label': page.value.label_color, '--consultation-title': page.value.title_color,
  '--consultation-text': page.value.description_color, '--consultation-button-bg': page.value.button_background_color, '--consultation-button-text': page.value.button_text_color,
  '--consultation-button-border': page.value.button_border_color, '--consultation-label-font': `"${page.value.label_font || 'Manrope'}", sans-serif`,
  '--consultation-title-font': `"${page.value.title_font || 'Manrope'}", sans-serif`, '--consultation-text-font': `"${page.value.description_font || 'Manrope'}", sans-serif`,
  '--consultation-button-font': `"${page.value.button_font || 'Manrope'}", sans-serif`, '--consultation-label-size': `${page.value.label_size || 14}px`,
  '--consultation-title-size': `${page.value.title_size || 44}px`, '--consultation-text-size': `${page.value.description_size || 18}px`, '--consultation-button-size': `${page.value.button_size || 16}px`
}));
async function submit() { sending.value = true; notice.value = ''; try { const result = await api('/public/leads', { method: 'POST', body: form.value }); notice.value = result.message; form.value = { name: '', whatsapp: '', company: '', message: '' }; } catch (error) { notice.value = error.message; } finally { sending.value = false; } }
onMounted(async () => { data.value = await api('/public/request-konsultasi'); });
</script>
<template><PublicPageShell><main v-if="data" class="consultation-page" :style="style"><div class="container"><div class="consultation-grid"><section><span class="consultation-eyebrow">{{ page.eyebrow }}</span><h1>{{ page.title }}</h1><p class="consultation-subtitle">{{ page.subtitle }}</p></section><section class="consultation-form"><h2>{{ page.form_title }}</h2><p>{{ page.form_description }}</p><form @submit.prevent="submit"><label>{{ page.name_label }}<input v-model="form.name" required></label><label>{{ page.whatsapp_label }}<input v-model="form.whatsapp" required></label><label>{{ page.company_label }}<input v-model="form.company"></label><label>{{ page.message_label }}<textarea v-model="form.message" rows="4"></textarea></label><div v-if="notice" class="alert alert-light">{{ notice }}</div><button :disabled="sending" type="submit">{{ sending ? 'Mengirim...' : page.submit_label }}</button></form></section></div></div></main><div v-else class="loading-screen"><div class="spinner-border text-danger"></div></div></PublicPageShell></template>
<style scoped>
.consultation-page{min-height:100vh;padding:9rem 0 5rem;background:var(--consultation-bg,#fff8f1);color:var(--consultation-text,#475569)}.consultation-grid{display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:center}.consultation-eyebrow{font:800 var(--consultation-label-size,14px) var(--consultation-label-font);color:var(--consultation-label,#9f1239);text-transform:uppercase;letter-spacing:.08em}.consultation-page h1{font:900 var(--consultation-title-size,44px) var(--consultation-title-font);line-height:1.1;color:var(--consultation-title,#172033);margin:.6rem 0 1rem}.consultation-subtitle,.consultation-form p{font:var(--consultation-text-size,18px) var(--consultation-text-font);line-height:1.7}.consultation-form{background:#fff;padding:2rem;border-radius:20px;box-shadow:0 18px 45px rgba(15,23,42,.1)}.consultation-form h2{color:var(--consultation-title,#172033)}form{display:grid;gap:1rem;margin-top:1.25rem}label{display:grid;gap:.45rem;font:700 .9rem var(--consultation-label-font)}input,textarea{border:1px solid #cbd5e1;border-radius:10px;padding:.75rem;font:inherit}button{border:1px solid var(--consultation-button-border,#c41e3a);background:var(--consultation-button-bg,#c41e3a);color:var(--consultation-button-text,#fff);border-radius:999px;padding:.85rem 1.25rem;font:800 var(--consultation-button-size,16px) var(--consultation-button-font);margin-top:.5rem}@media(max-width:800px){.consultation-page{padding:7rem 0 3rem}.consultation-grid{grid-template-columns:1fr;gap:2rem}.consultation-page h1{font-size:min(var(--consultation-title-size,44px),36px)}}</style>
