<script setup>
import { onErrorCaptured, ref } from 'vue';
const error = ref('');
onErrorCaptured((exception) => {
  error.value = exception?.message || 'Terjadi kesalahan.';
  return false;
});
</script>

<template>
  <div v-if="error" class="app-error">
    <strong>Halaman tidak dapat dimuat.</strong>
    <span>{{ error }}</span>
    <button class="btn btn-danger" @click="error = ''; $router.go(0)">Muat ulang</button>
  </div>
  <router-view v-else />
</template>
