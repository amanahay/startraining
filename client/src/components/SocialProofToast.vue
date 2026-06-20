<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

const props = defineProps({ items: { type: Array, default: () => [] } });
const activeIndex = ref(0);
const visible = ref(false);
let timer = null;

const activeItem = computed(() => props.items[activeIndex.value % Math.max(1, props.items.length)] || null);
const message = computed(() => {
  const item = activeItem.value;
  if (!item) return '';
  if (item.message_text) return item.message_text;
  const program = item.resolved_program_title || item.program_title || 'program STAR Training';
  return `${item.customer_name} ${item.action_text || 'telah membeli paket layanan pelatihan'} ${program}`;
});

function timeAgo(value) {
  const date = new Date(String(value || '').replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return 'Baru saja';
  const seconds = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000));
  const units = [
    ['tahun', 31536000],
    ['bulan', 2592000],
    ['hari', 86400],
    ['jam', 3600],
    ['menit', 60]
  ];
  for (const [label, size] of units) {
    const count = Math.floor(seconds / size);
    if (count >= 1) return `${count} ${label} yang lalu`;
  }
  return 'Baru saja';
}

function clearTimer() {
  if (timer) window.clearTimeout(timer);
  timer = null;
}

function schedule() {
  clearTimer();
  if (!props.items.length) return;
  visible.value = true;
  const seconds = Math.max(3, Math.min(5, Number(activeItem.value?.display_seconds || 4)));
  timer = window.setTimeout(() => {
    visible.value = false;
    timer = window.setTimeout(() => {
      activeIndex.value = (activeIndex.value + 1) % props.items.length;
      schedule();
    }, 1400);
  }, seconds * 1000);
}

onMounted(() => {
  timer = window.setTimeout(schedule, 1800);
});
onUnmounted(clearTimer);
watch(() => props.items.length, () => {
  activeIndex.value = 0;
  schedule();
});
</script>

<template>
  <transition name="social-proof-slide">
    <aside v-if="activeItem && visible" class="social-proof-toast" aria-live="polite">
      <div class="social-proof-avatar">{{ String(activeItem.customer_name || 'S').charAt(0).toUpperCase() }}</div>
      <div>
        <strong>{{ message }}</strong>
        <small>{{ timeAgo(activeItem.occurred_at) }}</small>
      </div>
    </aside>
  </transition>
</template>
