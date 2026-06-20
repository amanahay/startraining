<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../api.js';

const router = useRouter();
const form = ref({
  email: 'admin@startraining.info',
  pin: '',
  new_password: '',
  confirm_password: ''
});
const showPassword = ref(false);
const showConfirmation = ref(false);
const loading = ref(false);
const error = ref('');
const success = ref('');
const passwordValid = computed(() => form.value.new_password.length >= 10);
const passwordsMatch = computed(() => form.value.new_password && form.value.new_password === form.value.confirm_password);

async function recover() {
  if (loading.value) return;
  loading.value = true;
  error.value = '';
  success.value = '';
  try {
    const result = await api('/auth/recover-superadmin', { method: 'POST', body: form.value });
    success.value = result.message;
    form.value.pin = '';
    form.value.new_password = '';
    form.value.confirm_password = '';
    window.setTimeout(() => router.replace('/login'), 2200);
  } catch (exception) {
    error.value = exception.message;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <main class="recovery-page">
    <form class="recovery-card" @submit.prevent="recover">
      <router-link to="/login" class="recovery-back"><i class="bi bi-arrow-left"></i> Kembali ke Login</router-link>
      <div class="recovery-heading">
        <div class="recovery-icon"><i class="bi bi-shield-lock-fill"></i></div>
        <h1>Pemulihan SuperAdmin</h1>
        <p>Gunakan PIN pemilik untuk mengganti password akun utama.</p>
      </div>

      <div class="recovery-warning"><i class="bi bi-exclamation-triangle-fill"></i><span>Maksimal lima PIN salah. Setelah itu akses dikunci selama 15 menit.</span></div>
      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <div v-if="success" class="alert alert-success"><span class="spinner-border spinner-border-sm me-2"></span>{{ success }} Mengarahkan ke login...</div>

      <label>
        <span>Email SuperAdmin</span>
        <input v-model="form.email" type="email" readonly autocomplete="username">
      </label>
      <label>
        <span>PIN Pemulihan</span>
        <input v-model="form.pin" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="12" required autocomplete="one-time-code" placeholder="Masukkan PIN rahasia">
      </label>
      <label>
        <span>Password Baru</span>
        <div class="recovery-password">
          <input v-model="form.new_password" :type="showPassword ? 'text' : 'password'" minlength="10" required autocomplete="new-password" placeholder="Minimal 10 karakter">
          <button type="button" @click="showPassword=!showPassword" :aria-label="showPassword ? 'Sembunyikan password' : 'Tampilkan password'"><i class="bi" :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i></button>
        </div>
      </label>
      <label>
        <span>Konfirmasi Password Baru</span>
        <div class="recovery-password">
          <input v-model="form.confirm_password" :type="showConfirmation ? 'text' : 'password'" minlength="10" required autocomplete="new-password" placeholder="Ulangi password baru">
          <button type="button" @click="showConfirmation=!showConfirmation" :aria-label="showConfirmation ? 'Sembunyikan konfirmasi' : 'Tampilkan konfirmasi'"><i class="bi" :class="showConfirmation ? 'bi-eye-slash' : 'bi-eye'"></i></button>
        </div>
      </label>

      <div class="recovery-checks">
        <span :class="{ valid: passwordValid }"><i class="bi" :class="passwordValid ? 'bi-check-circle-fill' : 'bi-circle'"></i> Minimal 10 karakter</span>
        <span :class="{ valid: passwordsMatch }"><i class="bi" :class="passwordsMatch ? 'bi-check-circle-fill' : 'bi-circle'"></i> Password sama</span>
      </div>

      <button class="recovery-submit" :disabled="loading || !passwordValid || !passwordsMatch">
        <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
        {{ loading ? 'Mengganti Password...' : 'Ganti Password SuperAdmin' }}
      </button>
    </form>
  </main>
</template>

<style scoped>
.recovery-page{min-height:100vh;display:grid;place-items:center;padding:1.25rem;background:radial-gradient(circle at 15% 15%,rgba(220,38,38,.25),transparent 28%),linear-gradient(135deg,#0f172a,#3f0718)}
.recovery-card{width:min(500px,100%);background:#fff;border-radius:22px;padding:2rem;color:#172033;box-shadow:0 28px 90px rgba(0,0,0,.36)}
.recovery-back{display:inline-flex;align-items:center;gap:.4rem;color:#64748b;text-decoration:none;font-size:.85rem}
.recovery-heading{text-align:center;margin:1.5rem 0}.recovery-icon{width:64px;height:64px;margin:0 auto 1rem;display:grid;place-items:center;border-radius:18px;background:#fee2e2;color:#b91c1c;font-size:1.75rem}.recovery-heading h1{font-size:1.55rem;font-weight:900}.recovery-heading p{color:#64748b;margin:0}
.recovery-warning{display:flex;gap:.65rem;padding:.8rem;border:1px solid #fbbf24;border-radius:10px;background:#fffbeb;color:#92400e;font-size:.82rem;margin-bottom:1rem}
.recovery-card label{display:grid;gap:.4rem;margin-bottom:1rem}.recovery-card label>span{font-size:.82rem;font-weight:800;color:#334155}.recovery-card input{width:100%;min-height:50px;border:1.5px solid #94a3b8;border-radius:10px;padding:.75rem .9rem;background:#f8fafc;color:#111827;outline:0}.recovery-card input:focus{background:#fff;border-color:#b91c1c;box-shadow:0 0 0 4px rgba(185,28,28,.12)}.recovery-card input[readonly]{background:#e2e8f0;color:#475569}
.recovery-password{position:relative}.recovery-password input{padding-right:3.5rem}.recovery-password button{position:absolute;right:.5rem;top:50%;transform:translateY(-50%);width:42px;height:40px;border:0;border-radius:8px;background:#e2e8f0;color:#334155}
.recovery-checks{display:flex;gap:1rem;flex-wrap:wrap;font-size:.78rem;color:#94a3b8;margin:.25rem 0 1.2rem}.recovery-checks span{display:flex;gap:.35rem;align-items:center}.recovery-checks .valid{color:#15803d}
.recovery-submit{width:100%;min-height:52px;border:0;border-radius:999px;background:#b91c1c;color:#fff;font-weight:800}.recovery-submit:hover:not(:disabled){background:#991b1b}.recovery-submit:disabled{opacity:.55;cursor:not-allowed}
@media(max-width:520px){.recovery-card{padding:1.3rem;border-radius:16px}.recovery-heading{margin:1.2rem 0}.recovery-checks{flex-direction:column;gap:.4rem}}
</style>
