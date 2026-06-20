<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api } from '../api.js';

const router = useRouter();
const route = useRoute();
const site = ref({ settings: {} });
const form = ref({ email: 'admin@startraining.info', password: 'ChangeMe123!' });
const error = ref('');
const loading = ref(false);
const showPassword = ref(false);

async function login() {
  loading.value = true;
  error.value = '';
  try {
    await api('/auth/login', { method: 'POST', body: form.value });
    router.replace(String(route.query.redirect || '/admin'));
  } catch (exception) {
    error.value = exception.message;
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  try {
    site.value = await api('/public/bootstrap');
  } catch {}
});
</script>

<template>
  <main class="login-page">
    <form class="login-card" @submit.prevent="login">
      <router-link to="/" class="text-decoration-none text-muted small"><i class="bi bi-arrow-left me-1"></i>Kembali ke website</router-link>
      <div class="text-center my-4">
        <img v-if="site.settings.logo_url" :src="site.settings.logo_url" :alt="site.settings.site_name" class="login-logo">
        <div v-else class="fs-1">{{ site.settings.logo_symbol || '⭐' }}</div>
        <h1 class="h3 fw-bold">SuperAdmin</h1>
        <p class="text-muted">Kelola landing page dan SEO {{ site.settings.site_short_name || 'STAR Training' }}.</p>
      </div>
      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <div class="mb-3"><label class="form-label fw-semibold" for="login-email">Email</label><input id="login-email" v-model="form.email" type="email" class="form-control form-control-lg" required autocomplete="username"></div>
      <div class="mb-3"><label class="form-label fw-semibold" for="login-password">Password</label><div class="login-password-wrap"><input id="login-password" v-model="form.password" :type="showPassword ? 'text' : 'password'" class="form-control form-control-lg" required autocomplete="current-password"><button type="button" :aria-label="showPassword ? 'Sembunyikan password' : 'Tampilkan password'" @click="showPassword=!showPassword"><i class="bi" :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i></button></div></div>
      <button :disabled="loading" class="btn btn-danger btn-lg w-100 login-submit"><span v-if="loading" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>{{ loading ? 'Memproses...' : 'Masuk' }}</button>
      <div class="text-center mt-3"><router-link to="/superadmin" class="small text-danger fw-semibold text-decoration-none"><i class="bi bi-shield-lock me-1"></i>Pemulihan akun pemilik</router-link></div>
    </form>
  </main>
</template>

<style scoped>
.login-card{background:#fff;color:#172033;border:1px solid rgba(255,255,255,.7)}
.login-card h1,.login-card .form-label{color:#111827!important}
.login-logo{width:min(260px,100%);max-height:92px;object-fit:contain;object-position:center;display:block;margin:0 auto 1rem}
.login-card .form-control{background:#f8fafc!important;color:#111827!important;border:1.5px solid #94a3b8!important;box-shadow:none!important}
.login-card .form-control::placeholder{color:#64748b!important}
.login-card .form-control:focus{background:#fff!important;border-color:#b91c1c!important;box-shadow:0 0 0 4px rgba(185,28,28,.12)!important}
.login-password-wrap{position:relative}.login-password-wrap .form-control{padding-right:3.25rem}.login-password-wrap button{position:absolute;right:.55rem;top:50%;transform:translateY(-50%);width:42px;height:42px;border:0;border-radius:9px;background:#e2e8f0;color:#334155;display:grid;place-items:center}.login-password-wrap button:hover{background:#cbd5e1;color:#991b1b}
.login-submit{display:flex;align-items:center;justify-content:center;text-align:center}
.login-card .btn-danger:disabled{opacity:.8;cursor:wait}
</style>
